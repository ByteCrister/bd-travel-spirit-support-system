// lib/handlers/support/chats/id/chat-id-delete.handler.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ChatMessageModel } from "@/models/chat-message.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";
import { triggerSocketEvent } from "@/socket/triggerSocketEvent";
import { SOCKET_TRIGGERS } from "@/constants/socket.const";

/**
 * DELETE /api/support/users/v1/chats/[id]
 *
 * Soft-deletes by setting isDeletedBySender/isDeletedByReceiver for the authenticated user.
 */
export default async function ChatIdDeleteHandler(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid message ID", 400);

    await ConnectDB();

    const doc = await ChatMessageModel.findById(id);
    if (!doc) throw new ApiError("Message not found", 404);

    const userId = session.user.id;
    const isSender = doc.sender.toString() === userId;
    const isReceiver = doc.receiver.toString() === userId;

    if (isSender) {
        doc.isDeletedBySender = true;
    } else if (isReceiver) {
        doc.isDeletedByReceiver = true;
    } else {
        // Admin override: mark both sides as deleted
        doc.isDeletedBySender = true;
        doc.isDeletedByReceiver = true;
    }

    await doc.save();

    // Notify the other party
    const otherUserId = isSender ? doc.receiver.toString() : doc.sender.toString();
    triggerSocketEvent({
        userId: otherUserId,
        type: SOCKET_TRIGGERS.DELETE_CHAT_MESSAGE,
        data: { _id: id },
    }).catch((err) => console.error("Socket trigger failed:", err));

    return {
        data: { data: { _id: id } },
        status: 200,
    };
}
