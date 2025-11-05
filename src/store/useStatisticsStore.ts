'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    Preset,
    SectionKey,
    StatisticsState,
    DateRange,
    KpiMetrics,
    UsersStats,
    ToursStats,
    ReviewsStats,
    ReportsStats,
    ImagesStats,
    NotificationsStats,
    ChatStats,
    EmployeesStats,
} from '@/types/statistics.types';
import api from '@/utils/api/axios';
import { extractErrorMessage } from '@/utils/api/extractErrorMessage';

const URL_AFTER_API = "/mock/statistics";

/**
 * Combined store type: state + actions
 */
type StatisticsStore = StatisticsState & {
    setDateRange: (from: Date | null, to: Date | null) => void;
    setPreset: (preset: Preset) => void;
    refreshAll: () => Promise<void>;
    refreshSection: (sectionKey: SectionKey) => Promise<void>;
    clearError: (sectionKey: SectionKey) => void;
};

type SectionResponse =
    | KpiMetrics
    | UsersStats
    | ToursStats
    | ReviewsStats
    | ReportsStats
    | ImagesStats
    | NotificationsStats
    | ChatStats
    | EmployeesStats;

/* Default initial state */
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

/* Helper: call the backend endpoints that follow the Next.js App Router API shape.
   These endpoints are expected to be available under `${NEXT_PUBLIC_DOMAIN}/api/statistics/*`
   Example routes used below:
     GET /api/statistics/kpis?from=...&to=...
     GET /api/statistics/users?from=...&to=...
   Each handler returns a JSON payload matching the corresponding TypeScript shape.
*/
async function fetchSection<T extends SectionResponse>(path: string, range: DateRange): Promise<T> {
    const params: Record<string, string | undefined> = {};
    if (range.from) params.from = range.from.toISOString();
    if (range.to) params.to = range.to.toISOString();

    const resp = await api.get<T>(`${URL_AFTER_API}/${path}`, { params });
    return resp.data;
}

export const useStatisticsStore = create<StatisticsStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setDateRange: (from: Date | null, to: Date | null) => {
                set((state) => ({
                    filters: {
                        ...state.filters,
                        dateRange: { from, to },
                        preset: 'CUSTOM',
                    },
                }));
            },

            setPreset: (preset: Preset) => {
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
                        return;
                }

                set((state) => ({
                    filters: { ...state.filters, dateRange: { from, to }, preset },
                }));

                // fire-and-forget refresh all (keeps UI responsive)
                get().refreshAll();
            },

            refreshAll: async () => {
                const { filters } = get();
                const sections: SectionKey[] = [
                    'kpis',
                    'users',
                    'tours',
                    'reviews',
                    'reports',
                    'images',
                    'notifications',
                    'chat',
                    'employees',
                ];

                // mark all loading
                set((state) => ({
                    loading: sections.reduce(
                        (acc, key) => ({ ...acc, [key]: true }),
                        state.loading
                    ),
                }));

                const promises = sections.map(async (sectionKey) => {
                    try {
                        let data:
                            | KpiMetrics
                            | UsersStats
                            | ToursStats
                            | ReviewsStats
                            | ReportsStats
                            | ImagesStats
                            | NotificationsStats
                            | ChatStats
                            | EmployeesStats
                            | null = null;

                        switch (sectionKey) {
                            case 'kpis':
                                data = await fetchSection<KpiMetrics>('kpis', filters.dateRange);
                                break;
                            case 'users':
                                data = await fetchSection<UsersStats>('users', filters.dateRange);
                                break;
                            case 'tours':
                                data = await fetchSection<ToursStats>('tours', filters.dateRange);
                                break;
                            case 'reviews':
                                data = await fetchSection<ReviewsStats>('reviews', filters.dateRange);
                                break;
                            case 'reports':
                                data = await fetchSection<ReportsStats>('reports', filters.dateRange);
                                break;
                            case 'images':
                                data = await fetchSection<ImagesStats>('images', filters.dateRange);
                                break;
                            case 'notifications':
                                data = await fetchSection<NotificationsStats>('notifications', filters.dateRange);
                                break;
                            case 'chat':
                                data = await fetchSection<ChatStats>('chat', filters.dateRange);
                                break;
                            case 'employees':
                                data = await fetchSection<EmployeesStats>('employees', filters.dateRange);
                                break;
                        }

                        set((state) => ({
                            data: { ...state.data, [sectionKey]: data },
                            loading: { ...state.loading, [sectionKey]: false },
                            error: { ...state.error, [sectionKey]: null },
                        }));
                    } catch (err) {
                        const message = extractErrorMessage(err);
                        set((state) => ({
                            loading: { ...state.loading, [sectionKey]: false },
                            error: { ...state.error, [sectionKey]: message },
                        }));
                    }
                });

                await Promise.allSettled(promises);
            },

            refreshSection: async (sectionKey: SectionKey) => {
                const { filters } = get();

                set((state) => ({
                    loading: { ...state.loading, [sectionKey]: true },
                    error: { ...state.error, [sectionKey]: null },
                }));

                try {
                    let data:
                        | KpiMetrics
                        | UsersStats
                        | ToursStats
                        | ReviewsStats
                        | ReportsStats
                        | ImagesStats
                        | NotificationsStats
                        | ChatStats
                        | EmployeesStats
                        | null = null;

                    switch (sectionKey) {
                        case 'kpis':
                            data = await fetchSection<KpiMetrics>('kpis', filters.dateRange);
                            break;
                        case 'users':
                            data = await fetchSection<UsersStats>('users', filters.dateRange);
                            break;
                        case 'tours':
                            data = await fetchSection<ToursStats>('tours', filters.dateRange);
                            break;
                        case 'reviews':
                            data = await fetchSection<ReviewsStats>('reviews', filters.dateRange);
                            break;
                        case 'reports':
                            data = await fetchSection<ReportsStats>('reports', filters.dateRange);
                            break;
                        case 'images':
                            data = await fetchSection<ImagesStats>('images', filters.dateRange);
                            break;
                        case 'notifications':
                            data = await fetchSection<NotificationsStats>('notifications', filters.dateRange);
                            break;
                        case 'chat':
                            data = await fetchSection<ChatStats>('chat', filters.dateRange);
                            break;
                        case 'employees':
                            data = await fetchSection<EmployeesStats>('employees', filters.dateRange);
                            break;
                    }

                    set((state) => ({
                        data: { ...state.data, [sectionKey]: data },
                        loading: { ...state.loading, [sectionKey]: false },
                    }));
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set((state) => ({
                        loading: { ...state.loading, [sectionKey]: false },
                        error: { ...state.error, [sectionKey]: message },
                    }));
                }
            },

            clearError: (sectionKey: SectionKey) => {
                set((state) => ({
                    error: { ...state.error, [sectionKey]: null },
                }));
            },
        }),
        {
            name: 'statistics-store',
            partialize: (state) => ({
                filters: {
                    preset: state.filters.preset,
                    ...(state.filters.preset === 'CUSTOM' && {
                        dateRange: state.filters.dateRange,
                    }),
                },
            }),
            onRehydrateStorage: () => (state) => {
                // Ensure dateRange always exists and rehydrate Date objects
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
