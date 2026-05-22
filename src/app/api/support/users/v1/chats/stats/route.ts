// api/support/users/v1/chats/stats/route.ts
import { NextResponse } from "next/server";
import ChatGetStatsHandler from "@/lib/handlers/support/chats/chat-get-stats.handler";

/**
 * GET — fetch chat dashboard statistics
 */
export async function GET() {
    try {
        const result = await ChatGetStatsHandler();
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        console.error("GET /chats/stats error:", err);
        return NextResponse.json({ success: false, message }, { status });
    }
}
