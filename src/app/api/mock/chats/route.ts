import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";

import type {
    ChatMessage,
    ChatMessageListResponse,
    CreateChatMessageDTO,
    UpdateChatMessageDTO,
    ChatMessageMutationResponse,
} from "@/types/chatMessage.types";
import { USER_ROLE } from "@/constants/user.const";
import { MODERATION_STATUS } from "@/models/chatMessage.model";

/**
 * =========================
 * In-memory mock DB
 * =========================
 * For demo purposes only. Replace with real DB queries in production.
 */
const globalStore = globalThis as unknown as { messages?: ChatMessage[] };

if (!globalStore.messages) {
    globalStore.messages = Array.from({ length: 50 }).map(() => ({
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
}

export const messages = globalStore.messages!;


/**
 * =========================
 * GET /api/chat
 * =========================
 * Supports pagination via query params (?page=1&limit=20)
 */
export async function GET(req: NextRequest): Promise<NextResponse<ChatMessageListResponse>> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const start = (page - 1) * limit;
    const end = start + limit;

    const items = messages.slice(start, end);
    const total = messages.length;
    const totalPages = Math.ceil(total / limit);

    const response: ChatMessageListResponse = {
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

/**
 * =========================
 * POST /api/chat
 * =========================
 * Create a new message
 */
export async function POST(req: NextRequest): Promise<NextResponse<ChatMessageMutationResponse>> {
    try {
        const body: CreateChatMessageDTO = await req.json();

        const newMessage: ChatMessage = {
            _id: faker.database.mongodbObjectId(),
            sender: {
                _id: faker.database.mongodbObjectId(), // replace with auth user in real app
                name: faker.person.fullName(),
                avatar: faker.image.avatar(),
                role: USER_ROLE.TRAVELER,
            },
            receiver: body.receiver,
            message: body.message,
            timestamp: new Date().toISOString(),
            isDraft: !!body.isDraft,
            isRead: false,
            isDelivered: false,
            isEdited: false,
            isDeletedBySender: false,
            isDeletedByReceiver: false,
            moderationStatus: MODERATION_STATUS.CLEAN,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        messages.unshift(newMessage);

        return NextResponse.json(
            { success: true, data: newMessage },
            { status: 201 }
        );
    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Invalid request" },
            { status: 400 }
        );
    }
}

/**
 * =========================
 * PATCH /api/chat?id=...
 * =========================
 * Update an existing message
 */
export async function PATCH(req: NextRequest): Promise<NextResponse<ChatMessageMutationResponse>> {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
        return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });
    }

    try {
        const body: UpdateChatMessageDTO = await req.json();
        const idx = messages.findIndex((m) => m._id === id);
        if (idx === -1) {
            return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
        }

        const updated: ChatMessage = {
            ...messages[idx],
            ...body,
            updatedAt: new Date().toISOString(),
        };
        messages[idx] = updated;

        return NextResponse.json({ success: true, data: updated }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
}

/**
 * =========================
 * DELETE /api/chat?id=...
 * =========================
 * Remove a message
 */
export async function DELETE(req: NextRequest): Promise<NextResponse<ChatMessageMutationResponse>> {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
        return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });
    }

    const idx = messages.findIndex((m) => m._id === id);
    if (idx === -1) {
        return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }

    const deleted = messages[idx];
    messages.splice(idx, 1);

    return NextResponse.json({ success: true, data: deleted }, { status: 200 });
}
