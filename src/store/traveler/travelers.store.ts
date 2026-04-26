// stores/traveler.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import api from '@/utils/axios';
import {
    TravelerDetail,
    TravelerFilter,
    PaginatedResponse,
    TravelerBooking,
    TravelerReview,
    TravelerReport,
    TravelerFAQ,
    TravelerLikedTour,
    TravelerSharedTour,
    TravelerViewedTour,
    TravelerViewedArticle,
    TravelerCancellation,
    CacheEntry,
    CACHE_TTL,
    TravelerTabName,
    TravelerTabMap,
    TravelerListResponse,
} from '@/types/user/traveler.types';
import { ApiResponse } from '@/types/common/api.types';
import { extractErrorMessage } from '@/utils/axios/extract-error-message';
enableMapSet();

// const URL_AFTER_API = `/mock/users/travelers`
const URL_AFTER_API = `/users/travelers/v1`

// ----------------------------------------------------------------------
// API endpoint constants
// ----------------------------------------------------------------------
const API = {
    TRAVELERS: URL_AFTER_API,
    TRAVELER_BY_ID: (id: string) => `${URL_AFTER_API}/${id}`,
    TRAVELER_BOOKINGS: (id: string) => `${URL_AFTER_API}/${id}/bookings`,
    TRAVELER_REVIEWS: (id: string) => `${URL_AFTER_API}/${id}/reviews`,
    TRAVELER_REPORTS: (id: string) => `${URL_AFTER_API}/${id}/reports`,
    TRAVELER_FAQS: (id: string) => `${URL_AFTER_API}/${id}/faqs`,
    TRAVELER_LIKED_TOURS: (id: string) => `${URL_AFTER_API}/${id}/liked-tours`,
    TRAVELER_SHARED_TOURS: (id: string) => `${URL_AFTER_API}/${id}/shared-tours`,
    TRAVELER_VIEWED_TOURS: (id: string) => `${URL_AFTER_API}/${id}/viewed-tours`,
    TRAVELER_VIEWED_ARTICLES: (id: string) => `${URL_AFTER_API}/${id}/viewed-articles`,
    TRAVELER_CANCELLATIONS: (id: string) => `${URL_AFTER_API}/${id}/cancellations`,
    TRAVELER_SUSPEND: (id: string) => `${URL_AFTER_API}/${id}/actions/suspend`,
    TRAVELER_UNSUSPEND: (id: string) => `${URL_AFTER_API}/${id}/actions/unsuspend`,
    TRAVELER_LOCK: (id: string) => `${URL_AFTER_API}/${id}/actions/lock`,
    TRAVELER_UNLOCK: (id: string) => `${URL_AFTER_API}/${id}/actions/unlock`,
};

// ----------------------------------------------------------------------
// Store State Interface
// ----------------------------------------------------------------------
interface TravelerStoreState {
    travelerListCache: Map<string, CacheEntry<TravelerListResponse>>;
    travelerDetailCache: Map<string, CacheEntry<TravelerDetail>>;
    tabCache: Map<string, CacheEntry<PaginatedResponse<TravelerTabMap[keyof TravelerTabMap]>>>;

    loading: {
        list: boolean;
        detail: boolean;
        [key: string]: boolean;
    };
    errors: {
        list?: string;
        detail?: string;
        [key: string]: string | undefined;
    };
}

// ----------------------------------------------------------------------
// Store Actions Interface
// ----------------------------------------------------------------------
interface TravelerStoreActions {
    fetchTravelers: (
        filters: TravelerFilter,
        forceRefresh?: boolean
    ) => Promise<TravelerListResponse>;

    fetchTravelerById: (
        id: string,
        forceRefresh?: boolean
    ) => Promise<TravelerDetail>;

    fetchTabData: <K extends keyof TravelerTabMap>(
        travelerId: string,
        tabName: K,
        page: number,
        limit: number,
        url: string,
        forceRefresh?: boolean
    ) => Promise<PaginatedResponse<TravelerTabMap[K]>>;

    fetchBookings: (travelerId: string, page: number, limit: number, forceRefresh?: boolean) => Promise<PaginatedResponse<TravelerBooking>>;
    fetchReviews: (travelerId: string, page: number, limit: number, forceRefresh?: boolean) => Promise<PaginatedResponse<TravelerReview>>;
    fetchReports: (travelerId: string, page: number, limit: number, forceRefresh?: boolean) => Promise<PaginatedResponse<TravelerReport>>;
    fetchFAQs: (travelerId: string, page: number, limit: number, forceRefresh?: boolean) => Promise<PaginatedResponse<TravelerFAQ>>;
    fetchLikedTours: (travelerId: string, page: number, limit: number, forceRefresh?: boolean) => Promise<PaginatedResponse<TravelerLikedTour>>;
    fetchSharedTours: (travelerId: string, page: number, limit: number, forceRefresh?: boolean) => Promise<PaginatedResponse<TravelerSharedTour>>;
    fetchViewedTours: (travelerId: string, page: number, limit: number, forceRefresh?: boolean) => Promise<PaginatedResponse<TravelerViewedTour>>;
    fetchViewedArticles: (travelerId: string, page: number, limit: number, forceRefresh?: boolean) => Promise<PaginatedResponse<TravelerViewedArticle>>;
    fetchCancellations: (travelerId: string, page: number, limit: number, forceRefresh?: boolean) => Promise<PaginatedResponse<TravelerCancellation>>;

    suspendTraveler: (id: string, reason: string, durationDays?: number) => Promise<TravelerDetail>;
    unsuspendTraveler: (id: string) => Promise<TravelerDetail>;
    lockTraveler: (id: string, reason?: string) => Promise<TravelerDetail>;
    unlockTraveler: (id: string) => Promise<TravelerDetail>;

    clearTravelerListCache: () => void;
    clearTravelerDetailCache: (id?: string) => void;
    clearTabCache: (travelerId?: string, tabName?: TravelerTabName) => void;
    clearAllCache: () => void;

    setLoading: (key: string, isLoading: boolean) => void;
    setError: (key: string, error?: string) => void;
}

export type TravelerStore = TravelerStoreState & TravelerStoreActions;

// ----------------------------------------------------------------------
// Store Factory
// ----------------------------------------------------------------------
const TravelerStore = () => {
    return create<TravelerStore>()(
        devtools(
            immer((set, get) => ({
                // Initial state
                travelerListCache: new Map(),
                travelerDetailCache: new Map(),
                tabCache: new Map(),
                loading: { list: false, detail: false },
                errors: {},

                // ------------------------------------------------------------------
                // Core fetch with caching and axios
                // ------------------------------------------------------------------
                fetchTravelers: async (filters, forceRefresh = false) => {
                    const cacheKey = JSON.stringify(filters);
                    const cached = get().travelerListCache.get(cacheKey);
                    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
                        return cached.data;
                    }

                    get().setLoading('list', true);
                    get().setError('list', undefined);

                    try {
                        const response = await api.get<ApiResponse<TravelerListResponse>>(
                            API.TRAVELERS,
                            { params: filters }
                        );
                        const data = response.data.data!;
                        set((state) => {
                            state.travelerListCache.set(cacheKey, { data, timestamp: Date.now() });
                        });
                        return data;
                    } catch (error) {
                        const message = extractErrorMessage(error);
                        get().setError('list', message);
                        throw error;
                    } finally {
                        get().setLoading('list', false);
                    }
                },

                fetchTravelerById: async (id, forceRefresh = false) => {
                    const cached = get().travelerDetailCache.get(id);
                    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
                        return cached.data;
                    }

                    get().setLoading('detail', true);
                    get().setError('detail', undefined);

                    try {
                        const response = await api.get<ApiResponse<TravelerDetail>>(API.TRAVELER_BY_ID(id));
                        const data = response.data.data!;
                        set((state) => {
                            state.travelerDetailCache.set(id, { data, timestamp: Date.now() });
                        });
                        return data;
                    } catch (error) {
                        const message = extractErrorMessage(error);
                        get().setError('detail', message);
                        throw error;
                    } finally {
                        get().setLoading('detail', false);
                    }
                },

                fetchTabData: async <K extends keyof TravelerTabMap>(
                    travelerId: string,
                    tabName: K,
                    page: number,
                    limit: number,
                    url: string,
                    forceRefresh = false
                ): Promise<PaginatedResponse<TravelerTabMap[K]>> => {

                    const cacheKey = `${travelerId}:${tabName}:${page}:${limit}`;

                    const cached = get().tabCache.get(cacheKey);

                    if (
                        !forceRefresh &&
                        cached &&
                        Date.now() - cached.timestamp < CACHE_TTL
                    ) {
                        return cached.data as PaginatedResponse<TravelerTabMap[K]>;
                    }

                    const loadingKey = `tab:${travelerId}:${tabName}`;

                    get().setLoading(loadingKey, true);
                    get().setError(loadingKey, undefined);

                    try {
                        const response = await api.get<
                            ApiResponse<PaginatedResponse<TravelerTabMap[K]>>
                        >(url, {
                            params: { page, limit },
                        });

                        const data = response.data.data!;

                        set((state) => {
                            state.tabCache.set(cacheKey, {
                                data,
                                timestamp: Date.now(),
                            });
                        });

                        return data;
                    } catch (error) {
                        const message = extractErrorMessage(error);
                        get().setError(loadingKey, message);
                        throw error;
                    } finally {
                        get().setLoading(loadingKey, false);
                    }
                },

                // Convenience tab methods
                fetchBookings: (travelerId, page, limit, forceRefresh) =>
                    get().fetchTabData(
                        travelerId,
                        'bookings',
                        page,
                        limit,
                        API.TRAVELER_BOOKINGS(travelerId),
                        forceRefresh
                    ),

                fetchReviews: (travelerId, page, limit, forceRefresh) =>
                    get().fetchTabData(
                        travelerId,
                        'reviews',
                        page,
                        limit,
                        API.TRAVELER_REVIEWS(travelerId),
                        forceRefresh
                    ),

                fetchReports: (travelerId, page, limit, forceRefresh) =>
                    get().fetchTabData(
                        travelerId,
                        'reports',
                        page,
                        limit,
                        API.TRAVELER_REPORTS(travelerId),
                        forceRefresh
                    ),

                fetchFAQs: (travelerId, page, limit, forceRefresh) =>
                    get().fetchTabData(
                        travelerId,
                        'faqs',
                        page,
                        limit,
                        API.TRAVELER_FAQS(travelerId),
                        forceRefresh
                    ),

                fetchLikedTours: (travelerId, page, limit, forceRefresh) =>
                    get().fetchTabData(
                        travelerId,
                        'likedTours',
                        page,
                        limit,
                        API.TRAVELER_LIKED_TOURS(travelerId),
                        forceRefresh
                    ),

                fetchSharedTours: (travelerId, page, limit, forceRefresh) =>
                    get().fetchTabData(
                        travelerId,
                        'sharedTours',
                        page,
                        limit,
                        API.TRAVELER_SHARED_TOURS(travelerId),
                        forceRefresh
                    ),

                fetchViewedTours: (travelerId, page, limit, forceRefresh) =>
                    get().fetchTabData(
                        travelerId,
                        'viewedTours',
                        page,
                        limit,
                        API.TRAVELER_VIEWED_TOURS(travelerId),
                        forceRefresh
                    ),

                fetchViewedArticles: (travelerId, page, limit, forceRefresh) =>
                    get().fetchTabData(
                        travelerId,
                        'viewedArticles',
                        page,
                        limit,
                        API.TRAVELER_VIEWED_ARTICLES(travelerId),
                        forceRefresh
                    ),

                fetchCancellations: (travelerId, page, limit, forceRefresh) =>
                    get().fetchTabData(
                        travelerId,
                        'cancellations',
                        page,
                        limit,
                        API.TRAVELER_CANCELLATIONS(travelerId),
                        forceRefresh
                    ),

                // ------------------------------------------------------------------
                // Actions with cache invalidation
                // ------------------------------------------------------------------
                suspendTraveler: async (id, reason, durationDays) => {
                    get().setLoading(`action:${id}`, true);
                    get().setError(`action:${id}`, undefined);
                    try {
                        const response = await api.post<ApiResponse<TravelerDetail>>(
                            API.TRAVELER_SUSPEND(id),
                            { reason, durationDays }
                        );
                        const updated = response.data.data!;
                        set((state) => {
                            state.travelerDetailCache.set(id, { data: updated, timestamp: Date.now() });
                            state.travelerListCache.clear();
                            for (const key of state.tabCache.keys()) {
                                if (key.startsWith(`${id}:`)) {
                                    state.tabCache.delete(key);
                                }
                            }
                        });
                        return updated;
                    } catch (error) {
                        const message = extractErrorMessage(error);
                        get().setError(`action:${id}`, message);
                        throw error;
                    } finally {
                        get().setLoading(`action:${id}`, false);
                    }
                },

                unsuspendTraveler: async (id) => {
                    get().setLoading(`action:${id}`, true);
                    get().setError(`action:${id}`, undefined);
                    try {
                        const response = await api.post<ApiResponse<TravelerDetail>>(API.TRAVELER_UNSUSPEND(id));
                        const updated = response.data.data!;
                        set((state) => {
                            state.travelerDetailCache.set(id, { data: updated, timestamp: Date.now() });
                            state.travelerListCache.clear();
                            for (const key of state.tabCache.keys()) {
                                if (key.startsWith(`${id}:`)) {
                                    state.tabCache.delete(key);
                                }
                            }
                        });
                        return updated;
                    } catch (error) {
                        const message = extractErrorMessage(error);
                        get().setError(`action:${id}`, message);
                        throw error;
                    } finally {
                        get().setLoading(`action:${id}`, false);
                    }
                },

                lockTraveler: async (id, reason) => {
                    get().setLoading(`action:${id}`, true);
                    get().setError(`action:${id}`, undefined);
                    try {
                        const response = await api.post<ApiResponse<TravelerDetail>>(
                            API.TRAVELER_LOCK(id),
                            { reason }
                        );
                        const updated = response.data.data!;
                        set((state) => {
                            state.travelerDetailCache.set(id, { data: updated, timestamp: Date.now() });
                            state.travelerListCache.clear();
                            for (const key of state.tabCache.keys()) {
                                if (key.startsWith(`${id}:`)) {
                                    state.tabCache.delete(key);
                                }
                            }
                        });
                        return updated;
                    } catch (error) {
                        const message = extractErrorMessage(error);
                        get().setError(`action:${id}`, message);
                        throw error;
                    } finally {
                        get().setLoading(`action:${id}`, false);
                    }
                },

                unlockTraveler: async (id) => {
                    get().setLoading(`action:${id}`, true);
                    get().setError(`action:${id}`, undefined);
                    try {
                        const response = await api.post<ApiResponse<TravelerDetail>>(API.TRAVELER_UNLOCK(id));
                        const updated = response.data.data!;
                        set((state) => {
                            state.travelerDetailCache.set(id, { data: updated, timestamp: Date.now() });
                            state.travelerListCache.clear();
                            for (const key of state.tabCache.keys()) {
                                if (key.startsWith(`${id}:`)) {
                                    state.tabCache.delete(key);
                                }
                            }
                        });
                        return updated;
                    } catch (error) {
                        const message = extractErrorMessage(error);
                        get().setError(`action:${id}`, message);
                        throw error;
                    } finally {
                        get().setLoading(`action:${id}`, false);
                    }
                },

                // ------------------------------------------------------------------
                // Cache management
                // ------------------------------------------------------------------
                clearTravelerListCache: () => {
                    set((state) => { state.travelerListCache.clear(); });
                },
                clearTravelerDetailCache: (id) => {
                    set((state) => {
                        if (id) state.travelerDetailCache.delete(id);
                        else state.travelerDetailCache.clear();
                    });
                },
                clearTabCache: (travelerId, tabName) => {
                    set((state) => {
                        if (travelerId && tabName) {
                            const prefix = `${travelerId}:${tabName}:`;
                            for (const key of state.tabCache.keys()) {
                                if (key.startsWith(prefix)) state.tabCache.delete(key);
                            }
                        } else if (travelerId) {
                            for (const key of state.tabCache.keys()) {
                                if (key.startsWith(`${travelerId}:`)) state.tabCache.delete(key);
                            }
                        } else {
                            state.tabCache.clear();
                        }
                    });
                },
                clearAllCache: () => {
                    set((state) => {
                        state.travelerListCache.clear();
                        state.travelerDetailCache.clear();
                        state.tabCache.clear();
                    });
                },

                // ------------------------------------------------------------------
                // Loading/error helpers
                // ------------------------------------------------------------------
                setLoading: (key, isLoading) => {
                    set((state) => { state.loading[key] = isLoading; });
                },
                setError: (key, error) => {
                    set((state) => {
                        if (error === undefined) delete state.errors[key];
                        else state.errors[key] = error;
                    });
                },
            })),
            { name: 'TravelerStore' }
        )
    );
};

export const useTravelerStore = TravelerStore();