// api/support/users/v1/chats/user-list/route.ts
import { NextRequest, NextResponse } from "next/server";
import ChatGetUserListHandler from "@/lib/handlers/support/chats/chat-get-user-list.handler";

/**
 * GET — fetch paginated user list for sidebar
 */
export async function GET(request: NextRequest) {
    try {
        const result = await ChatGetUserListHandler(request);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        console.error("GET /chats/user-list error:", err);
        return NextResponse.json({ success: false, message }, { status });
    }
}