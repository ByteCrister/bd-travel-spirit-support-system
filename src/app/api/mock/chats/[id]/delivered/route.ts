import { NextRequest, NextResponse } from "next/server";
import type { ChatMessageMutationResponse } from "@/types/chatMessage.types";
import { messages } from "../../route";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse<ChatMessageMutationResponse>> {
    const { id } = params;
    const idx = messages.findIndex((m) => m._id === id);
    if (idx === -1) {
        return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }

    messages[idx].isDelivered = true;
    messages[idx].updatedAt = new Date().toISOString();

    return NextResponse.json({ success: true, data: messages[idx] }, { status: 200 });
}
