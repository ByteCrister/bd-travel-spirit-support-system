// lib/handlers/support/chats/id/chat-id-patch.handler.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ChatMessageModel } from "@/models/chat-message.model";
import UserModel from "@/models/user.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";
import type { ChatMessage } from "@/types/chatMessage.types";
import {
    toChatMessageDTO,
    type PopulatedChatMessage,
} from "../chat-get-conversation.handler";

/**
 * Whitelist of fields that can be updated on a message.
 */
const ALLOWED_FIELDS = [
    "message", "isDraft", "isRead", "isDelivered",
    "isEdited", "isDeletedBySender", "isDeletedByReceiver", "moderationStatus",
] as const;

/**
 * PATCH /api/support/users/v1/chats/[id]
 *
 * Updates a message's editable fields.
 */
export default async function ChatIdPatchHandler(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid message ID", 400);

    await ConnectDB();

    const body = await request.json();
    const update: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
        if (body[key] !== undefined) update[key] = body[key];
    }

    if (Object.keys(update).length === 0) {
        throw new ApiError("No valid fields to update", 400);
    }

    const doc = await ChatMessageModel.findByIdAndUpdate(id, update, { new: true })
        .populate({ path: "sender", model: UserModel, select: "name avatar role" })
        .populate({ path: "receiver", model: UserModel, select: "name avatar role" })
        .lean() as unknown as PopulatedChatMessage | null;

    if (!doc) throw new ApiError("Message not found", 404);

    const message: ChatMessage = toChatMessageDTO(doc);

    return { data: { data: message }, status: 200 };
}
