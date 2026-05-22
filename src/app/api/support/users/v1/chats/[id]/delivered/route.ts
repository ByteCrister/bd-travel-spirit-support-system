// api/support/users/v1/chats/[id]/delivered/route.ts
import { NextRequest, NextResponse } from "next/server";
import ChatMarkDeliveredHandler from "@/lib/handlers/support/chats/id/chat-mark-delivered.handler";

/**
 * POST — mark message as delivered
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const result = await ChatMarkDeliveredHandler(request, context);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        return NextResponse.json({ success: false, message }, { status });
    }
}
