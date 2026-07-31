import { z } from "zod";
import { getLLMProvider } from "./llm.factory";
import { AiChatActionSchema } from "./action-schema";
import { executeIntent, serializeRows } from "./query-executor";
import { parseAssistantIntent } from "./intent-parser";
import type { QueryExecutionResult } from "./llm.interface";
import {
    getSessionSummary,
    loadSessionHistory,
    saveChatExchange,
    updateSessionSummary,
} from "./chat-session.service";

type OrchestratorResult = Awaited<ReturnType<typeof saveChatExchange>> & { response: string };

const QueryIntentEnvelopeSchema = z.object({
    type: z.literal("query"),
    queries: z.array(
        z.object({
            id: z.string().min(1),
            intent: z.unknown(),
        })
    ),
});

function safeNowMs(): number {
    return Date.now();
}

export async function handleAiChatMessage(input: {
    userId: string;
    sessionId?: string;
    message: string;
    isAdmin: boolean;
}): Promise<OrchestratorResult> {
    const llm = getLLMProvider();
    const startedAt = safeNowMs();

    const fullHistory = input.sessionId
        ? await loadSessionHistory(input.sessionId, input.userId)
        : [];
    // Cap history sent to prompts at last 6 turns (3 exchanges).
    // Older context is captured in the rolling session summary.
    const history = fullHistory.slice(-6);

    const summaryPayload = input.sessionId
        ? await getSessionSummary(input.sessionId, input.userId)
        : null;

    const sessionSummary = summaryPayload?.summary ?? null;

    let actionRaw: unknown;
    let action: z.infer<typeof AiChatActionSchema>;
    try {
        actionRaw = await llm.generateAction({
            userMessage: input.message,
            history,
            sessionSummary,
            isAdmin: input.isAdmin,
        });
        // Normalise: if the LLM returned a bare find/aggregate intent instead of
        // wrapping it in the action envelope, auto-wrap it so Zod doesn't reject it.
        actionRaw = normalizeActionRaw(actionRaw);
        action = AiChatActionSchema.parse(actionRaw);
    } catch (err) {
        // Log the actual error so it shows in server logs
        console.error("[AI chat] generateAction/parse failed:", err instanceof Error ? err.message : String(err), "| user message:", input.message);
        const response =
            "I couldn't process that request right now. Please try rephrasing it, or simplify the question.";
        const saved = await saveChatExchange(input.userId, input.sessionId, input.message, response, {
            actionType: "error",
            error: err instanceof Error ? err.message : String(err),
            latencyMs: safeNowMs() - startedAt,
        });
        return { ...saved, response };
    }


    if (action.type === "reply") {
        const response = action.message.trim();
        const saved = await saveChatExchange(input.userId, input.sessionId, input.message, response, {
            actionType: "reply",
            latencyMs: safeNowMs() - startedAt,
        });
        await maybeUpdateSummary(input.sessionId, input.userId, llm, sessionSummary, fullHistory, input.message, response);
        return { ...saved, response };
    }

    if (action.type === "clarify") {
        const response = action.questions.map((q) => `- ${q}`).join("\n");
        const saved = await saveChatExchange(input.userId, input.sessionId, input.message, response, {
            actionType: "clarify",
            latencyMs: safeNowMs() - startedAt,
        });
        await maybeUpdateSummary(input.sessionId, input.userId, llm, sessionSummary, fullHistory, input.message, response);
        return { ...saved, response };
    }

    // action.type === "query" — parse the envelope
    let envelope: z.infer<typeof QueryIntentEnvelopeSchema>;
    try {
        envelope = QueryIntentEnvelopeSchema.parse(actionRaw);
    } catch (err) {
        console.error("[AI chat] QueryIntentEnvelopeSchema parse failed:", err instanceof Error ? err.message : String(err), "| actionRaw:", JSON.stringify(actionRaw));
        const response = "I understood your request but couldn't build a valid database query. Please try rephrasing.";
        const saved = await saveChatExchange(input.userId, input.sessionId, input.message, response, {
            actionType: "error",
            error: err instanceof Error ? err.message : String(err),
            latencyMs: safeNowMs() - startedAt,
        });
        return { ...saved, response };
    }
    const results: Array<{ id: string; result: QueryExecutionResult }> = [];

    const REVENUE_MODELS = new Set(["transaction"]);
    const REVENUE_KEYWORDS = ["revenue", "totalPaid", "amount", "commission", "earnings", "income", "profit"];

    function isRevenueIntent(intent: ReturnType<typeof parseAssistantIntent>): boolean {
        if (intent.type === "reply") return false;
        if (REVENUE_MODELS.has(intent.model)) return true;
        // Detect revenue-focused aggregates on booking (e.g. $sum: "$totalPaid")
        if (intent.type === "aggregate") {
            const pipelineStr = JSON.stringify(intent.pipeline).toLowerCase();
            return REVENUE_KEYWORDS.some((kw) => pipelineStr.includes(kw.toLowerCase()));
        }
        return false;
    }

    for (const q of envelope.queries) {
        const intent = parseAssistantIntent(q.intent);
        if (intent.type === "reply") {
            continue;
        }

        // Gate: support users cannot execute revenue/financial queries
        if (!input.isAdmin && isRevenueIntent(intent)) {
            results.push({
                id: q.id,
                result: {
                    model: intent.model,
                    mode: intent.type === "aggregate" ? "aggregate" : "find",
                    rows: [],
                    blocked: true,
                } as QueryExecutionResult & { blocked: boolean },
            });
            continue;
        }

        const exec = await executeIntent(intent);
        exec.rows = serializeRows(exec.rows);
        results.push({ id: q.id, result: exec });
    }

    const response = await llm.synthesizeAnswer({
        userMessage: input.message,
        history,
        sessionSummary,
        data: results.map((r) => ({ id: r.id, result: r.result })),
    });

    const saved = await saveChatExchange(input.userId, input.sessionId, input.message, response, {
        actionType: "query",
        queryCount: results.length,
        latencyMs: safeNowMs() - startedAt,
    });

    await maybeUpdateSummary(input.sessionId, input.userId, llm, sessionSummary, fullHistory, input.message, response);
    return { ...saved, response };
}

async function maybeUpdateSummary(
    sessionId: string | undefined,
    userId: string,
    llm: ReturnType<typeof getLLMProvider>,
    priorSummary: string | null,
    history: { role: "user" | "assistant"; content: string }[],
    userMessage: string,
    assistantMessage: string
) {
    if (!sessionId) return;

    const extended = [...history, { role: "user" as const, content: userMessage }, { role: "assistant" as const, content: assistantMessage }];

    if (extended.length < 6) return;

    try {
        const next = await llm.summarizeSession({
            priorSummary,
            history: extended.slice(-20),
        });
        if (next.trim()) {
            await updateSessionSummary(sessionId, userId, next);
        }
    } catch {
        // best-effort memory; ignore failures
    }
}

function normalizeActionRaw(raw: unknown): unknown {
    if (!raw || typeof raw !== "object") return raw;
    const obj = raw as Record<string, unknown>;
    
    // If it's already an envelope (type: query/reply/clarify), leave it alone.
    if (obj.type === "query" || obj.type === "reply" || obj.type === "clarify") {
        return raw;
    }
    
    // If it looks like a bare intent (type: find/aggregate), wrap it in a query envelope.
    if (obj.type === "find" || obj.type === "aggregate") {
        return {
            type: "query",
            queries: [{ id: "q1", intent: obj }]
        };
    }
    
    return raw;
}

