// api/support/users/v1/chats/[id]/moderation/route.ts
import { NextRequest, NextResponse } from "next/server";
import ChatModerateHandler from "@/lib/handlers/support/chats/id/chat-moderate.handler";

/**
 * POST — update moderation status
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const result = await ChatModerateHandler(request, context);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        return NextResponse.json({ success: false, message }, { status });
    }
}
