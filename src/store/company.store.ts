// stores/company.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
    CompanyQueryParams,
    CompanyRowDTO,
    CompanyListResponseDTO,
    CompanyDashboardStatsDTO,
    CompanySortBy,
    SortDir,
} from "@/types/company.types";

import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";

const URL_AFTER_API = "/mock/users/companies";

export function makeKey(params: Required<CompanyQueryParams>): string {
    const { search, sortBy, sortDir, page, limit } = params;
    return `search=${encodeURIComponent(search)}|sortBy=${sortBy}|sortDir=${sortDir}|page=${page}|limit=${limit}`;
}

function makeQueryGroupKey(params: Required<CompanyQueryParams>): string {
    const { search, sortBy, sortDir } = params;
    return `search=${encodeURIComponent(search)}|sortBy=${sortBy}|sortDir=${sortDir}`;
}

/** Default query params used on initial load */
const DEFAULT_PARAMS: Required<CompanyQueryParams> = {
    search: "",
    sortBy: "createdAt",
    sortDir: "desc",
    page: 1,
    limit: 20,
};

/** Cached page entry for a given query */
interface CompanyCacheEntry {
    rows: CompanyRowDTO[]; // rows for this cached page (in order)
    total: number;
    page: number; // 1-based page number used when fetching
    pages: number; // total pages reported by server for that fetch (based on that limit)
    limit: number; // limit used for this cached entry
    fetchedAt: number; // timestamp for TTL checks
    paramsUsed: Required<CompanyQueryParams>; // original params used to produce this entry
}

interface CompanyState {
    params: Required<CompanyQueryParams>; // current query params (persisted)
    cache: Record<string, CompanyCacheEntry>; // cached pages by exact query key
    entities: Record<string, CompanyRowDTO>; // normalized entities by id
    stats?: CompanyDashboardStatsDTO;
    selection: string[];
    loading: boolean;
    error?: string;

    // --- UI actions
    setSearch: (search: string) => void;
    setSort: (sortBy: CompanySortBy, sortDir: SortDir) => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    clearError: () => void;
    clearSelection: () => void;
    toggleSelect: (id: string) => void;

    // --- Data accessors
    getCurrentPage: () => CompanyCacheEntry | null;
    getCompanyById: (id: string) => CompanyRowDTO | undefined;

    // --- Network
    fetchCompanies: (force?: boolean) => Promise<void>;
    refresh: () => Promise<void>;
    invalidateAll: () => void;
}

export const useCompanyStore = create<CompanyState>()(
    persist(
        (set, get) => ({
            // --- Initial state
            params: { ...DEFAULT_PARAMS },
            cache: {},
            entities: {},
            stats: undefined,
            selection: [],
            loading: false,
            error: undefined,

            // --- UI actions
            setSearch: (search) => {
                set((s) => ({
                    params: { ...s.params, search, page: 1 }, // reset to page 1 on new search
                }));
            },

            setSort: (sortBy, sortDir) => {
                set((s) => ({
                    params: { ...s.params, sortBy, sortDir, page: 1 }, // reset to page 1 on new sort
                }));
            },

            setPage: (page) => {
                set((s) => ({
                    params: { ...s.params, page: Math.max(1, page) },
                }));
            },

            setLimit: (limit) => {
                set((s) => ({
                    params: { ...s.params, limit: Math.min(100, Math.max(1, limit)), page: 1 },
                }));
            },

            clearError: () => set({ error: undefined }),
            clearSelection: () => set({ selection: [] }),

            toggleSelect: (id) => {
                set((s) => {
                    const selected = new Set(s.selection);
                    if (selected.has(id)) selected.delete(id);
                    else selected.add(id);
                    return { selection: Array.from(selected) };
                });
            },

            // --- Data accessors
            getCurrentPage: () => {
                const { params, cache } = get();
                const key = makeKey(params);
                return cache[key] ?? null;
            },

            getCompanyById: (id) => get().entities[id],

            // --- Network
            /**
             * fetchCompanies
             * - tries exact cache hit first
             * - tries to reuse a superset cached page (e.g., cached limit bigger than requested)
             * - tries to merge contiguous cached pages (same query-group)
             * - otherwise calls the API and caches the page
             */
            fetchCompanies: async (force = false) => {
                const state = get();
                const params = state.params;
                const key = makeKey(params);
                const cached = state.cache[key];

                // TTL
                const TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 60_000;

                const isFresh = (entry?: CompanyCacheEntry) =>
                    !!entry && Date.now() - entry.fetchedAt < TTL_MS;

                // exact fresh hit -> nothing to do
                if (!force && isFresh(cached)) return;

                // Before calling API, attempt to satisfy request from existing cache entries
                if (!force) {
                    const groupKey = makeQueryGroupKey(params);
                    // Try exact key non-fresh: if present but stale, we might still reuse if we accept stale — we will not use stale entry.
                    // 1) Try superset cached entry: an entry that used a larger limit and whose rows cover requested range
                    const requestedStart = (params.page - 1) * params.limit; // 0-based index
                    const requestedEndExclusive = requestedStart + params.limit;

                    const entries = Object.values(state.cache).filter(
                        (e) =>
                            makeQueryGroupKey(e.paramsUsed) === groupKey &&
                            // must be fresh
                            isFresh(e)
                    );

                    // Helper: compute start index in absolute terms for a cached entry
                    const cachedStart = (e: CompanyCacheEntry) => (e.page - 1) * e.limit;
                    const cachedEndExclusive = (e: CompanyCacheEntry) => cachedStart(e) + e.rows.length;

                    // 1A) Superset: single cached entry that contains all requested rows
                    const superset = entries.find(
                        (e) =>
                            cachedStart(e) <= requestedStart && cachedEndExclusive(e) >= requestedEndExclusive
                    );
                    if (superset) {
                        // slice from superset
                        const sliceStart = requestedStart - cachedStart(superset);
                        const slice = superset.rows.slice(sliceStart, sliceStart + params.limit);

                        // normalize back into entities and cache a synthetic entry for the exact key
                        set((s) => {
                            const nextEntities = { ...s.entities };
                            for (const r of slice) {
                                nextEntities[r.id] = r;
                            }
                            const entry: CompanyCacheEntry = {
                                rows: slice.map((r) => ({ ...nextEntities[r.id] })), // clone to avoid mutation
                                total: superset.total,
                                page: params.page,
                                pages: Math.ceil(superset.total / params.limit),
                                limit: params.limit,
                                fetchedAt: Date.now(),
                                paramsUsed: { ...params },
                            };
                            return {
                                entities: nextEntities,
                                cache: { ...s.cache, [key]: entry },
                                stats: s.stats,
                                loading: false,
                                error: undefined,
                            };
                        });
                        return;
                    }

                    // 1B) Merge contiguous pages: attempt to assemble requested range from multiple cached pages in same group
                    // Build a map of absolute index -> row for all cached pages in group that are fresh
                    // Only accept if we can cover requestedStart..requestedEndExclusive entirely with contiguous rows (no gaps)
                    const coverageMap = new Map<number, CompanyRowDTO>();
                    for (const e of entries) {
                        const start = cachedStart(e);
                        for (let i = 0; i < e.rows.length; i++) {
                            coverageMap.set(start + i, e.rows[i]);
                        }
                    }
                    // Check coverage
                    let allCovered = true;
                    const assembled: CompanyRowDTO[] = [];
                    for (let idx = requestedStart; idx < requestedEndExclusive; idx++) {
                        const v = coverageMap.get(idx);
                        if (!v) {
                            allCovered = false;
                            break;
                        }
                        assembled.push(v);
                    }
                    if (allCovered && assembled.length === params.limit) {
                        // save assembled as cached entry for exact key to speed future requests
                        set((s) => {
                            const nextEntities = { ...s.entities };
                            for (const r of assembled) {
                                nextEntities[r.id] = r;
                            }
                            const entry: CompanyCacheEntry = {
                                rows: assembled.map((r) => ({ ...nextEntities[r.id] })),
                                total: entries[0].total, // all entries share same total logically; choose first
                                page: params.page,
                                pages: Math.ceil(entries[0].total / params.limit),
                                limit: params.limit,
                                fetchedAt: Date.now(),
                                paramsUsed: { ...params },
                            };
                            return {
                                entities: nextEntities,
                                cache: { ...s.cache, [key]: entry },
                                stats: s.stats,
                                loading: false,
                                error: undefined,
                            };
                        });
                        return;
                    }
                }

                // If we reached here: no cache could satisfy the requested range, so call API
                set({ loading: true, error: undefined });

                try {
                    const { search, sortBy, sortDir, page, limit } = params;
                    const qs = new URLSearchParams({
                        search,
                        sortBy,
                        sortDir,
                        page: String(page),
                        limit: String(limit),
                    }).toString();

                    const res = await api.get(`${URL_AFTER_API}?${qs}`);
                    const payload = res.data as CompanyListResponseDTO & { stats?: CompanyDashboardStatsDTO };

                    set((s) => {
                        // Normalize entities
                        const nextEntities = { ...s.entities };
                        for (const row of payload.rows) {
                            nextEntities[row.id] = row;
                        }

                        // Cache current page (store limit and paramsUsed)
                        const entry: CompanyCacheEntry = {
                            rows: payload.rows.map((r) => ({ ...nextEntities[r.id] })),
                            total: payload.total,
                            page: payload.page,
                            pages: payload.pages,
                            limit,
                            fetchedAt: Date.now(),
                            paramsUsed: { ...params },
                        };

                        return {
                            entities: nextEntities,
                            cache: { ...s.cache, [key]: entry },
                            stats: payload.stats ?? s.stats,
                            loading: false,
                            error: undefined,
                        };
                    });
                } catch (err) {
                    set({ loading: false, error: extractErrorMessage(err) });
                }
            },

            refresh: async () => {
                await get().fetchCompanies(true); // bypass TTL
            },

            invalidateAll: () => {
                set({ cache: {} });
            },
        }),
        {
            name: "company.store",
            partialize: (state) => ({ params: state.params }), // only persist query params
        }
    )
);
