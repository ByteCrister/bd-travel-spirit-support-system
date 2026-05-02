// store/notification.store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/utils/axios";
import type {
    SupportSystemNotificationType,
    FetchNotificationsResponseType,
} from "@/types/notification.types";

const URL_AFTER_API = `/dashboard/notifications/v1`

interface AdminNotificationState {
    // Data
    notifications: SupportSystemNotificationType[];
    cursor: string | null;
    hasMore: boolean;
    totalUnread: number;

    // Loading & error
    loading: boolean;           // fetch / fetchMore
    actionError: string | null; // surfaced error (mark read, etc.)
    isMarkingAllRead: boolean;  // disable button while marking all

    // Actions
    fetchInitial: () => Promise<void>;
    fetchMore: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    addNotificationFromSocket: (notification: SupportSystemNotificationType) => void;
    clearActionError: () => void;
    reset: () => void;
}

export const useAdminNotificationStore = create<AdminNotificationState>()(
    devtools(
        (set, get) => ({
            notifications: [],
            cursor: null,
            hasMore: true,
            totalUnread: 0,
            loading: false,
            actionError: null,
            isMarkingAllRead: false,

            /* ------------------------------------------------------------------ */
            /*  Fetch initial page                                                 */
            /* ------------------------------------------------------------------ */
            fetchInitial: async () => {
                set({ loading: true, actionError: null });
                try {
                    const { data } = await api.get<FetchNotificationsResponseType>(
                        `${URL_AFTER_API}`,
                        { params: { limit: 15 } }
                    );
                    set({
                        notifications: data.notifications,
                        cursor: data.nextCursor,
                        hasMore: data.hasMore,
                        totalUnread: data.totalUnread,
                        loading: false,
                    });
                } catch (err: any) {
                    set({
                        loading: false,
                        actionError:
                            err?.response?.data?.message || "Failed to load notifications",
                    });
                }
            },

            /* ------------------------------------------------------------------ */
            /*  Fetch next page                                                    */
            /* ------------------------------------------------------------------ */
            fetchMore: async () => {
                const { cursor, hasMore, loading, notifications } = get();
                if (!hasMore || loading || !cursor) return;

                set({ loading: true });
                try {
                    const { data } = await api.get<FetchNotificationsResponseType>(
                        `${URL_AFTER_API}`,
                        { params: { cursor, limit: 15 } }
                    );
                    set({
                        notifications: [...notifications, ...data.notifications],
                        cursor: data.nextCursor,
                        hasMore: data.hasMore,
                        loading: false,
                    });
                } catch (err: any) {
                    set({
                        loading: false,
                        actionError: err?.response?.data?.message || "Failed to load more",
                    });
                }
            },

            /* ------------------------------------------------------------------ */
            /*  Mark a single notification as read                                 */
            /* ------------------------------------------------------------------ */
            markAsRead: async (id: string) => {
                const state = get();
                const target = state.notifications.find((n) => n._id === id);

                // Already read or not found
                if (!target || target.isRead) return;

                // 1. Optimistic update: snapshot the current state before changes
                const previousNotifications = state.notifications;
                const previousTotalUnread = state.totalUnread;

                set({
                    notifications: previousNotifications.map((n) =>
                        n._id === id ? { ...n, isRead: true } : n
                    ),
                    totalUnread: Math.max(0, previousTotalUnread - 1),
                    actionError: null,
                });

                try {
                    await api.patch(`${URL_AFTER_API}/${id}/read`);
                } catch (err: any) {
                    // 2. Revert on failure
                    set({
                        notifications: previousNotifications,
                        totalUnread: previousTotalUnread,
                        actionError:
                            err?.response?.data?.message || "Failed to mark notification as read",
                    });
                }
            },

            /* ------------------------------------------------------------------ */
            /*  Mark all as read                                                   */
            /* ------------------------------------------------------------------ */
            markAllAsRead: async () => {
                const state = get();
                if (state.isMarkingAllRead || state.totalUnread === 0) return;

                const previousNotifications = state.notifications;
                const previousTotalUnread = state.totalUnread;

                set({
                    isMarkingAllRead: true,
                    notifications: previousNotifications.map((n) => ({ ...n, isRead: true })),
                    totalUnread: 0,
                    actionError: null,
                });

                try {
                    await api.patch(`${URL_AFTER_API}/read-all`);
                } catch (err: any) {
                    // Revert
                    set({
                        notifications: previousNotifications,
                        totalUnread: previousTotalUnread,
                        actionError:
                            err?.response?.data?.message || "Failed to mark all as read",
                    });
                } finally {
                    set({ isMarkingAllRead: false });
                }
            },

            /* ------------------------------------------------------------------ */
            /*  Socket‑pushed notification                                         */
            /* ------------------------------------------------------------------ */
            addNotificationFromSocket: (notification: SupportSystemNotificationType) => {
                const state = get();
                // Dedup: ignore if already present (by _id)
                if (state.notifications.some((n) => n._id === notification._id)) {
                    return;
                }
                set({
                    notifications: [notification, ...state.notifications],
                    totalUnread: state.totalUnread + 1,
                });
            },

            /* ------------------------------------------------------------------ */
            /*  Utility                                                            */
            /* ------------------------------------------------------------------ */
            clearActionError: () => set({ actionError: null }),

            reset: () =>
                set({
                    notifications: [],
                    cursor: null,
                    hasMore: true,
                    totalUnread: 0,
                    loading: false,
                    actionError: null,
                    isMarkingAllRead: false,
                }),
        }),
        { name: "support-system-notifications" }
    )
);