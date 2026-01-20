// stores/useGuideSubscriptionsStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import {
    ID,
    GuideSubscriptionsApiResponse,
    GuideSubscriptionsState,
    SubscriptionTierDTO,
    SubscriptionTierMap,
    UpsertSubscriptionTierPayload,
    ValidationError,
    TierListQuery,
    SubscriptionTierApiResponse,
    QueryCacheEntry,
    CacheKey,
} from "@/types/guide-subscription-settings.types";

import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "@/components/global/showToast";

/* -------------------------
Local helper types
------------------------- */

type ServerValidationShape = { errors?: ValidationError[] };

/* -------------------------
Constants
------------------------- */

// const URL_AFTER_API = "/mock/site-settings/guide-subscriptions";
const URL_AFTER_API = "/site-settings/guide-subscriptions/v1";

const FETCH_TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 1000 * 60 * 2; // 2 minutes
const CACHE_MAX_ENTRIES = 50; // simple bound to avoid unbounded growth

/* -------------------------
Pure helpers
------------------------- */

function canonicalId(t: SubscriptionTierDTO): ID {
    return t._id as ID;
}

function buildMap(list: SubscriptionTierDTO[]): SubscriptionTierMap {
    return list.reduce<SubscriptionTierMap>((acc, t) => {
        acc[canonicalId(t)] = t;
        return acc;
    }, {});
}

function parseServerValidations(payload: unknown): ValidationError[] {
    const p = payload as ServerValidationShape | null;
    if (!p) return [];
    if (Array.isArray(p.errors)) return p.errors;
    return [];
}

/** Deterministic serializer for TierListQuery to produce stable cache keys */
export function serializeQuery(q: Partial<TierListQuery> | undefined): CacheKey {
    const normalized = {
        search: q?.search ?? "",
        onlyActive: q?.onlyActive ? "1" : "0",
        sortBy: q?.sortBy ?? "title",
        sortDir: q?.sortDir ?? "asc",
    };
    return `q:${normalized.search}|a:${normalized.onlyActive}|s:${normalized.sortBy}|d:${normalized.sortDir}`;
}

/* Sorting helper used to keep cached lists consistent with query sort */
function sortList(list: SubscriptionTierDTO[], sortBy?: TierListQuery["sortBy"], sortDir?: "asc" | "desc") {
    if (!sortBy) return list;
    const dir = sortDir === "desc" ? -1 : 1;
    return list.slice().sort((a, b) => {
        if (sortBy === "title") return dir * a.title.localeCompare(b.title);
        if (sortBy === "price") return dir * (a.price - b.price);
        if (sortBy === "createdAt") {
            const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
            const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
            return dir * (ta - tb);
        }
        return 0;
    });
}

/* -------------------------
In-memory cache (module-level)
------------------------- */

const inMemoryCache: Record<CacheKey, QueryCacheEntry> = {};

/* Evict oldest entry when cache grows beyond limit */
function evictIfNeeded() {
    const keys = Object.keys(inMemoryCache);
    if (keys.length <= CACHE_MAX_ENTRIES) return;
    // find oldest by createdAt
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const k of keys) {
        try {
            const e = inMemoryCache[k];
            const t = Date.parse(e.createdAt);
            if (!Number.isNaN(t) && t < oldestTime) {
                oldestTime = t;
                oldestKey = k;
            }
        } catch {
            // ignore
        }
    }
    if (oldestKey) delete inMemoryCache[oldestKey];
}

/* Create a cache entry */
function makeCacheEntry<T>(
    key: CacheKey,
    query: TierListQuery,
    value: T,
    ttlMs = FETCH_TTL_MS,
    updatedAt?: string
): QueryCacheEntry<T> {
    return {
        key,
        query,
        value,
        createdAt: new Date().toISOString(),
        ttlMs,
        updatedAt,
    };
}

/* Check expiry */
export function isExpired(entry: QueryCacheEntry): boolean {
    const created = Date.parse(entry.createdAt);
    if (Number.isNaN(created)) return true;
    return Date.now() - created > (entry.ttlMs ?? FETCH_TTL_MS);
}

/* Get cached entry or undefined */
function getCache<T = unknown>(key: CacheKey): QueryCacheEntry<T> | undefined {
    const e = inMemoryCache[key] as QueryCacheEntry<T> | undefined;
    if (!e) return undefined;
    if (isExpired(e)) {
        delete inMemoryCache[key];
        return undefined;
    }
    return e;
}

/* Set cache and maintain eviction bound */
function setCache<T = unknown>(entry: QueryCacheEntry<T>): void {
    inMemoryCache[entry.key] = entry;
    evictIfNeeded();
}

/* Invalidate by predicate */
function invalidateCacheWhere(predicate: (entry: QueryCacheEntry) => boolean): void {
    for (const k of Object.keys(inMemoryCache)) {
        try {
            const e = inMemoryCache[k];
            if (predicate(e)) delete inMemoryCache[k];
        } catch {
            // swallow
        }
    }
}

/* Update a single cache entry in-place for an upserted tier */
function updateCacheEntryForTier(returned: SubscriptionTierDTO, newUpdatedAt?: string) {
    for (const k of Object.keys(inMemoryCache)) {
        try {
            const e = inMemoryCache[k];
            const payload = e.value as { guideSubscriptions?: SubscriptionTierDTO[] } | undefined;
            if (!payload || !Array.isArray(payload.guideSubscriptions)) continue;

            const idx = payload.guideSubscriptions.findIndex((t) => canonicalId(t) === canonicalId(returned));
            if (idx >= 0) {
                payload.guideSubscriptions[idx] = returned;
            } else {
                const q = e.query;
                if (q.onlyActive && !returned.active) {
                    // skip
                } else if (q.search && q.search.trim().length > 0) {
                    const s = q.search.toLowerCase();
                    if (returned.title.toLowerCase().includes(s) || returned.key.toLowerCase().includes(s)) {
                        payload.guideSubscriptions.push(returned);
                    }
                } else {
                    payload.guideSubscriptions.push(returned);
                }
            }

            // re-sort according to query
            payload.guideSubscriptions = sortList(payload.guideSubscriptions, e.query.sortBy, e.query.sortDir);

            e.updatedAt = newUpdatedAt ?? e.updatedAt;
            inMemoryCache[k] = e;
        } catch {
            // swallow
        }
    }
}

/* Remove tier from all cache entries */
function removeTierFromCache(id: ID, newUpdatedAt?: string) {
    for (const k of Object.keys(inMemoryCache)) {
        try {
            const e = inMemoryCache[k];
            const payload = e.value as { guideSubscriptions?: SubscriptionTierDTO[] } | undefined;
            if (!payload || !Array.isArray(payload.guideSubscriptions)) continue;
            const newList = payload.guideSubscriptions.filter((t) => canonicalId(t) !== id);
            if (newList.length !== payload.guideSubscriptions.length) {
                payload.guideSubscriptions = newList;
                // re-sort to keep consistency (though removal doesn't require it)
                payload.guideSubscriptions = sortList(payload.guideSubscriptions, e.query.sortBy, e.query.sortDir);
                e.updatedAt = newUpdatedAt ?? e.updatedAt;
                inMemoryCache[k] = e;
            }
        } catch {
            // swallow
        }
    }
}

/* -------------------------
Defensive sanitizer
------------------------- */

function sanitizeToDto(input: Partial<SubscriptionTierDTO>): SubscriptionTierDTO {
    const priceRaw = input.price as unknown;
    const price = typeof priceRaw === "string" ? priceRaw.trim() : priceRaw;
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || !isFinite(priceNum)) {
        throw new Error("Invalid price: must be a finite number");
    }

    const billingRaw = input.billingCycleDays ?? [];
    if (!Array.isArray(billingRaw) || billingRaw.length === 0) {
        throw new Error("billingCycleDays required: provide an array of positive integers (days)");
    }

    const billing = billingRaw.map((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
            throw new Error("Invalid billingCycleDays: each entry must be a positive integer (days)");
        }
        return Math.floor(n);
    });

    return {
        _id: input._id ?? "",
        key: String(input.key ?? "").trim(),
        title: String(input.title ?? "").trim(),
        price: priceNum,
        currency: input.currency ?? "USD",
        billingCycleDays: billing,
        perks: input.perks ?? [],
        active: input.active ?? true,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}

/* -------------------------
Default query
------------------------- */

const DEFAULT_QUERY: TierListQuery = {
    search: undefined,
    onlyActive: false,
    sortBy: "title",
    sortDir: "asc",
};

/* -------------------------
Store
------------------------- */

export const useGuideSubscriptionsStore = create<GuideSubscriptionsState>()(
    devtools(
        immer((set, get) => ({
            // data
            list: [],
            map: {},
            cacheIndex: {},

            // meta
            loading: false,
            saving: false,
            error: null,
            lastFetchedAt: undefined,

            // ui
            draft: null,
            validations: [],

            // query
            query: DEFAULT_QUERY,

            /* -------------------------
            fetchAll - TTL aware
            ------------------------- */
            fetchAll: async (force = false, query?: TierListQuery) => {
                const q = { ...DEFAULT_QUERY, ...(query ?? get().query) };
                const key = serializeQuery(q);
                const { loading } = get();
                if (loading) return;

                if (!force) {
                    const cached = getCache<{ guideSubscriptions: SubscriptionTierDTO[]; updatedAt?: string }>(key);
                    if (cached) {
                        const list = cached.value.guideSubscriptions ?? [];
                        set((s) => {
                            s.list = list;
                            s.map = buildMap(list);
                            s.lastFetchedAt = cached.updatedAt ?? s.lastFetchedAt;
                            s.loading = false;
                            s.error = null;
                        });
                        return;
                    }
                }

                set((s) => {
                    s.loading = true;
                    s.error = null;
                });

                try {
                    const resp = await api.get<GuideSubscriptionsApiResponse>(`${URL_AFTER_API}`);
                    if (!resp.data || !resp.data.data) throw new Error("Invalid response body.");
                    const payload = resp.data.data;
                    const list = payload.guideSubscriptions ?? [];

                    const entry = makeCacheEntry(key, q, { guideSubscriptions: list, updatedAt: payload.updatedAt }, FETCH_TTL_MS, payload.updatedAt);
                    setCache(entry);

                    set((s) => {
                        s.list = list;
                        s.map = buildMap(list);
                        s.lastFetchedAt = payload.updatedAt ?? new Date().toISOString();
                        s.loading = false;
                        s.error = null;
                    });
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set((s) => {
                        s.loading = false;
                        s.error = message;
                    });
                    showToast.error("Failed to load subscriptions", message);
                    throw new Error(message);
                }
            },

            /* -------------------------
            upsertTier - create or update single tier
            ------------------------- */
            upsertTier: async (payload: UpsertSubscriptionTierPayload) => {
                set((s) => {
                    s.saving = true;
                    s.error = null;
                    s.validations = [];
                });

                let sanitized: SubscriptionTierDTO;

                try {
                    // Convert to clean internal DTO
                    sanitized = sanitizeToDto(payload as Partial<SubscriptionTierDTO>);
                } catch (e) {
                    const msg = e instanceof Error ? e.message : "Invalid input";
                    set((s) => {
                        s.saving = false;
                        s.validations = [{ message: msg }];
                    });
                    showToast.error("Validation error", msg);
                    throw new Error(msg);
                }

                // Local validation
                const localErrors = get().validateDraft(sanitized);
                if (localErrors.length > 0) {
                    set((s) => {
                        s.saving = false;
                        s.validations = localErrors;
                    });
                    throw new Error("Validation failed");
                }

                try {
                    const hasId = Boolean(sanitized._id);
                    const url = hasId
                        ? `${URL_AFTER_API}/${encodeURIComponent(sanitized._id)}`
                        : `${URL_AFTER_API}`;

                    const method = hasId ? "put" : "post";

                    console.log("[UPSERT]", { method, url, sanitized });

                    const resp = await api[method]<SubscriptionTierApiResponse>(url, {
                        tier: sanitized,
                    });

                    if (!resp.data || !resp.data.data) {
                        throw new Error("Invalid response body.");
                    }

                    const { tier: returned, updatedAt } = resp.data.data;

                    set((s) => {
                        const id = canonicalId(returned);
                        const idx = s.list.findIndex((x) => canonicalId(x) === id);

                        if (idx >= 0) {
                            s.list[idx] = returned;
                        } else {
                            s.list.push(returned);
                        }

                        s.map = buildMap(s.list);
                        s.saving = false;
                        s.lastFetchedAt = updatedAt ?? s.lastFetchedAt;
                        s.validations = [];
                    });

                    updateCacheEntryForTier(returned, updatedAt);

                    const message = hasId
                        ? `Plan "${returned.title}" updated.`
                        : `Plan "${returned.title}" created.`;

                    showToast.success("Subscription saved", message);

                    return returned;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    const serverValidations = parseServerValidations(
                        (err as { response?: { data?: unknown } })?.response?.data
                    );

                    set((s) => {
                        s.saving = false;
                        s.error = message;
                        s.validations = serverValidations;
                    });

                    const status = (err as { response?: { status?: number } })?.response?.status;

                    if (status === 409) {
                        invalidateCacheWhere(() => true);
                        try {
                            await get().fetchAll(true);
                        } catch { }
                        showToast.warning(
                            "Conflict detected",
                            "Another admin updated settings; data refreshed."
                        );
                    } else {
                        showToast.error("Failed to save subscription", message);
                    }

                    throw new Error(message);
                }
            },

            /* -------------------------
            removeTier
            ------------------------- */
            removeTier: async (id: ID) => {
                set((s) => {
                    s.saving = true;
                    s.error = null;
                });

                const encodedId = encodeURIComponent(id);
                const prev = get().list.slice();

                set((s) => {
                    s.list = s.list.filter((t) => canonicalId(t) !== id);
                    s.map = buildMap(s.list);
                });

                try {
                    const resp = await api.delete<{ data: { updatedAt?: string } }>(`${URL_AFTER_API}/${encodedId}`);
                    const updatedAt = resp?.data?.data.updatedAt;
                    removeTierFromCache(id, updatedAt);

                    // Update store list & map
                    set((s) => {
                        s.list = s.list.filter((t) => canonicalId(t) !== id);
                        s.map = buildMap(s.list);
                        s.lastFetchedAt = updatedAt ?? s.lastFetchedAt;
                        s.saving = false;
                    });

                    showToast.success("Subscription removed", "The plan has been deleted.");
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set((s) => {
                        s.list = prev;
                        s.map = buildMap(prev);
                        s.saving = false;
                        s.error = message;
                    });
                    showToast.error("Failed to remove subscription", message);
                    throw new Error(message);
                }
            },

            /* -------------------------
            UI / helpers
            ------------------------- */
            setDraft: (d?: SubscriptionTierDTO | null) => {
                set((s) => {
                    s.draft = d ?? null;
                    s.validations = [];
                });
            },

            setQuery: (q: Partial<TierListQuery>) => {
                set((s) => {
                    s.query = { ...s.query, ...q };
                });
            },

            validateDraft: (d?: SubscriptionTierDTO | null) => {
                const target = d ?? get().draft;
                const errors: ValidationError[] = [];
                if (!target) return [];

                if (!target.key || String(target.key).trim().length === 0) {
                    errors.push({ field: "key", message: "Key is required" });
                } else if (!/^[a-z0-9-_]+$/i.test(target.key)) {
                    errors.push({ field: "key", message: "Key must be alphanumeric, dash or underscore" });
                }

                if (!target.title || String(target.title).trim().length === 0) {
                    errors.push({ field: "title", message: "Title is required" });
                }

                if (target.price === undefined || target.price === null || Number.isNaN(Number(target.price))) {
                    errors.push({ field: "price", message: "Price is required and must be a number" });
                } else if (!isFinite(Number(target.price)) || Number(target.price) < 0) {
                    errors.push({ field: "price", message: "Price must be a finite number >= 0" });
                }

                if (!Array.isArray(target.billingCycleDays) || target.billingCycleDays.length === 0) {
                    errors.push({ field: "billingCycleDays", message: "At least one billing cycle is required" });
                } else if (target.billingCycleDays.some((v) => !Number.isInteger(Number(v)) || Number(v) <= 0)) {
                    errors.push({ field: "billingCycleDays", message: "Billing cycles must be positive integers (days)" });
                }

                set((s) => {
                    s.validations = errors;
                });

                return errors;
            },

            clearError: () => {
                set((s) => {
                    s.error = null;
                    s.validations = [];
                });
            },
        }))
    )
);

export default useGuideSubscriptionsStore;