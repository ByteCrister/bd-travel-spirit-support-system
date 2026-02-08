'use client';

import { ACCOUNT_STATUS, USER_ROLE } from "@/constants/user.const";
import { UserSortableField, UserTableRow } from "@/types/user/user.table.types";
import { Suspension, User } from "@/types/user/user.types";
import api from "@/utils/axios";
import axios from "axios";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const URL_AFTER_API = "/mock/users/travelers";

/* Types you already had */
export interface UsersApiResponse {
    data: UserTableRow[];
    total: number;
    page: number;
    perPage: number;
}

export interface UsersQuery {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: UserSortableField;
    sortDir?: "asc" | "desc";
    roles?: string | USER_ROLE;
    accountStatus?: string | ACCOUNT_STATUS;
    isVerified?: boolean;
    [key: string]: unknown;
}

/* Cache structures */
interface PageMeta {
    ids: string[]; // ordered ids for this page/perPage
    total: number;
    fetchedAt: number;
    canonicalKey: string; // which canonical filters this page belongs to
}

interface NormalizedCache {
    items: Map<string, UserTableRow>;
    pages: Map<string, PageMeta>; // pageKey => meta
}

/* Public store interface */
interface useTravelerStoreTypes {
    perPage: number;
    setPerPage: (n: number) => void;

    query: UsersQuery;
    setQuery: (q: Partial<UsersQuery>) => void;
    resetQuery: () => void;

    _cache: NormalizedCache;
    cacheTTL: number;
    _lastRequestSeq?: number;

    invalidateCache: (predicate?: (canonicalKey: string) => boolean) => void;
    invalidateItem: (id: string) => void;

    currentPageKey?: string;
    currentData?: UsersApiResponse;
    total?: number;

    loading: boolean;
    actionLoading: boolean;
    userActionLoading: Record<string, boolean>;
    error?: string | null;
    actionError?: string | null;

    fetchUsers: (opts?: { useCache?: boolean; force?: boolean }) => Promise<UsersApiResponse | null>;

    selectedUser?: User | null;
    setSelectedUser: (u?: User | null) => void;

    // FIXED: Changed to UserTableRow to match cache type
    patchUserOptimistic: (id: string, patch: Partial<UserTableRow>) => Promise<UserTableRow | null>;
    verifyUser: (id: string) => Promise<boolean>;
    upgradeToOrganizer: (id: string) => Promise<boolean>;
    resetPassword: (id: string) => Promise<boolean>;
    deleteUser: (id: string) => Promise<boolean>;
    suspendUser: (id: string, fullSuspension: Suspension) => Promise<boolean>;

    _abortController?: AbortController | null;
}

/* Helpers */
const defaultCacheTTL = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 1000 * 60 * 2; // 2 minutes

function shallowCloneQuery(q: UsersQuery) {
    const clone = { ...q };
    Object.keys(clone).forEach((k) => {
        const v = clone[k as keyof UsersQuery];
        if (v === undefined || v === null || (Array.isArray(v) && v.length === 0)) delete clone[k as keyof UsersQuery];
    });
    return clone;
}

// canonical key excludes page & perPage so different page sizes for same filters share items
function makeCanonicalKey(q: UsersQuery) {
    const clone = shallowCloneQuery(q);
    delete clone.page;
    delete clone.perPage;
    return JSON.stringify(clone);
}

// pageKey uses canonicalKey + page + perPage so page metadata is unique
function makePageKey(canonicalKey: string, page: number, perPage: number) {
    return `${canonicalKey}|p=${page}|pp=${perPage}`;
}

/* In-flight dedupe: store promises for (pageKey) */
const inFlightRequests = new Map<string, Promise<UsersApiResponse | null>>();

/* Initialize normalized cache helper */
function createEmptyNormalizedCache(): NormalizedCache {
    return {
        items: new Map<string, UserTableRow>(),
        pages: new Map<string, PageMeta>(),
    };
}

/* Store implementation */
export const useTravelerStore = create<useTravelerStoreTypes>()(
    devtools(
        persist(
            (set, get) => ({
                perPage: 20,
                setPerPage: (n) => {
                    set({ perPage: n, query: { ...get().query, perPage: n, page: 1 } }); // FIXED: Reset to page 1
                    get().fetchUsers({ useCache: false, force: false }).catch(() => { });
                },

                query: { page: 1, perPage: 20 },
                setQuery: (q) => {
                    // FIXED: Add abort logic
                    const state = get();
                    if (state._abortController) {
                        state._abortController.abort();
                    }

                    set((state) => {
                        const nextQuery = { ...state.query, ...q };
                        // FIXED: Reset to page 1 when non-pagination filters change
                        if (q.search !== undefined || q.roles !== undefined || 
                            q.accountStatus !== undefined || q.isVerified !== undefined) {
                            nextQuery.page = 1;
                        }
                        return { query: nextQuery };
                    });
                    
                    Promise.resolve().then(() => {
                        get().fetchUsers({ useCache: false, force: false }).catch(() => { });
                    });
                }, 
                resetQuery: () => {
                    const state = get();
                    if (state._abortController) {
                        state._abortController.abort();
                    }
                    set({ query: { page: 1, perPage: state.perPage } });
                    get().fetchUsers({ useCache: false, force: false }).catch(() => { });
                },

                _cache: createEmptyNormalizedCache(),
                cacheTTL: defaultCacheTTL,
                _lastRequestSeq: 0,

                invalidateCache: (predicate) => {
                    const state = get();
                    const newCache = createEmptyNormalizedCache();

                    if (!predicate) {
                        // clear everything
                        set({ _cache: newCache });
                        return;
                    }

                    // keep pages whose canonicalKey passes predicate === false (i.e., not invalidated)
                    for (const [pageKey, meta] of state._cache.pages.entries()) {
                        if (!predicate(meta.canonicalKey)) {
                            // keep this page and its items
                            newCache.pages.set(pageKey, meta);
                            for (const id of meta.ids) {
                                const item = state._cache.items.get(id);
                                if (item) newCache.items.set(id, item);
                            }
                        }
                    }

                    set({ _cache: newCache });
                },

                invalidateItem: (id) => {
                    const state = get();
                    if (!state._cache.items.has(id)) return;
                    
                    const newItems = new Map(state._cache.items);
                    newItems.delete(id);
                    
                    const newPages = new Map<string, PageMeta>();
                    
                    // Update pages to remove the invalidated item
                    for (const [pageKey, meta] of state._cache.pages.entries()) {
                        const filteredIds = meta.ids.filter((iid) => iid !== id);
                        if (filteredIds.length > 0) {
                            newPages.set(pageKey, { ...meta, ids: filteredIds });
                        }
                        // If page becomes empty, it will be removed
                    }
                    
                    set({ 
                        _cache: { items: newItems, pages: newPages },
                        // Also update currentData if it contains the invalidated item
                        currentData: state.currentData ? {
                            ...state.currentData,
                            data: state.currentData.data.filter(item => item._id !== id)
                        } : undefined
                    });
                },

                currentPageKey: undefined,
                currentData: undefined,
                total: 0,

                loading: false,
                actionLoading: false,
                userActionLoading: {},
                error: null,
                actionError: null,

                // Fetch users with normalized cache + dedupe
                fetchUsers: async ({ useCache = true, force = false } = {}) => {
                    const state = get();
                    const q: UsersQuery = { ...state.query };
                    q.page ??= 1;
                    q.perPage ??= state.perPage;

                    const canonicalKey = makeCanonicalKey(q);
                    const pageKey = makePageKey(canonicalKey, q.page!, q.perPage!);
                    const params = shallowCloneQuery(q);
                    const now = Date.now();

                    // dedupe identical in-flight requests
                    if (inFlightRequests.has(pageKey)) {
                        return inFlightRequests.get(pageKey)!;
                    }

                    // quick cache hit for exact page
                    const existingPage = state._cache.pages.get(pageKey);
                    if (useCache && !force && existingPage && now - existingPage.fetchedAt < state.cacheTTL) {
                        const items = existingPage.ids
                            .map((id) => state._cache.items.get(id))
                            .filter(Boolean) as UserTableRow[];
                        const payload: UsersApiResponse = { 
                            data: items, 
                            total: existingPage.total, 
                            page: q.page!, 
                            perPage: q.perPage! 
                        };

                        // mark this as latest request result
                        set({ currentPageKey: pageKey, currentData: payload, total: payload.total, loading: false });
                        return payload;
                    }

                    // try to satisfy from a larger cached page (same canonicalKey)
                    if (useCache && !force) {
                        let candidate: PageMeta | undefined;
                        for (const meta of state._cache.pages.values()) {
                            if (meta.canonicalKey !== canonicalKey) continue;
                            const requestedStart = (q.page! - 1) * q.perPage!;
                            const requestedEndExclusive = requestedStart + q.perPage!;
                            if (meta.ids.length >= requestedEndExclusive) {
                                candidate = meta;
                                break;
                            }
                        }

                        if (candidate) {
                            const idsSlice = candidate.ids.slice(
                                (q.page! - 1) * q.perPage!, 
                                (q.page! - 1) * q.perPage! + q.perPage!
                            );
                            const items = idsSlice
                                .map((id) => state._cache.items.get(id))
                                .filter(Boolean) as UserTableRow[];
                            const payload: UsersApiResponse = { 
                                data: items, 
                                total: candidate.total, 
                                page: q.page!, 
                                perPage: q.perPage! 
                            };

                            const pageMeta: PageMeta = { 
                                ids: idsSlice, 
                                total: candidate.total, 
                                fetchedAt: candidate.fetchedAt, 
                                canonicalKey 
                            };
                            const newCache = { 
                                items: new Map(state._cache.items), 
                                pages: new Map(state._cache.pages) 
                            };
                            newCache.pages.set(pageKey, pageMeta);

                            set({ 
                                _cache: newCache, 
                                currentPageKey: pageKey, 
                                currentData: payload, 
                                total: payload.total, 
                                loading: false 
                            });
                            return payload;
                        }
                    }

                    // FIXED: Abort previous request
                    if (state._abortController) {
                        state._abortController.abort();
                    }

                    // make network request with per-request seq guard
                    const abortController = new AbortController();
                    set((s) => {
                        const nextSeq = (s._lastRequestSeq ?? 0) + 1;
                        return { 
                            _abortController: abortController, 
                            loading: true, 
                            error: null, 
                            _lastRequestSeq: nextSeq 
                        };
                    });

                    // capture seq locally
                    const requestSeq = get()._lastRequestSeq;

                    const requestPromise = (async (): Promise<UsersApiResponse | null> => {
                        try {
                            const resp = await api.get<UsersApiResponse>(
                                `${URL_AFTER_API}`, 
                                { params, signal: abortController.signal }
                            );
                            const payload = resp.data;

                            // merge items into normalized map
                            const stateAfterRequest = get();
                            const newItems = new Map(stateAfterRequest._cache.items);
                            for (const item of payload.data) newItems.set(item._id, item);
                            const ids = payload.data.map((d) => d._id);
                            const pageMeta: PageMeta = { 
                                ids, 
                                total: payload.total, 
                                fetchedAt: Date.now(), 
                                canonicalKey 
                            };
                            const newPages = new Map(stateAfterRequest._cache.pages);
                            newPages.set(pageKey, pageMeta);

                            // Only apply the page result to currentData if this response matches the latest request seq
                            if (requestSeq === get()._lastRequestSeq) {
                                set({
                                    _cache: { items: newItems, pages: newPages },
                                    currentPageKey: pageKey,
                                    currentData: payload,
                                    total: payload.total,
                                    loading: false,
                                });
                            } else {
                                // merge items/pages into cache but don't overwrite currentData (stale)
                                set(() => ({
                                    _cache: { items: newItems, pages: newPages },
                                }));
                            }

                            return payload;
                        } catch (err: unknown) {
                            if (axios.isCancel(err)) {
                                // if cancelled, clear loading only if this was the active request
                                if (requestSeq === get()._lastRequestSeq) set({ loading: false });
                                return null;
                            }
                            console.error('fetchUsers error', err);
                            if (requestSeq === get()._lastRequestSeq) {
                                set({ 
                                    error: err instanceof Error ? err.message : 'Unknown error', 
                                    loading: false 
                                });
                            }
                            return null;
                        } finally {
                            // tidy up
                            set({ _abortController: null });
                            inFlightRequests.delete(pageKey);
                        }
                    })();

                    inFlightRequests.set(pageKey, requestPromise);
                    return requestPromise;
                },

                selectedUser: null,
                setSelectedUser: (u) => set({ selectedUser: u ?? null }),

                // FIXED: Changed to accept UserTableRow patch
                patchUserOptimistic: async (id, patch) => {
                    const state = get();
                    const newItems = new Map(state._cache.items);
                    const existing = newItems.get(id);
                    
                    if (existing) {
                        const updated = { ...existing, ...patch };
                        newItems.set(id, updated);
                        
                        // Update currentData
                        set({
                            _cache: {
                                items: newItems,
                                pages: new Map(state._cache.pages),
                            },
                            currentData: state.currentData
                                ? {
                                    ...state.currentData,
                                    data: state.currentData.data.map((r) => 
                                        r._id === id ? { ...r, ...patch } : r
                                    ),
                                }
                                : state.currentData,
                            // Also update selectedUser if it's the same user
                            selectedUser: state.selectedUser?._id === id 
                                ? { ...state.selectedUser, ...patch } 
                                : state.selectedUser,
                        });

                        try {
                            await api.patch(`${URL_AFTER_API}/${id}`, patch);
                            return updated;
                        } catch (err) {
                            // On failure, invalidate the item to force refetch
                            get().invalidateItem(id);
                            console.error("patchUserOptimistic failed", err);
                            return null;
                        }
                    }
                    
                    // If item not in cache, just make the API call
                    try {
                        const response = await api.patch<UserTableRow>(`${URL_AFTER_API}/${id}`, patch);
                        return response.data;
                    } catch (err) {
                        console.error("patchUserOptimistic failed", err);
                        return null;
                    }
                },

                verifyUser: async (id) => {
                    set((s) => ({
                        actionLoading: true,
                        actionError: null,
                        userActionLoading: { ...s.userActionLoading, [id]: true },
                    }));
                    try {
                        await api.post(`${URL_AFTER_API}/${id}/verify`);
                        await get().patchUserOptimistic(id, { isVerified: true });
                        return true;
                    } catch (err) {
                        set({ actionError: err instanceof Error ? err.message : "Verify failed" });
                        return false;
                    } finally {
                        set((s) => ({
                            actionLoading: false,
                            userActionLoading: { ...s.userActionLoading, [id]: false },
                        }));
                    }
                },

                upgradeToOrganizer: async (id) => {
                    set((s) => ({
                        actionLoading: true,
                        actionError: null,
                        userActionLoading: { ...s.userActionLoading, [id]: true },
                    }));
                    try {
                        await api.post(`${URL_AFTER_API}/${id}/upgrade`);
                        // FIXED: Use correct role - check your constants for actual role name
                        await get().patchUserOptimistic(id, { role: USER_ROLE.GUIDE });
                        return true;
                    } catch (err) {
                        set({ actionError: err instanceof Error ? err.message : "Upgrade failed" });
                        return false;
                    } finally {
                        set((s) => ({
                            actionLoading: false,
                            userActionLoading: { ...s.userActionLoading, [id]: false },
                        }));
                    }
                },

                resetPassword: async (id) => {
                    set((s) => ({
                        actionLoading: true,
                        actionError: null,
                        userActionLoading: { ...s.userActionLoading, [id]: true },
                    }));
                    try {
                        await api.post(`${URL_AFTER_API}/${id}/reset-password`);
                        return true;
                    } catch (err) {
                        set({ actionError: err instanceof Error ? err.message : "Reset password failed" });
                        return false;
                    } finally {
                        set((s) => ({
                            actionLoading: false,
                            userActionLoading: { ...s.userActionLoading, [id]: false },
                        }));
                    }
                },

                deleteUser: async (id) => {
                    set((s) => ({
                        actionLoading: true,
                        actionError: null,
                        userActionLoading: { ...s.userActionLoading, [id]: true },
                    }));
                    try {
                        await api.delete(`${URL_AFTER_API}/${id}`);

                        // Remove item from normalized cache and any pages that referenced it
                        const stateAfter = get();
                        const newItems = new Map(stateAfter._cache.items);
                        newItems.delete(id);

                        const newPages = new Map<string, PageMeta>();
                        for (const [k, meta] of stateAfter._cache.pages.entries()) {
                            const filtered = meta.ids.filter((iid) => iid !== id);
                            if (filtered.length) {
                                newPages.set(k, { ...meta, ids: filtered });
                            }
                        }

                        set({
                            _cache: {
                                items: newItems,
                                pages: newPages,
                            },
                            // FIXED: Update currentData immediately
                            currentData: stateAfter.currentData ? {
                                ...stateAfter.currentData,
                                data: stateAfter.currentData.data.filter(item => item._id !== id),
                                total: stateAfter.currentData.total - 1
                            } : undefined
                        });

                        return true;
                    } catch (err) {
                        set({ actionError: err instanceof Error ? err.message : "Delete failed" });
                        return false;
                    } finally {
                        set((s) => ({
                            actionLoading: false,
                            userActionLoading: { ...s.userActionLoading, [id]: false },
                        }));
                    }
                },

                suspendUser: async (id: string, fullSuspension: Suspension) => {
                    set((s) => ({
                        actionLoading: true,
                        actionError: null,
                        userActionLoading: { ...s.userActionLoading, [id]: true },
                    }));
                    try {
                        // FIXED: Call actual API endpoint instead of timeout
                        await api.patch(`${URL_AFTER_API}/${id}/suspend`, fullSuspension);

                        await get().patchUserOptimistic(id, {
                            accountStatus: ACCOUNT_STATUS.SUSPENDED,
                            suspension: { ...fullSuspension },
                        });

                        return true;
                    } catch (err) {
                        console.error("suspendUser failed", err);
                        set({ actionError: err instanceof Error ? err.message : "Suspend failed" });
                        return false;
                    } finally {
                        set((s) => ({
                            actionLoading: false,
                            userActionLoading: { ...s.userActionLoading, [id]: false },
                        }));
                    }
                },

                _abortController: null,
            }),
            {
                name: "travelers.store",
                partialize: (state) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { _cache, _abortController, ...rest } = state;
                    return rest;
                },
            }
        )
    )
);

/* Helper usage functions (keep your exported helpers) */
export function buildUsersQuery(params: Partial<UsersQuery>): UsersQuery {
    return {
        page: params.page ?? 1,
        perPage: params.perPage ?? 20,
        search: params.search,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
        roles: params.roles,
        accountStatus: params.accountStatus,
        isVerified: params.isVerified,
    };
}

export function clearUsersCache() {
    const store = useTravelerStore.getState();
    store.invalidateCache();
}

export function forceRefreshCurrent() {
    const store = useTravelerStore.getState();
    store.fetchUsers({ force: true });
}

export default useTravelerStore;