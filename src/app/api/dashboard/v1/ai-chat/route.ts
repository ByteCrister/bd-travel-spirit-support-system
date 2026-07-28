import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { USER_ROLE } from "@/constants/user.const";
import { UserModel } from "@/models/user.model";
import { handleAiChatMessage } from "@/lib/ai/chat-orchestrator";
import {
    listSessionMessages,
    listSessions,
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

        // Resolve caller role — revenue data is admin-only
        const callerDoc = await UserModel.findById(userId).select("role").lean();
        const callerRole = (callerDoc as { role?: string } | null)?.role ?? "";
        const isAdmin = callerRole === USER_ROLE.ADMIN;

        try {
            const saved = await handleAiChatMessage({
                userId,
                sessionId,
                message: trimmedMessage,
                isAdmin,
            });
            return NextResponse.json(buildPostResponse(saved, saved.response));
        } catch (err) {
            console.error("AI chat orchestrator error:", err);
            const response =
                "Something went wrong while handling that request. Please try again, or simplify the question.";
            const saved = await saveChatExchange(userId, sessionId, trimmedMessage, response, {
                actionType: "error",
                error: err instanceof Error ? err.message : String(err),
            });
            return NextResponse.json(buildPostResponse(saved, response));
        }
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
