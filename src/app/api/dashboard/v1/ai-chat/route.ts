import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { USER_ROLE } from "@/constants/user.const";
import { getLLMProvider } from "@/lib/ai/llm.factory";
import { executeIntent, serializeRows } from "@/lib/ai/query-executor";
import { formatAsMarkdown } from "@/lib/ai/response-formatter";
import {
    listSessionMessages,
    listSessions,
    loadSessionHistory,
    saveChatExchange,
} from "@/lib/ai/chat-session.service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parseLimit(value: string | null): number {
    const parsed = parseInt(value || String(DEFAULT_LIMIT), 10);
    if (Number.isNaN(parsed)) return DEFAULT_LIMIT;
    return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

function resolveSessionId(body: Record<string, unknown>): string | undefined {
    const sessionId = body.sessionId ?? body.conversationId;
    return typeof sessionId === "string" && sessionId.trim() ? sessionId.trim() : undefined;
}

/**
 * GET /api/ai-chat
 * List sessions:        ?limit=20&cursor=<sessionId>
 * List session messages: ?sessionId=<id>&limit=30&cursor=<messageId>
 */
export async function GET(req: NextRequest) {
    try {
        await ConnectDB();
        const userId = await getUserIdFromSession();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await VERIFY_USER_ROLE.MULTIPLE(userId, [USER_ROLE.ADMIN, USER_ROLE.SUPPORT]);

        const { searchParams } = req.nextUrl;
        const sessionId = searchParams.get("sessionId") ?? searchParams.get("conversationId");
        const cursor = searchParams.get("cursor");
        const limit = parseLimit(searchParams.get("limit"));

        if (sessionId) {
            try {
                const result = await listSessionMessages(sessionId, userId, cursor, limit);
                return NextResponse.json({
                    sessionId: result.session.sessionId,
                    title: result.session.title,
                    messages: result.items,
                    nextCursor: result.nextCursor,
                    hasMore: result.hasMore,
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : "Session not found";
                if (message === "Session not found") {
                    return NextResponse.json({ error: message }, { status: 404 });
                }
                if (message === "Invalid cursor") {
                    return NextResponse.json({ error: message }, { status: 400 });
                }
                throw error;
            }
        }

        try {
            const result = await listSessions(userId, cursor, limit);
            return NextResponse.json({
                sessions: result.items,
                nextCursor: result.nextCursor,
                hasMore: result.hasMore,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Invalid cursor";
            if (message === "Invalid cursor") {
                return NextResponse.json({ error: message }, { status: 400 });
            }
            throw error;
        }
    } catch (error) {
        console.error("AI chat GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST /api/ai-chat
 * Body: { message: string, sessionId?: string, conversationId?: string }
 */
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();
        const userId = await getUserIdFromSession();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await VERIFY_USER_ROLE.MULTIPLE(userId, [USER_ROLE.ADMIN, USER_ROLE.SUPPORT]);

        const body = await req.json();
        const { message } = body;
        if (!message || typeof message !== "string" || !message.trim()) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const trimmedMessage = message.trim();
        const sessionId = resolveSessionId(body);
        const history = sessionId ? await loadSessionHistory(sessionId, userId) : [];

        const llm = getLLMProvider();
        let intent;
        try {
            intent = await llm.generateIntent(trimmedMessage, sessionId ? history : []);
        } catch (llmError) {
            console.error("LLM error:", llmError);
            const errorMarkdown =
                "Could not understand that request. Try rephrasing, e.g. *show pending guides* or *total booking revenue this month*.";
            const saved = await saveChatExchange(userId, sessionId, trimmedMessage, errorMarkdown);
            return NextResponse.json(buildPostResponse(saved, errorMarkdown));
        }

        if (intent.type === "reply") {
            const saved = await saveChatExchange(
                userId,
                sessionId,
                trimmedMessage,
                intent.message
            );
            return NextResponse.json(buildPostResponse(saved, intent.message));
        }

        let markdownResponse: string;
        try {
            const result = await executeIntent(intent);
            result.rows = serializeRows(result.rows);
            markdownResponse = formatAsMarkdown(result, trimmedMessage);
        } catch (dbError) {
            console.error("Database error:", dbError);
            const modelLabel = intent.model;
            markdownResponse = `Database error while fetching **${modelLabel}** data. Check filters or try a simpler question.`;
        }

        const saved = await saveChatExchange(
            userId,
            sessionId,
            trimmedMessage,
            markdownResponse
        );

        return NextResponse.json(buildPostResponse(saved, markdownResponse));
    } catch (error) {
        console.error("AI chat error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function buildPostResponse(
    saved: Awaited<ReturnType<typeof saveChatExchange>>,
    response: string
) {
    return {
        sessionId: saved.sessionId,
        conversationId: saved.sessionId,
        response,
        messages: {
            user: saved.userMessage,
            assistant: saved.assistantMessage,
        },
    };
}
