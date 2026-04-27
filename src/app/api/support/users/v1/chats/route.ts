// api/support/users/v1/chats/route.ts
import { NextRequest, NextResponse } from "next/server";
import ChatPostHandler from "@/lib/handlers/support/chats/chat-post.handler";
import ChatGetListHandler from "@/lib/handlers/support/chats/chat-get-list.handler";

/**
 * GET — fetch a filtered/paginated list of all chat messages
 */
export async function GET(request: NextRequest) {
    try {
        const result = await ChatGetListHandler(request);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        console.error("GET /chats error:", err);
        return NextResponse.json({ success: false, message }, { status });
    }
}

/**
 * POST — create a new chat message
 */
export async function POST(request: NextRequest) {
    try {
        const result = await ChatPostHandler(request);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        console.error("POST /chats error:", err);
        return NextResponse.json({ success: false, message }, { status });
    }
}
