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

    const history = input.sessionId
        ? await loadSessionHistory(input.sessionId, input.userId)
        : [];

    const summaryPayload = input.sessionId
        ? await getSessionSummary(input.sessionId, input.userId)
        : null;

    const sessionSummary = summaryPayload?.summary ?? null;

    let actionRaw: unknown;
    try {
        actionRaw = await llm.generateAction({
            userMessage: input.message,
            history,
            sessionSummary,
            isAdmin: input.isAdmin,
        });
    } catch (err) {
        const response =
            "Could not understand that request. Please rephrase and include key filters (date range, status, entity).";
        const saved = await saveChatExchange(input.userId, input.sessionId, input.message, response, {
            actionType: "error",
            error: err instanceof Error ? err.message : String(err),
            latencyMs: safeNowMs() - startedAt,
        });
        return { ...saved, response };
    }

    const action = AiChatActionSchema.parse(actionRaw);

    if (action.type === "reply") {
        const response = action.message.trim();
        const saved = await saveChatExchange(input.userId, input.sessionId, input.message, response, {
            actionType: "reply",
            latencyMs: safeNowMs() - startedAt,
        });
        await maybeUpdateSummary(input.sessionId, input.userId, llm, sessionSummary, history, input.message, response);
        return { ...saved, response };
    }

    if (action.type === "clarify") {
        const response = action.questions.map((q) => `- ${q}`).join("\n");
        const saved = await saveChatExchange(input.userId, input.sessionId, input.message, response, {
            actionType: "clarify",
            latencyMs: safeNowMs() - startedAt,
        });
        await maybeUpdateSummary(input.sessionId, input.userId, llm, sessionSummary, history, input.message, response);
        return { ...saved, response };
    }

    const envelope = QueryIntentEnvelopeSchema.parse(actionRaw);
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

    await maybeUpdateSummary(input.sessionId, input.userId, llm, sessionSummary, history, input.message, response);
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

