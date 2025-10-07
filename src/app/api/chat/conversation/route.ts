import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";

import type {
    ConversationResponse,
    ChatMessage,
} from "@/types/chatMessage.types";
import { USER_ROLE } from "@/constants/user.const";
import { MODERATION_STATUS } from "@/models/chatMessage.model";

/**
 * =========================
 * In-memory mock DB
 * =========================
 * Replace with real DB queries in production.
 */
const messages: ChatMessage[] = Array.from({ length: 100 }).map(() => ({
    _id: faker.database.mongodbObjectId(),
    sender: {
        _id: faker.database.mongodbObjectId(),
        name: faker.person.fullName(),
        avatar: faker.image.avatar(),
        role: USER_ROLE.TRAVELER,
    },
    receiver: {
        _id: faker.database.mongodbObjectId(),
        name: faker.person.fullName(),
        avatar: faker.image.avatar(),
        role: USER_ROLE.SUPPORT,
    },
    message: faker.lorem.sentence(),
    timestamp: faker.date.recent().toISOString(),
    isDraft: false,
    isRead: faker.datatype.boolean(),
    isDelivered: true,
    isEdited: false,
    isDeletedBySender: false,
    isDeletedByReceiver: false,
    moderationStatus: MODERATION_STATUS.CLEAN,
    createdAt: faker.date.recent().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
}));

/**
 * =========================
 * GET /api/chat/conversation
 * =========================
 * Query params: userA, userB, page, limit
 */
export async function GET(req: NextRequest): Promise<NextResponse<ConversationResponse>> {
    const { searchParams } = new URL(req.url);

    const userA = searchParams.get("userA");
    const userB = searchParams.get("userB");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!userA || !userB) {
        return NextResponse.json(
            { success: false, message: "Both userA and userB are required" },
            { status: 400 }
        );
    }

    // Filter conversation between two users
    const conversation = messages.filter((m) => {
        const senderId = typeof m.sender === "string" ? m.sender : m.sender._id;
        const receiverId = typeof m.receiver === "string" ? m.receiver : m.receiver._id;
        return (
            (senderId === userA && receiverId === userB) ||
            (senderId === userB && receiverId === userA)
        );
    });

    // Sort by timestamp ascending (like WhatsApp)
    conversation.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = conversation.slice(start, end);
    const total = conversation.length;
    const totalPages = Math.ceil(total / limit);

    const response: ConversationResponse = {
        success: true,
        data: {
            items,
            total,
            page,
            limit,
            totalPages,
        },
    };

    return NextResponse.json(response, { status: 200 });
}
