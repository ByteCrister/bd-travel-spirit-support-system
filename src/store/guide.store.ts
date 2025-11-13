import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { PendingGuideDTO } from "@/types/pendingGuide.types";

const URL_AFTER_API = "/mock/users/guides";
const CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL ?? 60_000);

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
    status?: typeof GUIDE_STATUS[keyof typeof GUIDE_STATUS] | "";
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

type PageMeta = { ids: string[]; page: number; pageSize: number };
type CacheEntry = {
    items: Record<string, PendingGuideDTO>;
    pages: Record<string, PageMeta>;
    total: number;
    ts: number;
};

type GuideStoreState = {
    items: Record<string, PendingGuideDTO>;
    ids: string[];
    total: number;
    query: QueryParams;
    loading: boolean;
    error: string | null;
    cache: Record<string, CacheEntry>; // key = stableQueryKey (excludes page/pageSize?) we'll use full key for isolation
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

// Create a stable key for query attributes that affect results except page/pageSize
function getBaseQueryKey(query: Partial<QueryParams>) {
    // base key does not include page/pageSize — we'll use this to group caches that share same filtering/sorting/search
    return [
        query.sortBy ?? "createdAt",
        query.sortDir ?? "desc",
        query.status ?? "",
        (query.search ?? "").trim().toLowerCase(),
    ].join("|");
}

// page-specific key used for inflight and mapping
function getPageKey(query: Partial<QueryParams>) {
    return [
        query.page ?? 1,
        query.pageSize ?? 20,
        query.sortBy ?? "createdAt",
        query.sortDir ?? "desc",
        query.status ?? "",
        (query.search ?? "").trim().toLowerCase(),
    ].join("|");
}

function normalizeList(list: PendingGuideDTO[]) {
    const items: Record<string, PendingGuideDTO> = {};
    const ids: string[] = [];
    for (const g of list) {
        items[g._id] = g;
        ids.push(g._id);
    }
    return { items, ids };
}

function computeCounts(items: Record<string, PendingGuideDTO>, total: number) {
    const counts = { total, pending: 0, approved: 0, rejected: 0 };
    Object.values(items).forEach((g) => {
        if (g.status === GUIDE_STATUS.PENDING) counts.pending++;
        else if (g.status === GUIDE_STATUS.APPROVED) counts.approved++;
        else if (g.status === GUIDE_STATUS.REJECTED) counts.rejected++;
    });
    return counts;
}

// helper to merge two item maps (immutable)
function mergeItems(a: Record<string, PendingGuideDTO>, b: Record<string, PendingGuideDTO>) {
    return { ...a, ...b };
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

        setQuery: (partial) =>
            set((state) => {
                const nextQuery = { ...state.query, ...partial };
                return { query: nextQuery };
            }),

        /**
         * Fetch with cache-awareness and pageSize reuse logic.
         * Strategy:
         * 1. Try to answer from cache: look up baseKey (filter+sort+search).
         *    - If there is a page meta matching exact page|pageSize and it's fresh -> use it.
         *    - Else try to synthesize requested page from available cached pages covering that range
         *      (e.g., if we have page=1,pageSize=20 cached and request page=1,pageSize=10, reuse first 10 ids).
         * 2. If not satisfiable or force=true or stale -> perform API call, update cache.pages and cache.items.
         * 3. Keep per-page inflight dedupe.
         */
        fetch: async (force = false, overrideQuery?: Partial<QueryParams>) => {
            const state = get();
            const query = { ...state.query, ...overrideQuery };
            const pageKey = getPageKey(query);
            const baseKey = getBaseQueryKey(query);
            const now = Date.now();

            // persist the query in store
            set({ query });

            // dedupe in-flight
            const existing = get()._inflight[pageKey];
            if (existing) return existing;

            // try answer from cache
            const cached = state.cache[baseKey];
            if (!force && cached && now - cached.ts < CACHE_TTL_MS) {
                // check if exact page exists
                const pageMetaKey = `${query.page}|${query.pageSize}`;
                const exact = cached.pages[pageMetaKey];
                if (exact) {
                    // exact page exists and is fresh
                    const ids = exact.ids;
                    const items = cached.items;
                    set({
                        items,
                        ids,
                        total: cached.total,
                        guides: ids.map((id) => items[id]),
                        counts: computeCounts(items, cached.total),
                        loading: false,
                        error: null,
                    });
                    return Promise.resolve(true);
                }

                // attempt to synthesize from other cached pages
                // collect ordered ids across cached.pages where possible and compute slice for requested range
                const requestedStart = (query.page - 1) * query.pageSize;
                const requestedEnd = requestedStart + query.pageSize; // exclusive

                // build a dense array of ids if we have contiguous data covering the requested range
                // We'll try to find a cached page whose span covers the requested range (easy reuse).
                const pagesArr = Object.values(cached.pages);

                // find any single page that fully covers requested range (e.g., cached pageSize bigger)
                const covering = pagesArr.find((p) => {
                    const pStart = (p.page - 1) * p.pageSize;
                    const pEnd = pStart + p.pageSize;
                    return pStart <= requestedStart && pEnd >= requestedEnd;
                });

                if (covering) {
                    // synthesize slice from covering.page
                    const coverIds = cached.pages[`${covering.page}|${covering.pageSize}`].ids;
                    // convert to slice relative to cover page
                    const coverStart = (covering.page - 1) * covering.pageSize;
                    const offsetStart = requestedStart - coverStart;
                    const slice = coverIds.slice(offsetStart, offsetStart + query.pageSize);
                    set({
                        items: cached.items,
                        ids: slice,
                        total: cached.total,
                        guides: slice.map((id) => cached.items[id]),
                        counts: computeCounts(cached.items, cached.total),
                        loading: false,
                        error: null,
                    });
                    return Promise.resolve(true);
                }

                // otherwise fallthrough to API call - we attempted reuse but couldn't satisfy.
            }

            // Build inflight promise
            const p = (async (): Promise<boolean> => {
                set({ loading: true, error: null });
                try {
                    const res = await api.get<PaginatedResponse<PendingGuideDTO>>(URL_AFTER_API, {
                        params: query,
                    });

                    const { items: newItems, ids } = normalizeList(res.data.data);

                    set((prev) => {
                        const prevCache = prev.cache[baseKey];

                        // merge items into existing cache.items, or create new
                        const mergedItems = prevCache ? mergeItems(prevCache.items, newItems) : { ...newItems };

                        // update page meta
                        const pageMetaKey = `${query.page}|${query.pageSize}`;
                        const newPageMeta: PageMeta = { ids, page: query.page, pageSize: query.pageSize };

                        const newPages = prevCache ? { ...prevCache.pages, [pageMetaKey]: newPageMeta } : { [pageMetaKey]: newPageMeta };

                        const newCacheEntry: CacheEntry = {
                            items: mergedItems,
                            pages: newPages,
                            total: res.data.total,
                            ts: now,
                        };

                        const newCache = { ...prev.cache, [baseKey]: newCacheEntry };

                        return {
                            items: mergedItems,
                            ids: ids,
                            total: res.data.total,
                            guides: ids.map((id) => mergedItems[id]),
                            counts: computeCounts(mergedItems, res.data.total),
                            loading: false,
                            error: null,
                            cache: newCache,
                        };
                    });

                    return true;
                } catch (err) {
                    set({ error: extractErrorMessage(err), loading: false });
                    return false;
                } finally {
                    // remove inflight
                    set((s) => {
                        const next = { ...s._inflight };
                        delete next[pageKey];
                        return { _inflight: next };
                    });
                }
            })();

            // set inflight and return
            set((s) => ({ _inflight: { ...s._inflight, [pageKey]: p } }));
            return p;
        },

        /* ----------------------- Mutations that update cache ----------------------- */

        // Helper to update cached items across all cache entries
        // updates a single item by id (partial merge), and returns new cache map
        _updateCachesForId: undefined as unknown as (id: string, updater: (prev?: PendingGuideDTO) => PendingGuideDTO | undefined) => Record<string, CacheEntry>,

        approve: async (id) => {
            try {
                await api.put(`${URL_AFTER_API}/${id}/status`, { status: "APPROVED" });
                // perform an optimistic, consistent update across store and cache
                set((state) => {
                    const updatedItem: PendingGuideDTO = {
                        ...state.items[id],
                        status: GUIDE_STATUS.APPROVED,
                        updatedAt: new Date().toISOString(),
                    };

                    // update top-level items
                    const newItems = { ...state.items, [id]: updatedItem };

                    // update cache entries: replace item where present immutably
                    const newCache: Record<string, CacheEntry> = {};
                    Object.entries(state.cache).forEach(([k, entry]) => {
                        if (entry.items[id]) {
                            const items = { ...entry.items, [id]: updatedItem };
                            newCache[k] = { ...entry, items };
                        } else {
                            newCache[k] = entry;
                        }
                    });

                    // recompute counts conservatively using newItems and existing total
                    const counts = computeCounts(newItems, state.total);

                    return { items: newItems, cache: newCache, counts };
                });

                return true;
            } catch (err) {
                set({ error: extractErrorMessage(err) });
                return false;
            }
        },

        reject: async (id, reason) => {
            try {
                await api.put(`${URL_AFTER_API}/${id}/status`, {
                    status: "REJECTED",
                    reason,
                });

                set((state) => {
                    const updatedItem: PendingGuideDTO = {
                        ...state.items[id],
                        status: GUIDE_STATUS.REJECTED,
                        reviewComment: reason,
                        updatedAt: new Date().toISOString(),
                    };

                    const newItems = { ...state.items, [id]: updatedItem };

                    const newCache: Record<string, CacheEntry> = {};
                    Object.entries(state.cache).forEach(([k, entry]) => {
                        if (entry.items[id]) {
                            const items = { ...entry.items, [id]: updatedItem };
                            newCache[k] = { ...entry, items };
                        } else {
                            newCache[k] = entry;
                        }
                    });

                    const counts = computeCounts(newItems, state.total);

                    return { items: newItems, cache: newCache, counts };
                });

                return true;
            } catch (err) {
                set({ error: extractErrorMessage(err) });
                return false;
            }
        },

        updateReviewComment: async (id, reviewComment) => {
            try {
                await api.post(`${URL_AFTER_API}/${id}/review-comment`, { reviewComment });

                set((state) => {
                    const updatedItem: PendingGuideDTO = {
                        ...state.items[id],
                        reviewComment,
                        updatedAt: new Date().toISOString(),
                    };

                    const newItems = { ...state.items, [id]: updatedItem };

                    const newCache: Record<string, CacheEntry> = {};
                    Object.entries(state.cache).forEach(([k, entry]) => {
                        if (entry.items[id]) {
                            const items = { ...entry.items, [id]: updatedItem };
                            newCache[k] = { ...entry, items };
                        } else {
                            newCache[k] = entry;
                        }
                    });

                    // counts do not change for reviewComment update, but keep recompute for consistency
                    const counts = computeCounts(newItems, state.total);

                    return { items: newItems, cache: newCache, counts };
                });

                return true;
            } catch (err) {
                set({ error: extractErrorMessage(err) });
                return false;
            }
        },

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
