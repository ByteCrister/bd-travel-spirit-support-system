// store/article.store.ts

import { create } from 'zustand';

import {
    ArticleDashboardStats,
    ArticleDetail,
    ArticleDetailApi,
    ArticleListApi,
    ArticleListItem,
    ArticleListQueryRequest,
    ArticleStatsApi,
    CreateArticleApi,
    CreateArticleInput,
    CreateArticleResponse,
    DeleteArticleApi,
    DeleteArticleInput,
    DeleteArticleResponse,
    UpdateArticleApi,
    UpdateArticleInput,
    UpdateArticleResponse,
    OffsetPageRequest,
    OffsetPageResponse,
    ArticleFilter,
    ArticleSearch,
    ArticleSort,
    ID,
    RestoreArticleInput,
    RestoreArticleResponse,
    RestoreArticleApi,
} from '@/types/article.types';

import api from '@/utils/axios';
import { extractErrorMessage } from '@/utils/axios/extract-error-message';
import { ARTICLE_STATUS } from '@/constants/article.const';

const URL_AFTER_API = '/mock/articles';

// TTL: ms
const DEFAULT_TTL =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CACHE_TTL
        ? Number(process.env.NEXT_PUBLIC_CACHE_TTL)
        : 60_000;

type CacheEntry<T> = { data: T; ts: number };

class MemoryCache {
    private map = new Map<string, CacheEntry<unknown>>();

    get<T>(key: string, ttl = DEFAULT_TTL): T | undefined {
        const entry = this.map.get(key);
        if (!entry) return undefined;
        if (Date.now() - entry.ts >= ttl) {
            this.map.delete(key);
            return undefined;
        }
        return entry.data as T;
    }

    set<T>(key: string, data: T): void {
        this.map.set(key, { data, ts: Date.now() });
    }

    del(key: string): void {
        this.map.delete(key);
    }

    clear(): void {
        this.map.clear();
    }

    keys(): string[] {
        return Array.from(this.map.keys());
    }
}

const detailCache = new MemoryCache();
const statsCache = new MemoryCache();

// Enhanced paged cache:
// key: identity = JSON.stringify({ filter, search, sort })
// value: { pages: Map<`${pageSize}:${page}`, CacheEntry<OffsetPageResponse<ArticleListItem>>>; ts }
type QueryIdentity = string;
type PageKey = string;
type PagedCacheValue = {
    pages: Map<PageKey, CacheEntry<OffsetPageResponse<ArticleListItem>>>;
    ts: number;
};
const pagedCache = new Map<QueryIdentity, PagedCacheValue>();

function queryIdentityFor(req: ArticleListQueryRequest): QueryIdentity {
    // exclude pagination from identity
    const key = {
        scope: 'list',
        filter: req.filter ?? undefined,
        search: req.search ?? undefined,
        sort: req.sort ?? undefined,
    };
    return JSON.stringify(key);
}

function pageKey(pageSize: number, page: number): PageKey {
    return `${pageSize}:${page}`;
}

// Try to assemble requested page from available cached pages (different pageSizes allowed)
function tryAssembleFromCache(
    req: ArticleListQueryRequest,
    neededPage: number,
    neededPageSize: number,
    ttl = DEFAULT_TTL
): OffsetPageResponse<ArticleListItem> | undefined {
    const identity = queryIdentityFor(req);
    const group = pagedCache.get(identity);
    if (!group) return undefined;
    if (Date.now() - group.ts >= ttl) {
        pagedCache.delete(identity);
        return undefined;
    }

    const startIndex = (neededPage - 1) * neededPageSize;
    const endIndexExclusive = startIndex + neededPageSize;

    // collect available items with their global offsets
    const global = new Map<number, ArticleListItem>();
    let totalCount: number | undefined = undefined;
    let totalPages: number | undefined = undefined;

    for (const [key, entry] of group.pages.entries()) {
        if (Date.now() - entry.ts >= ttl) continue;
        const [psStr, pStr] = key.split(':');
        const ps = Number(psStr);
        const p = Number(pStr);
        if (!Number.isFinite(ps) || !Number.isFinite(p)) continue;
        const offset = (p - 1) * ps;
        const resp = entry.data;
        resp.items.forEach((it, idx) => {
            const globalIdx = offset + idx;
            if (!global.has(globalIdx)) {
                global.set(globalIdx, it);
            }
        });
        if (resp.totalCount !== undefined) {
            totalCount = resp.totalCount;
            totalPages = resp.totalPages;
        }
    }

    // ensure we have every index in requested slice
    const items: ArticleListItem[] = [];
    for (let i = startIndex; i < endIndexExclusive; i++) {
        const it = global.get(i);
        if (!it) return undefined;
        items.push(it);
    }

    return { items, page: neededPage, pageSize: neededPageSize, totalCount, totalPages };
}

// Store types
type LoadingFlags = { isLoadingList: boolean; isLoadingDetail: boolean; isLoadingStats: boolean };

type ArticleStore = {
    listItems: ArticleListItem[];
    detailById: Record<ID, ArticleDetail | undefined>;
    stats?: ArticleDashboardStats;

    currentFilter: ArticleFilter;
    currentSearch: ArticleSearch;
    currentSort: ArticleSort;
    currentPagination: OffsetPageRequest;
    totalCount?: number;
    totalPages?: number;

    selectedArticleId?: ID;
    error?: string;

    loading: LoadingFlags;

    setFilter: (filter: ArticleFilter) => void;
    setSearch: (search: ArticleSearch) => void;
    setSort: (sort: ArticleSort) => void;
    setPagination: (pg: OffsetPageRequest) => void;
    setSelectedArticleId: (id?: ID) => void;
    clearError: () => void;

    fetchArticleList: (overrides?: Partial<ArticleListQueryRequest>) => Promise<void>;
    fetchArticleDetails: (id: ID, force?: boolean) => Promise<void>;
    fetchArticleStats: (force?: boolean) => Promise<void>;

    createArticle: (input: CreateArticleInput) => Promise<CreateArticleResponse>;
    updateArticle: (input: UpdateArticleInput) => Promise<UpdateArticleResponse>;
    deleteArticle: (input: DeleteArticleInput) => Promise<DeleteArticleResponse>;
    restoreArticle: (input: RestoreArticleInput) => Promise<RestoreArticleResponse>;

    invalidateList: (req?: ArticleListQueryRequest) => void;
    invalidateDetail: (id: ID) => void;
    invalidateStats: () => void;
    reset: () => void;
};

const initialFilter: ArticleFilter = {
    status: [ARTICLE_STATUS.DRAFT, ARTICLE_STATUS.PUBLISHED, ARTICLE_STATUS.ARCHIVED],
};
const initialSearch: ArticleSearch = { query: '' };
const initialSort: ArticleSort = { field: 'updatedAt', order: 'desc' };
const initialPagination: OffsetPageRequest = { page: 1, pageSize: 20 };

export const useArticleStore = create<ArticleStore>((set, get) => ({
    listItems: [],
    detailById: {},
    stats: undefined,

    currentFilter: initialFilter,
    currentSearch: initialSearch,
    currentSort: initialSort,
    currentPagination: initialPagination,
    totalCount: undefined,
    totalPages: undefined,

    selectedArticleId: undefined,
    error: undefined,

    loading: { isLoadingList: false, isLoadingDetail: false, isLoadingStats: false },

    setFilter: (filter) => set({ currentFilter: filter, currentPagination: { ...get().currentPagination, page: 1 } }),
    setSearch: (search) => set({ currentSearch: search, currentPagination: { ...get().currentPagination, page: 1 } }),
    setSort: (sort) => set({ currentSort: sort }),
    setPagination: (pg) => set({ currentPagination: pg }),
    setSelectedArticleId: (id) => set({ selectedArticleId: id }),
    clearError: () => set({ error: undefined }),

    fetchArticleList: async (overrides?: Partial<ArticleListQueryRequest>) => {
        const state = get();

        const req: ArticleListQueryRequest = {
            filter: overrides?.filter ?? state.currentFilter,
            search: overrides?.search ?? state.currentSearch,
            sort: overrides?.sort ?? state.currentSort,
            pagination: overrides?.pagination ?? state.currentPagination,
        };

        // Normalize pagination and ensure numbers
        const pagination = req.pagination as OffsetPageRequest | undefined;
        const page = typeof pagination?.page === 'number' ? pagination.page : 1;
        const pageSize = typeof pagination?.pageSize === 'number' ? pagination.pageSize : initialPagination.pageSize;

        const normalizedReq: ArticleListQueryRequest = {
            filter: req.filter,
            search: req.search,
            sort: req.sort,
            pagination: { page, pageSize },
        };

        // 1) Try to assemble from any cached pages (cross-pageSize)
        const assembled = tryAssembleFromCache(normalizedReq, page, pageSize as number);
        if (assembled) {
            set({
                listItems: assembled.items,
                currentFilter: normalizedReq.filter ?? state.currentFilter,
                currentSearch: normalizedReq.search ?? state.currentSearch,
                currentSort: normalizedReq.sort ?? state.currentSort,
                currentPagination: { page: assembled.page, pageSize: assembled.pageSize },
                totalCount: assembled.totalCount,
                totalPages: assembled.totalPages,
                loading: { ...state.loading, isLoadingList: false },
                error: undefined,
            });
            return;
        }

        // 2) Try exact page lookup
        const identity = queryIdentityFor(normalizedReq);
        const pk = pageKey(pageSize as number, page);
        const group = pagedCache.get(identity);
        if (group) {
            const pageEntry = group.pages.get(pk);
            if (pageEntry && Date.now() - pageEntry.ts < DEFAULT_TTL) {
                const resp = pageEntry.data;
                set({
                    listItems: resp.items,
                    currentFilter: normalizedReq.filter ?? state.currentFilter,
                    currentSearch: normalizedReq.search ?? state.currentSearch,
                    currentSort: normalizedReq.sort ?? state.currentSort,
                    currentPagination: { page: resp.page, pageSize: resp.pageSize },
                    totalCount: resp.totalCount,
                    totalPages: resp.totalPages,
                    loading: { ...state.loading, isLoadingList: false },
                    error: undefined,
                });
                return;
            }
        }

        // 3) Not cached — fetch
        set({ loading: { ...state.loading, isLoadingList: true }, error: undefined });

        try {
            const params: Record<string, unknown> = { page, pageSize, query: normalizedReq.search?.query ?? '' };

            if (normalizedReq.filter) {
                Object.entries(normalizedReq.filter).forEach(([k, v]) => {
                    if (v === undefined || v === null) return;
                    params[k] = Array.isArray(v) ? v.join(',') : v;
                });
            }

            if (normalizedReq.sort) {
                params.sortField = normalizedReq.sort.field;
                params.sortOrder = normalizedReq.sort.order;
            }

            const { data } = await api.get<ArticleListApi>(`${URL_AFTER_API}`, { params });
            if (!data || !data.data) throw new Error('Failed to load articles');

            const response = data.data;
            if (response.paginationType === 'offset') {
                const offsetResp = response as OffsetPageResponse<ArticleListItem>;

                // Persist into pagedCache
                const identityKey = queryIdentityFor(normalizedReq);
                let pageGroup = pagedCache.get(identityKey);
                if (!pageGroup) {
                    pageGroup = { pages: new Map(), ts: Date.now() };
                    pagedCache.set(identityKey, pageGroup);
                }
                const respPage = typeof offsetResp.page === 'number' ? offsetResp.page : page;
                const respPageSize = typeof offsetResp.pageSize === 'number' ? offsetResp.pageSize : pageSize;
                const storeKey = pageKey(respPageSize as number, respPage);
                pageGroup.pages.set(storeKey, { data: { ...offsetResp, page: respPage, pageSize: respPageSize as number }, ts: Date.now() });
                pageGroup.ts = Date.now();

                set({
                    listItems: offsetResp.items,
                    currentFilter: normalizedReq.filter ?? state.currentFilter,
                    currentSearch: normalizedReq.search ?? state.currentSearch,
                    currentSort: normalizedReq.sort ?? state.currentSort,
                    currentPagination: { page: respPage, pageSize: respPageSize },
                    totalCount: offsetResp.totalCount,
                    totalPages: offsetResp.totalPages,
                    loading: { ...get().loading, isLoadingList: false },
                    error: undefined,
                });
            } else {
                // fallback (no pagination metadata)
                const items = response.items ?? [];
                set({
                    listItems: items,
                    currentFilter: normalizedReq.filter ?? state.currentFilter,
                    currentSearch: normalizedReq.search ?? state.currentSearch,
                    currentSort: normalizedReq.sort ?? state.currentSort,
                    currentPagination: { page, pageSize },
                    totalCount: undefined,
                    totalPages: undefined,
                    loading: { ...get().loading, isLoadingList: false },
                    error: undefined,
                });
            }
        } catch (err) {
            set({ loading: { ...get().loading, isLoadingList: false }, error: extractErrorMessage(err) });
        }
    },

    fetchArticleDetails: async (id, force = false) => {
        const state = get();
        const key = `detail:${id}`;
        const cached = !force ? detailCache.get<ArticleDetail>(key) : undefined;
        if (cached) {
            set({ detailById: { ...state.detailById, [id]: cached }, loading: { ...state.loading, isLoadingDetail: false }, error: undefined });
            return;
        }

        set({ loading: { ...state.loading, isLoadingDetail: true }, error: undefined });
        try {
            const { data } = await api.get<ArticleDetailApi>(`${URL_AFTER_API}/${id}`);
            if (!data || !data.data) throw new Error('Failed to load article detail');
            const detail = data.data;
            detailCache.set(key, detail);
            set({ detailById: { ...get().detailById, [id]: detail }, loading: { ...get().loading, isLoadingDetail: false }, error: undefined });
        } catch (err) {
            set({ loading: { ...get().loading, isLoadingDetail: false }, error: extractErrorMessage(err) });
        }
    },

    fetchArticleStats: async (force = false) => {
        const state = get();
        const key = 'stats';
        const cached = !force ? statsCache.get<ArticleDashboardStats>(key) : undefined;
        if (cached) {
            set({ stats: cached, loading: { ...state.loading, isLoadingStats: false }, error: undefined });
            return;
        }

        set({ loading: { ...state.loading, isLoadingStats: true }, error: undefined });
        try {
            const { data } = await api.get<ArticleStatsApi>(`${URL_AFTER_API}/stats`);
            if (!data || !data.data) throw new Error('Failed to load stats');
            const stats = data.data;
            statsCache.set(key, stats);
            set({ stats, loading: { ...get().loading, isLoadingStats: false }, error: undefined });
        } catch (err) {
            set({ loading: { ...get().loading, isLoadingStats: false }, error: extractErrorMessage(err) });
        }
    },

    createArticle: async (input) => {
        try {
            const { data } = await api.post<CreateArticleApi>(`${URL_AFTER_API}`, input);
            if (!data || !data.data) throw new Error('Failed to create article');
            const created = data.data.article;
            if (created) {
                // New article affects lists & stats. Clear paged cache and stats detail caches for consistency.
                pagedCache.clear();
                statsCache.clear();
                // optionally keep detailCache or set newly created detail
                detailCache.set(`detail:${created.id}`, created);
                set({ detailById: { ...get().detailById, [created.id]: created }, error: undefined });
            }
            return data.data;
        } catch (err) {
            const message = extractErrorMessage(err);
            set({ error: message });
            return { success: false, message } as CreateArticleResponse;
        }
    },

    updateArticle: async (input) => {
        const { id, ...payload } = input;
        try {
            const { data } = await api.put<UpdateArticleApi>(`${URL_AFTER_API}/${id}`, payload);
            if (!data || !data.data) throw new Error('Failed to update articles');
            const updated = data.data.article;
            if (updated) {
                // update detail cache and update local store; clear pagedCache for simplicity
                detailCache.set(`detail:${id}`, updated);
                pagedCache.clear();
                const state = get();
                const newDetailById = { ...state.detailById, [id]: updated };
                const newListItems = state.listItems.map((a) => (a.id === id ? { ...a, ...updated } : a));
                set({ detailById: newDetailById, listItems: newListItems, error: undefined });
            }
            return data.data;
        } catch (err) {
            const message = extractErrorMessage(err);
            set({ error: message });
            return { success: false, message } as UpdateArticleResponse;
        }
    },

    deleteArticle: async (input) => {
        const { id } = input;
        const prevList = get().listItems;
        set({ listItems: prevList.filter((a) => a.id !== id) });
        try {
            const { data } = await api.delete<DeleteArticleApi>(`${URL_AFTER_API}/${id}`);
            if (!data || !data.data) throw new Error('Failed to delete article');
            detailCache.del(`detail:${id}`);
            pagedCache.clear();
            const detailById = { ...get().detailById };
            delete detailById[id];
            set({ detailById, error: undefined });
            return data.data;
        } catch (err) {
            set({ listItems: prevList, error: extractErrorMessage(err) });
            return { success: false, message: extractErrorMessage(err), deletedId: undefined } as DeleteArticleResponse;
        }
    },

    restoreArticle: async (input) => {
        const { id } = input;

        try {
            // Typically restore would be a PATCH or POST to a restore endpoint
            const { data } = await api.post<RestoreArticleApi>(`${URL_AFTER_API}/${id}/restore`);

            if (!data || !data.data) throw new Error('Failed to restore article');

            const restored = data.data.article;
            if (restored) {
                // Update caches and store state
                detailCache.set(`detail:${id}`, restored);
                pagedCache.clear(); // Clear list cache as the restored article might appear in lists
                statsCache.clear(); // Stats might change

                const state = get();
                const newDetailById = { ...state.detailById, [id]: restored };

                // If the article exists in listItems, update it
                const newListItems = state.listItems.map((a) =>
                    a.id === id ? { ...a, ...restored, status: restored.status } : a
                );

                set({
                    detailById: newDetailById,
                    listItems: newListItems,
                    error: undefined
                });
            }

            return data.data;
        } catch (err) {
            const message = extractErrorMessage(err);
            set({ error: message });
            return {
                success: false,
                message
            } as RestoreArticleResponse;
        }
    },

    invalidateList: (req) => {
        if (req) {
            const identity = queryIdentityFor(req);
            pagedCache.delete(identity);
        } else {
            pagedCache.clear();
        }
    },

    invalidateDetail: (id) => {
        detailCache.del(`detail:${id}`);
    },

    invalidateStats: () => {
        statsCache.clear();
    },

    reset: () =>
        set({
            listItems: [],
            detailById: {},
            stats: undefined,
            currentFilter: initialFilter,
            currentSearch: initialSearch,
            currentSort: initialSort,
            currentPagination: initialPagination,
            totalCount: undefined,
            totalPages: undefined,
            selectedArticleId: undefined,
            error: undefined,
            loading: { isLoadingList: false, isLoadingDetail: false, isLoadingStats: false },
        }),
}));
