// 
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { PendingGuideDTO } from "@/types/pendingGuide.types";

const ROOT_DIR = "/users-management/guide";
const CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL ?? 60_000);

/* ----------------------------- Types ----------------------------- */
export type SortByTypes =
    | "createdAt"
    | "status"
    | "name"
    | "email"
    | "companyName"
    | "appliedAt"
    | "reviewedAt"
    | "updatedAt";

export type SortDirTypes = "asc" | "desc";

export type QueryParams = {
    page: number;
    pageSize: number;
    sortBy: SortByTypes;
    sortDir: SortDirTypes;
    status?: GUIDE_STATUS | "";
    search?: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
};

type CacheEntry = {
    ids: string[];
    total: number;
    ts: number;
    items: Record<string, PendingGuideDTO>;
};

type GuideStoreState = {
    items: Record<string, PendingGuideDTO>;
    ids: string[];
    total: number;
    query: QueryParams;
    loading: boolean;
    error: string | null;
    cache: Record<string, CacheEntry>;
    guides: PendingGuideDTO[];
    counts: { total: number; pending: number; approved: number; rejected: number };
    _inflight: Record<string, Promise<boolean> | undefined>;

    setQuery: (partial: Partial<QueryParams>) => void;
    fetch: (force?: boolean, overrideQuery?: Partial<QueryParams>) => Promise<boolean>;
    approve: (id: string) => Promise<boolean>;
    reject: (id: string, reason?: string) => Promise<boolean>;
    updateReviewComment: (id: string, reviewComment: string) => Promise<boolean>;
    invalidateCache: (key?: string) => void;
};

/* ----------------------------- Helpers ----------------------------- */

// Normalize list into { items, ids }
function normalizeList(list: PendingGuideDTO[]) {
    const items: Record<string, PendingGuideDTO> = {};
    const ids: string[] = [];
    for (const g of list) {
        items[g._id] = g;
        ids.push(g._id);
    }
    return { items, ids };
}

// Compute counts for status summary
function computeCounts(items: Record<string, PendingGuideDTO>, total: number) {
    const counts = { total, pending: 0, approved: 0, rejected: 0 };
    Object.values(items).forEach((g) => {
        if (g.status === GUIDE_STATUS.PENDING) counts.pending++;
        else if (g.status === GUIDE_STATUS.APPROVED) counts.approved++;
        else if (g.status === GUIDE_STATUS.REJECTED) counts.rejected++;
    });
    return counts;
}

// Cache key includes page so each page is cached separately
function getCacheKey(query: Partial<QueryParams>): string {
    return [
        query.page ?? 1,
        query.pageSize ?? 20,
        query.sortBy ?? "createdAt",
        query.sortDir ?? "desc",
        query.status ?? "",
        (query.search ?? "").trim().toLowerCase(),
    ].join("|");
}

/* ----------------------------- Store ----------------------------- */
export const useGuideStore = create<GuideStoreState>()(
    devtools((set, get) => ({
        items: {},
        ids: [],
        total: 0,
        query: { page: 1, pageSize: 20, sortBy: "createdAt", sortDir: "desc" },
        guides: [],
        counts: { total: 0, pending: 0, approved: 0, rejected: 0 },
        loading: false,
        error: null,
        cache: {},
        _inflight: {},

        // Update query params
        setQuery: (partial) =>
            set((state) => ({ query: { ...state.query, ...partial } })),

        // Unified fetch (cache-aware, force option, query override)
        fetch: async (force = false, overrideQuery?: Partial<QueryParams>) => {
            const state = get();
            const query = { ...state.query, ...overrideQuery };
            const key = getCacheKey(query);
            const now = Date.now();

            // persist the query
            set({ query });

            // fast cache check (no network if cached and not forced)
            if (!force) {
                const cached = state.cache[key];
                if (cached && now - cached.ts < CACHE_TTL_MS) {
                    set({
                        items: cached.items,
                        ids: cached.ids,
                        total: cached.total,
                        guides: cached.ids.map((id) => cached.items[id]),
                        counts: computeCounts(cached.items, cached.total),
                        loading: false,
                        error: null,
                    });
                    return true;
                }
            }

            // If a request for this key is already in-flight, return that Promise (dedupe)
            const existing = get()._inflight[key];
            if (existing) return existing;

            // Build the in-flight Promise
            const p = (async (): Promise<boolean> => {
                set({ loading: true, error: null });
                try {
                    const res = await api.get<PaginatedResponse<PendingGuideDTO>>(ROOT_DIR, {
                        params: query,
                    });
                    const { items, ids } = normalizeList(res.data.data);
                    const counts = computeCounts(items, res.data.total);

                    set((prev) => ({
                        items,
                        ids,
                        total: res.data.total,
                        guides: ids.map((id) => items[id]),
                        counts,
                        loading: false,
                        error: null,
                        cache: {
                            ...prev.cache,
                            [key]: { ids, total: res.data.total, ts: now, items },
                        },
                    }));

                    return true;
                } catch (err) {
                    set({ error: extractErrorMessage(err), loading: false });
                    return false;
                } finally {
                    // remove the inflight entry
                    set((s) => {
                        const next = { ...s._inflight };
                        delete next[key];
                        return { _inflight: next };
                    });
                }
            })();

            // store the Promise and return it
            set((s) => ({ _inflight: { ...s._inflight, [key]: p } }));
            return p;
        },

        // Approve guide and update cache
        approve: async (id) => {
            try {
                await api.put(`${ROOT_DIR}/${id}/status`, { status: "APPROVED" });
                set((state) => {
                    const updated = {
                        ...state.items[id],
                        status: GUIDE_STATUS.APPROVED,
                        updatedAt: new Date().toISOString(),
                    };
                    const key = getCacheKey(state.query);
                    const cacheEntry = state.cache[key];
                    if (cacheEntry) cacheEntry.items[id] = updated;
                    return {
                        items: { ...state.items, [id]: updated },
                        cache: { ...state.cache, [key]: cacheEntry },
                    };
                });
                return true;
            } catch (err) {
                set({ error: extractErrorMessage(err) });
                return false;
            }
        },

        // Reject guide and update cache
        reject: async (id, reason) => {
            try {
                await api.put(`${ROOT_DIR}/${id}/status`, {
                    status: "REJECTED",
                    reason,
                });
                set((state) => {
                    const updated = {
                        ...state.items[id],
                        status: GUIDE_STATUS.REJECTED,
                        reviewComment: reason,
                        updatedAt: new Date().toISOString(),
                    };
                    const key = getCacheKey(state.query);
                    const cacheEntry = state.cache[key];
                    if (cacheEntry) cacheEntry.items[id] = updated;
                    return {
                        items: { ...state.items, [id]: updated },
                        cache: { ...state.cache, [key]: cacheEntry },
                    };
                });
                return true;
            } catch (err) {
                set({ error: extractErrorMessage(err) });
                return false;
            }
        },

        // Update review comment and cache
        updateReviewComment: async (id, reviewComment) => {
            try {
                await api.post(`${ROOT_DIR}/${id}/review-comment`, { reviewComment });
                set((state) => {
                    const updated = {
                        ...state.items[id],
                        reviewComment,
                        updatedAt: new Date().toISOString(),
                    };
                    const key = getCacheKey(state.query);
                    const cacheEntry = state.cache[key];
                    if (cacheEntry) cacheEntry.items[id] = updated;
                    return {
                        items: { ...state.items, [id]: updated },
                        cache: { ...state.cache, [key]: cacheEntry },
                    };
                });
                return true;
            } catch (err) {
                set({ error: extractErrorMessage(err) });
                return false;
            }
        },

        // Invalidate cache (all or specific key)
        invalidateCache: (key) => {
            if (!key) {
                set({ cache: {} });
            } else {
                set((state) => {
                    const newCache = { ...state.cache };
                    delete newCache[key];
                    return { cache: newCache };
                });
            }
        },
    }))
);
