export type AiChatMessageRole = "user" | "assistant";

export type AiChatMessageMeta = {
    provider?: string;
    model?: string;
    actionType?: "reply" | "clarify" | "query" | "error" | string;
    queryCount?: number;
    latencyMs?: number;
    error?: string;
    [key: string]: unknown;
};

export interface AiChatMessage {
    id: string;
    role: AiChatMessageRole;
    content: string;
    createdAt: string;
    meta?: AiChatMessageMeta;
}

export interface AiChatSession {
    sessionId: string;
    title: string;
    lastMessagePreview: string;
    lastMessageAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FetchSessionsResponse {
    sessions: AiChatSession[];
    nextCursor: string | null;
    hasMore: boolean;
}

export interface FetchSessionMessagesResponse {
    sessionId: string;
    title: string;
    messages: AiChatMessage[];
    nextCursor: string | null;
    hasMore: boolean;
}

export interface SendAiChatMessageBody {
    message: string;
    sessionId?: string;
    conversationId?: string;
}

export interface SendAiChatMessageResponse {
    sessionId: string;
    conversationId: string;
    response: string;
    messages: {
        user: AiChatMessage;
        assistant: AiChatMessage;
    };
}

export interface DeleteSessionResponse {
    deleted: boolean;
}
