import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { UserListResponse, UserConversationSummary } from "@/types/chatMessage.types";
import { USER_ROLE } from "@/constants/user.const";
import { MODERATION_STATUS } from "@/models/chatMessage.model";

// Generate a fixed list of mock users
const users: UserConversationSummary[] = Array.from({ length: 50 }).map(() => {
    const userId = faker.database.mongodbObjectId();
    const lastMessageTimestamp = faker.date.recent().toISOString();

    return {
        user: {
            _id: userId,
            name: faker.person.fullName(),
            avatar: faker.image.avatar(),
            role: faker.helpers.arrayElement([USER_ROLE.TRAVELER, USER_ROLE.SUPPORT]),
        },
        lastMessage: {
            _id: faker.database.mongodbObjectId(),
            sender: { _id: userId, name: "User", avatar: faker.image.avatar(), role: USER_ROLE.TRAVELER },
            receiver: { _id: "ADMIN_ID", name: "Admin", avatar: "/avatar.png", role: USER_ROLE.SUPPORT },
            message: faker.lorem.sentence(),
            timestamp: lastMessageTimestamp,
            isDraft: false,
            isRead: faker.datatype.boolean(),
            isDelivered: true,
            isEdited: false,
            isDeletedBySender: false,
            isDeletedByReceiver: false,
            moderationStatus: MODERATION_STATUS.CLEAN,
            createdAt: lastMessageTimestamp,
            updatedAt: lastMessageTimestamp,
        },
        lastMessageAt: lastMessageTimestamp,
        unreadCount: faker.number.int({ min: 0, max: 5 }),
    };
});

export async function GET(req: NextRequest): Promise<NextResponse<UserListResponse>> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search")?.toLowerCase();

    let filtered = users;

    if (search) {
        filtered = filtered.filter((u) => u.user.name.toLowerCase().includes(search));
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
        {
            success: true,
            data: {
                items: paginated,
                total,
                page,
                limit,
                totalPages,
            },
        },
        { status: 200 }
    );
}
