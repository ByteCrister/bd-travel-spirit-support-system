import { Types } from "mongoose";
import { ChatTurn } from "./llm.interface";
import {
    AIChatMessageModel,
    AIChatSessionModel,
    ChatMessageRole,
    IChatMessage,
    IChatSession,
} from "@/models/ai-chat-bot/chat.model";

const HISTORY_LIMIT = 8;
const DEFAULT_SESSION_TITLE = "New chat";
const TITLE_MAX_LENGTH = 200;
const PREVIEW_MAX_LENGTH = 1000;

export function buildSessionTitle(firstUserMessage: string): string {
    const trimmed = firstUserMessage.trim();
    if (!trimmed) return DEFAULT_SESSION_TITLE;
    return trimmed.length > TITLE_MAX_LENGTH
        ? `${trimmed.slice(0, TITLE_MAX_LENGTH)}…`
        : trimmed;
}

function buildPreview(text: string): string {
    const trimmed = text.trim();
    if (!trimmed) return "";
    return trimmed.length > PREVIEW_MAX_LENGTH
        ? `${trimmed.slice(0, PREVIEW_MAX_LENGTH - 1)}…`
        : trimmed;
}

export async function getSessionForUser(
    sessionId: string,
    userId: string
): Promise<IChatSession | null> {
    if (!Types.ObjectId.isValid(sessionId)) return null;

    const session = await AIChatSessionModel.findById(sessionId);
    if (!session || session.user.toString() !== userId) return null;
    return session;
}

export async function loadSessionHistory(
    sessionId: string,
    userId: string
): Promise<ChatTurn[]> {
    const session = await getSessionForUser(sessionId, userId);
    if (!session) return [];

    const messages = await AIChatMessageModel.find({ session: session._id })
        .sort({ _id: -1 })
        .limit(HISTORY_LIMIT)
        .lean();

    return messages
        .reverse()
        .map((entry: { role: string; content: string }) => ({
            role: entry.role as ChatMessageRole,
            content: entry.content,
        }));
}

export type SavedChatExchange = {
    sessionId: string;
    userMessage: SerializedMessage;
    assistantMessage: SerializedMessage;
};

export type SerializedMessage = {
    id: string;
    role: ChatMessageRole;
    content: string;
    createdAt: string;
};

function serializeMessage(doc: IChatMessage): SerializedMessage {
    return {
        id: String(doc._id),
        role: doc.role,
        content: doc.content,
        createdAt: doc.createdAt.toISOString(),
    };
}

export async function saveChatExchange(
    userId: string,
    sessionId: string | undefined,
    userMessage: string,
    assistantResponse: string
): Promise<SavedChatExchange> {
    const userObjectId = new Types.ObjectId(userId);
    let session: IChatSession | null = null;

    if (sessionId) {
        session = await getSessionForUser(sessionId, userId);
    }

    if (!session) {
        session = await AIChatSessionModel.create({
            user: userObjectId,
            title: buildSessionTitle(userMessage),
            lastMessagePreview: buildPreview(assistantResponse),
            lastMessageAt: new Date(),
        });
    }

    const [userDoc, assistantDoc] = await AIChatMessageModel.create([
        {
            session: session._id,
            role: "user",
            content: userMessage,
        },
        {
            session: session._id,
            role: "assistant",
            content: assistantResponse,
        },
    ]);

    if (session.title === DEFAULT_SESSION_TITLE) {
        session.title = buildSessionTitle(userMessage);
    }
    session.lastMessagePreview = buildPreview(assistantResponse);
    session.lastMessageAt = assistantDoc.createdAt;
    await session.save();

    return {
        sessionId: String(session._id),
        userMessage: serializeMessage(userDoc),
        assistantMessage: serializeMessage(assistantDoc),
    };
}

export type CursorPage<T> = {
    items: T[];
    nextCursor: string | null;
    hasMore: boolean;
};

export async function listSessions(
    userId: string,
    cursor: string | null,
    limit: number
): Promise<CursorPage<{
    sessionId: string;
    title: string;
    lastMessagePreview: string;
    lastMessageAt: string | null;
    createdAt: string;
    updatedAt: string;
}>> {
    const filter: Record<string, unknown> = { user: new Types.ObjectId(userId) };
    if (cursor) {
        if (!Types.ObjectId.isValid(cursor)) {
            throw new Error("Invalid cursor");
        }
        filter._id = { $lt: new Types.ObjectId(cursor) };
    }

    const docs = await AIChatSessionModel.find(filter)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = docs.length > limit;
    const page = hasMore ? docs.slice(0, limit) : docs;

    return {
        items: page.map((session: {
            _id: Types.ObjectId;
            title: string;
            lastMessagePreview?: string;
            lastMessageAt?: Date;
            createdAt: Date;
            updatedAt: Date;
        }) => ({
            sessionId: session._id.toString(),
            title: session.title,
            lastMessagePreview: session.lastMessagePreview ?? "",
            lastMessageAt: session.lastMessageAt?.toISOString() ?? null,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
        })),
        nextCursor: hasMore ? page[page.length - 1]._id.toString() : null,
        hasMore,
    };
}

export async function listSessionMessages(
    sessionId: string,
    userId: string,
    cursor: string | null,
    limit: number
): Promise<
    CursorPage<SerializedMessage> & {
        session: {
            sessionId: string;
            title: string;
        };
    }
> {
    const session = await getSessionForUser(sessionId, userId);
    if (!session) {
        throw new Error("Session not found");
    }

    const filter: Record<string, unknown> = { session: session._id };
    if (cursor) {
        if (!Types.ObjectId.isValid(cursor)) {
            throw new Error("Invalid cursor");
        }
        filter._id = { $lt: new Types.ObjectId(cursor) };
    }

    const docs = await AIChatMessageModel.find(filter)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = docs.length > limit;
    const batch = hasMore ? docs.slice(0, limit) : docs;
    const chronological = [...batch].reverse();

    return {
        session: {
            sessionId: String(session._id),
            title: session.title,
        },
        items: chronological.map((message) => ({
            id: message._id.toString(),
            role: message.role as ChatMessageRole,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
        })),
        nextCursor: hasMore ? chronological[0]?.id ?? null : null,
        hasMore,
    };
}
