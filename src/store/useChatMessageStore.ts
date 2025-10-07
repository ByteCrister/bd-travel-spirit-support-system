// stores/useChatMessage.store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produce } from "immer";

import type {
    ChatMessage,
    ChatMessageQuery,
    ChatMessageListResponse,
    ChatMessageResponse,
    ChatMessageMutationResponse,
    CreateChatMessageDTO,
    UpdateChatMessageDTO,
    ChatMessageStats,
    ChatMessageStatsResponse,
    ChatMessageEvent,
    ConversationQuery,
    ConversationResponse,
} from "@/types/chatMessage.types";
import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";

/**
 * =========================
 * Endpoint configuration
 * =========================
 */
const ENDPOINTS = {
    conversation: "/chat/conversation",
    list: "/chat",
    byId: (id: string) => `/chat/${id}`,
    create: "/chat",
    update: (id: string) => `/chat/${id}`,
    delete: (id: string) => `/chat/${id}`,
    stats: "/chat/stats",
    markRead: (id: string) => `/chat/${id}/read`,
    markDelivered: (id: string) => `/chat/${id}/delivered`,
    moderate: (id: string) => `/chat/${id}/moderation`,
};

/**
 * =========================
 * Cache key builders
 * =========================
 */
function buildQueryKey(q?: ChatMessageQuery): string {
    // Stable cache key for list queries
    const params = new URLSearchParams();
    if (!q) return "default";
    if (q.sender) params.set("sender", q.sender);
    if (q.receiver) params.set("receiver", q.receiver);
    if (typeof q.isRead === "boolean") params.set("isRead", String(q.isRead));
    if (typeof q.isDelivered === "boolean") params.set("isDelivered", String(q.isDelivered));
    if (q.moderationStatus) params.set("moderationStatus", q.moderationStatus);
    if (q.dateFrom) params.set("dateFrom", q.dateFrom);
    if (q.dateTo) params.set("dateTo", q.dateTo);
    if (q.search) params.set("search", q.search);
    params.set("page", String(q.page ?? 1));
    params.set("limit", String(q.limit ?? 20));
    params.set("sortBy", q.sortBy ?? "createdAt");
    params.set("sortOrder", q.sortOrder ?? "desc");
    return params.toString();
}

function mergeMessages(
    existing: Record<string, ChatMessage>,
    incoming: ChatMessage[]
): Record<string, ChatMessage> {
    const copy = { ...existing };
    for (const m of incoming) copy[m._id] = m;
    return copy;
}

/**
 * =========================
 * Store state & actions
 * =========================
 */
export interface ChatMessageStoreState {
    // Normalized cache
    messagesById: Record<string, ChatMessage>;
    listsByQueryKey: Record<
        string,
        {
            ids: string[]; // normalized list of message ids for this query
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            lastFetchedAt?: number;
        }
    >;

    // Single message fetch status
    messageLoadingById: Record<string, boolean>;
    messageErrorById: Record<string, string | undefined>;

    // List fetch status
    listLoadingByKey: Record<string, boolean>;
    listErrorByKey: Record<string, string | undefined>;

    // Stats
    stats?: ChatMessageStats;
    statsLoading: boolean;
    statsError?: string;

    // Global mutation flags
    mutatingIds: Set<string>;

    // Actions
    fetchMessages: (query?: ChatMessageQuery, options?: { force?: boolean }) => Promise<void>;
    fetchMessageById: (id: string, options?: { force?: boolean }) => Promise<ChatMessage | undefined>;

    fetchConversation: (
        query: ConversationQuery,
        options?: { force?: boolean }
    ) => Promise<void>;

    getConversation: (query: ConversationQuery) => ChatMessage[];
    getConversationMeta: (query: ConversationQuery) => {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };

    sendMessage: (payload: CreateChatMessageDTO) => Promise<ChatMessage>;
    updateMessage: (id: string, payload: UpdateChatMessageDTO) => Promise<ChatMessage>;
    deleteMessage: (id: string) => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markDelivered: (id: string) => Promise<void>;
    moderateMessage: (id: string, status: UpdateChatMessageDTO["moderationStatus"]) => Promise<void>;

    fetchStats: () => Promise<void>;
    invalidateList: (query?: ChatMessageQuery) => void;
    invalidateMessage: (id: string) => void;

    // Realtime event integration
    handleEvent: (evt: ChatMessageEvent) => void;

    // Selectors
    getList: (query?: ChatMessageQuery) => ChatMessage[];
    getListMeta: (query?: ChatMessageQuery) => { total: number; page: number; limit: number; totalPages: number };
    getMessage: (id: string) => ChatMessage | undefined;
}

export const useChatMessageStore = create<ChatMessageStoreState>()(
    devtools((set, get) => ({
        messagesById: {},
        listsByQueryKey: {},
        messageLoadingById: {},
        messageErrorById: {},
        listLoadingByKey: {},
        listErrorByKey: {},
        stats: undefined,
        statsLoading: false,
        statsError: undefined,
        mutatingIds: new Set<string>(),

        /**
         * Fetch paginated messages with caching by query key.
         * Optionally 'force' to bypass cache and refetch.
         */
        async fetchMessages(query, options) {
            const key = buildQueryKey(query);
            const state = get();

            // Use cache unless force
            if (!options?.force && state.listsByQueryKey[key]?.lastFetchedAt) {
                return;
            }

            set(
                produce((draft: ChatMessageStoreState) => {
                    draft.listLoadingByKey[key] = true;
                    draft.listErrorByKey[key] = undefined;
                })
            );

            try {
                const params = {
                    sender: query?.sender,
                    receiver: query?.receiver,
                    isRead: query?.isRead,
                    isDelivered: query?.isDelivered,
                    moderationStatus: query?.moderationStatus,
                    dateFrom: query?.dateFrom,
                    dateTo: query?.dateTo,
                    search: query?.search,
                    page: query?.page ?? 1,
                    limit: query?.limit ?? 20,
                    sortBy: query?.sortBy ?? "createdAt",
                    sortOrder: query?.sortOrder ?? "desc",
                };

                const res = await api.get<ChatMessageListResponse>(ENDPOINTS.list, { params });
                if (!res.data.success || !res.data.data) {
                    throw new Error(res.data.message || "Failed to fetch messages");
                }

                const { items, total, page, limit, totalPages } = res.data.data;

                set(
                    produce((draft: ChatMessageStoreState) => {
                        draft.messagesById = mergeMessages(draft.messagesById, items);

                        const existing = draft.listsByQueryKey[key];
                        if (existing && (query?.page ?? 1) > 1) {
                            // Append new page
                            existing.ids.push(...items.map((m) => m._id));
                            existing.total = total;
                            existing.page = page;
                            existing.limit = limit;
                            existing.totalPages = totalPages;
                            existing.lastFetchedAt = Date.now();
                        } else {
                            // First page or no existing list
                            draft.listsByQueryKey[key] = {
                                ids: items.map((m) => m._id),
                                total,
                                page,
                                limit,
                                totalPages,
                                lastFetchedAt: Date.now(),
                            };
                        }
                        draft.listLoadingByKey[key] = false;
                    })
                );
            } catch (err) {
                const msg = extractErrorMessage(err);
                set(
                    produce((draft: ChatMessageStoreState) => {
                        draft.listLoadingByKey[key] = false;
                        draft.listErrorByKey[key] = msg;
                    })
                );
            }
        },

        /**
         * Fetch a full conversation between two users.
         * Uses cached data unless `options.force` is true.
         */
        async fetchConversation(query, options) {
            const key = buildQueryKey({
                sender: query.userA,
                receiver: query.userB,
                page: query.page,
                limit: query.limit,
                sortBy: query.sortBy,
                sortOrder: query.sortOrder,
            });

            const state = get();
            if (!options?.force && state.listsByQueryKey[key]?.lastFetchedAt) return;

            set(produce((draft: ChatMessageStoreState) => {
                draft.listLoadingByKey[key] = true;
                draft.listErrorByKey[key] = undefined;
            }));

            try {
                const res = await api.get<ConversationResponse>(ENDPOINTS.conversation, {
                    params: {
                        sender: query.userA,
                        receiver: query.userB,
                        page: query.page ?? 1,
                        limit: query.limit ?? 20,
                        sortBy: query.sortBy ?? "createdAt",
                        sortOrder: query.sortOrder ?? "asc",
                    },
                });

                if (!res.data.success || !res.data.data) {
                    throw new Error(res.data.message || "Failed to fetch conversation");
                }

                const { items, total, page, limit, totalPages } = res.data.data;

                set(produce((draft: ChatMessageStoreState) => {
                    draft.messagesById = mergeMessages(draft.messagesById, items);
                    draft.listsByQueryKey[key] = {
                        ids: items.map((m) => m._id),
                        total,
                        page,
                        limit,
                        totalPages,
                        lastFetchedAt: Date.now(),
                    };
                    draft.listLoadingByKey[key] = false;
                }));
            } catch (err) {
                const msg = extractErrorMessage(err);
                set(produce((draft: ChatMessageStoreState) => {
                    draft.listLoadingByKey[key] = false;
                    draft.listErrorByKey[key] = msg;
                }));
            }
        },
        /**
         * Get a conversation’s messages from the local store (no API call).
         */
        getConversation(query) {
            const key = buildQueryKey({
                sender: query.userA,
                receiver: query.userB,
                page: query.page,
                limit: query.limit,
                sortBy: query.sortBy,
                sortOrder: query.sortOrder,
            });
            const { listsByQueryKey, messagesById } = get();
            const list = listsByQueryKey[key];
            if (!list) return [];
            return list.ids.map((id) => messagesById[id]).filter(Boolean);
        },
        /**
         * Get pagination metadata for a specific conversation.
         */
        getConversationMeta(query) {
            const key = buildQueryKey({
                sender: query.userA,
                receiver: query.userB,
                page: query.page,
                limit: query.limit,
                sortBy: query.sortBy,
                sortOrder: query.sortOrder,
            });
            const list = get().listsByQueryKey[key];
            return {
                total: list?.total ?? 0,
                page: list?.page ?? (query.page ?? 1),
                limit: list?.limit ?? (query.limit ?? 20),
                totalPages: list?.totalPages ?? 0,
            };
        },

        /**
         * Fetch a single message by id. Uses cached value unless force=true.
         */
        async fetchMessageById(id, options) {
            const state = get();
            const cached = state.messagesById[id];
            if (cached && !options?.force) return cached;

            set(
                produce((draft: ChatMessageStoreState) => {
                    draft.messageLoadingById[id] = true;
                    draft.messageErrorById[id] = undefined;
                })
            );

            try {
                const res = await api.get<ChatMessageResponse>(ENDPOINTS.byId(id));
                if (!res.data.success || !res.data.data) {
                    throw new Error(res.data.message || "Failed to fetch message");
                }
                const message = res.data.data;

                set(
                    produce((draft: ChatMessageStoreState) => {
                        draft.messagesById[message._id] = message;
                        draft.messageLoadingById[id] = false;
                    })
                );

                return message;
            } catch (err) {
                const msg = extractErrorMessage(err);
                set(
                    produce((draft: ChatMessageStoreState) => {
                        draft.messageLoadingById[id] = false;
                        draft.messageErrorById[id] = msg;
                    })
                );
                return undefined;
            }
        },

        /**
         * Send a new message (supports drafts).
         * Optimistically insert into the default cache list and messagesById.
         */
        async sendMessage(payload) {
            // Optimistic placeholder id
            const tempId = `temp_${Date.now()}`;
            const optimistic: ChatMessage = {
                _id: tempId,
                sender: "me", // Replace with authenticated user's id or IUserRef in your app shell
                receiver: payload.receiver,
                message: payload.message,
                timestamp: new Date().toISOString(),
                isDraft: !!payload.isDraft,
                isRead: false,
                isDelivered: false,
                isEdited: false,
                isDeletedBySender: false,
                isDeletedByReceiver: false,
                moderationStatus: "clean",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Insert optimistic into cache
            set(
                produce((draft: ChatMessageStoreState) => {
                    draft.messagesById[optimistic._id] = optimistic;
                    const key = buildQueryKey({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" });
                    const existing = draft.listsByQueryKey[key];
                    if (existing) {
                        existing.ids = [optimistic._id, ...existing.ids];
                        existing.total += 1;
                    } else {
                        draft.listsByQueryKey[key] = {
                            ids: [optimistic._id],
                            total: 1,
                            page: 1,
                            limit: 20,
                            totalPages: 1,
                            lastFetchedAt: Date.now(),
                        };
                    }
                })
            );

            try {
                const res = await api.post<ChatMessageMutationResponse>(ENDPOINTS.create, payload);
                if (!res.data.success || !res.data.data) {
                    throw new Error(res.data.message || "Failed to send message");
                }
                const created = res.data.data;

                // Replace optimistic with real
                set(
                    produce((draft: ChatMessageStoreState) => {
                        // Swap id in messagesById
                        delete draft.messagesById[tempId];
                        draft.messagesById[created._id] = created;

                        // Swap id in any lists containing tempId
                        for (const list of Object.values(draft.listsByQueryKey)) {
                            const idx = list.ids.indexOf(tempId);
                            if (idx !== -1) list.ids[idx] = created._id;
                        }
                    })
                );

                // Background refetch default list
                get().fetchMessages({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" }, { force: true });
                return created;
            } catch (err) {
                const msg = extractErrorMessage(err);
                // Rollback optimistic
                set(
                    produce((draft: ChatMessageStoreState) => {
                        delete draft.messagesById[tempId];
                        for (const list of Object.values(draft.listsByQueryKey)) {
                            list.ids = list.ids.filter((id) => id !== tempId);
                            list.total = Math.max(0, list.total - 1);
                        }
                    })
                );
                throw new Error(msg);
            }
        },

        /**
         * Update message (optimistic).
         */
        async updateMessage(id, payload) {
            const prev = get().messagesById[id];
            if (!prev) await get().fetchMessageById(id);

            // Optimistic apply
            set(
                produce((draft: ChatMessageStoreState) => {
                    const current = draft.messagesById[id];
                    if (!current) return;
                    draft.messagesById[id] = { ...current, ...payload, updatedAt: new Date().toISOString() };
                })
            );

            try {
                const res = await api.patch<ChatMessageMutationResponse>(ENDPOINTS.update(id), payload);
                if (!res.data.success || !res.data.data) {
                    throw new Error(res.data.message || "Failed to update message");
                }
                const updated = res.data.data;
                set(
                    produce((draft: ChatMessageStoreState) => {
                        draft.messagesById[id] = updated;
                    })
                );
                return updated;
            } catch (err) {
                const msg = extractErrorMessage(err);
                // Rollback
                set(
                    produce((draft: ChatMessageStoreState) => {
                        if (prev) draft.messagesById[id] = prev;
                    })
                );
                throw new Error(msg);
            }
        },

        /**
         * Soft delete a message (respecting per-user delete flags if needed).
         */
        async deleteMessage(id) {
            const prev = get().messagesById[id];
            // Optimistic remove from lists
            set(
                produce((draft: ChatMessageStoreState) => {
                    for (const list of Object.values(draft.listsByQueryKey)) {
                        const idx = list.ids.indexOf(id);
                        if (idx !== -1) {
                            list.ids.splice(idx, 1);
                            list.total = Math.max(0, list.total - 1);
                        }
                    }
                })
            );

            try {
                const res = await api.delete<ChatMessageMutationResponse>(ENDPOINTS.delete(id));
                if (!res.data.success) {
                    throw new Error(res.data.message || "Failed to delete message");
                }
                // Remove from entity cache
                set(
                    produce((draft: ChatMessageStoreState) => {
                        delete draft.messagesById[id];
                    })
                );
            } catch (err) {
                const msg = extractErrorMessage(err);
                // Rollback: re-insert id to lists and restore entity
                set(
                    produce((draft: ChatMessageStoreState) => {
                        if (prev) draft.messagesById[id] = prev;
                        // Re-add to default list front if we can't determine original position
                        const key = buildQueryKey({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" });
                        const list = draft.listsByQueryKey[key];
                        if (list && !list.ids.includes(id)) {
                            list.ids.unshift(id);
                            list.total += 1;
                        }
                    })
                );
                throw new Error(msg);
            }
        },

        /**
         * Mark a message as read (optimistic).
         */
        async markRead(id) {
            const prev = get().messagesById[id];
            set(
                produce((draft: ChatMessageStoreState) => {
                    const m = draft.messagesById[id];
                    if (m) m.isRead = true;
                })
            );
            try {
                await api.post(ENDPOINTS.markRead(id));
            } catch (err) {
                const msg = extractErrorMessage(err);
                set(
                    produce((draft: ChatMessageStoreState) => {
                        const m = draft.messagesById[id];
                        if (m && prev) m.isRead = prev.isRead;
                    })
                );
                throw new Error(msg);
            }
        },

        /**
         * Mark a message as delivered (optimistic).
         */
        async markDelivered(id) {
            const prev = get().messagesById[id];
            set(
                produce((draft: ChatMessageStoreState) => {
                    const m = draft.messagesById[id];
                    if (m) m.isDelivered = true;
                })
            );
            try {
                await api.post(ENDPOINTS.markDelivered(id));
            } catch (err) {
                const msg = extractErrorMessage(err);
                set(
                    produce((draft: ChatMessageStoreState) => {
                        const m = draft.messagesById[id];
                        if (m && prev) m.isDelivered = prev.isDelivered;
                    })
                );
                throw new Error(msg);
            }
        },

        /**
         * Moderate a message (flag/clean/removed) — optimistic.
         */
        async moderateMessage(id, status) {
            const prev = get().messagesById[id];
            set(
                produce((draft: ChatMessageStoreState) => {
                    const m = draft.messagesById[id];
                    if (m) m.moderationStatus = status ?? m.moderationStatus;
                })
            );

            try {
                await api.post(ENDPOINTS.moderate(id), { moderationStatus: status });
            } catch (err) {
                const msg = extractErrorMessage(err);
                set(
                    produce((draft: ChatMessageStoreState) => {
                        const m = draft.messagesById[id];
                        if (m && prev) m.moderationStatus = prev.moderationStatus;
                    })
                );
                throw new Error(msg);
            }
        },

        /**
         * Fetch dashboard stats with caching.
         */
        async fetchStats() {
            set(
                produce((draft: ChatMessageStoreState) => {
                    draft.statsLoading = true;
                    draft.statsError = undefined;
                })
            );

            try {
                const res = await api.get<ChatMessageStatsResponse>(ENDPOINTS.stats);
                if (!res.data.success || !res.data.data) {
                    throw new Error(res.data.message || "Failed to fetch stats");
                }
                set(
                    produce((draft: ChatMessageStoreState) => {
                        draft.stats = res.data.data;
                        draft.statsLoading = false;
                    })
                );
            } catch (err) {
                const msg = extractErrorMessage(err);
                set(
                    produce((draft: ChatMessageStoreState) => {
                        draft.statsLoading = false;
                        draft.statsError = msg;
                    })
                );
            }
        },

        /**
         * Invalidate cached list for a given query (forces next fetch).
         */
        invalidateList(query) {
            const key = buildQueryKey(query);
            set(
                produce((draft: ChatMessageStoreState) => {
                    const list = draft.listsByQueryKey[key];
                    if (list) list.lastFetchedAt = undefined;
                })
            );
        },

        /**
         * Invalidate single message cache (forces next fetch).
         */
        invalidateMessage(id) {
            set(
                produce((draft: ChatMessageStoreState) => {
                    delete draft.messagesById[id];
                    draft.messageErrorById[id] = undefined;
                    draft.messageLoadingById[id] = false;
                })
            );
        },

        /**
         * Handle realtime events (WebSocket/SSE).
         * Merge payload into cache appropriately.
         */
        handleEvent(evt) {
            set(
                produce((draft: ChatMessageStoreState) => {
                    const msg = evt.payload;
                    switch (evt.type) {
                        case "created": {
                            draft.messagesById[msg._id] = msg;
                            // Prepend to default list
                            const key = buildQueryKey({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" });
                            const list = draft.listsByQueryKey[key] ?? {
                                ids: [],
                                total: 0,
                                page: 1,
                                limit: 20,
                                totalPages: 1,
                            };
                            if (!list.ids.includes(msg._id)) {
                                list.ids.unshift(msg._id);
                                list.total += 1;
                            }
                            draft.listsByQueryKey[key] = { ...list, lastFetchedAt: Date.now() };
                            break;
                        }
                        case "updated": {
                            const existing = draft.messagesById[msg._id];
                            draft.messagesById[msg._id] = { ...(existing || msg), ...msg };
                            break;
                        }
                        case "deleted": {
                            delete draft.messagesById[msg._id];
                            for (const list of Object.values(draft.listsByQueryKey)) {
                                list.ids = list.ids.filter((id) => id !== msg._id);
                                list.total = Math.max(0, list.total - 1);
                            }
                            break;
                        }
                        case "read": {
                            const m = draft.messagesById[msg._id];
                            if (m) m.isRead = true;
                            break;
                        }
                        case "delivered": {
                            const m = draft.messagesById[msg._id];
                            if (m) m.isDelivered = true;
                            break;
                        }
                    }
                })
            );
        },

        /**
         * Selectors to consume in UI.
         */
        getList(query) {
            const key = buildQueryKey(query);
            const { listsByQueryKey, messagesById } = get();
            const list = listsByQueryKey[key];
            if (!list) return [];
            return list.ids.map((id) => messagesById[id]).filter(Boolean);
        },

        getListMeta(query) {
            const key = buildQueryKey(query);
            const list = get().listsByQueryKey[key];
            return {
                total: list?.total ?? 0,
                page: list?.page ?? (query?.page ?? 1),
                limit: list?.limit ?? (query?.limit ?? 20),
                totalPages: list?.totalPages ?? 0,
            };
        },

        getMessage(id) {
            return get().messagesById[id];
        },
    }))
);
