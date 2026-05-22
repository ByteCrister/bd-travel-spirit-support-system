// lib/handlers/support/chats/chat-post.handler.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ChatMessageModel } from "@/models/chat-message.model";
import UserModel from "@/models/user.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";
import { triggerSocketEvent } from "@/socket/triggerSocketEvent";
import { SOCKET_TRIGGERS } from "@/constants/socket.const";
import type { ChatMessage } from "@/types/chatMessage.types";
import {
    toChatMessageDTO,
    type PopulatedChatMessage,
} from "./chat-get-conversation.handler";

/**
 * POST /api/support/users/v1/chats
 *
 * Creates a new chat message from the authenticated user.
 * Body: { receiver: string, message: string, isDraft?: boolean }
 */
export default async function ChatPostHandler(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

    await ConnectDB();

    const body = await request.json();
    const { receiver, message, isDraft } = body;

    if (!receiver || !message) {
        throw new ApiError("receiver and message are required", 400);
    }
    if (!Types.ObjectId.isValid(receiver)) {
        throw new ApiError("Invalid receiver ID", 400);
    }
    if (typeof message !== "string" || message.trim().length === 0) {
        throw new ApiError("Message cannot be empty", 400);
    }

    const senderId = session.user.id;

    const doc = await ChatMessageModel.create({
        sender: new Types.ObjectId(senderId),
        receiver: new Types.ObjectId(receiver),
        message: message.trim(),
        isDraft: isDraft === true,
        timestamp: new Date(),
    });

    // Populate sender & receiver for the response
    const populated = await ChatMessageModel.findById(doc._id)
        .populate({ path: "sender", model: UserModel, select: "name avatar role" })
        .populate({ path: "receiver", model: UserModel, select: "name avatar role" })
        .lean() as unknown as PopulatedChatMessage | null;

    if (!populated) throw new ApiError("Failed to create message", 500);

    const created: ChatMessage = toChatMessageDTO(populated);

    // Trigger socket event to receiver (fire-and-forget)
    if (!isDraft) {
        triggerSocketEvent({
            userId: receiver,
            type: SOCKET_TRIGGERS.SEND_NEW_CHAT_MESSAGE,
            data: created,
        }).catch((err) => console.error("Socket trigger failed:", err));
    }

    return {
        data: { data: created },
        status: 201,
    };
}
