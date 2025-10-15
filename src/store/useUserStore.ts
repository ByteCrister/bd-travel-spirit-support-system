// stores/useUserStore.ts
import { UserNotificationDTO } from "@/types/notification.types";
import { ReportDetailDTO } from "@/types/report.types";
import { ReviewDTO } from "@/types/review.tour.response.type";
import { User } from "@/types/user.types";
import api from "@/utils/api/axios";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// -----------------------------
// Types for segments and states
// -----------------------------

// All user data is organized into "segments"
export type SegmentKey =
    | "profile"
    | "activity"
    | "roles"
    | "security"
    | "notifications"
    | "audit"
    | "guide"
    | "tours";

// Each segment can be in one of these loading states
type LoadStatus = "idle" | "loading" | "success" | "error";

// Generic state wrapper for each segment
interface SegmentState<T> {
    data: T | null;
    status: LoadStatus;
    error?: string | null;
    lastFetched?: number; // epoch milliseconds
}

// -----------------------------
// DTOs (data transfer objects)
// -----------------------------
interface ActivityDTO {
    bookingHistory: string[]; // tour IDs
    cart: string[];
    wishlist: string[];
    reviews: ReviewDTO[];
    reports: ReportDetailDTO[];
}

interface RolesDTO {
    role: User["role"];
    isVerified: boolean;
    guideStatus?: User["guideProfile"] extends { status: infer S }
    ? S
    : undefined;
}

interface SecurityDTO {
    loginAttempts: number;
    lastLogin?: string;
    lockUntil?: string;
    suspension?: User["suspension"];
}

interface GuideDTO {
    profile?: User["guideProfile"];
    documents?: NonNullable<User["guideProfile"]>["documents"];
}

interface AuditDTO {
    actions: {
        id: string;
        actorId: string;
        action: string;
        target?: string;
        createdAt: string;
        meta?: Record<string, unknown>;
    }[];
}

interface ToursDTO {
    created: ToursDTO[];
}

// Mapping between segment key and its data type
interface SegmentDataMap {
    profile: User;
    activity: ActivityDTO;
    roles: RolesDTO;
    security: SecurityDTO;
    notifications: { items: UserNotificationDTO[]; unreadCount: number };
    audit: AuditDTO;
    guide: GuideDTO;
    tours: ToursDTO;
}

// All segments for one user
type UserSegments = {
    [K in SegmentKey]: SegmentState<SegmentDataMap[K]>;
};

// Cache entry for a single user
interface UserCacheEntry {
    segments: UserSegments;
}

// Factory for empty segment state
const emptySegment = <T>(): SegmentState<T> => ({
    data: null,
    status: "idle",
    error: null,
    lastFetched: undefined,
});

// -----------------------------
// Store state definition
// -----------------------------
interface UseUserStoreState {
    // Active user context (e.g., currently viewed user in dashboard)
    activeUserId: string | null;

    // LRU cache of users (key: userId)
    cacheOrder: string[]; // keeps track of least recently used
    users: Map<string, UserCacheEntry>;

    // Tracks in-flight requests: key = userId|segment
    inflight: Map<string, Promise<SegmentDataMap[SegmentKey]>>;

    // Cache config
    ttlMs: number; // cache expiry time
    maxUsersCached: number; // max users cached before eviction

    // -------------------------
    // Store actions
    // -------------------------
    setActiveUser: (userId: string | null) => void;

    ensureUserEntry: (userId: string) => void;
    fetchSegment: <K extends SegmentKey>(
        userId: string,
        segment: K,
        opts?: { force?: boolean }
    ) => Promise<SegmentDataMap[K]>;

    prefetchUser: (userId: string, segments?: SegmentKey[]) => Promise<void>;

    invalidateUser: (userId: string) => void;
    invalidateSegment: (userId: string, segment: SegmentKey) => void;
    clearAll: () => void;
}

// -----------------------------
// Helpers
// -----------------------------
const now = () => Date.now();
const keyOf = (userId: string, segment: SegmentKey) => `${userId}|${segment}`;

// Creates a fresh user entry with all segments empty
function newUserEntry(): UserCacheEntry {
    return {
        segments: {
            profile: emptySegment<User>(),
            activity: emptySegment<ActivityDTO>(),
            roles: emptySegment<RolesDTO>(),
            security: emptySegment<SecurityDTO>(),
            notifications: emptySegment<{
                items: UserNotificationDTO[];
                unreadCount: number;
            }>(),
            audit: emptySegment<AuditDTO>(),
            guide: emptySegment<GuideDTO>(),
            tours: emptySegment<ToursDTO>(),
        },
    };
}

// Maintains LRU cache order and evicts oldest entries if capacity exceeded
function lruTouch(state: UseUserStoreState, userId: string) {
    const idx = state.cacheOrder.indexOf(userId);
    if (idx !== -1) state.cacheOrder.splice(idx, 1);
    state.cacheOrder.push(userId);

    // Evict oldest if over capacity
    if (state.cacheOrder.length > state.maxUsersCached) {
        const evictId = state.cacheOrder.shift(); // remove oldest
        if (evictId) state.users.delete(evictId);
    }
}

// -----------------------------
// API endpoints (without /api prefix)
// -----------------------------
const endpoints = {
    profile: (id: string) => `/users-management/users/${id}`,
    activity: (id: string) => `/users-management/users/${id}/activity`,
    roles: (id: string) => `/users-management/users/${id}/roles`,
    security: (id: string) => `/users-management/users/${id}/security`,
    notifications: (id: string) => `/users-management/users/${id}/notifications`,
    audit: (id: string) => `/users-management/users/${id}/audit`,
    guide: (id: string) => `/users-management/users/${id}/guide`,
    tours: (id: string) => `/users-management/users/${id}/tours`,
};

// -----------------------------
// Zustand store
// -----------------------------
export const useUserStore = create<UseUserStoreState>()(
    subscribeWithSelector((set, get) => ({
        activeUserId: null,
        cacheOrder: [],
        users: new Map<string, UserCacheEntry>(),
        inflight: new Map<string, Promise<SegmentDataMap[SegmentKey]>>(),
        ttlMs: 1000 * 60 * 5, // 5 minutes cache TTL
        maxUsersCached: 500, // adjust based on memory/usage

        // Set currently active user
        setActiveUser: (userId) => set(() => ({ activeUserId: userId })),

        // Ensure a user entry exists in the cache (creates new if missing)
        ensureUserEntry: (userId: string) =>
            set((s) => {
                if (!s.users.has(userId)) {
                    s.users.set(userId, newUserEntry());
                }
                lruTouch(s, userId);
                return { users: s.users, cacheOrder: s.cacheOrder };
            }),

        // Fetches a single segment for a user with caching and deduplication
        fetchSegment: async <K extends SegmentKey>(
            userId: string,
            segment: K,
            opts?: { force?: boolean }
        ): Promise<SegmentDataMap[K]> => {
            const { ttlMs, users, inflight } = get();
            get().ensureUserEntry(userId);

            const cache = users.get(userId)!;
            const segState = cache.segments[segment] as SegmentState<
                SegmentDataMap[K]
            >;
            const isFresh =
                segState.lastFetched && now() - segState.lastFetched < ttlMs;

            // Return cached data if fresh
            if (
                !opts?.force &&
                segState.status === "success" &&
                isFresh &&
                segState.data
            ) {
                lruTouch(get(), userId);
                return segState.data;
            }

            const inflightKey = keyOf(userId, segment);
            if (inflight.has(inflightKey)) {
                return inflight.get(inflightKey) as Promise<SegmentDataMap[K]>;
            }

            // Mark as loading
            set((s) => {
                const entry = s.users.get(userId)!;
                entry.segments[segment].status = "loading";
                entry.segments[segment].error = null;
                return { users: s.users };
            });

            const promise = (async () => {
                try {
                    const url = endpoints[segment](userId);
                    const res = await api.get(url);

                    const data = res.data as SegmentDataMap[K];

                    // Save in cache
                    set((s) => {
                        const entry = s.users.get(userId)!;
                        entry.segments[segment].data = data;
                        entry.segments[segment].status = "success";
                        entry.segments[segment].error = null;
                        entry.segments[segment].lastFetched = now();
                        lruTouch(s, userId);
                        return { users: s.users };
                    });

                    return data;
                } catch (err: unknown) {
                    // Fallback error extraction
                    const message =
                        (
                            err as {
                                response?: { data?: { message?: string } };
                                message?: string;
                            }
                        )?.response?.data?.message ||
                        (err as Error).message ||
                        "Failed to fetch segment";

                    set((s) => {
                        const entry = s.users.get(userId)!;
                        entry.segments[segment].status = "error";
                        entry.segments[segment].error = message;
                        entry.segments[segment].lastFetched = now();
                        return { users: s.users };
                    });

                    throw new Error(message);
                } finally {
                    // Cleanup inflight map
                    get().inflight.delete(inflightKey);
                }
            })();

            inflight.set(inflightKey, promise);
            return promise;
        },

        // Prefetch multiple segments for a user
        prefetchUser: async (userId: string, segments?: SegmentKey[]) => {
            const segs =
                segments ?? (["profile", "roles", "security"] as SegmentKey[]);
            await Promise.all(
                segs.map((seg) =>
                    get()
                        .fetchSegment(userId, seg)
                        .catch(() => undefined)
                )
            );
        },

        // Completely remove user from cache
        invalidateUser: (userId: string) =>
            set((s) => {
                s.users.delete(userId);
                const idx = s.cacheOrder.indexOf(userId);
                if (idx !== -1) s.cacheOrder.splice(idx, 1);
                return { users: s.users, cacheOrder: s.cacheOrder };
            }),

        // Reset a single segment for a user
        invalidateSegment: <K extends SegmentKey>(userId: string, segment: K) =>
            set((s) => {
                const entry = s.users.get(userId);
                if (entry) {
                    entry.segments[segment] = emptySegment<
                        SegmentDataMap[K]
                    >() as UserSegments[K];
                }
                return { users: s.users };
            }),

        // Clear the entire cache
        clearAll: () =>
            set(() => ({
                activeUserId: null,
                cacheOrder: [],
                users: new Map<string, UserCacheEntry>(),
                inflight: new Map<string, Promise<SegmentDataMap[SegmentKey]>>(),
            })),
    }))
);

// -----------------------------
// Typed selectors for components
// -----------------------------
export const selectSegment =
    <K extends SegmentKey>(userId: string, segment: K) =>
        (state: UseUserStoreState) =>
            state.users.get(userId)?.segments[segment] as
            | SegmentState<SegmentDataMap[K]>
            | undefined;

export const selectStatus =
    (userId: string, segment: SegmentKey) => (state: UseUserStoreState) =>
        state.users.get(userId)?.segments[segment]?.status ?? "idle";

export const selectError =
    (userId: string, segment: SegmentKey) => (state: UseUserStoreState) =>
        state.users.get(userId)?.segments[segment]?.error ?? null;

export const selectActiveUserId = (state: UseUserStoreState) =>
    state.activeUserId;
