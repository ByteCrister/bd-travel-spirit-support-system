import { NextRequest, NextResponse } from "next/server";
import type { ChatMessageMutationResponse, UpdateChatMessageDTO } from "@/types/chatMessage.types";
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

    try {
        const body: Pick<UpdateChatMessageDTO, "moderationStatus"> = await req.json();
        if (!body.moderationStatus) {
            return NextResponse.json({ success: false, message: "Missing moderationStatus" }, { status: 400 });
        }

        messages[idx].moderationStatus = body.moderationStatus;
        messages[idx].updatedAt = new Date().toISOString();

        return NextResponse.json({ success: true, data: messages[idx] }, { status: 200 });
    } catch {
        return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
}
