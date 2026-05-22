// api/support/users/v1/chats/conversation/route.ts
import { NextRequest, NextResponse } from "next/server";
import ChatGetConversationHandler from "@/lib/handlers/support/chats/chat-get-conversation.handler";

/**
 * GET — fetch paginated conversation between two users
 */
export async function GET(request: NextRequest) {
    try {
        const result = await ChatGetConversationHandler(request);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        console.error("GET /chats/conversation error:", err);
        return NextResponse.json({ success: false, message }, { status });
    }
}
