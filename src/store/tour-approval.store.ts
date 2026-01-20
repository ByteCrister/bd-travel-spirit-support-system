// stores/tour-approval.store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
    TourApprovalStoreState,
    TourApprovalStats,
    TourApprovalResponse,
    TourApprovalList,
} from '@/types/tour-approval.types';
import { ApiResponse } from '@/types/api.types';
import { TourDetailDTO, TourFilterOptions } from '@/types/tour.types';
import { extractErrorMessage } from '@/utils/axios/extract-error-message';
import api from '@/utils/axios';
import { MODERATION_STATUS } from '@/constants/tour.const';
import { showToast } from '@/components/global/showToast';
import { decodeId } from '@/utils/helpers/mongodb-id-conversions';

// const URL_AFTER_API = `/mock/support/tours`;
const URL_AFTER_API = `/support/tours/v1`;

// Cache configuration
const CACHE_TTL = Number(process.env.NEXT_PUBLIC_CACHE_TTL) ?? 1 * 60 * 1000; // 1 minute in milliseconds
const MAX_LIST_CACHE_SIZE = 100; // Maximum number of cached list responses
const MAX_TOUR_CACHE_SIZE = 50; // Maximum number of cached individual tours

interface PersistedTourApprovalStoreState {
    listCache: [string, ListCacheItem][];
    tourCache: [string, TourCacheItem][];
    filters: Partial<TourFilterOptions>;
    pagination: {
        limit: number;
    };
}

// List cache item interface
interface ListCacheItem {
    data: TourApprovalList;
    timestamp: number;
    filters: Partial<TourFilterOptions>;
    page: number;
    limit: number;
}

// Individual tour cache item interface
interface TourCacheItem {
    data: TourDetailDTO;
    timestamp: number;
}

// Cache key generators
const generateListCacheKey = (
    filters: Partial<TourFilterOptions> = {},
    page: number,
    limit: number
): string => {
    const normalizedFilters = { ...filters };

    // Normalize array filters for consistent cache keys
    if (normalizedFilters.moderationStatus) {
        normalizedFilters.moderationStatus = [...normalizedFilters.moderationStatus].sort();
    }
    if (normalizedFilters.division) {
        normalizedFilters.division = [...normalizedFilters.division].sort();
    }
    if (normalizedFilters.district) {
        normalizedFilters.district = [...normalizedFilters.district].sort();
    }
    if (normalizedFilters.tourType) {
        normalizedFilters.tourType = [...normalizedFilters.tourType].sort();
    }

    return `list_${JSON.stringify({
        filters: normalizedFilters,
        page,
        limit,
    })}`;
};

const generateTourCacheKey = (tourId: string): string => {
    return `tour_${tourId}`;
};

// Initial state
const initialStats: TourApprovalStats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    total: 0,
};

const initialFilters: Partial<TourFilterOptions> = {
    moderationStatus: [MODERATION_STATUS.PENDING]
};

// Extended store state with caching
interface EnhancedTourApprovalStoreState extends TourApprovalStoreState {
    // Cache states
    listCache: Map<string, ListCacheItem>;
    tourCache: Map<string, TourCacheItem>;

    // List cache actions
    getFromListCache: (key: string) => TourApprovalList | null;
    setToListCache: (key: string, data: TourApprovalList, filters: Partial<TourFilterOptions>, page: number, limit: number) => void;
    clearListCache: () => void;
    clearExpiredListCache: () => void;
    invalidateListCache: (partialKey?: string) => void;

    // Tour cache actions
    getFromTourCache: (tourId: string) => TourDetailDTO | null;
    setToTourCache: (tourId: string, data: TourDetailDTO) => void;
    removeFromTourCache: (tourId: string) => void;
    clearTourCache: () => void;
    clearExpiredTourCache: () => void;
    updateTourInCache: (tourId: string, updates: Partial<TourDetailDTO>) => void;

    // Enhanced actions
    prefetchNextPage: (filters?: Partial<TourFilterOptions>, currentPage?: number, limit?: number) => Promise<void>;
    refreshCurrentPage: () => Promise<void>;
}

export const useTourApproval = create<EnhancedTourApprovalStoreState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                tours: [],
                selectedTour: null,
                selectedTourIds: [],
                filters: initialFilters,
                isLoading: false,
                isProcessing: false,
                error: null,
                stats: initialStats,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                },
                listCache: new Map(),
                tourCache: new Map(),

                // ===== LIST CACHE METHODS =====
                getFromListCache: (key: string) => {
                    const item = get().listCache.get(key);
                    if (!item) return null;

                    const now = Date.now();
                    if (now - item.timestamp > CACHE_TTL) {
                        get().listCache.delete(key);
                        return null;
                    }

                    return item.data;
                },

                setToListCache: (key: string, data: TourApprovalList, filters: Partial<TourFilterOptions>, page: number, limit: number) => {
                    const cache = get().listCache;

                    // Clean up if cache is too large
                    if (cache.size >= MAX_LIST_CACHE_SIZE) {
                        const oldestKey = Array.from(cache.entries())
                            .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
                        if (oldestKey) {
                            cache.delete(oldestKey);
                        }
                    }

                    cache.set(key, {
                        data,
                        timestamp: Date.now(),
                        filters,
                        page,
                        limit,
                    });

                    set({ listCache: new Map(cache) });
                },

                clearListCache: () => {
                    set({ listCache: new Map() });
                },

                clearExpiredListCache: () => {
                    const now = Date.now();
                    const cache = get().listCache;

                    for (const [key, item] of cache.entries()) {
                        if (now - item.timestamp > CACHE_TTL) {
                            cache.delete(key);
                        }
                    }

                    set({ listCache: new Map(cache) });
                },

                invalidateListCache: (partialKey?: string) => {
                    if (!partialKey) {
                        get().clearListCache();
                        return;
                    }

                    const cache = get().listCache;
                    for (const [key] of cache.entries()) {
                        if (key.includes(partialKey)) {
                            cache.delete(key);
                        }
                    }

                    set({ listCache: new Map(cache) });
                },

                // ===== TOUR CACHE METHODS =====
                getFromTourCache: (tourId: string) => {
                    const key = generateTourCacheKey(tourId);
                    const item = get().tourCache.get(key);
                    if (!item) return null;

                    const now = Date.now();
                    if (now - item.timestamp > CACHE_TTL) {
                        get().tourCache.delete(key);
                        return null;
                    }

                    return item.data;
                },

                setToTourCache: (tourId: string, data: TourDetailDTO) => {
                    const key = generateTourCacheKey(tourId);
                    const cache = get().tourCache;

                    // Clean up if cache is too large
                    if (cache.size >= MAX_TOUR_CACHE_SIZE) {
                        const oldestKey = Array.from(cache.entries())
                            .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
                        if (oldestKey) {
                            cache.delete(oldestKey);
                        }
                    }

                    cache.set(key, {
                        data,
                        timestamp: Date.now(),
                    });

                    set({ tourCache: new Map(cache) });
                },

                removeFromTourCache: (tourId: string) => {
                    const key = generateTourCacheKey(tourId);
                    const cache = get().tourCache;
                    cache.delete(key);
                    set({ tourCache: new Map(cache) });
                },

                clearTourCache: () => {
                    set({ tourCache: new Map() });
                },

                clearExpiredTourCache: () => {
                    const now = Date.now();
                    const cache = get().tourCache;

                    for (const [key, item] of cache.entries()) {
                        if (now - item.timestamp > CACHE_TTL) {
                            cache.delete(key);
                        }
                    }

                    set({ tourCache: new Map(cache) });
                },

                updateTourInCache: (tourId: string, updates: Partial<TourDetailDTO>) => {
                    const key = generateTourCacheKey(tourId);
                    const cache = get().tourCache;
                    const item = cache.get(key);

                    if (item) {
                        cache.set(key, {
                            ...item,
                            data: { ...item.data, ...updates },
                            timestamp: Date.now(), // Update timestamp on modification
                        });
                        set({ tourCache: new Map(cache) });
                    }
                },

                // ===== FETCH METHODS =====
                fetchTours: async (filters = {}, page = 1, limit = 10) => {
                    const currentFilters = { ...get().filters, ...filters };
                    const cacheKey = generateListCacheKey(currentFilters, page, limit);

                    // Check cache first
                    const cached = get().getFromListCache(cacheKey);
                    if (cached) {
                        set({
                            tours: cached.tours,
                            stats: cached.stats || initialStats,
                            pagination: {
                                page: cached.page || page,
                                limit: cached.limit || limit,
                                total: cached.total || 0,
                                totalPages: cached.totalPages || 0,
                            },
                            isLoading: false,
                        });

                        // Cache individual tours from the list
                        cached.tours.forEach(tour => {
                            // Only cache basic tour info, full details will be fetched separately
                            const basicTourInfo: TourDetailDTO = {
                                ...tour,
                                id: tour.id,
                                title: tour.title,
                                // Add other basic fields as needed
                            } as TourDetailDTO;
                            get().setToTourCache(tour.id, basicTourInfo);
                        });

                        return;
                    }

                    set({ isLoading: true, error: null });

                    try {
                        // Build query params as Record<string, any>
                        const params: Record<string, unknown> = {
                            page,
                            limit,
                            ...currentFilters,
                        };

                        // Handle array filters
                        const arrayFilters = ['moderationStatus', 'division', 'district', 'tourType', 'difficulty', 'status'];
                        arrayFilters.forEach(filterName => {
                            if (Array.isArray(currentFilters[filterName as keyof TourFilterOptions])) {
                                const value = currentFilters[filterName as keyof TourFilterOptions];
                                if (Array.isArray(value) && value.length > 0) {
                                    params[filterName] = value.join(',');
                                }
                            }
                        });

                        // Remove undefined/empty values
                        Object.keys(params).forEach(key => {
                            if (params[key] === undefined || params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
                                delete params[key];
                            }
                        });

                        const response = await api.get<ApiResponse<TourApprovalList>>(`${URL_AFTER_API}`, { params });

                        if (response.data.error) {
                            throw new Error(response.data.error);
                        }

                        const { tours, total, page: currentPage, limit: currentLimit, totalPages, stats } = response.data.data!;

                        // Update state
                        set({
                            tours,
                            stats: stats || initialStats,
                            pagination: {
                                page: currentPage,
                                limit: currentLimit,
                                total,
                                totalPages,
                            },
                            filters: currentFilters,
                            isLoading: false,
                        });

                        // Cache the list result
                        get().setToListCache(cacheKey, response.data.data!, currentFilters, currentPage, currentLimit);

                        // Cache individual tours from the list
                        tours.forEach(tour => {
                            // Only cache basic tour info
                            const basicTourInfo: TourDetailDTO = {
                                ...tour,
                                id: tour.id,
                                title: tour.title,
                                // Add other basic fields
                            } as TourDetailDTO;
                            get().setToTourCache(tour.id, basicTourInfo);
                        });

                    } catch (error) {
                        const message = extractErrorMessage(error);
                        set({ error: message, isLoading: false });
                        console.error('Error fetching tours:', error);
                    }
                },

                // In stores/tour-approval.store.ts - Update fetchTourById
                fetchTourById: async (tourId: string, skipCache = false) => {
                    // Check cache first unless skipping
                    if (!skipCache) {
                        const cachedTour = get().getFromTourCache(tourId);
                        if (cachedTour) {
                            set({ selectedTour: cachedTour, isLoading: false });
                            return;
                        }
                    }

                    // Don't return early if selectedTour matches - always fetch if cache is empty/expired
                    set({ isLoading: true, error: null });

                    try {
                        const response = await api.get<ApiResponse<TourDetailDTO>>(`${URL_AFTER_API}/${tourId}`);

                        if (response.data.error) {
                            throw new Error(response.data.error);
                        }

                        if (!response.data || !response.data.data) {
                            throw new Error("Invalid response body.")
                        }

                        const tour = response.data.data;

                        // Update state
                        set({ selectedTour: tour, isLoading: false });

                        // Cache the tour
                        get().setToTourCache(tourId, tour);

                    } catch (error) {
                        const message = extractErrorMessage(error);
                        set({ error: message, isLoading: false });
                        console.error('Error fetching tour:', error);
                    }
                },

                // Prefetch next page for smoother pagination
                prefetchNextPage: async (filters = {}, currentPage = 1, limit = 10) => {
                    const nextPage = currentPage + 1;
                    const currentFilters = { ...get().filters, ...filters };
                    const cacheKey = generateListCacheKey(currentFilters, nextPage, limit);

                    // Don't prefetch if already cached or at last page
                    if (get().getFromListCache(cacheKey) || nextPage > get().pagination.totalPages) {
                        return;
                    }

                    try {
                        const params: Record<string, unknown> = {
                            page: nextPage,
                            limit,
                            ...currentFilters,
                        };

                        const response = await api.get<ApiResponse<TourApprovalList>>(`${URL_AFTER_API}`, { params });

                        if (response.data.data) {
                            get().setToListCache(cacheKey, response.data.data!, currentFilters, nextPage, limit);

                            // Cache individual tours from prefetched list
                            response.data.data.tours.forEach(tour => {
                                const basicTourInfo: TourDetailDTO = {
                                    ...tour,
                                    id: tour.id,
                                    title: tour.title,
                                } as TourDetailDTO;
                                get().setToTourCache(tour.id, basicTourInfo);
                            });
                        }
                    } catch (error) {
                        // Silent fail for prefetching
                        console.debug('Prefetch failed:', error);
                    }
                },

                // Refresh current page
                refreshCurrentPage: async () => {
                    const { page, limit } = get().pagination;
                    const currentFilters = get().filters;
                    const cacheKey = generateListCacheKey(currentFilters, page, limit);

                    // Invalidate cache for this key
                    get().listCache.delete(cacheKey);

                    // Refetch
                    await get().fetchTours(currentFilters, page, limit);
                },

                // Approve a tour with cache invalidation
                approveTour: async (tourId: string, reason?: string) => {
                    set({ isProcessing: true, error: null });

                    try {
                        const response = await api.post<ApiResponse<TourApprovalResponse>>(
                            `${URL_AFTER_API}/${decodeURIComponent(decodeId(tourId) ?? "")}/approve`,
                            { reason }
                        );

                        if (response.data.error) {
                            throw new Error(response.data.error);
                        }

                        // Update local state
                        const updatedTour = response.data.data!.tour;

                        // Update in tours list
                        const tours = get().tours.map(tour =>
                            tour.id === tourId ? { ...tour, ...updatedTour } : tour
                        );

                        // Update selected tour if it's the current one
                        if (get().selectedTour?.id === tourId) {
                            set({ selectedTour: updatedTour });
                        }

                        // Update tour cache
                        get().updateTourInCache(tourId, updatedTour);

                        // Update stats
                        const stats = get().stats;
                        const newStats = {
                            ...stats,
                            pending: Math.max(0, stats.pending - 1),
                            approved: stats.approved + 1,
                        };

                        // Invalidate list cache for all queries that might include this tour
                        get().invalidateListCache('moderationStatus');

                        set({
                            tours,
                            stats: newStats,
                            isProcessing: false,
                        });

                        return response.data;

                    } catch (error) {
                        const message = extractErrorMessage(error);
                        set({ error: message, isProcessing: false });

                        showToast.error('Error approving tour', message);

                        console.error('Error approving tour:', error);
                        return {
                            data: undefined,
                            error: message,
                        };
                    }
                },

                // Reject a tour with cache invalidation
                rejectTour: async (tourId: string, reason: string) => {
                    if (!reason.trim()) {
                        const error = 'Rejection reason is required';
                        set({ error });
                        return { data: undefined, error };
                    }

                    set({ isProcessing: true, error: null });

                    try {
                        const response = await api.post<ApiResponse<TourApprovalResponse>>(
                            `${URL_AFTER_API}/${decodeURIComponent(decodeId(tourId) ?? "")}/reject`,
                            { reason }
                        );

                        if (response.data.error) {
                            throw new Error(response.data.error);
                        }

                        // Update local state
                        const updatedTour = response.data.data!.tour;

                        // Update in tours list
                        const tours = get().tours.map(tour =>
                            tour.id === tourId ? { ...tour, ...updatedTour } : tour
                        );

                        // Update selected tour if it's the current one
                        if (get().selectedTour?.id === tourId) {
                            set({ selectedTour: updatedTour });
                        }

                        // Update tour cache
                        get().updateTourInCache(tourId, updatedTour);

                        // Update stats
                        const stats = get().stats;
                        const newStats = {
                            ...stats,
                            pending: Math.max(0, stats.pending - 1),
                            rejected: stats.rejected + 1,
                        };

                        // Invalidate list cache for all queries that might include this tour
                        get().invalidateListCache('moderationStatus');

                        set({
                            tours,
                            stats: newStats,
                            isProcessing: false,
                        });

                        return response.data;

                    } catch (error) {
                        const message = extractErrorMessage(error);
                        set({ error: message, isProcessing: false });

                        showToast.error('Error rejecting tour', message);

                        console.error('Error rejecting tour:', error);
                        return {
                            data: undefined,
                            error: message,
                        };
                    }
                },

                // Set filters with cache consideration
                setFilters: (filters: Partial<TourFilterOptions>) => {
                    const currentFilters = get().filters;
                    const newFilters = { ...currentFilters, ...filters };
                    set({ filters: newFilters });

                    // Auto-refetch with new filters (page reset to 1)
                    const { limit } = get().pagination;
                    get().fetchTours(newFilters, 1, limit);
                },

                // Clear all filters
                clearFilters: () => {
                    set({ filters: initialFilters });

                    // Refetch with initial filters
                    const { limit } = get().pagination;
                    get().fetchTours(initialFilters, 1, limit);
                },

                // Set selected tour
                setSelectedTour: (tour: TourDetailDTO | null) => {
                    set({ selectedTour: tour });
                },

                // Get tour from cache if available
                getCachedTour: (tourId: string) => {
                    return get().getFromTourCache(tourId);
                },

                // Clear both caches
                clearAllCache: () => {
                    get().clearListCache();
                    get().clearTourCache();
                },

                // Clear error
                clearError: () => {
                    set({ error: null });
                },

            }),
            {
                name: 'tour-approval-store',
                partialize: (state) => ({
                    // Persist both caches and filters
                    listCache: Array.from(state.listCache.entries()),
                    tourCache: Array.from(state.tourCache.entries()),
                    filters: state.filters,
                    pagination: {
                        limit: state.pagination.limit,
                    },
                }),

                merge: (persistedState: unknown, currentState: EnhancedTourApprovalStoreState): EnhancedTourApprovalStoreState => {
                    const isPersistedState = (state: unknown): state is PersistedTourApprovalStoreState => {
                        if (!state || typeof state !== 'object') return false;

                        const s = state as Record<string, unknown>;
                        return (
                            Array.isArray(s.listCache) &&
                            Array.isArray(s.tourCache) &&
                            typeof s.filters === 'object' &&
                            s.filters !== null &&
                            typeof s.pagination === 'object' &&
                            s.pagination !== null &&
                            'limit' in s.pagination &&
                            typeof s.pagination.limit === 'number'
                        );
                    };

                    if (!isPersistedState(persistedState)) {
                        return currentState;
                    }

                    const now = Date.now();

                    // Filter out expired list cache entries
                    const filteredListCache = persistedState.listCache.filter(([, item]) =>
                        now - item.timestamp <= CACHE_TTL
                    );

                    // Filter out expired tour cache entries
                    const filteredTourCache = persistedState.tourCache.filter(([, item]) =>
                        now - item.timestamp <= CACHE_TTL
                    );

                    return {
                        ...currentState,
                        filters: persistedState.filters || currentState.filters,
                        pagination: {
                            ...currentState.pagination,
                            limit: persistedState.pagination.limit,
                        },
                        listCache: new Map(filteredListCache),
                        tourCache: new Map(filteredTourCache),
                        selectedTour: null, // Clear selectedTour on rehydration
                    };
                },
            }
        ),
        {
            name: 'tour-approval-store',
            enabled: process.env.NODE_ENV !== 'production',
        }
    )
);