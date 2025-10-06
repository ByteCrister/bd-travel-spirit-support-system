// stores/useEmployeeStore.ts
// Purpose: Production-grade, type-safe zustand store for /employees admin.
// Design:
// - In-memory TTL cache for list/detail and meta endpoints.
// - Per-item loading states for responsive UX.
// - Strict ApiResult handling and consistent error propagation.
// - Persist only minimal UI state; keep cache in memory for correctness.

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";

import {
    ApiResult,
    CreateEmployeePayload,
    EmployeeDetailDTO,
    EMPLOYEES_CACHE_KEYS,
    EmployeesListResponse,
    EmployeesQuery,
    RestoreEmployeePayload,
    SoftDeleteEmployeePayload,
    UpdateEmployeePayload,
    ObjectIdString,
} from "@/types/employee.types";

const ROOT_DIRECTORY = `/users-management/employees`;

const DEFAULT_TTL_SECONDS =
    Number.parseInt(process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL || "300", 10) || 300;

// Cache entry holds a payload, when cached, and its TTL (seconds).
type CacheEntry<T = unknown> = {
    ts: number; // epoch ms when cached
    ttl: number; // seconds
    data: T;
};

// In-memory cache keyed by computed strings (see EMPLOYEES_CACHE_KEYS).
type InMemoryCache = Map<string, CacheEntry<unknown>>;

// Minimal UI state persisted to localStorage.
// Keep it small to avoid stale cached data between sessions.
interface EmployeeUiState {
    lastQuery?: EmployeesQuery;
    collapsed?: boolean;
}

// Central store interface. Keep signatures explicit and stable.
interface EmployeeStore {
    // In-memory cache
    cache: InMemoryCache;

    // Per-item loading states (detail fetch, actions, etc.)
    loadingById: Record<string, boolean>;

    // Global loading and last error surfaces
    loadingList: boolean;
    loadingDetail: boolean;
    lastError?: string | null;

    // UI (persisted)
    ui: EmployeeUiState;
    setUi: (patch: Partial<EmployeeUiState>) => void;
    clearUi: () => void;

    // Cache read helpers
    getCachedList: (q: EmployeesQuery) => EmployeesListResponse | null;
    getCachedDetail: (id: string) => EmployeeDetailDTO | null;

    // Actions
    fetchEmployees: (query?: EmployeesQuery, force?: boolean) => Promise<EmployeesListResponse>;
    fetchEmployeeDetail: (id: string, force?: boolean) => Promise<EmployeeDetailDTO>;

    createEmployee: (payload: CreateEmployeePayload) => Promise<EmployeeDetailDTO>;
    updateEmployee: (payload: UpdateEmployeePayload) => Promise<EmployeeDetailDTO>;
    softDeleteEmployee: (payload: SoftDeleteEmployeePayload) => Promise<void>;
    restoreEmployee: (payload: RestoreEmployeePayload) => Promise<void>;

    // Meta endpoints
    fetchPositions: (force?: boolean) => Promise<unknown>;
    fetchEnums: (force?: boolean) => Promise<unknown>;

    // Cache helpers
    invalidateCacheKey: (key: string) => void;
    invalidateCacheKeyPrefix: (prefix: string) => void;
    clearCache: () => void;
}

// API endpoints. Keep inline and deterministic.
const EMP_API = {
    LIST: ROOT_DIRECTORY,
    DETAIL: (id: string) => `${ROOT_DIRECTORY}/${id}`,
    CREATE: ROOT_DIRECTORY,
    UPDATE: (id: string) => `${ROOT_DIRECTORY}/${id}`,
    SOFT_DELETE: (id: string) => `${ROOT_DIRECTORY}/${id}/soft-delete`,
    RESTORE: (id: string) => `${ROOT_DIRECTORY}/${id}/restore`,
    POSITIONS: `${ROOT_DIRECTORY}/positions`,
    ENUMS: `${ROOT_DIRECTORY}/enums`,
} as const;

function nowMs() {
    return Date.now();
}

function isExpired(entry: CacheEntry<unknown>) {
    return nowMs() - entry.ts > entry.ttl * 1000;
}

export const useEmployeeStore = create<EmployeeStore>()(
    devtools(
        persist(
            (set, get) => ({
                // In-memory cache only. Never persist payloads across reloads.
                cache: new Map<string, CacheEntry<unknown>>(),

                // Per-item loading map for detail/actions.
                loadingById: {},

                loadingList: false,
                loadingDetail: false,
                lastError: null,

                // Persisted UI only
                ui: {
                    lastQuery: undefined,
                    collapsed: false,
                },

                // Patch UI state (persisted); safe merge.
                setUi: (patch) =>
                    set((s) => ({ ui: { ...s.ui, ...patch } }), false, "employees/setUi"),

                // Reset UI state; avoids any-casts.
                clearUi: () =>
                    set(
                        { ui: { lastQuery: undefined, collapsed: false } },
                        false,
                        "employees/clearUi"
                    ),

                // Return a cached list if present and valid; otherwise null.
                getCachedList: (q) => {
                    try {
                        const key = EMPLOYEES_CACHE_KEYS.list(q as EmployeesQuery);
                        const entry = get().cache.get(key);
                        if (!entry) return null;
                        if (isExpired(entry)) {
                            get().cache.delete(key);
                            return null;
                        }
                        return entry.data as EmployeesListResponse;
                    } catch {
                        return null;
                    }
                },

                // Return a cached detail if present and valid; otherwise null.
                getCachedDetail: (id) => {
                    try {
                        const key = EMPLOYEES_CACHE_KEYS.detail(id as ObjectIdString);
                        const entry = get().cache.get(key);
                        if (!entry) return null;
                        if (isExpired(entry)) {
                            get().cache.delete(key);
                            return null;
                        }
                        return entry.data as EmployeeDetailDTO;
                    } catch {
                        return null;
                    }
                },

                // Fetch list with caching + TTL. Always updates lastQuery in UI.
                async fetchEmployees(query = {}, force = false) {
                    const key = EMPLOYEES_CACHE_KEYS.list(query as EmployeesQuery);
                    const cached = get().cache.get(key);

                    if (!force && cached && !isExpired(cached)) {
                        // Persist lastQuery even when serving from cache.
                        get().setUi({ lastQuery: query });
                        return cached.data as EmployeesListResponse;
                    }

                    set({ loadingList: true, lastError: null }, false, "employees/fetchList:start");
                    try {
                        const res = await api.get<ApiResult<EmployeesListResponse>>(EMP_API.LIST, {
                            params: query,
                        });
                        const payload = res.data;

                        if (!payload.ok || !payload.data) {
                            throw new Error(payload.error?.message || "Failed to fetch employees list");
                        }

                        get().cache.set(key, {
                            ts: nowMs(),
                            ttl: DEFAULT_TTL_SECONDS,
                            data: payload.data,
                        });

                        // Track last query for reloads and UX continuity.
                        get().setUi({ lastQuery: query });

                        set({ loadingList: false }, false, "employees/fetchList:done");
                        return payload.data;
                    } catch (err) {
                        const message = extractErrorMessage(err);
                        set({ lastError: message, loadingList: false }, false, "employees/fetchList:error");
                        throw new Error(message);
                    }
                },

                // Fetch detail with per-item loading and in-memory caching + TTL.
                async fetchEmployeeDetail(id, force = false) {
                    const detailKey = EMPLOYEES_CACHE_KEYS.detail(id as ObjectIdString);
                    const cached = get().cache.get(detailKey);

                    // Mark per-item loading on.
                    set(
                        (s) => ({ loadingById: { ...s.loadingById, [id]: true }, loadingDetail: true }),
                        false,
                        "employees/fetchDetail:start"
                    );

                    try {
                        if (!force && cached && !isExpired(cached)) {
                            // Per-item loading off when served from cache.
                            set(
                                (s) => ({
                                    loadingById: { ...s.loadingById, [id]: false },
                                    loadingDetail: false,
                                }),
                                false,
                                "employees/fetchDetail:cache"
                            );
                            return cached.data as EmployeeDetailDTO;
                        }

                        const res = await api.get<ApiResult<EmployeeDetailDTO>>(EMP_API.DETAIL(id));
                        const payload = res.data;

                        if (!payload.ok || !payload.data) {
                            throw new Error(payload.error?.message || "Failed to fetch employee detail");
                        }

                        get().cache.set(detailKey, {
                            ts: nowMs(),
                            ttl: DEFAULT_TTL_SECONDS,
                            data: payload.data,
                        });

                        set(
                            (s) => ({
                                loadingById: { ...s.loadingById, [id]: false },
                                loadingDetail: false,
                            }),
                            false,
                            "employees/fetchDetail:done"
                        );
                        return payload.data;
                    } catch (err) {
                        const message = extractErrorMessage(err);
                        set(
                            (s) => ({
                                lastError: message,
                                loadingById: { ...s.loadingById, [id]: false },
                                loadingDetail: false,
                            }),
                            false,
                            "employees/fetchDetail:error"
                        );
                        throw new Error(message);
                    }
                },

                // Create employee, invalidate list caches, and cache returned detail.
                async createEmployee(payload) {
                    set({ lastError: null }, false, "employees/create:start");
                    try {
                        const res = await api.post<ApiResult<EmployeeDetailDTO>>(EMP_API.CREATE, payload);
                        const body = res.data;

                        if (!body.ok || !body.data) {
                            throw new Error(body.error?.message || "Failed to create employee");
                        }

                        // Invalidate all list cache keys to avoid stale denormalized cells.
                        get().invalidateCacheKeyPrefix("employees:list");

                        // Cache detail for immediate subsequent use.
                        const detailKey = EMPLOYEES_CACHE_KEYS.detail(body.data.id);
                        get().cache.set(detailKey, {
                            ts: nowMs(),
                            ttl: DEFAULT_TTL_SECONDS,
                            data: body.data,
                        });

                        return body.data;
                    } catch (err) {
                        const message = extractErrorMessage(err);
                        set({ lastError: message }, false, "employees/create:error");
                        throw new Error(message);
                    }
                },

                // Update employee, update detail cache, and invalidate list caches.
                async updateEmployee(payload) {
                    set({ lastError: null }, false, "employees/update:start");
                    try {
                        const res = await api.put<ApiResult<EmployeeDetailDTO>>(
                            EMP_API.UPDATE(payload.id),
                            payload
                        );
                        const body = res.data;

                        if (!body.ok || !body.data) {
                            throw new Error(body.error?.message || "Failed to update employee");
                        }

                        // Overwrite detail cache with fresh data.
                        const detailKey = EMPLOYEES_CACHE_KEYS.detail(body.data.id);
                        get().cache.set(detailKey, {
                            ts: nowMs(),
                            ttl: DEFAULT_TTL_SECONDS,
                            data: body.data,
                        });

                        // Denormalized list cells likely changed; invalidate all list caches.
                        get().invalidateCacheKeyPrefix("employees:list");

                        return body.data;
                    } catch (err) {
                        const message = extractErrorMessage(err);
                        set({ lastError: message }, false, "employees/update:error");
                        throw new Error(message);
                    }
                },

                // Soft delete employee and invalidate relevant caches.
                async softDeleteEmployee({ id }) {
                    set(
                        (s) => ({ lastError: null, loadingById: { ...s.loadingById, [id]: true } }),
                        false,
                        "employees/softDelete:start"
                    );
                    try {
                        const res = await api.patch<ApiResult<null>>(EMP_API.SOFT_DELETE(id));
                        const body = res.data;
                        if (!body.ok) {
                            throw new Error(body.error?.message || "Failed to soft-delete employee");
                        }

                        // Invalidate caches that could contain the deleted record.
                        get().invalidateCacheKeyPrefix("employees:list");
                        get().invalidateCacheKey(EMPLOYEES_CACHE_KEYS.detail(id));

                        set(
                            (s) => ({ loadingById: { ...s.loadingById, [id]: false } }),
                            false,
                            "employees/softDelete:done"
                        );
                    } catch (err) {
                        const message = extractErrorMessage(err);
                        set(
                            (s) => ({
                                lastError: message,
                                loadingById: { ...s.loadingById, [id]: false },
                            }),
                            false,
                            "employees/softDelete:error"
                        );
                        throw new Error(message);
                    }
                },

                // Restore employee and invalidate relevant caches.
                async restoreEmployee({ id }) {
                    set(
                        (s) => ({ lastError: null, loadingById: { ...s.loadingById, [id]: true } }),
                        false,
                        "employees/restore:start"
                    );
                    try {
                        const res = await api.patch<ApiResult<null>>(EMP_API.RESTORE(id));
                        const body = res.data;
                        if (!body.ok) {
                            throw new Error(body.error?.message || "Failed to restore employee");
                        }

                        // Invalidate caches that could reflect deletion state.
                        get().invalidateCacheKeyPrefix("employees:list");
                        get().invalidateCacheKey(EMPLOYEES_CACHE_KEYS.detail(id));

                        set(
                            (s) => ({ loadingById: { ...s.loadingById, [id]: false } }),
                            false,
                            "employees/restore:done"
                        );
                    } catch (err) {
                        const message = extractErrorMessage(err);
                        set(
                            (s) => ({
                                lastError: message,
                                loadingById: { ...s.loadingById, [id]: false },
                            }),
                            false,
                            "employees/restore:error"
                        );
                        throw new Error(message);
                    }
                },

                // Fetch positions metadata (cached with TTL). Kept as unknown for backend flexibility.
                async fetchPositions(force = false) {
                    const key = EMPLOYEES_CACHE_KEYS.positions;
                    const cached = get().cache.get(key);
                    if (!force && cached && !isExpired(cached)) return cached.data;

                    try {
                        const res = await api.get<ApiResult<unknown>>(EMP_API.POSITIONS);
                        const body = res.data;
                        if (!body.ok) throw new Error(body.error?.message || "Failed to fetch positions");

                        get().cache.set(key, { ts: nowMs(), ttl: DEFAULT_TTL_SECONDS, data: body.data });
                        return body.data;
                    } catch (err) {
                        const message = extractErrorMessage(err);
                        set({ lastError: message }, false, "employees/fetchPositions:error");
                        throw new Error(message);
                    }
                },

                // Fetch enums metadata (cached with TTL). Kept as unknown for backend flexibility.
                async fetchEnums(force = false) {
                    const key = EMPLOYEES_CACHE_KEYS.enums;
                    const cached = get().cache.get(key);
                    if (!force && cached && !isExpired(cached)) return cached.data;

                    try {
                        const res = await api.get<ApiResult<unknown>>(EMP_API.ENUMS);
                        const body = res.data;
                        if (!body.ok) throw new Error(body.error?.message || "Failed to fetch enums");

                        get().cache.set(key, { ts: nowMs(), ttl: DEFAULT_TTL_SECONDS, data: body.data });
                        return body.data;
                    } catch (err) {
                        const message = extractErrorMessage(err);
                        set({ lastError: message }, false, "employees/fetchEnums:error");
                        throw new Error(message);
                    }
                },

                // Remove a single cache entry (no-op if not present).
                invalidateCacheKey: (key: string) => {
                    get().cache.delete(key);
                },

                // Remove all cache entries that start with the given prefix.
                invalidateCacheKeyPrefix: (prefix: string) => {
                    const keys = Array.from(get().cache.keys());
                    for (const k of keys) {
                        if (k.startsWith(prefix)) get().cache.delete(k);
                    }
                },

                // Clear the entire cache (list, detail, meta).
                clearCache: () => {
                    get().cache.clear();
                },
            }),
            {
                name: "employees-ui-store",
                // Persist only UI slice; avoid persisting cached payloads.
                partialize: (state) => ({ ui: state.ui }),
            }
        ),
        { name: "employees-store" } // devtools label
    )
);
