'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    Preset,
    SectionKey,
    StatisticsState,
} from '@/types/statistics.types';
import {
    fetchChatStats,
    fetchEmployeesStats,
    fetchImagesStats,
    fetchKpis,
    fetchNotificationsStats,
    fetchReportsStats,
    fetchReviewsStats,
    fetchToursStats,
    fetchUsersStats,
} from '@/utils/api/statisticsApi';

/**
 * Combined store type:
 * Includes state and all actions that can update it
 */
type StatisticsStore = StatisticsState & {
    setDateRange: (from: Date | null, to: Date | null) => void;
    setPreset: (preset: Preset) => void;
    refreshAll: () => Promise<void>;
    refreshSection: (sectionKey: SectionKey) => Promise<void>;
    clearError: (sectionKey: SectionKey) => void;
};

/**
 * Default initial state for the store
 */
const initialState: StatisticsState = {
    filters: {
        dateRange: { from: null, to: null },
        preset: 'LAST_30',
    },
    loading: {
        kpis: false,
        users: false,
        tours: false,
        reviews: false,
        reports: false,
        images: false,
        notifications: false,
        chat: false,
        employees: false,
    },
    error: {
        kpis: null,
        users: null,
        tours: null,
        reviews: null,
        reports: null,
        images: null,
        notifications: null,
        chat: null,
        employees: null,
    },
    data: {
        kpis: null,
        users: null,
        tours: null,
        reviews: null,
        reports: null,
        images: null,
        notifications: null,
        chat: null,
        employees: null,
    },
};

/**
 * Main Zustand store
 * - All state, actions, and API calls are inside the store
 * - Persist only the filters (with timestamps for stable storage)
 */
export const useStatisticsStore = create<StatisticsStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            /**
             * Set a custom date range
             */
            setDateRange: (from, to) => {
                set((state) => ({
                    filters: {
                        ...state.filters,
                        dateRange: { from, to },
                        preset: 'CUSTOM',
                    },
                }));
            },

            /**
             * Set a predefined date preset (LAST_7, LAST_30, YTD)
             */
            setPreset: (preset) => {
                const now = new Date();
                let from: Date | null = null;
                const to: Date = now;

                switch (preset) {
                    case 'LAST_7':
                        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'LAST_30':
                        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case 'YTD':
                        from = new Date(now.getFullYear(), 0, 1);
                        break;
                    case 'CUSTOM':
                        return; // Do not change existing dateRange
                }

                set((state) => ({
                    filters: { ...state.filters, dateRange: { from, to }, preset },
                }));
                // Automatically refresh all data when preset changes
                get().refreshAll();
            },

            /**
             * Refresh all sections concurrently
             */
            refreshAll: async () => {
                const { filters } = get();
                const sections: SectionKey[] = [
                    'kpis', 'users', 'tours', 'reviews', 'reports',
                    'images', 'notifications', 'chat', 'employees',
                ];

                // Set loading = true for all
                set((state) => ({
                    loading: sections.reduce((acc, key) => ({ ...acc, [key]: true }), state.loading),
                }));

                const promises = sections.map(async (sectionKey) => {
                    try {
                        let data;
                        switch (sectionKey) {
                            case 'kpis': data = await fetchKpis(filters.dateRange); break;
                            case 'users': data = await fetchUsersStats(filters.dateRange); break;
                            case 'tours': data = await fetchToursStats(filters.dateRange); break;
                            case 'reviews': data = await fetchReviewsStats(filters.dateRange); break;
                            case 'reports': data = await fetchReportsStats(filters.dateRange); break;
                            case 'images': data = await fetchImagesStats(filters.dateRange); break;
                            case 'notifications': data = await fetchNotificationsStats(filters.dateRange); break;
                            case 'chat': data = await fetchChatStats(filters.dateRange); break;
                            case 'employees': data = await fetchEmployeesStats(filters.dateRange); break;
                        }

                        set((state) => ({
                            data: { ...state.data, [sectionKey]: data },
                            loading: { ...state.loading, [sectionKey]: false },
                            error: { ...state.error, [sectionKey]: null },
                        }));
                    } catch (error) {
                        set((state) => ({
                            loading: { ...state.loading, [sectionKey]: false },
                            error: { ...state.error, [sectionKey]: (error as Error).message },
                        }));
                    }
                });

                await Promise.allSettled(promises);
            },

            /**
             * Refresh a single section
             */
            refreshSection: async (sectionKey) => {
                const { filters } = get();

                set((state) => ({
                    loading: { ...state.loading, [sectionKey]: true },
                    error: { ...state.error, [sectionKey]: null },
                }));

                try {
                    let data;
                    switch (sectionKey) {
                        case 'kpis': data = await fetchKpis(filters.dateRange); break;
                        case 'users': data = await fetchUsersStats(filters.dateRange); break;
                        case 'tours': data = await fetchToursStats(filters.dateRange); break;
                        case 'reviews': data = await fetchReviewsStats(filters.dateRange); break;
                        case 'reports': data = await fetchReportsStats(filters.dateRange); break;
                        case 'images': data = await fetchImagesStats(filters.dateRange); break;
                        case 'notifications': data = await fetchNotificationsStats(filters.dateRange); break;
                        case 'chat': data = await fetchChatStats(filters.dateRange); break;
                        case 'employees': data = await fetchEmployeesStats(filters.dateRange); break;
                    }

                    set((state) => ({
                        data: { ...state.data, [sectionKey]: data },
                        loading: { ...state.loading, [sectionKey]: false },
                    }));
                } catch (error) {
                    set((state) => ({
                        loading: { ...state.loading, [sectionKey]: false },
                        error: { ...state.error, [sectionKey]: (error as Error).message },
                    }));
                }
            },

            /**
             * Clear error for a specific section
             */
            clearError: (sectionKey) => {
                set((state) => ({
                    error: { ...state.error, [sectionKey]: null },
                }));
            },
        }),
        // Persist configuration
        {
            name: "statistics-store",
            partialize: (state) => ({
                filters: {
                    preset: state.filters.preset,
                    ...(state.filters.preset === 'CUSTOM' && {
                        dateRange: state.filters.dateRange,
                    }),
                },
            }),
            onRehydrateStorage: () => (state) => {
                // Ensure dateRange always exists
                if (!state?.filters?.dateRange) {
                    state!.filters.dateRange = { from: null, to: null };
                }
                if (state?.filters?.dateRange?.from) {
                    state.filters.dateRange.from = new Date(state.filters.dateRange.from);
                }
                if (state?.filters?.dateRange?.to) {
                    state.filters.dateRange.to = new Date(state.filters.dateRange.to);
                }
            },
        }
    )
);
