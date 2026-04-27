// lib/handlers/support/chats/id/chat-mark-delivered.handler.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ChatMessageModel } from "@/models/chat-message.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";

/**
 * POST /api/support/users/v1/chats/[id]/delivered
 *
 * Marks a message as delivered.
 */
export default async function ChatMarkDeliveredHandler(
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
        { isDelivered: true },
        { new: true }
    );

    if (!doc) throw new ApiError("Message not found", 404);

    return { data: { data: { _id: id, isDelivered: true } }, status: 200 };
}
