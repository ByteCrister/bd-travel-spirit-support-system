// stores/useGuideStore.ts

import { GUIDE_STATUS } from "@/constants/user.const";
import { PendingGuideDTO } from "@/types/pendingGuide.types";
import api from "@/utils/api/axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const ROOT_DIR = "/users-management/guide";

/* ============================================================

* Types & Data Structures
* ============================================================
  */

/**

* Query parameters used when fetching pending guides.
* Controls pagination, sorting, filtering, and search.
  */
export type QueryParams = {
    page: number;
    pageSize: number;
    sortBy:
    | "name"
    | "email"
    | "companyName"
    | "status"
    | "appliedAt"
    | "reviewedAt"
    | "createdAt"
    | "updatedAt";
    sortDir: "asc" | "desc";
    status?: GUIDE_STATUS | null; // Optional filter by approval status
    search?: string;              // Free-text search
};

/**

* Standardized response shape for paginated API calls.
  */
export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
};

/**

* Cache entry for a given query result.
* Stores a list of IDs, total count, and timestamp.
  */
type CacheEntry = {
    ids: string[];
    total: number;
    ts: number; // timestamp when cached
    items: Record<string, PendingGuideDTO>; // cached items by ID
};

/**

* Zustand store state and actions for managing guides.
  */
type GuideStoreState = {
    items: Record<string, PendingGuideDTO>; // All guide records, normalized by ID
    ids: string[];                          // Current visible list of guide IDs
    total: number;                          // Total number of guides in DB
    query: QueryParams;                     // Current query parameters
    loading: boolean;                       // Loading state
    error: string | null;                   // Error message if request fails
    cache: Record<string, CacheEntry>;      // Cached responses by serialized query

    // Actions
    setQuery: (partial: Partial<QueryParams>) => void;
    fetch: () => Promise<void>;
    approve: (id: string) => Promise<void>;
    reject: (id: string, reason?: string) => Promise<void>;
    updateReviewComment: (id: string, reviewComment: string) => Promise<void>;
    invalidateCache: (key?: string) => void;
};

/* ============================================================

* Helpers
* ============================================================
  */

const CACHE_TTL_MS = 60_000; // Cache entries are valid for 1 minute

/**

* Create a stable string key for query parameters.
* Ensures consistent cache keys even if values are reordered.
  */
const stableSerializeQuery = (q: QueryParams): string => {
    const normalized = {
        page: q.page,
        pageSize: q.pageSize,
        sortBy: q.sortBy,
        sortDir: q.sortDir,
        status: q.status ?? undefined,
        search: q.search ?? undefined,
    };
    return JSON.stringify(normalized);
};

/**

* Normalize a list of guides into a dictionary keyed by ID
* along with a separate array of IDs for ordering.
  */
const normalizeList = (list: PendingGuideDTO[]) => {
    const items: Record<string, PendingGuideDTO> = {};
    const ids: string[] = [];
    for (const g of list) {
        items[g._id] = g;
        ids.push(g._id);
    }
    return { items, ids };
};

/* ============================================================

* Zustand Store Hook
* ============================================================
  */
export const useGuideStore = create<GuideStoreState>()(
    devtools((set, get) => ({
        // Initial state
        items: {},
        ids: [],
        total: 0,
        query: {
            page: 1,
            pageSize: 20,
            sortBy: "createdAt",
            sortDir: "desc",
        },
        loading: false,
        error: null,
        cache: {},

        /**
         * Update the current query parameters (partial merge).
         */
        setQuery: (partial) => set((state) => ({ query: { ...state.query, ...partial } })),

        /**
         * Fetch a list of guides from the API.
         * Uses in-memory cache when possible to avoid redundant requests.
         */
        // --- fetch: use cached.items on cache hit; save items into cache after success ---
        fetch: async () => {
            const state = get();
            const key = stableSerializeQuery(state.query);

            // check cache before fetch
            const cached = state.cache[key];
            const now = Date.now();
            if (cached && now - cached.ts < CACHE_TTL_MS) {
                // restore both ids AND items so guides array can be built
                set({
                    items: { ...state.items, ...cached.items },
                    ids: cached.ids,
                    total: cached.total,
                    loading: false,
                    error: null,
                });
                return;
            }

            set({ loading: true, error: null });
            try {
                const res = await api.get<PaginatedResponse<PendingGuideDTO>>(
                    `${ROOT_DIR}`,
                    { params: state.query }
                );

                const { items, ids } = normalizeList(res.data.data);

                set((prev) => ({
                    items: { ...prev.items, ...items },
                    ids,
                    total: res.data.total,
                    loading: false,
                    error: null,
                    cache: {
                        ...prev.cache,
                        [key]: { ids, total: res.data.total, ts: now, items }, // <-- store items in cache
                    },
                }));
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : "Unknown error";
                set({ error: errorMessage, loading: false });
            }
        },


        /**
         * Approve a pending guide by ID.
         * Updates local state and invalidates cache.
         */
        approve: async (id: string) => {
            set({ loading: true, error: null });
            try {
                await api.put(`${ROOT_DIR}/${id}/status`, {
                    status: "APPROVED",
                });
                set((state) => ({
                    items: {
                        ...state.items,
                        [id]: {
                            ...state.items[id],
                            status: GUIDE_STATUS.APPROVED,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                    loading: false,
                }));
                get().invalidateCache();
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : "Unknown error";
                set({ error: errorMessage, loading: false });
            }
        },

        /**
         * Reject a pending guide by ID, optionally with a reason.
         * Updates local state and invalidates cache.
         */
        reject: async (id: string, reason: string) => {
            set({ loading: true, error: null });
            try {
                await api.put(`${ROOT_DIR}/${id}/status`, {
                    status: "REJECTED",
                    reason,
                });
                set((state) => ({
                    items: {
                        ...state.items,
                        [id]: {
                            ...state.items[id],
                            status: GUIDE_STATUS.REJECTED,
                            reviewComment: reason,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                    loading: false,
                }));
                get().invalidateCache();
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : "Unknown error";
                set({ error: errorMessage, loading: false });
            }
        },

        /**
         * Update the review comment for a guide without changing its status.
         */
        updateReviewComment: async (id, reviewComment) => {
            set({ loading: true, error: null });
            try {
                await api.post(
                    `${ROOT_DIR}/${id}/review-comment`,
                    { reviewComment }
                );
                set((state) => ({
                    items: {
                        ...state.items,
                        [id]: {
                            ...state.items[id],
                            reviewComment,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                    loading: false,
                }));
                get().invalidateCache();
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : "Unknown error";
                set({ error: errorMessage, loading: false });
            }
        },

        /**
         * Invalidate cached results.
         * - If a specific key is passed, removes only that entry.
         * - If no key is passed, clears the entire cache.
         */
        invalidateCache: (key) =>
            set((state) => {
                if (!key) return { cache: {} };
                const next = { ...state.cache };
                delete next[key];
                return { cache: next };
            }),

    }))
);
