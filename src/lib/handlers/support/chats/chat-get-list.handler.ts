// lib/handlers/support/chats/chat-get-list.handler.ts
import { NextRequest } from "next/server";
import { Types, FilterQuery } from "mongoose";

import ConnectDB from "@/config/db";
import { ChatMessageModel } from "@/models/chat-message.model";
import UserModel from "@/models/user.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";
import type { ChatMessage } from "@/types/chatMessage.types";
import {
    toChatMessageDTO,
    type PopulatedChatMessage,
} from "./chat-get-conversation.handler";

/**
 * GET /api/support/users/v1/chats
 *
 * Returns a paginated, filterable list of all chat messages.
 * Query: sender, receiver, isRead, isDelivered, moderationStatus,
 *        dateFrom, dateTo, search, page, limit, sortBy, sortOrder
 */
export default async function ChatGetListHandler(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

    await ConnectDB();

    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "20")));
    const sortBy = sp.get("sortBy") || "createdAt";
    const sortOrder = sp.get("sortOrder") === "asc" ? 1 : -1;

    // Build filter
    const filter: FilterQuery<typeof ChatMessageModel> = {};

    const sender = sp.get("sender");
    const receiver = sp.get("receiver");
    if (sender && Types.ObjectId.isValid(sender)) filter.sender = new Types.ObjectId(sender);
    if (receiver && Types.ObjectId.isValid(receiver)) filter.receiver = new Types.ObjectId(receiver);

    const isRead = sp.get("isRead");
    if (isRead === "true") filter.isRead = true;
    else if (isRead === "false") filter.isRead = false;

    const isDelivered = sp.get("isDelivered");
    if (isDelivered === "true") filter.isDelivered = true;
    else if (isDelivered === "false") filter.isDelivered = false;

    const moderationStatus = sp.get("moderationStatus");
    if (moderationStatus && ["clean", "flagged", "removed"].includes(moderationStatus)) {
        filter.moderationStatus = moderationStatus;
    }

    const dateFrom = sp.get("dateFrom");
    const dateTo = sp.get("dateTo");
    if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const search = sp.get("search");
    if (search && search.trim()) {
        filter.message = { $regex: search.trim(), $options: "i" };
    }

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
