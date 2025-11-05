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

const ROOT_DIR = "/mock/users/companies";

/**
 * Build a stable cache key string from query params.
 * Ensures identical queries always map to the same cache entry.
 */
function makeKey(params: Required<CompanyQueryParams>): string {
    const { search, sortBy, sortDir, page, limit } = params;
    return `search=${encodeURIComponent(search)}|sortBy=${sortBy}|sortDir=${sortDir}|page=${page}|limit=${limit}`;
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
    rows: CompanyRowDTO[];
    total: number;
    page: number;
    pages: number;
    fetchedAt: number; // timestamp for TTL checks
}

/** Zustand store shape */
interface CompanyState {
    // --- State
    params: Required<CompanyQueryParams>; // current query params (persisted)
    cache: Record<string, CompanyCacheEntry>; // cached pages by query key
    entities: Record<string, CompanyRowDTO>; // normalized entities by id
    stats?: CompanyDashboardStatsDTO; // optional dashboard stats
    selection: string[]; // selected row ids
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

/**
 * Company store with:
 * - Query param persistence (via localStorage)
 * - Page-level caching with TTL
 * - Normalized entity storage
 */
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
            fetchCompanies: async (force = false) => {
                const state = get();
                const key = makeKey(state.params);
                const cached = state.cache[key];

                // Cache policy: 60s TTL unless force refresh
                const TTL_MS = Number(process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL) ?? 60_000;
                const isFresh = cached && Date.now() - cached.fetchedAt < TTL_MS;

                if (isFresh && !force) return;

                set({ loading: true, error: undefined });

                try {
                    // Build query string
                    const { search, sortBy, sortDir, page, limit } = state.params;
                    const qs = new URLSearchParams({
                        search,
                        sortBy,
                        sortDir,
                        page: String(page),
                        limit: String(limit),
                    }).toString();

                    const res = await api.get(`${ROOT_DIR}?${qs}`);
                    const payload = res.data as CompanyListResponseDTO & { stats?: CompanyDashboardStatsDTO };

                    set((s) => {
                        // Normalize entities
                        const nextEntities = { ...s.entities };
                        for (const row of payload.rows) {
                            nextEntities[row.id] = row;
                        }

                        // Cache current page
                        const entry: CompanyCacheEntry = {
                            rows: payload.rows.map((r) => ({ ...nextEntities[r.id] })),
                            total: payload.total,
                            page: payload.page,
                            pages: payload.pages,
                            fetchedAt: Date.now(),
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
                set({ cache: {} }); // clear all cached pages
            },
        }),
        {
            name: "company-store", // localStorage key
            partialize: (state) => ({ params: state.params }), // only persist query params
        }
    )
);
