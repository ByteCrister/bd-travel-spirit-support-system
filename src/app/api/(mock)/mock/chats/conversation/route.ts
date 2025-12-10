import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { ConversationResponse, ChatMessage } from "@/types/chatMessage.types";
import { USER_ROLE } from "@/constants/user.const";
import { MODERATION_STATUS } from "@/constants/chatmessage.const";

/**
 * =========================
 * GET /api/chat/conversation
 * Query params: sender, receiver, page, limit
 */
export async function GET(req: NextRequest): Promise<NextResponse<ConversationResponse>> {
    const { searchParams } = new URL(req.url);

    const sender = searchParams.get("sender");
    const receiver = searchParams.get("receiver");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!sender || !receiver) {
        return NextResponse.json(
            { success: false, message: "Both sender and receiver are required" },
            { status: 400 }
        );
    }

    // Generate 50 mock messages between sender and receiver
    const messages: ChatMessage[] = Array.from({ length: 50 }).map((_, i) => {
        const isSenderToReceiver = i % 2 === 0; // alternate direction
        return {
            _id: faker.database.mongodbObjectId(),
            sender: {
                _id: isSenderToReceiver ? sender : receiver,
                name: faker.person.fullName(),
                avatar: faker.image.avatar(),
                role: isSenderToReceiver ? USER_ROLE.SUPPORT : USER_ROLE.TRAVELER,
            },
            receiver: {
                _id: isSenderToReceiver ? receiver : sender,
                name: faker.person.fullName(),
                avatar: faker.image.avatar(),
                role: isSenderToReceiver ? USER_ROLE.TRAVELER : USER_ROLE.SUPPORT,
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
        };
    });

    // Sort by timestamp descending (newest first)
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = messages.slice(start, end);
    const totalPages = Math.ceil(messages.length / limit);

    const response: ConversationResponse = {
        success: true,
        data: {
            items: paginated,
            total: messages.length,
            page,
            limit,
            totalPages,
        },
    };

    return NextResponse.json(response, { status: 200 });
}
