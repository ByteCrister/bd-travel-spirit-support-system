// lib/handlers/support/chats/chat-get-user-list.handler.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ChatMessageModel } from "@/models/chat-message.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";

/**
 * GET /api/support/users/v1/chats/user-list
 *
 * Returns a paginated list of users who have conversations with the admin,
 * sorted by last message time, with unread counts and last message preview.
 *
 * Query: adminId, search, page, limit, sortBy, sortOrder
 */
export default async function ChatGetUserListHandler(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

    await ConnectDB();

    const sp = request.nextUrl.searchParams;
    const adminId = sp.get("adminId");
    const search = sp.get("search") || "";
    const page = Math.max(1, parseInt(sp.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "20")));
    const sortBy = sp.get("sortBy") || "lastMessageAt";
    const sortOrder = sp.get("sortOrder") === "asc" ? 1 : -1;

    if (!adminId || !Types.ObjectId.isValid(adminId)) {
        throw new ApiError("Valid adminId is required", 400);
    }

    const adminOid = new Types.ObjectId(adminId);

    // Aggregation: find all distinct conversation partners for this admin
    const pipeline: Parameters<typeof ChatMessageModel.aggregate>[0] = [
        // Match messages involving this admin
        {
            $match: {
                $or: [{ sender: adminOid }, { receiver: adminOid }],
            },
        },
        // Determine the "other" user in each message
        {
            $addFields: {
                otherUser: {
                    $cond: [{ $eq: ["$sender", adminOid] }, "$receiver", "$sender"],
                },
            },
        },
        // Sort by createdAt descending so $first picks the latest message
        { $sort: { createdAt: -1 as const } },
        // Group by otherUser
        {
            $group: {
                _id: "$otherUser",
                lastMessage: { $first: "$$ROOT" },
                lastMessageAt: { $first: "$createdAt" },
                // Count unread messages sent TO admin by this user
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$receiver", adminOid] },
                                    { $eq: ["$isRead", false] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        // Lookup user details
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userDoc",
            },
        },
        { $unwind: "$userDoc" },
        // Optional search filter
        ...(search
            ? [
                {
                    $match: {
                        $or: [
                            { "userDoc.name": { $regex: search, $options: "i" } },
                            { "userDoc.email": { $regex: search, $options: "i" } },
                        ],
                    },
                },
            ]
            : []),
        // Sort
        {
            $sort: {
                ...(sortBy === "unreadCount"
                    ? { unreadCount: sortOrder as 1 | -1 }
                    : sortBy === "name"
                        ? { "userDoc.name": sortOrder as 1 | -1 }
                        : { lastMessageAt: sortOrder as 1 | -1 }),
            },
        },
        // Facet for pagination
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
            },
        },
    ];

    const [result] = await ChatMessageModel.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    interface AggregatedRow {
        userDoc: {
            _id: Types.ObjectId;
            name: string;
            avatar?: string;
            role: string;
        };
        lastMessage?: {
            _id: Types.ObjectId;
            sender: Types.ObjectId;
            receiver: Types.ObjectId;
            message: string;
            timestamp?: Date;
            isDraft: boolean;
            isRead: boolean;
            isDelivered: boolean;
            isEdited: boolean;
            isDeletedBySender: boolean;
            isDeletedByReceiver: boolean;
            moderationStatus: string;
            createdAt?: Date;
            updatedAt?: Date;
        };
        lastMessageAt?: Date;
        unreadCount: number;
    }

    const items = (result?.data ?? []).map((row: AggregatedRow) => ({
        user: {
            _id: row.userDoc._id.toString(),
            name: row.userDoc.name,
            avatar: row.userDoc.avatar?.toString(),
            role: row.userDoc.role,
        },
        lastMessage: row.lastMessage
            ? {
                _id: row.lastMessage._id.toString(),
                sender: row.lastMessage.sender.toString(),
                receiver: row.lastMessage.receiver.toString(),
                message: row.lastMessage.message,
                timestamp: row.lastMessage.timestamp?.toISOString?.() ?? "",
                isDraft: row.lastMessage.isDraft,
                isRead: row.lastMessage.isRead,
                isDelivered: row.lastMessage.isDelivered,
                isEdited: row.lastMessage.isEdited,
                isDeletedBySender: row.lastMessage.isDeletedBySender,
                isDeletedByReceiver: row.lastMessage.isDeletedByReceiver,
                moderationStatus: row.lastMessage.moderationStatus,
                createdAt: row.lastMessage.createdAt?.toISOString?.() ?? "",
                updatedAt: row.lastMessage.updatedAt?.toISOString?.() ?? "",
            }
            : undefined,
        lastMessageAt: row.lastMessageAt?.toISOString?.() ?? undefined,
        unreadCount: row.unreadCount ?? 0,
    }));

    return {
        data: {
            data: { items, total, page, limit, totalPages },
        },
        status: 200,
    };
}
