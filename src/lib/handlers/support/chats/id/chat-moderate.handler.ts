// lib/handlers/support/chats/id/chat-moderate.handler.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ChatMessageModel } from "@/models/chat-message.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";

const VALID_STATUSES = ["clean", "flagged", "removed"] as const;

/**
 * POST /api/support/users/v1/chats/[id]/moderation
 *
 * Updates the moderation status of a message.
 * Body: { moderationStatus: 'clean' | 'flagged' | 'removed' }
 */
export default async function ChatModerateHandler(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid message ID", 400);

    const body = await request.json();
    const { moderationStatus } = body;

    if (!moderationStatus || !VALID_STATUSES.includes(moderationStatus)) {
        throw new ApiError(
            `Invalid moderationStatus. Must be one of: ${VALID_STATUSES.join(", ")}`,
            400
        );
    }

    await ConnectDB();

    const doc = await ChatMessageModel.findByIdAndUpdate(
        id,
        { moderationStatus },
        { new: true }
    );

    if (!doc) throw new ApiError("Message not found", 404);

    return { data: { data: { _id: id, moderationStatus } }, status: 200 };
}
