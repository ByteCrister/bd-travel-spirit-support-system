// store/password-request.store.ts

import { FORGOT_PASSWORD_STATUS } from '@/constants/guide-forgot-password.const';
import {
    PasswordRequestFilters,
    PasswordRequestStore,
    PasswordRequestStoreState,
    PasswordRequestDto,
    PasswordRequestStats,
    PaginatedResponse,
    QueryParams,
    CacheStore,
    CacheEntry
} from '@/types/guide/guide-forgot-password.types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import api from '@/utils/axios';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extract-error-message';
import { ApiResponse } from '@/types/common/api.types';

// const URL_AFTER_API = `/mock/support/guide-password-requests`;
const URL_AFTER_API = `/support/guide-password-requests/v1`;

export const DEFAULT_FILTERS: PasswordRequestFilters = {
    search: '',
    status: 'ALL',
    dateRange: {
        start: null,
        end: null,
    },
    sortBy: {
        field: 'createdAt',
        order: 'desc',
    },
};

export const DEFAULT_PAGINATION = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
};

export const CACHE_CONFIG = {
    requests: {
        ttl: 5 * 60 * 1000, // 5 minutes
        staleWhileRevalidate: true,
        maxSize: 50, // Maximum number of cached queries
    },
    stats: {
        ttl: 10 * 60 * 1000, // 10 minutes
    },
    detail: {
        ttl: 2 * 60 * 1000, // 2 minutes
        maxSize: 100, // Maximum number of cached details
    },
};

export const STATUS_OPTIONS = [
    { value: 'ALL', label: 'All Statuses' },
    { value: FORGOT_PASSWORD_STATUS.PENDING, label: 'Pending' },
    { value: FORGOT_PASSWORD_STATUS.APPROVED, label: 'Approved' },
    { value: FORGOT_PASSWORD_STATUS.REJECTED, label: 'Rejected' },
];

export const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'expiresAt', label: 'Expiry Date' },
    { value: 'user.name', label: 'User Name' },
    { value: 'user.email', label: 'User Email' },
    { value: 'status', label: 'Status' },
];

// Helper function to generate query key for caching
const generateQueryKey = (params: QueryParams): string => {
    const { startDate, endDate, ...rest } = params;
    return JSON.stringify({
        ...rest,
        startDate: startDate || null,
        endDate: endDate || null,
    });
};

// Helper to clean expired cache entries
const cleanExpiredCache = (cache: CacheStore): CacheStore => {
    const now = Date.now();

    // Clean requests cache
    const validRequests = new Map<string, CacheEntry<PaginatedResponse<PasswordRequestDto>>>();
    for (const [key, entry] of cache.requests) {
        if (now - entry.timestamp < entry.ttl) {
            validRequests.set(key, entry);
        }
    }

    // Clean stats cache if expired
    const validStats = cache.stats && (now - cache.stats.timestamp < cache.stats.ttl)
        ? cache.stats
        : null;

    // Clean details cache
    const validDetails = new Map<string, CacheEntry<PasswordRequestDto>>();
    for (const [key, entry] of cache.details) {
        if (now - entry.timestamp < entry.ttl) {
            validDetails.set(key, entry);
        }
    }

    return {
        requests: validRequests,
        stats: validStats,
        details: validDetails,
        lastInvalidated: cache.lastInvalidated,
    };
};

const initialState: PasswordRequestStoreState = {
    requests: [],
    selectedRequest: null,
    stats: null,
    filters: DEFAULT_FILTERS,
    pagination: DEFAULT_PAGINATION,
    isLoading: false,
    isFetching: false,
    isUpdating: false,
    cache: {
        requests: new Map(),
        stats: null,
        details: new Map(),
        lastInvalidated: Date.now(),
    },
    error: null,
};

export const usePasswordRequestStore = create<PasswordRequestStore>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                fetchRequests: async (forceRefresh = false) => {
                    const { filters, pagination, cache: currentCache } = get();

                    // Clean expired cache first
                    const cache = cleanExpiredCache(currentCache);

                    // Build query params
                    const queryParams: QueryParams = {
                        page: pagination.page,
                        limit: pagination.limit,
                        search: filters.search,
                        status: filters.status,
                        sortBy: filters.sortBy.field,
                        sortOrder: filters.sortBy.order,
                        ...(filters.dateRange.start && {
                            startDate: filters.dateRange.start.toISOString()
                        }),
                        ...(filters.dateRange.end && {
                            endDate: filters.dateRange.end.toISOString()
                        }),
                    };

                    const queryKey = generateQueryKey(queryParams);

                    // Check cache validity
                    const now = Date.now();
                    const cachedEntry = cache.requests.get(queryKey);
                    const isCacheValid = cachedEntry &&
                        (now - cachedEntry.timestamp) < CACHE_CONFIG.requests.ttl &&
                        !forceRefresh;

                    if (isCacheValid && cachedEntry) {
                        // Use cached data
                        set({
                            requests: cachedEntry.data.data,
                            pagination: cachedEntry.data.pagination,
                            stats: cachedEntry.data.stats || get().stats,
                            isFetching: false,
                        });
                        return;
                    }

                    set({ isFetching: true, error: null });

                    try {
                        const response = await api.get<ApiResponse<PaginatedResponse<PasswordRequestDto>>>(`${URL_AFTER_API}`, {
                            params: queryParams,
                            headers: cachedEntry?.etag ? {
                                'If-None-Match': cachedEntry.etag
                            } : undefined
                        });

                        // Handle 304 Not Modified
                        if (response.status === 304 && cachedEntry) {
                            set({
                                requests: cachedEntry.data.data,
                                pagination: cachedEntry.data.pagination,
                                stats: cachedEntry.data.stats || get().stats,
                                isFetching: false,
                            });
                            return;
                        }

                        if (!(response.data && response.data.data)) {
                            throw new Error('Invalid response body.');
                        }

                        const responseData = response.data.data;

                        // Update cache
                        const updatedRequests = new Map(cache.requests);
                        updatedRequests.set(queryKey, {
                            data: responseData,
                            timestamp: Date.now(),
                            ttl: CACHE_CONFIG.requests.ttl,
                            queryKey,
                            etag: response.headers.etag,
                        });

                        // Enforce cache size limit
                        if (updatedRequests.size > CACHE_CONFIG.requests.maxSize!) {
                            const firstKey = updatedRequests.keys().next().value;
                            if (typeof firstKey === "string") {
                                updatedRequests.delete(firstKey);
                            }
                        }

                        set({
                            requests: responseData.data,
                            pagination: responseData.pagination,
                            cache: {
                                ...cache,
                                requests: updatedRequests,
                            },
                            isFetching: false,
                        });

                        if (responseData.stats) {
                            set({
                                stats: responseData.stats,
                                cache: {
                                    ...get().cache,
                                    stats: {
                                        data: responseData.stats,
                                        timestamp: Date.now(),
                                        ttl: CACHE_CONFIG.stats.ttl,
                                        queryKey: 'stats',
                                    },
                                },
                            });
                        }

                        // Show success toast for force refresh
                        if (forceRefresh) {
                            showToast.success('Data Refreshed', 'Requests list has been updated');
                        }
                    } catch (error: unknown) {
                        // If error is 304, use cached data
                        if (
                            typeof error === "object" &&
                            error !== null &&
                            "response" in error &&
                            (error as { response?: { status?: number } }).response?.status === 304 &&
                            cachedEntry
                        ) {
                            set({
                                requests: cachedEntry.data.data,
                                pagination: cachedEntry.data.pagination,
                                stats: cachedEntry.data.stats || get().stats,
                                isFetching: false,
                            });
                            return;
                        }

                        const errorMessage = extractErrorMessage(error);
                        set({
                            error: errorMessage,
                            isFetching: false
                        });
                        showToast.error('Failed to Fetch Requests', errorMessage);
                    }
                },

                fetchRequestById: async (id: string) => {
                    const { cache: currentCache } = get();
                    const cache = cleanExpiredCache(currentCache);

                    // Check cache first
                    const cachedDetail = cache.details.get(id);
                    const now = Date.now();

                    if (cachedDetail && (now - cachedDetail.timestamp < CACHE_CONFIG.detail.ttl)) {
                        set({
                            selectedRequest: cachedDetail.data,
                            isLoading: false
                        });
                        return;
                    }

                    set({ isLoading: true, error: null });

                    try {
                        const response = await api.get<ApiResponse<PasswordRequestDto>>(`${URL_AFTER_API}/${id}`);

                        if (!(response.data && response.data.data)) {
                            throw new Error('Invalid response body.');
                        }

                        const requestData = response.data.data;

                        // Update details cache
                        const updatedDetails = new Map(cache.details);
                        updatedDetails.set(id, {
                            data: requestData,
                            timestamp: Date.now(),
                            ttl: CACHE_CONFIG.detail.ttl,
                            queryKey: id,
                        });

                        // Enforce cache size limit
                        if (updatedDetails.size > CACHE_CONFIG.detail.maxSize!) {
                            const firstKey = updatedDetails.keys().next().value;
                            if (typeof firstKey === 'string') {
                                updatedDetails.delete(firstKey);
                            }
                        }

                        set({
                            selectedRequest: requestData,
                            cache: {
                                ...cache,
                                details: updatedDetails,
                            },
                            isLoading: false
                        });
                    } catch (error) {
                        const errorMessage = extractErrorMessage(error);
                        set({
                            error: errorMessage,
                            isLoading: false
                        });
                        showToast.error('Failed to Fetch Request', errorMessage);
                    }
                },

                fetchStats: async (forceRefresh = false) => {
                    const { cache: currentCache } = get();
                    const cache = cleanExpiredCache(currentCache);

                    const now = Date.now();
                    const isCacheValid = cache.stats &&
                        (now - cache.stats.timestamp) < CACHE_CONFIG.stats.ttl &&
                        !forceRefresh;

                    if (isCacheValid) {
                        return;
                    }

                    set({ isFetching: true, error: null });

                    try {
                        const response = await api.get<ApiResponse<PasswordRequestStats>>(`${URL_AFTER_API}/stats`);

                        if (!(response.data && response.data.data)) {
                            throw new Error('Invalid response body.');
                        }

                        set({
                            stats: response.data.data,
                            cache: {
                                ...cache,
                                stats: {
                                    data: response.data.data,
                                    timestamp: Date.now(),
                                    ttl: CACHE_CONFIG.stats.ttl,
                                    queryKey: 'stats',
                                },
                            },
                            isFetching: false,
                        });
                    } catch (error) {
                        const errorMessage = extractErrorMessage(error);
                        set({
                            error: errorMessage,
                            isFetching: false
                        });
                        showToast.error('Failed to Fetch Stats', errorMessage);
                    }
                },

                approveRequest: async (requestId: string, newPass: string, sendEmail: boolean) => {
                    set({ isUpdating: true, error: null });

                    try {
                        const response = await api.post<ApiResponse<PasswordRequestDto>>(
                            `${URL_AFTER_API}/${requestId}/approve`,
                            { newPass, sendEmail }
                        );

                        if (!(response.data && response.data.data)) {
                            throw new Error('Invalid response body.');
                        }

                        const updatedRequest = response.data.data;

                        // Update the request in all caches
                        const { cache, requests } = get();

                        // Update details cache
                        const updatedDetails = new Map(cache.details);
                        updatedDetails.set(requestId, {
                            data: updatedRequest,
                            timestamp: Date.now(),
                            ttl: CACHE_CONFIG.detail.ttl,
                            queryKey: requestId,
                        });

                        // Update request in all cached query results
                        const updatedRequestsCache = new Map(cache.requests);
                        for (const [key, entry] of updatedRequestsCache) {
                            const updatedData = entry.data.data.map(req =>
                                req.id === requestId ? updatedRequest : req
                            );
                            updatedRequestsCache.set(key, {
                                ...entry,
                                data: {
                                    ...entry.data,
                                    data: updatedData,
                                },
                            });
                        }

                        // Update local state immediately for better UX
                        const updatedRequestsList = requests.map(req =>
                            req.id === requestId ? updatedRequest : req
                        );

                        set({
                            requests: updatedRequestsList,
                            selectedRequest: null,
                            cache: {
                                ...cache,
                                requests: updatedRequestsCache,
                                details: updatedDetails,
                            },
                            isUpdating: false
                        });

                        showToast.success('Request Approved', 'The password request has been approved successfully');

                        // Refresh stats in background
                        get().fetchStats(true);
                    } catch (error) {
                        const errorMessage = extractErrorMessage(error);
                        set({
                            error: errorMessage,
                            isUpdating: false
                        });
                        showToast.error('Failed to Approve Request', errorMessage);
                    }
                },

                rejectRequest: async (requestId: string, reason: string) => {
                    set({ isUpdating: true, error: null });

                    try {
                        const response = await api.post<ApiResponse<PasswordRequestDto>>(
                            `${URL_AFTER_API}/${requestId}/reject`,
                            { reason }
                        );

                        if (!(response.data && response.data.data)) {
                            throw new Error('Invalid response body.');
                        }

                        const updatedRequest = response.data.data;

                        // Update the request in all caches
                        const { cache, requests } = get();

                        // Update details cache
                        const updatedDetails = new Map(cache.details);
                        updatedDetails.set(requestId, {
                            data: updatedRequest,
                            timestamp: Date.now(),
                            ttl: CACHE_CONFIG.detail.ttl,
                            queryKey: requestId,
                        });

                        // Update request in all cached query results
                        const updatedRequestsCache = new Map(cache.requests);
                        for (const [key, entry] of updatedRequestsCache) {
                            const updatedData = entry.data.data.map(req =>
                                req.id === requestId ? updatedRequest : req
                            );
                            updatedRequestsCache.set(key, {
                                ...entry,
                                data: {
                                    ...entry.data,
                                    data: updatedData,
                                },
                            });
                        }

                        // Update local state immediately
                        const updatedRequestsList = requests.map(req =>
                            req.id === requestId ? updatedRequest : req
                        );

                        set({
                            requests: updatedRequestsList,
                            selectedRequest: null,
                            cache: {
                                ...cache,
                                requests: updatedRequestsCache,
                                details: updatedDetails,
                            },
                            isUpdating: false
                        });

                        showToast.success('Request Rejected', 'The password request has been rejected');

                        // Refresh stats in background
                        get().fetchStats(true);
                    } catch (error) {
                        const errorMessage = extractErrorMessage(error);
                        set({
                            error: errorMessage,
                            isUpdating: false
                        });
                        showToast.error('Failed to Reject Request', errorMessage);
                    }
                },

                setFilters: (filters) => {
                    set((state) => ({
                        filters: { ...state.filters, ...filters },
                        pagination: { ...state.pagination, page: 1 }, // Reset to first page
                    }));
                },

                resetFilters: () => {
                    set({
                        filters: DEFAULT_FILTERS,
                        pagination: { ...get().pagination, page: 1 },
                    });
                },

                setPage: (page) => {
                    set({
                        pagination: { ...get().pagination, page },
                        // Check cache for this page when setPage is called
                    });
                },

                setLimit: (limit) => {
                    set({
                        pagination: { ...get().pagination, limit, page: 1 }
                    });
                },

                invalidateCache: (key) => {
                    const { cache } = get();

                    switch (key) {
                        case 'requests':
                            set({
                                cache: {
                                    ...cache,
                                    requests: new Map(),
                                    lastInvalidated: Date.now(),
                                }
                            });
                            showToast.success('Cache Invalidated', 'Requests cache has been cleared');
                            break;
                        case 'stats':
                            set({
                                cache: {
                                    ...cache,
                                    stats: null,
                                    lastInvalidated: Date.now(),
                                }
                            });
                            showToast.success('Cache Invalidated', 'Stats cache has been cleared');
                            break;
                        case 'details':
                            set({
                                cache: {
                                    ...cache,
                                    details: new Map(),
                                    lastInvalidated: Date.now(),
                                }
                            });
                            showToast.success('Cache Invalidated', 'Details cache has been cleared');
                            break;
                        case 'all':
                        default:
                            set({
                                cache: {
                                    requests: new Map(),
                                    stats: null,
                                    details: new Map(),
                                    lastInvalidated: Date.now(),
                                }
                            });
                            showToast.success('Cache Invalidated', 'All cached data has been cleared');
                            break;
                    }
                },

                clearCache: () => {
                    set({
                        cache: {
                            requests: new Map(),
                            stats: null,
                            details: new Map(),
                            lastInvalidated: Date.now(),
                        }
                    });
                    showToast.success('Cache Cleared', 'All cached data has been removed');
                },

                updateCacheEntry: (request: PasswordRequestDto) => {
                    const { cache } = get();

                    // Update details cache
                    const updatedDetails = new Map(cache.details);
                    updatedDetails.set(request.id, {
                        data: request,
                        timestamp: Date.now(),
                        ttl: CACHE_CONFIG.detail.ttl,
                        queryKey: request.id,
                    });

                    // Update request in all cached query results
                    const updatedRequestsCache = new Map(cache.requests);
                    for (const [key, entry] of updatedRequestsCache) {
                        const updatedData = entry.data.data.map(req =>
                            req.id === request.id ? request : req
                        );
                        updatedRequestsCache.set(key, {
                            ...entry,
                            data: {
                                ...entry.data,
                                data: updatedData,
                            },
                        });
                    }

                    set({
                        cache: {
                            ...cache,
                            requests: updatedRequestsCache,
                            details: updatedDetails,
                        },
                    });
                },

                selectRequest: (request) => {
                    set({ selectedRequest: request });
                },

                clearError: () => {
                    set({ error: null });
                },
            }),
            {
                name: 'guide-password-requests-store',
                partialize: (state) => ({
                    filters: state.filters,
                    pagination: state.pagination,
                    // Don't persist cache in localStorage for production
                    // cache: state.cache,
                }),
                // Custom storage with serialization for Map objects
                storage: {
                    getItem: (name) => {
                        const str = localStorage.getItem(name);
                        if (!str) return null;
                        const parsed = JSON.parse(str);
                        return {
                            ...parsed,
                            state: {
                                ...parsed.state,
                                // Don't restore cache from localStorage
                                cache: initialState.cache,
                            },
                        };
                    },
                    setItem: (name, value) => {
                        localStorage.setItem(name, JSON.stringify(value));
                    },
                    removeItem: (name) => {
                        localStorage.removeItem(name);
                    },
                },
            }
        ),
        { name: 'PasswordRequestStore' }
    )
);