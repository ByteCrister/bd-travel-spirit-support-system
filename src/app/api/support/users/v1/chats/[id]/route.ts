// api/support/users/v1/chats/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import ChatIdGetHandler from "@/lib/handlers/support/chats/id/chat-id-get.handler";
import ChatIdPatchHandler from "@/lib/handlers/support/chats/id/chat-id-patch.handler";
import ChatIdDeleteHandler from "@/lib/handlers/support/chats/id/chat-id-delete.handler";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET — fetch single message by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const result = await ChatIdGetHandler(request, context);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        return NextResponse.json({ success: false, message }, { status });
    }
}

/**
 * PATCH — update message fields
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const result = await ChatIdPatchHandler(request, context);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        return NextResponse.json({ success: false, message }, { status });
    }
}

/**
 * DELETE — soft-delete message
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const result = await ChatIdDeleteHandler(request, context);
        return NextResponse.json(result.data, { status: result.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const status = (err as { status?: number })?.status ?? 500;
        return NextResponse.json({ success: false, message }, { status });
    }
}
