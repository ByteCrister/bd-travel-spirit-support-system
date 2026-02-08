// stores/employee.store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
    CreateEmployeePayload,
    EmployeeDetailDTO,
    EmployeeListItemDTO,
    EMPLOYEES_CACHE_KEYS,
    EmployeesListResponse,
    EmployeesQuery,
    RestoreEmployeePayload,
    UpdateEmployeePayload,
    ObjectIdString,
} from "@/types/employee/employee.types";
import { ApiResponse } from "@/types/common/api.types";
import { showToast } from "@/components/global/showToast";
import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";

// const URL_AFTER_API = `/mock/users/employees`;
const URL_AFTER_API = `/users/employees/v1`;

const DEFAULT_TTL_SECONDS =
    Number.parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || "300", 10) || 300;

// New knobs
const DEFAULT_LIST_CACHE_MAX_ITEMS = 500; // max items to keep per canonical query buffer
const DEFAULT_GLOBAL_CACHE_ENTRIES = 200; // global entries (list buffers + details)
const STALE_WHILE_REVALIDATE = true; // serve stale and revalidate in background when expired

type CacheEntry<T = unknown> = {
    ts: number; // epoch ms when cached
    ttl: number; // seconds
    data: T;
};

type InMemoryCache = Map<string, CacheEntry<unknown>>;

interface EmployeeUiState {
    lastQuery?: EmployeesQuery;
    collapsed?: boolean;
}

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
    softDeleteEmployee: (id: string, reason: string) => Promise<void>;
    restoreEmployee: (payload: RestoreEmployeePayload) => Promise<EmployeeDetailDTO>;

    retryEmployeeSalaryPayment: (id: string) => Promise<EmployeeDetailDTO>;

    // Meta endpoints
    fetchEnums: (force?: boolean) => Promise<unknown>;

    // Cache helpers
    invalidateCacheKey: (key: string) => void;
    invalidateCacheKeyPrefix: (prefix: string) => void;
    clearCache: () => void;
}

const EMP_API = {
    LIST: URL_AFTER_API,
    DETAIL: (id: string) => `${URL_AFTER_API}/${id}`,
    CREATE: `${URL_AFTER_API}`,
    UPDATE: (id: string) => `${URL_AFTER_API}/${id}`,
    SOFT_DELETE: (id: string) => `${URL_AFTER_API}/${id}/soft-delete`,
    RESTORE: (id: string) => `${URL_AFTER_API}/${id}/restore`,
    RETRY_SALARY_PAYMENT: (id: string) => `${URL_AFTER_API}/${id}/retry-payment`,
    POSITIONS: `${URL_AFTER_API}/positions`,
    ENUMS: `${URL_AFTER_API}/enums`,
} as const;

function nowMs() {
    return Date.now();
}
function isExpired(entry: CacheEntry<unknown>) {
    return nowMs() - entry.ts > entry.ttl * 1000;
}

/**
 * New helpers for canonical list keys:
 * - listBaseKey(query) => key derived from filters+sort only (no page/limit)
 * - pageKey(query) => "page:limit" string
 *
 * We'll store canonical buffers under `employees:list:canonical:${baseKey}`
 * and continue to allow detail keys as before.
 */
function listBaseKey(q: EmployeesQuery) {
    const normalized = {
        sortBy: q.sortBy ?? "createdAt",
        sortOrder: q.sortOrder ?? "desc",
        filters: q.filters ?? {},
    };
    return JSON.stringify(normalized);
}
function pageKey(q: EmployeesQuery) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    return `p${page}_l${limit}`;
}

// Helper to prune global cache size (simple LRU-ish by insertion order)
function pruneGlobalCache(cache: InMemoryCache, maxEntries = DEFAULT_GLOBAL_CACHE_ENTRIES) {
    if (cache.size <= maxEntries) return;
    const keys = Array.from(cache.keys());
    // remove oldest entries until size <= maxEntries (Map preserves insertion order)
    const toRemove = keys.slice(0, cache.size - maxEntries);
    for (const k of toRemove) cache.delete(k);
}

export const useEmployeeStore = create<EmployeeStore>()(
    devtools(
        persist(
            (set, get) => {
                // in-flight dedupe maps
                const inflightListRequests = new Map<string, Promise<EmployeesListResponse>>();
                const inflightDetailRequests = new Map<string, Promise<EmployeeDetailDTO>>();

                // internal helpers to access canonical list cache entry shape:
                type CanonicalListCache = {
                    items: EmployeeListItemDTO[];
                    total: number;
                    pagesCached: Set<string>; // pageKey values that were fetched and merged
                };

                function canonicalCacheKeyFor(q: EmployeesQuery) {
                    return `employees:list:canonical:${listBaseKey(q)}`;
                }

                function makeInitialCanonical(data: EmployeesListResponse): CanonicalListCache {
                    return {
                        items: data.docs.slice(),
                        total: data.total,
                        pagesCached: new Set([pageKey({ page: data.page, limit: data.docs.length })]),
                    };
                }

                // attempt to build EmployeesListResponse for requested page/limit from cached canonical buffer
                function buildListFromCanonical(canonical: CanonicalListCache, q: EmployeesQuery): EmployeesListResponse | null {
                    const page = q.page ?? 1;
                    const limit = q.limit ?? 20;
                    const start = (page - 1) * limit;
                    const end = start + limit;

                    // if we have enough items in the canonical buffer to satisfy slice, return it
                    if (canonical.items.length >= end || (canonical.items.length > start && canonical.total <= canonical.items.length)) {
                        const slice = canonical.items.slice(start, end);
                        const pages = Math.max(1, Math.ceil(canonical.total / limit));
                        return {
                            docs: slice,
                            total: canonical.total,
                            page,
                            pages,
                        };
                    }
                    return null;
                }

                return {
                    cache: new Map<string, CacheEntry<unknown>>(),
                    loadingById: {},
                    loadingList: false,
                    loadingDetail: false,
                    lastError: null,
                    ui: {
                        lastQuery: undefined,
                        collapsed: false,
                    },

                    setUi: (patch) => set((s) => ({ ui: { ...s.ui, ...patch } }), false, "employees/setUi"),
                    clearUi: () => set({ ui: { lastQuery: undefined, collapsed: false } }, false, "employees/clearUi"),

                    getCachedList: (q) => {
                        try {
                            const baseKey = canonicalCacheKeyFor(q);
                            const entry = get().cache.get(baseKey);
                            if (!entry) return null;
                            if (isExpired(entry)) {
                                // on expiration, if SWR is enabled we still keep and return stale; otherwise remove.
                                if (!STALE_WHILE_REVALIDATE) {
                                    get().cache.delete(baseKey);
                                    return null;
                                }
                                // if stale and SWR, don't delete; allow caller to receive stale data
                            }
                            const canonical = entry.data as CanonicalListCache;
                            const maybe = buildListFromCanonical(canonical, q);
                            if (!maybe) return null;
                            return maybe;
                        } catch {
                            return null;
                        }
                    },

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

                    // Fetch employees with canonical buffering, dedupe, and slice serving.
                    async fetchEmployees(query = {}, force = false) {
                        const baseKey = canonicalCacheKeyFor(query);
                        const page = query.page ?? 1;
                        const limit = query.limit ?? 20;
                        const requestedPageKey = pageKey({ page, limit });

                        // 1) Try to satisfy from cache
                        const cachedEntry = get().cache.get(baseKey);
                        if (!force && cachedEntry && !isExpired(cachedEntry)) {
                            const canonical = cachedEntry.data as CanonicalListCache;
                            const built = buildListFromCanonical(canonical, query);
                            if (built) {
                                // update lastQuery and return cached slice
                                get().setUi({ lastQuery: query });
                                return built;
                            }
                            // else cached buffer doesn't cover requested slice: we'll fetch just the requested page
                        }

                        // dedupe concurrent page requests of the same baseKey + pageKey combo
                        const inflightKey = `${baseKey}::${requestedPageKey}`;
                        if (inflightListRequests.has(inflightKey)) {
                            return inflightListRequests.get(inflightKey)!;
                        }

                        set({ loadingList: true, lastError: null }, false, "employees/fetchList:start");

                        // create inflight promise
                        const promise = (async () => {
                            try {
                                // hit API with provided page+limit so backend returns the exact page requested
                                const res = await api.get<ApiResponse<EmployeesListResponse>>(EMP_API.LIST, {
                                    params: query,
                                });
                                const payload = res.data;
                                if (!payload.data) {
                                    throw new Error("Failed to fetch employees list");
                                }

                                // merge into canonical buffer:
                                const response = payload.data;

                                const existingEntry = get().cache.get(baseKey);

                                if (!existingEntry || isExpired(existingEntry)) {
                                    const canonical = makeInitialCanonical(response);
                                    // place items at correct offsets by expanding with undefined items when necessary
                                    const start = (response.page - 1) * limit;
                                    // create placeholder array of length start, then append docs
                                    canonical.items = new Array<EmployeeListItemDTO>(start).fill(undefined as unknown as EmployeeListItemDTO).concat(response.docs);
                                    canonical.total = response.total;
                                    canonical.pagesCached.add(requestedPageKey);
                                    get().cache.set(baseKey, {
                                        ts: nowMs(),
                                        ttl: DEFAULT_TTL_SECONDS,
                                        data: canonical,
                                    });
                                } else {
                                    const canonical = existingEntry.data as CanonicalListCache;
                                    const start = (response.page - 1) * limit;
                                    // ensure items length is at least start
                                    if (canonical.items.length < start) canonical.items.length = start;
                                    for (let i = 0; i < response.docs.length; i++) {
                                        canonical.items[start + i] = response.docs[i];
                                    }
                                    canonical.total = response.total;
                                    canonical.pagesCached.add(requestedPageKey);
                                    // update timestamp and put back
                                    get().cache.set(baseKey, {
                                        ts: nowMs(),
                                        ttl: DEFAULT_TTL_SECONDS,
                                        data: canonical,
                                    });
                                }

                                // enforce per-canonical max buffer items (trim trailing undefined/extra)
                                const entryAfter = get().cache.get(baseKey)!;
                                const canonicalAfter = entryAfter.data as CanonicalListCache;
                                // remove undefined placeholders and cap to DEFAULT_LIST_CACHE_MAX_ITEMS
                                const compact = canonicalAfter.items.filter((x) => x !== undefined);
                                if (compact.length > DEFAULT_LIST_CACHE_MAX_ITEMS) {
                                    canonicalAfter.items = compact.slice(0, DEFAULT_LIST_CACHE_MAX_ITEMS);
                                } else {
                                    canonicalAfter.items = compact;
                                }
                                // refresh canonical entry timestamp
                                get().cache.set(baseKey, {
                                    ts: nowMs(),
                                    ttl: DEFAULT_TTL_SECONDS,
                                    data: canonicalAfter,
                                });

                                // prune global cache
                                pruneGlobalCache(get().cache, DEFAULT_GLOBAL_CACHE_ENTRIES);

                                // Build a return payload for requested page
                                const built = buildListFromCanonical(canonicalAfter, query);
                                const final: EmployeesListResponse =
                                    built ??
                                    ({
                                        docs: response.docs,
                                        total: response.total,
                                        page: response.page,
                                        pages: response.pages,
                                    } as EmployeesListResponse);

                                // persist last query
                                get().setUi({ lastQuery: query });
                                set({ loadingList: false }, false, "employees/fetchList:done");
                                return final;
                            } catch (err) {
                                const message = extractErrorMessage(err);
                                set({ lastError: message, loadingList: false }, false, "employees/fetchList:error");
                                throw new Error(message);
                            } finally {
                                // clear inflight
                                inflightListRequests.delete(inflightKey);
                            }
                        })();

                        inflightListRequests.set(inflightKey, promise);
                        return promise;
                    },

                    // Fetch detail with dedupe and TTL
                    async fetchEmployeeDetail(id, force = false) {
                        const detailKey = EMPLOYEES_CACHE_KEYS.detail(id as ObjectIdString);
                        const cached = get().cache.get(detailKey);

                        // If available and not expired, return immediately
                        if (!force && cached && !isExpired(cached)) return cached.data as EmployeeDetailDTO;

                        // Deduplicate inflight detail requests
                        if (inflightDetailRequests.has(detailKey)) return inflightDetailRequests.get(detailKey)!;

                        // mark loading
                        set(
                            (s) => ({
                                loadingById: { ...s.loadingById, [id]: true },
                                loadingDetail: true,
                            }),
                            false,
                            "employees/fetchDetail:start"
                        );

                        const promise = (async () => {
                            try {
                                const res = await api.get<ApiResponse<EmployeeDetailDTO>>(EMP_API.DETAIL(id));
                                const payload = res.data;
                                if (!payload.data) {
                                    throw new Error("Failed to fetch employee detail");
                                }
                                get().cache.set(detailKey, {
                                    ts: nowMs(),
                                    ttl: DEFAULT_TTL_SECONDS,
                                    data: payload.data,
                                });
                                pruneGlobalCache(get().cache, DEFAULT_GLOBAL_CACHE_ENTRIES);
                                set(
                                    (s) => ({ loadingById: { ...s.loadingById, [id]: false }, loadingDetail: false }),
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
                            } finally {
                                inflightDetailRequests.delete(detailKey);
                            }
                        })();

                        inflightDetailRequests.set(detailKey, promise);
                        return promise;
                    },

                    // Create: invalidate list canonical buffers and cache returned detail
                    async createEmployee(payload) {
                        set({ lastError: null }, false, "employees/create:start");
                        try {
                            const res = await api.post<ApiResponse<EmployeeDetailDTO>>(EMP_API.CREATE, payload);
                            const body = res.data;
                            if (!body.data) {
                                throw new Error("Failed to create employee");
                            }
                            // Invalidate canonical lists (they will be refetched or merged on next request)
                            get().invalidateCacheKeyPrefix("employees:list:canonical:");
                            // Cache detail
                            const detailKey = EMPLOYEES_CACHE_KEYS.detail(body.data.id);
                            get().cache.set(detailKey, { ts: nowMs(), ttl: DEFAULT_TTL_SECONDS, data: body.data });
                            pruneGlobalCache(get().cache, DEFAULT_GLOBAL_CACHE_ENTRIES);
                            return body.data;
                        } catch (err) {
                            const message = extractErrorMessage(err);
                            set({ lastError: message }, false, "employees/create:error");
                            throw new Error(message);
                        }
                    },

                    async updateEmployee(payload) {
                        set({ lastError: null }, false, "employees/update:start");
                        try {
                            const res = await api.put<ApiResponse<EmployeeDetailDTO>>(EMP_API.UPDATE(payload.id), payload);
                            const body = res.data;
                            if (!body.data) {
                                throw new Error("Failed to update employee");
                            }
                            // Overwrite detail cache
                            const detailKey = EMPLOYEES_CACHE_KEYS.detail(body.data.id);
                            get().cache.set(detailKey, { ts: nowMs(), ttl: DEFAULT_TTL_SECONDS, data: body.data });
                            // Invalidate canonical list buffers that might include denormalized cells
                            get().invalidateCacheKeyPrefix("employees:list:canonical:");
                            pruneGlobalCache(get().cache, DEFAULT_GLOBAL_CACHE_ENTRIES);
                            return body.data;
                        } catch (err) {
                            const message = extractErrorMessage(err);
                            set({ lastError: message }, false, "employees/update:error");
                            throw new Error(message);
                        }
                    },

                    async softDeleteEmployee(id, reason) {
                        set(
                            (s) => ({
                                lastError: null,
                                loadingById: { ...s.loadingById, [id]: true },
                            }),
                            false,
                            "employees/softDelete:start"
                        );
                        try {
                            await api.patch<ApiResponse<null>>(EMP_API.SOFT_DELETE(id), { reason });

                            get().invalidateCacheKeyPrefix("employees:list:canonical:");
                            get().invalidateCacheKey(EMPLOYEES_CACHE_KEYS.detail(id));
                            set((s) => ({ loadingById: { ...s.loadingById, [id]: false } }), false, "employees/softDelete:done");
                            showToast.success("Employee deleted successfully.")
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
                            showToast.error("Employee did not deleted", message)
                            throw new Error(message);
                        }
                    },

                    async restoreEmployee({ id }: RestoreEmployeePayload) {
                        set(
                            (s) => ({
                                lastError: null,
                                loadingById: { ...s.loadingById, [id]: true },
                            }),
                            false,
                            "employees/restore:start"
                        );

                        try {
                            const res = await api.patch<ApiResponse<EmployeeDetailDTO>>(EMP_API.RESTORE(id));
                            const body = res.data;

                            if (!body?.data) {
                                throw new Error("Failed to restore employee");
                            }

                            const restored = body.data;

                            // Cache the restored employee detail
                            const detailKey = EMPLOYEES_CACHE_KEYS.detail(id as ObjectIdString);
                            get().cache.set(detailKey, {
                                ts: nowMs(),
                                ttl: DEFAULT_TTL_SECONDS,
                                data: restored,
                            });

                            // Update canonical list cache if employee exists there
                            const cacheEntries = Array.from(get().cache.entries());

                            cacheEntries.forEach(([key, entry]) => {
                                if (key.startsWith("employees:list:canonical:")) {
                                    const canonical = entry.data as CanonicalListCache;

                                    const employeeIndex = canonical.items.findIndex(item => item?.id === id);
                                    if (employeeIndex !== -1) {
                                        // Safely map the restored data to minimal EmployeeListItemDTO
                                        const user = {
                                            name: restored.user.name ?? "Restored Employee",
                                            email: restored.user.email ?? "",
                                            phone: restored.user.phone ?? "",
                                            avatar: restored.user.avatar ?? undefined,
                                        };

                                        canonical.items[employeeIndex] = {
                                            ...canonical.items[employeeIndex],
                                            id: restored.id,
                                            user,
                                            avatar: restored.avatar,
                                            status: restored.status,
                                            salary: restored.salary,
                                            currency: restored.currency,
                                            employmentType: restored.employmentType,
                                            dateOfJoining: restored.dateOfJoining,
                                            dateOfLeaving: restored.dateOfLeaving,
                                            isDeleted: restored.isDeleted,
                                            createdAt: restored.createdAt,
                                            updatedAt: restored.updatedAt,
                                        };

                                        // Update the cache entry
                                        get().cache.set(key, {
                                            ...entry,
                                            data: canonical,
                                        });
                                    }
                                }
                            });

                            // Invalidate list cache to be safe
                            get().invalidateCacheKeyPrefix("employees:list:canonical:");

                            set(
                                (s) => ({
                                    loadingById: { ...s.loadingById, [id]: false },
                                }),
                                false,
                                "employees/restore:done"
                            );

                            showToast.success("Employee successfully restored", `${restored.user.name} has been successfully restored.`)
                            return restored;
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
                            showToast.error("Employee did not restored", message)
                            throw new Error(message);
                        }
                    },

                    // Add this new method after restoreEmployee method
                    async retryEmployeeSalaryPayment(id: string) {
                        set(
                            (s) => ({
                                lastError: null,
                                loadingById: { ...s.loadingById, [id]: true },
                            }),
                            false,
                            "employees/retrySalaryPayment:start"
                        );

                        try {
                            const res = await api.post<ApiResponse<EmployeeDetailDTO>>(
                                EMP_API.RETRY_SALARY_PAYMENT(id)
                            );
                            const body = res.data;

                            if (!body?.data) {
                                throw new Error("Failed to retry salary payment");
                            }

                            const updatedEmployee = body.data;

                            // Cache the updated employee detail
                            const detailKey = EMPLOYEES_CACHE_KEYS.detail(id as ObjectIdString);
                            get().cache.set(detailKey, {
                                ts: nowMs(),
                                ttl: DEFAULT_TTL_SECONDS,
                                data: updatedEmployee,
                            });

                            // Update canonical list cache if employee exists there
                            const cacheEntries = Array.from(get().cache.entries());

                            cacheEntries.forEach(([key, entry]) => {
                                if (key.startsWith("employees:list:canonical:")) {
                                    const canonical = entry.data as CanonicalListCache;

                                    const employeeIndex = canonical.items.findIndex(item => item?.id === id);
                                    if (employeeIndex !== -1) {
                                        // Update the payment status in the list item
                                        canonical.items[employeeIndex] = {
                                            ...canonical.items[employeeIndex],
                                            currentMonthPayment: updatedEmployee.currentMonthPayment,
                                            // Update other relevant fields if needed
                                            status: updatedEmployee.status,
                                            updatedAt: updatedEmployee.updatedAt,
                                        };

                                        // Update the cache entry
                                        get().cache.set(key, {
                                            ...entry,
                                            data: canonical,
                                        });
                                    }
                                }
                            });

                            // Invalidate list cache to ensure UI updates
                            get().invalidateCacheKeyPrefix("employees:list:canonical:");

                            set(
                                (s) => ({
                                    loadingById: { ...s.loadingById, [id]: false },
                                }),
                                false,
                                "employees/retrySalaryPayment:done"
                            );

                            showToast.success(
                                "Salary payment retried successfully",
                                `Payment for ${updatedEmployee.user.name} has been retried.`
                            );
                            return updatedEmployee;
                        } catch (err) {
                            const message = extractErrorMessage(err);
                            set(
                                (s) => ({
                                    lastError: message,
                                    loadingById: { ...s.loadingById, [id]: false },
                                }),
                                false,
                                "employees/retrySalaryPayment:error"
                            );
                            showToast.error("Salary payment retry failed", message);
                            throw new Error(message);
                        }
                    },

                    async fetchEnums(force = false) {
                        const key = EMPLOYEES_CACHE_KEYS.enums;
                        const cached = get().cache.get(key);
                        if (!force && cached && !isExpired(cached)) return cached.data;
                        try {
                            const res = await api.get<ApiResponse<unknown>>(EMP_API.ENUMS);
                            const body = res.data;
                            if (!body.data) throw new Error("Failed to fetch enums");
                            get().cache.set(key, { ts: nowMs(), ttl: DEFAULT_TTL_SECONDS, data: body.data });
                            pruneGlobalCache(get().cache, DEFAULT_GLOBAL_CACHE_ENTRIES);
                            return body.data;
                        } catch (err) {
                            const message = extractErrorMessage(err);
                            set({ lastError: message }, false, "employees/fetchEnums:error");
                            throw new Error(message);
                        }
                    },

                    invalidateCacheKey: (key: string) => {
                        get().cache.delete(key);
                    },

                    // remove entries by prefix (works for canonical list keys and others)
                    invalidateCacheKeyPrefix: (prefix: string) => {
                        const keys = Array.from(get().cache.keys());
                        for (const k of keys) {
                            if (k.startsWith(prefix)) get().cache.delete(k);
                        }
                    },

                    clearCache: () => {
                        get().cache.clear();
                    },
                };
            },
            {
                name: "employees-ui-store",
                partialize: (state) => ({ ui: state.ui }),
            }
        ),
        { name: "employee.store" }
    )
);
