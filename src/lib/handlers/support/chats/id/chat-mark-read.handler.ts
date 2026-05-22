// lib/handlers/support/chats/id/chat-mark-read.handler.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ChatMessageModel } from "@/models/chat-message.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";
import { triggerSocketEvent } from "@/socket/triggerSocketEvent";
import { SOCKET_TRIGGERS } from "@/constants/socket.const";

/**
 * POST /api/support/users/v1/chats/[id]/read
 *
 * Marks a message as read.
 */
export default async function ChatMarkReadHandler(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid message ID", 400);

    await ConnectDB();

    const doc = await ChatMessageModel.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
    );

    if (!doc) throw new ApiError("Message not found", 404);

    // Notify the sender that their message was read
    triggerSocketEvent({
        userId: doc.sender.toString(),
        type: SOCKET_TRIGGERS.MARK_AS_SEEN,
        data: { _id: id, isRead: true },
    }).catch((err) => console.error("Socket trigger failed:", err));

    return { data: { data: { _id: id, isRead: true } }, status: 200 };
}
