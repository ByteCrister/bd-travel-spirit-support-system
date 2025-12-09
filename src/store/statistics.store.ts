// src/stores/statistics.store.tsx
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";

import {
    PresetEnum,
    Preset,
    SectionKeyEnum,
    SectionKey,
    StatisticsState,
    DateRange,
    SectionResponse,
} from "@/types/statistics.types";

const URL_AFTER_API = "/mock/statistics";

/* Combined store type: state + actions */
type StatisticsStore = StatisticsState & {
    setDateRange: (from: Date | null, to: Date | null) => void;
    setPreset: (preset: Preset) => void;
    refreshAll: (opts?: { force?: boolean }) => Promise<void>;
    refreshSection: (
        sectionKey: SectionKey,
        opts?: { force?: boolean }
    ) => Promise<void>;
    clearError: (sectionKey: SectionKey) => void;
    // helpers exposed for testing/debugging
    invalidateCache: (sectionKey?: SectionKey) => void;
};

const initialState: StatisticsState = {
    filters: {
        dateRange: { from: null, to: null },
        preset: PresetEnum.LAST_30,
    },
    loading: {
        [SectionKeyEnum.KPIS]: false,
        [SectionKeyEnum.USERS]: false,
        [SectionKeyEnum.TOURS]: false,
        [SectionKeyEnum.REVIEWS]: false,
        [SectionKeyEnum.REPORTS]: false,
        [SectionKeyEnum.IMAGES]: false,
        [SectionKeyEnum.NOTIFICATIONS]: false,
        [SectionKeyEnum.CHAT]: false,
        [SectionKeyEnum.EMPLOYEES]: false,
    },
    error: {
        [SectionKeyEnum.KPIS]: null,
        [SectionKeyEnum.USERS]: null,
        [SectionKeyEnum.TOURS]: null,
        [SectionKeyEnum.REVIEWS]: null,
        [SectionKeyEnum.REPORTS]: null,
        [SectionKeyEnum.IMAGES]: null,
        [SectionKeyEnum.NOTIFICATIONS]: null,
        [SectionKeyEnum.CHAT]: null,
        [SectionKeyEnum.EMPLOYEES]: null,
    },
    data: {
        [SectionKeyEnum.KPIS]: null,
        [SectionKeyEnum.USERS]: null,
        [SectionKeyEnum.TOURS]: null,
        [SectionKeyEnum.REVIEWS]: null,
        [SectionKeyEnum.REPORTS]: null,
        [SectionKeyEnum.IMAGES]: null,
        [SectionKeyEnum.NOTIFICATIONS]: null,
        [SectionKeyEnum.CHAT]: null,
        [SectionKeyEnum.EMPLOYEES]: null,
    },
};

type CacheEntry<T = unknown> = {
    value: T;
    fetchedAt: number;
    ttlMs: number;
};

const DEFAULT_TTL_MS = 1000 * 60 * 2; // 2 minutes default
const SECTION_TTL: Partial<Record<SectionKey, number>> = {
    [SectionKeyEnum.KPIS]: 1000 * 30, // kpis change frequently; 30s
    [SectionKeyEnum.USERS]: 1000 * 60 * 2, // 2m
    [SectionKeyEnum.TOURS]: 1000 * 60 * 3, // 3m
    [SectionKeyEnum.REVIEWS]: 1000 * 60 * 3,
    [SectionKeyEnum.REPORTS]: 1000 * 60 * 5,
    [SectionKeyEnum.IMAGES]: 1000 * 60 * 5,
    [SectionKeyEnum.NOTIFICATIONS]: 1000 * 30,
    [SectionKeyEnum.CHAT]: 1000 * 15, // chat might update very frequently
    [SectionKeyEnum.EMPLOYEES]: 1000 * 60 * 5,
};

const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();

function cacheKey(section: SectionKey, range: DateRange) {
    const from = range.from ? range.from.toISOString() : "";
    const to = range.to ? range.to.toISOString() : "";
    return `${section}:${from}:${to}`;
}

async function fetchSectionFromApi<T extends SectionResponse>(
    path: string,
    range: DateRange
): Promise<T> {
    const params: Record<string, string | undefined> = {};
    if (range.from) params.from = range.from.toISOString();
    if (range.to) params.to = range.to.toISOString();
    const resp = await api.get<T>(`${URL_AFTER_API}/${path}`, { params });
    return resp.data;
}

// canonicalize to start-of-day and end-of-day to increase cache reuse
function canonicalRange(range: DateRange): DateRange {
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;
    if (from) {
        from.setUTCHours(0, 0, 0, 0);
    }
    if (to) {
        to.setUTCHours(23, 59, 59, 999);
    }
    return { from, to };
}

async function getCachedOrFetch<T extends SectionResponse>(
    section: SectionKey,
    range: DateRange,
    opts?: { force?: boolean }
): Promise<T> {
    const canonical = canonicalRange(range);
    const key = cacheKey(section, canonical);
    const now = Date.now();
    const ttlMs = SECTION_TTL[section] ?? DEFAULT_TTL_MS;
    const entry = cache.get(key) as CacheEntry<T> | undefined;

    // if there is a pending request for this key, reuse it
    const pending = pendingRequests.get(key) as Promise<T> | undefined;
    if (pending) {
        return pending;
    }

    // If not forcing and cached exists
    if (!opts?.force && entry) {
        const isFresh = now - entry.fetchedAt < entry.ttlMs;
        if (isFresh) {
            // fresh cache -> return immediately
            return entry.value;
        }
        // stale cache -> return value (stale) and trigger background refresh
        // while returning the stale value to the caller quickly
        // but we still dedupe background refresh
        const background = (async () => {
            try {
                const fresh = await fetchSectionFromApi<T>(section, range);
                cache.set(key, { value: fresh, fetchedAt: Date.now(), ttlMs });
            } catch {
                // ignore background fetch errors (keep stale until next explicit refresh)
            } finally {
                pendingRequests.delete(key);
            }
        })();
        pendingRequests.set(key, background as unknown as Promise<unknown>);
        return entry.value;
    }

    // No cache or force -> perform fetch (and dedupe)
    const promise = (async () => {
        try {
            const res = await fetchSectionFromApi<T>(section, range);
            cache.set(key, { value: res, fetchedAt: Date.now(), ttlMs });
            return res;
        } finally {
            pendingRequests.delete(key);
        }
    })();

    pendingRequests.set(key, promise as unknown as Promise<unknown>);
    return promise;
}

/* Public store implementation */
export const useStatisticsStore = create<StatisticsStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setDateRange: (from: Date | null, to: Date | null) => {
                set((state) => ({
                    filters: {
                        ...state.filters,
                        dateRange: { from, to },
                        preset: PresetEnum.CUSTOM,
                    },
                }));
            },

            setPreset: (preset: Preset) => {
                const now = new Date();
                let from: Date | null = null;
                const to: Date = now;

                switch (preset) {
                    case PresetEnum.LAST_7:
                        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case PresetEnum.LAST_30:
                        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case PresetEnum.YTD:
                        from = new Date(now.getFullYear(), 0, 1);
                        break;
                    case PresetEnum.CUSTOM:
                        // custom is set via setDateRange
                        return;
                }

                set((state) => ({
                    filters: { ...state.filters, dateRange: { from, to }, preset },
                }));

                // fire-and-forget refresh all but use cached where possible
                get().refreshAll();
            },

            refreshAll: async (opts?: { force?: boolean }) => {
                const { filters } = get();
                const sections: SectionKey[] = [
                    SectionKeyEnum.KPIS,
                    SectionKeyEnum.USERS,
                    SectionKeyEnum.TOURS,
                    SectionKeyEnum.REVIEWS,
                    SectionKeyEnum.REPORTS,
                    SectionKeyEnum.IMAGES,
                    SectionKeyEnum.NOTIFICATIONS,
                    SectionKeyEnum.CHAT,
                    SectionKeyEnum.EMPLOYEES,
                ];

                // mark all loading (but keep other flags intact)
                set((state) => ({
                    loading: sections.reduce(
                        (acc, key) => ({ ...acc, [key]: true }),
                        state.loading
                    ),
                }));

                const promises = sections.map(async (sectionKey) => {
                    try {
                        const data = await getCachedOrFetch<SectionResponse>(
                            sectionKey,
                            filters.dateRange,
                            {
                                force: opts?.force,
                            }
                        );

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

            refreshSection: async (
                sectionKey: SectionKey,
                opts?: { force?: boolean }
            ) => {
                const { filters } = get();

                set((state) => ({
                    loading: { ...state.loading, [sectionKey]: true },
                    error: { ...state.error, [sectionKey]: null },
                }));

                try {
                    const data = await getCachedOrFetch<SectionResponse>(
                        sectionKey,
                        filters.dateRange,
                        {
                            force: opts?.force,
                        }
                    );

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
            },

            clearError: (sectionKey: SectionKey) => {
                set((state) => ({
                    error: { ...state.error, [sectionKey]: null },
                }));
            },

            // debug / control helpers
            invalidateCache: (sectionKey?: SectionKey) => {
                if (sectionKey) {
                    // remove all keys that start with sectionKey
                    for (const key of Array.from(cache.keys())) {
                        if (key.startsWith(`${sectionKey}:`)) cache.delete(key);
                    }
                } else {
                    cache.clear();
                }
            },
        }),
        {
            name: "statistics.store",
            partialize: (state) => ({
                filters: {
                    preset: state.filters.preset,
                    ...(state.filters.preset === PresetEnum.CUSTOM && {
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
