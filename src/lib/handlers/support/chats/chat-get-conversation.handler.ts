// lib/handlers/support/chats/chat-get-conversation.handler.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ChatMessageModel, IChatMessage } from "@/models/chat-message.model";
import UserModel from "@/models/user.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";
import type { ChatMessage, IUserRef } from "@/types/chatMessage.types";
import type { ModerationStatusType } from "@/constants/chatmessage.const";

/**
 * Shape of the populated sender/receiver after `.populate()` + `.lean()`.
 */
interface PopulatedUser {
    _id: Types.ObjectId;
    name: string;
    avatar?: string;
    role: string;
}

/**
 * The lean document returned by Mongoose after population.
 * `sender` and `receiver` are either populated objects or raw ObjectIds.
 */
interface PopulatedChatMessage extends Omit<IChatMessage, "sender" | "receiver"> {
    _id: Types.ObjectId;
    sender: PopulatedUser | Types.ObjectId;
    receiver: PopulatedUser | Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Transforms a populated user field into a frontend-safe IUserRef or string.
 */
function toUserRef(field: PopulatedUser | Types.ObjectId): IUserRef | string {
    if (field && typeof field === "object" && "name" in field) {
        return {
            _id: field._id.toString(),
            name: field.name,
            avatar: field.avatar,
            role: field.role as IUserRef["role"],
        };
    }
    return field?.toString?.() ?? "";
}

/**
 * Transforms a populated lean document into a frontend-safe ChatMessage.
 */
function toChatMessageDTO(m: PopulatedChatMessage): ChatMessage {
    return {
        _id: m._id.toString(),
        sender: toUserRef(m.sender),
        receiver: toUserRef(m.receiver),
        message: m.message,
        timestamp: m.timestamp?.toISOString?.() ?? new Date().toISOString(),
        isDraft: m.isDraft,
        isRead: m.isRead,
        isDelivered: m.isDelivered,
        isEdited: m.isEdited,
        isDeletedBySender: m.isDeletedBySender,
        isDeletedByReceiver: m.isDeletedByReceiver,
        moderationStatus: m.moderationStatus as ModerationStatusType,
        createdAt: m.createdAt?.toISOString?.() ?? "",
        updatedAt: m.updatedAt?.toISOString?.() ?? "",
    };
}

/**
 * GET /api/support/users/v1/chats/conversation
 *
 * Returns paginated messages between two participants.
 * Query: sender, receiver, page, limit, sortBy, sortOrder
 */
export default async function ChatGetConversationHandler(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

    await ConnectDB();

    const sp = request.nextUrl.searchParams;
    const sender = sp.get("sender");
    const receiver = sp.get("receiver");

    if (!sender || !receiver) {
        throw new ApiError("sender and receiver are required", 400);
    }
    if (!Types.ObjectId.isValid(sender) || !Types.ObjectId.isValid(receiver)) {
        throw new ApiError("Invalid sender or receiver ID", 400);
    }

    const page = Math.max(1, parseInt(sp.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "50")));
    const sortBy = sp.get("sortBy") || "createdAt";
    const sortOrder = sp.get("sortOrder") === "desc" ? -1 : 1;

    const senderOid = new Types.ObjectId(sender);
    const receiverOid = new Types.ObjectId(receiver);

    // Bidirectional: messages where (A→B) or (B→A), excluding deleted
    const filter = {
        $or: [
            { sender: senderOid, receiver: receiverOid, isDeletedBySender: false },
            { sender: receiverOid, receiver: senderOid, isDeletedByReceiver: false },
        ],
    };

    const total = await ChatMessageModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const messages = await ChatMessageModel.find(filter)
        .populate({ path: "sender", model: UserModel, select: "name avatar role" })
        .populate({ path: "receiver", model: UserModel, select: "name avatar role" })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean() as unknown as PopulatedChatMessage[];

    const items: ChatMessage[] = messages.map(toChatMessageDTO);

    return {
        data: {
            data: { items, total, page, limit, totalPages },
        },
        status: 200,
    };
}

// Re-export helpers for reuse in other handlers
export { toUserRef, toChatMessageDTO };
export type { PopulatedChatMessage, PopulatedUser };
