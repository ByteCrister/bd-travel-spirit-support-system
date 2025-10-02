'use client';

import { ACCOUNT_STATUS, USER_ROLE } from "@/constants/user.const";
import { UserSortableField, UserTableRow } from "@/types/user.table.types";
import { Suspension, User } from "@/types/user.types";
import api from "@/utils/api/axios";
import axios from "axios";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// -----------------------------
// Types
// -----------------------------

// API response for /users endpoint
export interface UsersApiResponse {
    data: UserTableRow[];
    total: number;
    page: number;
    perPage: number;
}

// Query parameters for fetching users
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

// -----------------------------
// Cache utilities
// -----------------------------

interface CacheValue {
    payload: UsersApiResponse;
    fetchedAt: number;
}

const defaultCacheTTL = 1000 * 60 * 2; // 2 minutes

function makeCacheKey(q: UsersQuery) {
    const clone = { ...q };
    Object.keys(clone).forEach((k) => {
        if (clone[k] === undefined) delete clone[k];
    });
    return JSON.stringify(clone);
}

// -----------------------------
// Zustand store state
// -----------------------------

interface useUserManagementStoreState {
    // Pagination config
    perPage: number;
    setPerPage: (n: number) => void;

    // Query parameters
    query: UsersQuery;
    setQuery: (q: Partial<UsersQuery>) => void;
    resetQuery: () => void;

    // Cache for paginated users
    _cache: Map<string, CacheValue>;
    cacheTTL: number;
    invalidateCache: (predicate?: (key: string) => boolean) => void;

    // Current table state
    currentPageKey?: string;
    currentData?: UsersApiResponse;
    total?: number;

    // Loading & error states
    loading: boolean; // for fetching users table
    actionLoading: boolean; // for global mutations
    userActionLoading: Record<string, boolean>; // per-user row-level actions
    error?: string | null;
    actionError?: string | null;

    // Fetch users with pagination & caching
    fetchUsers: (opts?: { useCache?: boolean; force?: boolean }) => Promise<UsersApiResponse | null>;

    // Selected user
    selectedUser?: User | null;
    setSelectedUser: (u?: User | null) => void;

    // User actions
    patchUserOptimistic: (id: string, patch: Partial<User>) => Promise<User | null>;
    verifyUser: (id: string) => Promise<boolean>;
    upgradeToOrganizer: (id: string) => Promise<boolean>;
    resetPassword: (id: string) => Promise<boolean>;
    deleteUser: (id: string) => Promise<boolean>;
    suspendUser: (id: string, fullSuspension: Suspension) => Promise<boolean>

    _abortController?: AbortController | null;
}

// -----------------------------
// Zustand store implementation
// -----------------------------

export const useUserManagementStore = create<useUserManagementStoreState>()(
    devtools(
        persist(
            (set, get) => ({
                perPage: 20,
                setPerPage: (n) => set({ perPage: n, query: { ...get().query, perPage: n } }),

                query: { page: 1, perPage: 20 },
                setQuery: (q) => set({ query: { ...get().query, ...q } }),
                resetQuery: () => set({ query: { page: 1, perPage: get().perPage } }),

                _cache: new Map<string, CacheValue>(),
                cacheTTL: defaultCacheTTL,
                invalidateCache: (predicate) => {
                    const cache = new Map(get()._cache);
                    if (!predicate) {
                        cache.clear();
                    } else {
                        for (const k of Array.from(cache.keys())) {
                            if (predicate(k)) cache.delete(k);
                        }
                    }
                    set({ _cache: cache });
                },

                currentPageKey: undefined,
                currentData: undefined,
                total: 0,

                // Loading & error states
                loading: false,
                actionLoading: false,
                userActionLoading: {},
                error: null,
                actionError: null,

                // -----------------------------
                // Fetch users
                // -----------------------------
                fetchUsers: async ({ useCache = true, force = false } = {}) => {
                    const state = get();
                    const query: UsersQuery = { ...state.query };

                    query.page ??= 1;
                    query.perPage ??= state.perPage;

                    // sanitize query before sending
                    Object.keys(query).forEach((k) => {
                        const val = query[k as keyof UsersQuery];
                        if (
                            val === undefined ||
                            val === null ||
                            (Array.isArray(val) && val.length === 0)
                        ) {
                            delete query[k as keyof UsersQuery];
                        }
                    });

                    const key = makeCacheKey(query);

                    // Abort previous request if still running
                    if (state._abortController) state._abortController.abort();
                    const abortController = new AbortController();
                    set({ _abortController: abortController, loading: true, error: null });

                    // Use cache if available
                    const cached = state._cache.get(key);
                    const now = Date.now();
                    if (useCache && !force && cached && now - cached.fetchedAt < state.cacheTTL) {
                        set({
                            currentPageKey: key,
                            currentData: cached.payload,
                            total: cached.payload.total,
                            loading: false,
                        });
                        return cached.payload;
                    }

                    try {
                        const resp = await api.get<UsersApiResponse>("/users-management", {
                            params: query,
                            signal: abortController.signal,
                        });
                        const payload = resp.data;
                        const cacheVal: CacheValue = { payload, fetchedAt: Date.now() };

                        const cache = new Map(state._cache);
                        cache.set(key, cacheVal);
                        set({
                            _cache: cache,
                            currentPageKey: key,
                            currentData: payload,
                            total: payload.total,
                            loading: false,
                        });
                        return payload;
                    } catch (err: unknown) {
                        if (axios.isCancel(err)) {
                            set({ loading: false });
                            return null;
                        }
                        console.error("fetchUsers error", err);
                        set({
                            error: err instanceof Error ? err.message : "Unknown error",
                            loading: false,
                        });
                        return null;
                    } finally {
                        set({ _abortController: null });
                    }
                },

                // -----------------------------
                // Selected user
                // -----------------------------
                selectedUser: null,
                setSelectedUser: (u) => set({ selectedUser: u ?? null }),

                // -----------------------------
                // Optimistic patch for user
                // -----------------------------
                patchUserOptimistic: async (id, patch) => {
                    const state = get();
                    const cache = new Map(state._cache);
                    const modifiedKeys: string[] = [];

                    for (const [k, v] of cache.entries()) {
                        const idx = v.payload.data.findIndex((r) => r._id === id);
                        if (idx !== -1) {
                            const clonedPayload: UsersApiResponse = JSON.parse(JSON.stringify(v.payload));
                            clonedPayload.data[idx] = { ...clonedPayload.data[idx], ...patch };
                            cache.set(k, { payload: clonedPayload, fetchedAt: v.fetchedAt });
                            modifiedKeys.push(k);
                        }
                    }

                    if (modifiedKeys.length) {
                        set({
                            _cache: cache,
                            currentData: cache.get(state.currentPageKey || "")?.payload,
                        });
                    }

                    try {
                        await api.patch(`/users-management/${id}`, patch);
                        return get().selectedUser ?? null;
                    } catch (err) {
                        get().invalidateCache((k) => modifiedKeys.includes(k));
                        console.error("patchUserOptimistic failed", err);
                        return null;
                    }
                },

                // -----------------------------
                // User actions
                // -----------------------------
                verifyUser: async (id) => {
                    set((s) => ({
                        actionLoading: true,
                        actionError: null,
                        userActionLoading: { ...s.userActionLoading, [id]: true },
                    }));
                    try {
                        await api.post(`/users-management/${id}/verify`);
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
                        await api.post(`/users-management/${id}/upgrade`);
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
                        await api.post(`/users-management/${id}/reset-password`);
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
                        await api.delete(`/users-management/${id}`);
                        get().invalidateCache((k) => {
                            const v = get()._cache.get(k);
                            return !!v?.payload.data.some((r) => r._id === id);
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

                // Inside the create() function, under "User actions"
                suspendUser: async (id: string, fullSuspension: Suspension) => {
                    set((s) => ({
                        actionLoading: true,
                        actionError: null,
                        userActionLoading: { ...s.userActionLoading, [id]: true },
                    }));

                    try {
                        // Dummy API delay
                        await new Promise((resolve) => setTimeout(resolve, 800));

                        // Optimistically update cache
                        await get().patchUserOptimistic(id, {
                            accountStatus: ACCOUNT_STATUS.SUSPENDED,
                            suspension: { ...fullSuspension },
                        });

                        return true; // success
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
                name: "users-management-store",
                partialize: (state) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { _cache, _abortController, ...rest } = state;
                    return rest; // only persist the rest
                }
            }
        )
    )
);

// -----------------------------
// Helper usage functions
// -----------------------------

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
    const store = useUserManagementStore.getState();
    store.invalidateCache();
}

export function forceRefreshCurrent() {
    const store = useUserManagementStore.getState();
    store.fetchUsers({ force: true });
}

export default useUserManagementStore;
