import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import type {
    AiChatMessage,
    AiChatSession,
    DeleteSessionResponse,
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
    sessionCache: Record<string, {
        messages: AiChatMessage[];
        messagesCursor: string | null;
        messagesHasMore: boolean;
    }>;

    draftMessage: string;
    sending: boolean;
    error: string | null;

    setDraftMessage: (value: string) => void;
    fetchSessionsInitial: () => Promise<void>;
    fetchMoreSessions: () => Promise<void>;
    selectSession: (sessionId: string) => Promise<void>;
    startNewSession: () => void;
    fetchMoreMessages: () => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
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
    sessionCache: {} as Record<string, {
        messages: AiChatMessage[];
        messagesCursor: string | null;
        messagesHasMore: boolean;
    }>,

    draftMessage: "",
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

            setDraftMessage: (value: string) => set({ draftMessage: value }),

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
                const { sessionCache, sessions } = get();
                const cached = sessionCache[sessionId];
                const sessionMeta = sessions.find((s) => s.sessionId === sessionId);

                if (cached) {
                    set({
                        activeSessionId: sessionId,
                        activeSessionTitle: sessionMeta?.title || "Chat",
                        messages: cached.messages,
                        messagesCursor: cached.messagesCursor,
                        messagesHasMore: cached.messagesHasMore,
                        messagesLoading: false,
                        error: null,
                    });
                    return;
                }

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

                    const currentSessionMeta = get().sessions.find((s) => s.sessionId === sessionId);

                    set({
                        activeSessionTitle: data.title || currentSessionMeta?.title || "Chat",
                        messages: data.messages,
                        messagesCursor: data.nextCursor,
                        messagesHasMore: data.hasMore,
                        messagesLoading: false,
                        sessionCache: {
                            ...get().sessionCache,
                            [sessionId]: {
                                messages: data.messages,
                                messagesCursor: data.nextCursor,
                                messagesHasMore: data.hasMore,
                            }
                        }
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
                    draftMessage: "",
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

                    const newMessages = [...data.messages, ...messages];

                    set({
                        messages: newMessages,
                        messagesCursor: data.nextCursor,
                        messagesHasMore: data.hasMore,
                        messagesLoading: false,
                        sessionCache: {
                            ...get().sessionCache,
                            [activeSessionId]: {
                                messages: newMessages,
                                messagesCursor: data.nextCursor,
                                messagesHasMore: data.hasMore,
                            }
                        }
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
                    draftMessage: "",
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

                    const newMessages = [...currentMessages, user, assistant];

                    set({
                        activeSessionId: data.sessionId,
                        activeSessionTitle: existing?.title ?? sessionSummary.title,
                        messages: newMessages,
                        sessions: upsertSession(get().sessions, sessionSummary),
                        sending: false,
                        sessionCache: {
                            ...get().sessionCache,
                            [data.sessionId]: {
                                messages: newMessages,
                                messagesCursor: get().messagesCursor,
                                messagesHasMore: get().messagesHasMore,
                            }
                        }
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

            deleteSession: async (sessionId: string) => {
                try {
                    await api.delete<DeleteSessionResponse>(
                        `${API_BASE}/${sessionId}`
                    );

                    const { activeSessionId, sessions } = get();
                    const remaining = sessions.filter((s) => s.sessionId !== sessionId);
                    
                    const newCache = { ...get().sessionCache };
                    delete newCache[sessionId];

                    const wasActive = activeSessionId === sessionId;

                    set({
                        sessions: remaining,
                        sessionCache: newCache,
                        ...(wasActive
                            ? {
                                  activeSessionId: null,
                                  activeSessionTitle: "New chat",
                                  messages: [],
                                  messagesCursor: null,
                                  messagesHasMore: false,
                                  messagesLoading: false,
                              }
                            : {}),
                    });
                } catch (err) {
                    set({ error: extractErrorMessage(err) });
                }
            },

            reset: () => set(initialState),
        }),
        { name: "ai-chat-store" }
    )
);
