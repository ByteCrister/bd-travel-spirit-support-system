import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import type {
    AiChatMessage,
    AiChatSession,
    FetchSessionMessagesResponse,
    FetchSessionsResponse,
    SendAiChatMessageResponse,
} from "@/types/ai-chat";

const API_BASE = "/dashboard/v1/ai-chat";
const SESSION_PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 30;

interface AiChatState {
    sessions: AiChatSession[];
    sessionsCursor: string | null;
    sessionsHasMore: boolean;
    sessionsLoading: boolean;

    activeSessionId: string | null;
    activeSessionTitle: string;
    messages: AiChatMessage[];
    messagesCursor: string | null;
    messagesHasMore: boolean;
    messagesLoading: boolean;

    sending: boolean;
    error: string | null;

    fetchSessionsInitial: () => Promise<void>;
    fetchMoreSessions: () => Promise<void>;
    selectSession: (sessionId: string) => Promise<void>;
    startNewSession: () => void;
    fetchMoreMessages: () => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    sessions: [] as AiChatSession[],
    sessionsCursor: null as string | null,
    sessionsHasMore: true,
    sessionsLoading: false,

    activeSessionId: null as string | null,
    activeSessionTitle: "New chat",
    messages: [] as AiChatMessage[],
    messagesCursor: null as string | null,
    messagesHasMore: false,
    messagesLoading: false,

    sending: false,
    error: null as string | null,
};

function upsertSession(sessions: AiChatSession[], session: AiChatSession): AiChatSession[] {
    const without = sessions.filter((item) => item.sessionId !== session.sessionId);
    return [session, ...without];
}

export const useAiChatStore = create<AiChatState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            fetchSessionsInitial: async () => {
                set({ sessionsLoading: true, error: null });
                try {
                    const { data } = await api.get<FetchSessionsResponse>(API_BASE, {
                        params: { limit: SESSION_PAGE_SIZE },
                    });
                    set({
                        sessions: data.sessions,
                        sessionsCursor: data.nextCursor,
                        sessionsHasMore: data.hasMore,
                        sessionsLoading: false,
                    });
                } catch (err) {
                    set({
                        sessionsLoading: false,
                        error: extractErrorMessage(err),
                    });
                }
            },

            fetchMoreSessions: async () => {
                const { sessionsCursor, sessionsHasMore, sessionsLoading, sessions } = get();
                if (!sessionsHasMore || sessionsLoading || !sessionsCursor) return;

                set({ sessionsLoading: true });
                try {
                    const { data } = await api.get<FetchSessionsResponse>(API_BASE, {
                        params: { cursor: sessionsCursor, limit: SESSION_PAGE_SIZE },
                    });
                    set({
                        sessions: [...sessions, ...data.sessions],
                        sessionsCursor: data.nextCursor,
                        sessionsHasMore: data.hasMore,
                        sessionsLoading: false,
                    });
                } catch (err) {
                    set({
                        sessionsLoading: false,
                        error: extractErrorMessage(err),
                    });
                }
            },

            selectSession: async (sessionId: string) => {
                set({
                    activeSessionId: sessionId,
                    messages: [],
                    messagesCursor: null,
                    messagesHasMore: false,
                    messagesLoading: true,
                    error: null,
                });

                try {
                    const { data } = await api.get<FetchSessionMessagesResponse>(API_BASE, {
                        params: { sessionId, limit: MESSAGE_PAGE_SIZE },
                    });

                    const sessionMeta = get().sessions.find((s) => s.sessionId === sessionId);

                    set({
                        activeSessionTitle: data.title || sessionMeta?.title || "Chat",
                        messages: data.messages,
                        messagesCursor: data.nextCursor,
                        messagesHasMore: data.hasMore,
                        messagesLoading: false,
                    });
                } catch (err) {
                    set({
                        messagesLoading: false,
                        error: extractErrorMessage(err),
                    });
                }
            },

            startNewSession: () => {
                set({
                    activeSessionId: null,
                    activeSessionTitle: "New chat",
                    messages: [],
                    messagesCursor: null,
                    messagesHasMore: false,
                    messagesLoading: false,
                    error: null,
                });
            },

            fetchMoreMessages: async () => {
                const {
                    activeSessionId,
                    messagesCursor,
                    messagesHasMore,
                    messagesLoading,
                    messages,
                } = get();

                if (!activeSessionId || !messagesHasMore || messagesLoading || !messagesCursor) {
                    return;
                }

                set({ messagesLoading: true });
                try {
                    const { data } = await api.get<FetchSessionMessagesResponse>(API_BASE, {
                        params: {
                            sessionId: activeSessionId,
                            cursor: messagesCursor,
                            limit: MESSAGE_PAGE_SIZE,
                        },
                    });

                    set({
                        messages: [...data.messages, ...messages],
                        messagesCursor: data.nextCursor,
                        messagesHasMore: data.hasMore,
                        messagesLoading: false,
                    });
                } catch (err) {
                    set({
                        messagesLoading: false,
                        error: extractErrorMessage(err),
                    });
                }
            },

            sendMessage: async (content: string) => {
                const trimmed = content.trim();
                if (!trimmed) return;

                const { activeSessionId, sending, messages } = get();
                if (sending) return;

                const optimisticUser: AiChatMessage = {
                    id: `temp-user-${Date.now()}`,
                    role: "user",
                    content: trimmed,
                    createdAt: new Date().toISOString(),
                };

                set({
                    sending: true,
                    error: null,
                    messages: [...messages, optimisticUser],
                });

                try {
                    const { data } = await api.post<SendAiChatMessageResponse>(API_BASE, {
                        message: trimmed,
                        sessionId: activeSessionId ?? undefined,
                    });

                    const { user, assistant } = data.messages;
                    const currentMessages = get().messages.filter(
                        (message) => message.id !== optimisticUser.id
                    );

                    const existing = get().sessions.find((s) => s.sessionId === data.sessionId);

                    const sessionSummary: AiChatSession = {
                        sessionId: data.sessionId,
                        title: existing?.title ?? trimmed.slice(0, 80),
                        lastMessagePreview: assistant.content.slice(0, 200),
                        lastMessageAt: assistant.createdAt,
                        createdAt: existing?.createdAt ?? user.createdAt,
                        updatedAt: assistant.createdAt,
                    };

                    set({
                        activeSessionId: data.sessionId,
                        activeSessionTitle: existing?.title ?? sessionSummary.title,
                        messages: [...currentMessages, user, assistant],
                        sessions: upsertSession(get().sessions, sessionSummary),
                        sending: false,
                    });
                } catch (err) {
                    set({
                        sending: false,
                        messages: get().messages.filter((message) => message.id !== optimisticUser.id),
                        error: extractErrorMessage(err),
                    });
                }
            },

            clearError: () => set({ error: null }),

            reset: () => set(initialState),
        }),
        { name: "ai-chat-store" }
    )
);
