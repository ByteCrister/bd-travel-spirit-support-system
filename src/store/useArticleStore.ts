// store/useArticle.store.ts
import { create } from 'zustand';

import {
    ArticleCacheKey,
    ArticleDashboardStats,
    ArticleDetail,
    ArticleDetailApi,
    ArticleDetailCacheKey,
    ArticleListApi,
    ArticleListItem,
    ArticleListQueryRequest,
    ArticleListQueryResponse,
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
} from '@/types/article.types';

import api from '@/utils/api/axios';
import { extractErrorMessage } from '@/utils/api/extractErrorMessage';
import { ARTICLE_STATUS } from '@/constants/article.const';

const URL_AFTER_API = "/mock/articles";

// ===== Cache helpers =====

const DEFAULT_TTL =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL
        ? Number(process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL)
        : 60_000;

type CacheEntry<T> = {
    data: T;
    ts: number;
};

class MemoryCache {
    private map = new Map<string, CacheEntry<unknown>>();

    get<T>(key: string, ttl = DEFAULT_TTL): T | undefined {
        const entry = this.map.get(key);
        if (!entry) return undefined;
        const isFresh = Date.now() - entry.ts < ttl;
        if (!isFresh) {
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
}

const cache = new MemoryCache();

// Stable cache-key serialization
function serializeKey(key: ArticleCacheKey): string {
    // JSON.stringify is stable enough here because keys are plain objects
    return JSON.stringify(key);
}

function listCacheKey(req: ArticleListQueryRequest): string {
    const key: ArticleCacheKey = {
        scope: 'list',
        filter: req.filter,
        search: req.search,
        sort: req.sort,
        pagination: req.pagination,
    };
    return serializeKey(key);
}

function detailCacheKey(id: ID): string {
    const key: ArticleDetailCacheKey = { scope: 'detail', id };
    return serializeKey(key);
}

function statsCacheKey(): string {
    return serializeKey({ scope: 'stats' as const });
}

// ===== Store types =====

type LoadingFlags = {
    isLoadingList: boolean;
    isLoadingDetail: boolean;
    isLoadingStats: boolean;
};

type ArticleStore = {
    // Data
    listItems: ArticleListItem[];
    detailById: Record<ID, ArticleDetail | undefined>;
    stats?: ArticleDashboardStats;

    // Query / pagination state (offset pagination)
    currentFilter: ArticleFilter;
    currentSearch: ArticleSearch;
    currentSort: ArticleSort;
    currentPagination: OffsetPageRequest; // page, pageSize
    totalCount?: number;
    totalPages?: number;

    // UI state
    selectedArticleId?: ID;
    error?: string;

    // Loading flags
    loading: LoadingFlags;

    // Actions
    setFilter: (filter: ArticleFilter) => void;
    setSearch: (search: ArticleSearch) => void;
    setSort: (sort: ArticleSort) => void;
    setPagination: (pg: OffsetPageRequest) => void;
    setSelectedArticleId: (id?: ID) => void;
    clearError: () => void;

    // Loaders
    fetchArticleList: (overrides?: Partial<ArticleListQueryRequest>) => Promise<void>;
    fetchArticleDetails: (id: ID, force?: boolean) => Promise<void>;
    fetchArticleStats: (force?: boolean) => Promise<void>;

    // Mutations
    createArticle: (input: CreateArticleInput) => Promise<CreateArticleResponse>;
    updateArticle: (input: UpdateArticleInput) => Promise<UpdateArticleResponse>;
    deleteArticle: (input: DeleteArticleInput) => Promise<DeleteArticleResponse>;

    // Cache utilities
    invalidateList: (req?: ArticleListQueryRequest) => void;
    invalidateDetail: (id: ID) => void;
    invalidateStats: () => void;
    reset: () => void;
};

// ===== Initial values =====

const initialFilter: ArticleFilter = {
    status: [ARTICLE_STATUS.DRAFT, ARTICLE_STATUS.PUBLISHED, ARTICLE_STATUS.ARCHIVED],
};

const initialSearch: ArticleSearch = { query: '' };

const initialSort: ArticleSort = { field: 'updatedAt', order: 'desc' };

const initialPagination: OffsetPageRequest = { page: 1, pageSize: 20 };

// ===== Store implementation =====

export const useArticleStore = create<ArticleStore>((set, get) => ({
    // data
    listItems: [],
    detailById: {},
    stats: undefined,

    // query state
    currentFilter: initialFilter,
    currentSearch: initialSearch,
    currentSort: initialSort,
    currentPagination: initialPagination,
    totalCount: undefined,
    totalPages: undefined,

    // ui state
    selectedArticleId: undefined,
    error: undefined,

    // loading
    loading: {
        isLoadingList: false,
        isLoadingDetail: false,
        isLoadingStats: false,
    },

    // actions
    setFilter: (filter) => {
        // reset to page 1 when filter changes
        set({ currentFilter: filter, currentPagination: { ...get().currentPagination, page: 1 } });
    },

    setSearch: (search) => {
        // reset to page 1 when search changes
        set({ currentSearch: search, currentPagination: { ...get().currentPagination, page: 1 } });
    },

    setSort: (sort) => {
        // keep current page; clients may choose to reset page
        set({ currentSort: sort });
    },

    setPagination: (pg) => {
        set({ currentPagination: pg });
    },

    setSelectedArticleId: (id) => set({ selectedArticleId: id }),

    clearError: () => set({ error: undefined }),

    // loaders
    fetchArticleList: async (overrides?: Partial<ArticleListQueryRequest>) => {
        const state = get();

        // Merge overrides with current store state
        const req: ArticleListQueryRequest = {
            filter: overrides?.filter ?? state.currentFilter,
            search: overrides?.search ?? state.currentSearch,
            sort: overrides?.sort ?? state.currentSort,
            pagination: overrides?.pagination ?? state.currentPagination,
        };

        // Ensure OffsetPageRequest shape
        const pagination = req.pagination as OffsetPageRequest;
        const page = pagination?.page ?? 1;
        const pageSize = pagination?.pageSize ?? initialPagination.pageSize;

        const normalizedReq: ArticleListQueryRequest = {
            filter: req.filter,
            search: req.search,
            sort: req.sort,
            pagination: { page, pageSize },
        };

        const key = listCacheKey(normalizedReq);
        const cached = cache.get<ArticleListQueryResponse>(key);

        if (cached) {
            const offsetResp = cached as OffsetPageResponse<ArticleListItem>;
            set({
                listItems: offsetResp.items,
                currentFilter: normalizedReq.filter ?? state.currentFilter,
                currentSearch: normalizedReq.search ?? state.currentSearch,
                currentSort: normalizedReq.sort ?? state.currentSort,
                currentPagination: normalizedReq.pagination,
                totalCount: offsetResp.totalCount,
                totalPages: offsetResp.totalPages,
                loading: { ...state.loading, isLoadingList: false },
                error: undefined,
            });
            return;
        }

        set({ loading: { ...state.loading, isLoadingList: true }, error: undefined });

        try {
            // Build query params dynamically
            const params: Record<string, unknown> = {
                page,
                pageSize,
                query: normalizedReq.search?.query ?? '',
            };

            // Serialize all filter fields
            if (normalizedReq.filter) {
                Object.entries(normalizedReq.filter).forEach(([key, value]) => {
                    if (value === undefined || value === null) return;
                    if (Array.isArray(value)) params[key] = value.join(',');
                    else params[key] = value;
                });
            }

            // Include sort if present
            if (normalizedReq.sort) {
                params.sortField = normalizedReq.sort.field;
                params.sortOrder = normalizedReq.sort.order;
            }

            const { data } = await api.get<ArticleListApi>(`${URL_AFTER_API}`, { params });
            if (!data.ok) throw new Error(data.error || 'Failed to load articles');

            const response = data.data;

            if (response.paginationType === 'offset') {
                cache.set(key, response);
                const offsetResp = response as OffsetPageResponse<ArticleListItem>;
                set({
                    listItems: offsetResp.items,
                    currentFilter: normalizedReq.filter ?? state.currentFilter,
                    currentSearch: normalizedReq.search ?? state.currentSearch,
                    currentSort: normalizedReq.sort ?? state.currentSort,
                    currentPagination: { page: offsetResp.page ?? page, pageSize },
                    totalCount: offsetResp.totalCount,
                    totalPages: offsetResp.totalPages,
                    loading: { ...get().loading, isLoadingList: false },
                    error: undefined,
                });
            } else {
                // fallback
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
            set({
                loading: { ...get().loading, isLoadingList: false },
                error: extractErrorMessage(err),
            });
        }
    },


    fetchArticleDetails: async (id, force = false) => {
        const state = get();
        const key = detailCacheKey(id);
        const cached = !force ? cache.get<ArticleDetail>(key) : undefined;

        if (cached) {
            set({
                detailById: { ...state.detailById, [id]: cached },
                loading: { ...state.loading, isLoadingDetail: false },
                error: undefined,
            });
            return;
        }

        set({ loading: { ...state.loading, isLoadingDetail: true }, error: undefined });

        try {
            const { data } = await api.get<ArticleDetailApi>(`${URL_AFTER_API}/${id}`);
            if (!data.ok) throw new Error(data.error || 'Failed to load article');

            const detail = data.data;
            cache.set(key, detail);
            set({
                detailById: { ...get().detailById, [id]: detail },
                loading: { ...get().loading, isLoadingDetail: false },
                error: undefined,
            });
        } catch (err) {
            set({
                loading: { ...get().loading, isLoadingDetail: false },
                error: extractErrorMessage(err),
            });
        }
    },

    fetchArticleStats: async (force = false) => {
        const state = get();
        const key = statsCacheKey();
        const cached = !force ? cache.get<ArticleDashboardStats>(key) : undefined;

        if (cached) {
            set({
                stats: cached,
                loading: { ...state.loading, isLoadingStats: false },
                error: undefined,
            });
            return;
        }

        set({ loading: { ...state.loading, isLoadingStats: true }, error: undefined });

        try {
            const { data } = await api.get<ArticleStatsApi>(`${URL_AFTER_API}/stats`);
            if (!data.ok) throw new Error(data.error || 'Failed to load stats');

            const stats = data.data;
            cache.set(key, stats);
            set({
                stats,
                loading: { ...get().loading, isLoadingStats: false },
                error: undefined,
            });
        } catch (err) {
            set({
                loading: { ...get().loading, isLoadingStats: false },
                error: extractErrorMessage(err),
            });
        }
    },

    // mutations
    createArticle: async (input) => {
        try {
            const { data } = await api.post<CreateArticleApi>(`${URL_AFTER_API}`, input);
            if (!data.ok) throw new Error(data.error || 'Failed to create article');

            const created = data.data.article;
            if (created) {
                // Invalidate list & stats caches to reflect new data
                cache.clear();
                // Merge into local store detail
                set({
                    detailById: { ...get().detailById, [created.id]: created },
                    error: undefined,
                });
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
            if (!data.ok) throw new Error(data.error || 'Failed to update article');

            const updated = data.data.article;
            if (updated) {
                // Update caches: detail and invalidate list/stats so UI reloads list pages
                cache.set(detailCacheKey(id), updated);
                cache.clear();

                // Update local store
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

        // Optimistic removal from local list while request is in-flight
        const prevList = get().listItems;
        set({ listItems: prevList.filter((a) => a.id !== id) });

        try {
            const { data } = await api.delete<DeleteArticleApi>(`${URL_AFTER_API}/${id}`);
            if (!data.ok) throw new Error(data.error || 'Failed to delete article');

            // Invalidate caches
            cache.del(detailCacheKey(id));
            cache.clear();

            // Remove detail
            const detailById = { ...get().detailById };
            delete detailById[id];
            set({ detailById, error: undefined });

            return data.data;
        } catch (err) {
            // Rollback list on failure
            set({ listItems: prevList, error: extractErrorMessage(err) });
            return { success: false, message: extractErrorMessage(err), deletedId: undefined } as DeleteArticleResponse;
        }
    },

    // cache utilities
    invalidateList: (req) => {
        if (req) {
            cache.del(listCacheKey(req));
        } else {
            cache.clear();
        }
    },

    invalidateDetail: (id) => cache.del(detailCacheKey(id)),

    invalidateStats: () => cache.del(statsCacheKey()),

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
