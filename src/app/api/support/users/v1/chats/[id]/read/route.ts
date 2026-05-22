// api/support/users/v1/chats/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import ChatMarkReadHandler from "@/lib/handlers/support/chats/id/chat-mark-read.handler";

/**
 * POST — mark message as read
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const result = await ChatMarkReadHandler(request, context);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        return NextResponse.json({ success: false, message }, { status });
    }
}
