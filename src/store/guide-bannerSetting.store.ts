/* eslint-disable @typescript-eslint/no-unused-vars */
// src/stores/guide-bannerSetting.store.ts
import { create } from "zustand";
import { produce, enableMapSet } from "immer";
import { v4 as uuidv4 } from "uuid";

import {
    ID,
    ISODateString,
    GuideBannersStore,
    GuideBannersState,
    GuideBannerEntity,
    GuideBannerCreateDTO,
    GuideBannerUpdateDTO,
    GuideBannerQueryParams,
    RequestError,
    RequestStatus,
    OperationTracker,
    EntityRequestState,
    GUIDE_BANNER_CONSTRAINTS,
    GuideBannerListResponse,
    GuideBannerQueryCacheEntry,
    GuideBannerListMeta,
} from "../types/guide-banner-settings.types";

import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import api from "@/utils/axios";
import { showToast } from "@/components/global/showToast";

enableMapSet();

/* Main API path constant requested */
// export const URL_AFTER_API = "/mock/site-settings/guide-banners";
export const URL_AFTER_API = "/site-settings/guide-banners/v1";

/* Operation keys used by the store */
const OP_CREATE = "create";
const OP_UPDATE = "update";
const OP_PATCH = "patch";
const OP_DELETE = "delete";
const OP_FETCH_LIST = "fetchList";
const OP_FETCH_BY_ID = "fetchById";

/* Config */
const OPTIMISTIC_TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 60_000; // auto-rollback and cleanup after 60s

/* Helpers ------------------------------------------------------------------ */
function nowISO(): ISODateString {
    return new Date().toISOString();
}

const optimisticTimers = new Map<string, ReturnType<typeof setTimeout>>();

function makeEntityRequestState(
    status: RequestStatus,
    error?: RequestError | null,
    requestId?: string
): EntityRequestState {
    return {
        status,
        error: error ?? null,
        startedAt: status === RequestStatus.Pending ? nowISO() : undefined,
        finishedAt:
            status === RequestStatus.Success || status === RequestStatus.Failed ? nowISO() : undefined,
        requestId,
    };
}

/**
 * Build a full RequestError by attempting to extract structured pieces if present.
 * Keeps original extractErrorMessage usage for human message but preserves server metadata
 * when available (status, code, details, traceId).
 */
function getErrorObject(e: unknown): RequestError {
    const message = extractErrorMessage(e);
    // try to read structured pieces from axios-like shape
    // safe guarded with any casts to avoid changing types elsewhere
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyE = e as any;
    const fromResponse = anyE?.response?.data?.error || anyE?.response?.data || undefined;
    const status = anyE?.response?.status;
    const code = fromResponse?.code ?? fromResponse?.errorCode ?? undefined;
    const details = fromResponse?.details ?? undefined;
    const traceId = fromResponse?.traceId ?? undefined;

    const result: RequestError = { message };
    if (code) result.code = code;
    if (typeof status === "number") result.status = status;
    if (details) result.details = details;
    if (traceId) result.traceId = traceId;
    return result;
}

/* Normalization helpers --------------------------------------------------- */
function normalizeList(list: GuideBannerEntity[]) {
    const byId: Record<string, GuideBannerEntity> = {};
    const allIds: string[] = [];
    for (const item of list) {
        if (!item || !item._id) continue;
        const id = String(item._id);
        byId[id] = item;
        allIds.push(id);
    }
    return { byId, allIds } as { byId: Record<string, GuideBannerEntity>; allIds: string[] };
}

/* -------------------------
   Client-side order resolver
------------------------- */
function resolveGuideBannersOrderClient(
    byId: Record<string, GuideBannerEntity>,
    allIds: string[]
) {
    // Extract entities
    const banners = allIds.map((id) => byId[id]).filter(Boolean);

    // Special case: if only one banner and its order is 1, reset to 0
    if (banners.length === 1 && banners[0].order === 1) {
        banners[0] = { ...banners[0], order: 0 };
    }

    // Sort by order first, then createdAt for stability
    banners.sort(
        (a, b) =>
            (a.order ?? 0) - (b.order ?? 0) ||
            (new Date(a.createdAt ?? 0).getTime() -
                new Date(b.createdAt ?? 0).getTime())
    );

    // Reassign sequential order starting from 0
    banners.forEach((b, idx) => {
        b.order = idx;
    });

    // Update normalized structures
    const newById: Record<string, GuideBannerEntity> = {};
    const newAllIds: string[] = [];

    for (const b of banners) {
        const id = String(b._id);
        newById[id] = b;
        newAllIds.push(id);
    }

    return { byId: newById, allIds: newAllIds };
}

/* Build initial state ---------------------------------------------------- */
const initialState: GuideBannersState = {
    normalized: { byId: {}, allIds: [] },
    total: undefined,
    lastFetchedAt: undefined,
    lastQuery: null,
    listRequest: {
        status: RequestStatus.Idle,
        error: null,
        startedAt: undefined,
        finishedAt: undefined,
        requestId: undefined,
    },
    operations: {} as OperationTracker,
    optimisticRegistry: {},
    queryCache: new Map<string, GuideBannerQueryCacheEntry>(),
    isHydrated: false,
};

const QUERY_CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 60_000;

/* Query cache helpers (Map-based) -------------------------------------- */

function serializeQueryParams(p: GuideBannerQueryParams) {
    const normalized: Record<string, unknown> = {
        limit: p.limit ?? GUIDE_BANNER_CONSTRAINTS.defaultLimit,
        offset: p.offset ?? 0,
        sortBy: p.sortBy ?? "order",
        sortDir: p.sortDir ?? "asc",
        active: typeof p.active === "boolean" ? p.active : undefined,
        search: p.search ? String(p.search).trim() : undefined,
    };
    return JSON.stringify(normalized);
}

function isCacheEntryFresh(createdAt: ISODateString, ttl = QUERY_CACHE_TTL_MS) {
    return Date.now() - new Date(createdAt).getTime() <= ttl;
}

/* Small utilities for optimistic registry TTL management ----------------- */
type OptimisticEntry = { rollback: () => void; createdAt: ISODateString; timerId?: ReturnType<typeof setTimeout> };

function scheduleOptimisticCleanup(key: string, entry: OptimisticEntry, unregister: (k: string) => void) {
    // Ensure existing timer is cleared then set a new one
    if (entry.timerId) clearTimeout(entry.timerId);
    entry.timerId = setTimeout(() => {
        try {
            entry.rollback();
        } catch (_) {
            // swallow rollback errors
        } finally {
            unregister(key);
            // no toast to avoid spamming; caller may re-fetch as needed
        }
    }, OPTIMISTIC_TTL_MS);
}

/* Store implementation ---------------------------------------------------- */
export const useGuideBannersStore = create<GuideBannersStore>((set, get) => ({
    ...initialState,

    /* Actions ---------------------------------------------------------------- */

    // Get cached entry or null (also removes stale entries)
    getCachedList(key: string) {
        const entry = get().queryCache.get(key);
        if (!entry) return null;
        if (!isCacheEntryFresh(entry.createdAt)) {
            // stale: remove and return null
            set(produce((s: GuideBannersState) => { s.queryCache.delete(key); }));
            return null;
        }
        return entry;
    },

    // Set or replace cache entry
    setCachedList(key: string, data: GuideBannerEntity[], meta?: GuideBannerListMeta) {
        set(produce((s: GuideBannersState) => {
            s.queryCache.set(key, { data, meta, createdAt: nowISO() });
        }));
    },

    // Invalidate cache: if predicate omitted, clear all; otherwise remove keys whose parsed params satisfy predicate
    invalidateQueryCache(predicate?: (params: GuideBannerQueryParams) => boolean) {
        if (!predicate) {
            set(produce((s: GuideBannersState) => { s.queryCache = new Map(); }));
            return;
        }
        set(produce((s: GuideBannersState) => {
            for (const key of Array.from(s.queryCache.keys())) {
                try {
                    const params = JSON.parse(key) as GuideBannerQueryParams;
                    if (predicate(params)) s.queryCache.delete(key);
                } catch {
                    s.queryCache.delete(key);
                }
            }
        }));
    },

    // Low-level request state setters (consistent; avoids races using requestId)
    setOperationPending(operation: string, id?: ID, requestId?: string) {
        const opKey = operation;
        set(
            produce((s: GuideBannersState) => {
                // create or merge global
                s.operations[opKey] = s.operations[opKey] ?? { global: { status: RequestStatus.Idle }, byId: {} };
                s.operations[opKey].global = {
                    ...(s.operations[opKey].global ?? {}),
                    status: RequestStatus.Pending,
                    startedAt: nowISO(),
                    requestId,
                    error: null,
                };
                if (id) {
                    s.operations[opKey].byId = s.operations[opKey].byId ?? {};
                    s.operations[opKey].byId![String(id)] = makeEntityRequestState(RequestStatus.Pending, null, requestId);
                }
            })
        );
    },

    setOperationSuccess(operation: string, id?: ID, requestId?: string) {
        const opKey = operation;
        set(
            produce((s: GuideBannersState) => {
                // if requestId provided we guard against stale transitions
                const currentRequestId = s.operations[opKey]?.global?.requestId;
                if (requestId && currentRequestId && requestId !== currentRequestId) {
                    // stale, ignore
                    return;
                }
                s.operations[opKey] = s.operations[opKey] ?? { global: { status: RequestStatus.Idle }, byId: {} };
                s.operations[opKey].global = {
                    ...(s.operations[opKey].global ?? {}),
                    status: RequestStatus.Success,
                    finishedAt: nowISO(),
                    requestId,
                    error: null,
                };
                if (id && s.operations[opKey].byId) {
                    const cur = s.operations[opKey].byId![String(id)];
                    if (!cur || !requestId || cur.requestId === requestId) {
                        s.operations[opKey].byId![String(id)] = makeEntityRequestState(RequestStatus.Success, null, requestId);
                    }
                }
            })
        );
    },

    setOperationFailed(operation: string, error: RequestError, id?: ID, requestId?: string) {
        const opKey = operation;
        set(
            produce((s: GuideBannersState) => {
                // guard against stale failures
                const currentRequestId = s.operations[opKey]?.global?.requestId;
                if (requestId && currentRequestId && requestId !== currentRequestId) {
                    // stale, ignore
                    return;
                }
                s.operations[opKey] = s.operations[opKey] ?? { global: { status: RequestStatus.Idle }, byId: {} };
                s.operations[opKey].global = {
                    ...(s.operations[opKey].global ?? {}),
                    status: RequestStatus.Failed,
                    error,
                    finishedAt: nowISO(),
                    requestId,
                };
                if (id) {
                    s.operations[opKey].byId = s.operations[opKey].byId ?? {};
                    s.operations[opKey].byId![String(id)] = makeEntityRequestState(RequestStatus.Failed, error, requestId);
                }
            })
        );
    },

    clearErrors() {
        set(
            produce((s: GuideBannersState) => {
                s.listRequest.error = null;
                for (const k of Object.keys(s.operations)) {
                    if (!s.operations[k]) continue;
                    s.operations[k].global.error = null;
                    if (s.operations[k].byId) {
                        for (const id of Object.keys(s.operations[k].byId!)) {
                            s.operations[k].byId![id].error = null;
                        }
                    }
                }
            })
        );
    },

    /* Local helpers for optimistic updates ---------------------------------- */
    upsertLocal(entity: GuideBannerEntity) {
        set(
            produce((s: GuideBannersState) => {
                const id = String(entity._id);
                s.normalized.byId[id] = entity;
                if (!s.normalized.allIds.includes(id)) s.normalized.allIds.push(id);
            })
        );
    },

    removeLocal(id: ID) {
        set(
            produce((s: GuideBannersState) => {
                const key = String(id);
                delete s.normalized.byId[key];
                s.normalized.allIds = s.normalized.allIds.filter((x) => x !== key);
            })
        );
    },

    registerOptimistic(key: string, rollback: () => void) {
        // Clear existing timer
        const existingTimer = optimisticTimers.get(key);
        if (existingTimer) clearTimeout(existingTimer);

        set(
            produce((s: GuideBannersState) => {
                s.optimisticRegistry[key] = { rollback, createdAt: nowISO() };
            })
        );

        const timerId = setTimeout(() => {
            const store = get();
            const entry = store.optimisticRegistry[key];
            if (entry) {
                try {
                    entry.rollback();
                } catch (_) {
                    // swallow
                } finally {
                    store.unregisterOptimistic(key);
                }
            }
        }, OPTIMISTIC_TTL_MS);

        optimisticTimers.set(key, timerId);
    },

    unregisterOptimistic(key: string) {
        const timerId = optimisticTimers.get(key);
        if (timerId) {
            clearTimeout(timerId);
            optimisticTimers.delete(key);
        }

        set(
            produce((s: GuideBannersState) => {
                delete s.optimisticRegistry[key];
            })
        );
    },

    /* Thunks: fetchList ----------------------------------------------------- */
    async fetchList(params?: GuideBannerQueryParams) {
        const requestId = uuidv4();

        const reqParams: GuideBannerQueryParams = {
            limit: params?.limit ?? GUIDE_BANNER_CONSTRAINTS.defaultLimit,
            offset: params?.offset ?? 0,
            sortBy: params?.sortBy ?? "order",
            sortDir: params?.sortDir ?? "asc",
            active: typeof params?.active === "boolean" ? params!.active : undefined,
            search: params?.search ? String(params.search).trim() : undefined,
        };

        const key = serializeQueryParams(reqParams);

        // Try cache first
        const cached = get().getCachedList(key);
        if (cached) {
            const list = Array.isArray(cached.data) ? cached.data : [];
            const normalized = normalizeList(list);
            set(
                produce((s: GuideBannersState) => {
                    s.normalized = normalized;
                    s.total = typeof cached.meta?.total === "number" ? cached.meta!.total : list.length;
                    s.lastFetchedAt = nowISO();
                    s.lastQuery = reqParams;
                    s.listRequest = { status: RequestStatus.Success, error: null, finishedAt: nowISO(), requestId };
                    s.isHydrated = true;
                })
            );
            get().setOperationSuccess(OP_FETCH_LIST, undefined, requestId);
            return;
        }

        // Not cached or stale -> proceed with network call (existing logic)
        try {
            set(
                produce((s: GuideBannersState) => {
                    s.listRequest = { status: RequestStatus.Pending, error: null, startedAt: nowISO(), requestId };
                })
            );

            get().setOperationPending(OP_FETCH_LIST, undefined, requestId);

            const resp = await api.get<GuideBannerListResponse>(URL_AFTER_API, { params: reqParams });

            if (!resp?.data.data || typeof resp.data.data !== "object") {
                throw new Error("Invalid API response");
            }

            const data = resp.data.data as {
                data?: GuideBannerEntity[];
                meta?: { total?: number; limit?: number; offset?: number; version?: number };
            };

            const list = Array.isArray(data.data) ? data.data : [];

            // cache the server response
            get().setCachedList(key, list, data.meta);

            const normalized = normalizeList(list);

            set(
                produce((s: GuideBannersState) => {
                    s.normalized = normalized;
                    s.total = typeof data.meta?.total === "number" ? data.meta!.total : list.length;
                    s.lastFetchedAt = nowISO();
                    s.lastQuery = reqParams;
                    if (typeof data.meta?.offset === "number") {
                        s.listRequest = { ...(s.listRequest ?? {}), status: RequestStatus.Success, error: null, finishedAt: nowISO(), requestId };
                    } else {
                        s.listRequest = { status: RequestStatus.Success, error: null, finishedAt: nowISO(), requestId };
                    }
                    s.isHydrated = true;
                })
            );

            get().setOperationSuccess(OP_FETCH_LIST, undefined, requestId);
        } catch (err) {
            const error = getErrorObject(err);
            set(
                produce((s: GuideBannersState) => {
                    s.listRequest = { status: RequestStatus.Failed, error, finishedAt: nowISO(), requestId };
                })
            );
            get().setOperationFailed(OP_FETCH_LIST, error, undefined, requestId);
            showToast.error("Failed to load guide banners", error.message);
            throw error;
        }
    },


    /* Thunks: fetchById ---------------------------------------------------- */
    async fetchById(id: ID) {
        const requestId = uuidv4();
        try {
            get().setOperationPending(OP_FETCH_BY_ID, id, requestId);

            const resp = await api.get(`${URL_AFTER_API}/${encodeURIComponent(String(id))}`);
            if (!resp?.data || typeof resp.data !== "object" || !resp.data.data) {
                throw new Error("Invalid API response");
            }
            const body = resp.data as { data: GuideBannerEntity };
            const entity = body.data;
            if (!entity || !entity._id) throw new Error("Invalid entity returned");

            set(
                produce((s: GuideBannersState) => {
                    const idStr = String(entity._id);
                    s.normalized.byId[idStr] = entity;
                    if (!s.normalized.allIds.includes(idStr)) s.normalized.allIds.push(idStr);
                    s.lastFetchedAt = nowISO();
                })
            );

            get().setOperationSuccess(OP_FETCH_BY_ID, id, requestId);
            return entity;
        } catch (err) {
            const error = getErrorObject(err);
            get().setOperationFailed(OP_FETCH_BY_ID, error, id, requestId);
            showToast.error("Failed to load banner", error.message);
            throw error;
        }
    },

    /* Thunks: createBanner (optimistic by default) ------------------------- */
    async createBanner(payload: GuideBannerCreateDTO) {
        const tempId = `temp:${uuidv4()}`;
        const requestId = uuidv4();

        // optimistic entity - keep minimal valid fields but mark as placeholder by tempId
        const optimisticEntity: GuideBannerEntity = {
            _id: tempId,
            asset: payload.asset,
            alt: payload.alt ?? null,
            caption: payload.caption ?? null,
            order: payload.order ?? 0,
            active: payload.active ?? true,
            createdAt: nowISO(),
            updatedAt: nowISO(),
        };

        // apply optimistic update
        get().upsertLocal(optimisticEntity);

        // register rollback (use tempId as key)
        get().registerOptimistic(tempId, () => {
            get().removeLocal(tempId);
        });

        try {
            get().setOperationPending(OP_CREATE, tempId, requestId);

            const resp = await api.post(`${URL_AFTER_API}`, payload);
            if (!resp?.data || typeof resp.data !== "object" || !resp.data.data) {
                throw new Error("Invalid API response");
            }
            const body = resp.data as { data: GuideBannerEntity };
            const created = body.data;
            if (!created || !created._id) throw new Error("Invalid created entity");

            // replace temp with real entity (determine index at moment of replacement)
            set(
                produce((s: GuideBannersState) => {
                    const oldIndex = s.normalized.allIds.indexOf(tempId);
                    // remove temp if present
                    if (oldIndex !== -1) s.normalized.allIds.splice(oldIndex, 1);
                    delete s.normalized.byId[tempId];

                    const createdId = String(created._id);
                    s.normalized.byId[createdId] = created;

                    // insert at previous position if available, otherwise append
                    const insertAt = oldIndex === -1 ? s.normalized.allIds.length : oldIndex;
                    if (!s.normalized.allIds.includes(createdId)) s.normalized.allIds.splice(insertAt, 0, createdId);

                    // resolving order to ensure consistency
                    const result = resolveGuideBannersOrderClient(s.normalized.byId, s.normalized.allIds);
                    s.normalized.byId = result.byId;
                    s.normalized.allIds = result.allIds;

                    // update total banner number
                    s.total = s.total ?? 0 + 1;
                })
            );

            get().unregisterOptimistic(tempId);
            get().setOperationSuccess(OP_CREATE, created._id, requestId);
            // Invalidate the cache
            get().invalidateQueryCache(() => true);
            showToast.success("Guide banner created");
            return created;
        } catch (err) {
            const error = getErrorObject(err);

            // rollback optimistic update - try using registry first
            const reg = get().optimisticRegistry[tempId];
            if (reg) {
                try {
                    reg.rollback();
                } catch (_) {
                    // swallow
                }
                get().unregisterOptimistic(tempId);
            } else {
                get().removeLocal(tempId);
            }

            get().setOperationFailed(OP_CREATE, error, tempId, requestId);
            showToast.error("Failed to create guide banner", error.message);
            throw error;
        }
    },

    /* Thunks: updateBanner (replace) --------------------------------------- */
    async updateBanner(id: ID, payload: GuideBannerUpdateDTO) {
        const requestId = uuidv4();
        const stringId = String(id);

        // keep snapshot for rollback (defensive clone)
        const snapshot = get().normalized.byId[stringId] ? { ...get().normalized.byId[stringId] } : undefined;

        // optimistic apply (merge safely)
        set(
            produce((s: GuideBannersState) => {
                const cur = s.normalized.byId[stringId] ?? ({} as GuideBannerEntity);
                s.normalized.byId[stringId] = { ...(cur as GuideBannerEntity), ...payload, updatedAt: nowISO() } as GuideBannerEntity;
                if (!s.normalized.allIds.includes(stringId)) s.normalized.allIds.push(stringId);
            })
        );

        // register rollback keyed by requestId
        get().registerOptimistic(`optimistic:${requestId}`, () => {
            if (snapshot) get().upsertLocal(snapshot);
        });

        try {
            get().setOperationPending(OP_UPDATE, id, requestId);
            const resp = await api.put(`${URL_AFTER_API}/${encodeURIComponent(stringId)}`, payload);
            if (!resp?.data || typeof resp.data !== "object" || !resp.data.data) {
                throw new Error("Invalid API response");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const body = resp.data as { data: GuideBannerEntity; meta?: any };
            const updated = body.data;
            if (!updated || !updated._id) throw new Error("Invalid updated entity");

            set(
                produce((s: GuideBannersState) => {
                    s.normalized.byId[stringId] = updated;
                    // resolving order
                    if ('order' in payload && payload.order !== undefined) {
                        const result = resolveGuideBannersOrderClient(s.normalized.byId, s.normalized.allIds);
                        s.normalized.byId = result.byId;
                        s.normalized.allIds = result.allIds;
                    }
                })
            );

            // unregister optimistic keyed by requestId
            get().unregisterOptimistic(`optimistic:${requestId}`);
            get().setOperationSuccess(OP_UPDATE, id, requestId);
            // Invalidate the cache
            get().invalidateQueryCache(() => true);
            showToast.success("Guide banner saved");
            return updated;
        } catch (err) {
            const error = getErrorObject(err);
            // rollback
            const regKey = `optimistic:${requestId}`;
            const reg = get().optimisticRegistry[regKey];
            if (reg) {
                try {
                    reg.rollback();
                } catch (_) {
                    // swallow
                }
                get().unregisterOptimistic(regKey);
            } else if (snapshot) {
                get().upsertLocal(snapshot);
            }
            get().setOperationFailed(OP_UPDATE, error, id, requestId);
            showToast.error("Failed to save guide banner", error.message);
            throw error;
        }
    },

    /* Thunks: toggleActive (convenience wrapper) --------------------------- */
    async toggleActive(id: ID) {
        const stringId = String(id);
        const current = get().normalized.byId[stringId];
        if (!current) {
            const err: RequestError = { message: "Entity not found" };
            get().setOperationFailed(OP_PATCH, err, id);
            throw err;
        }

        const requestId = uuidv4();

        // Optimistic PATCH
        set(produce((s: GuideBannersState) => {
            const entity = s.normalized.byId[stringId];
            if (!entity) return;

            entity.active = !entity.active;
            entity.updatedAt = nowISO();
        }));

        get().registerOptimistic(`optimistic:${requestId}`, () => {
            get().upsertLocal(current);
        });

        try {
            get().setOperationPending(OP_PATCH, id, requestId);

            const resp = await api.patch(
                `${URL_AFTER_API}/${encodeURIComponent(stringId)}/toggle-active`
            );

            if (!resp?.data?.data) throw new Error("Invalid API response");

            const patch = resp.data.data as Partial<GuideBannerEntity>;

            // Server PATCH merge
            set(produce((s: GuideBannersState) => {
                const entity = s.normalized.byId[stringId];
                if (!entity) return;

                Object.assign(entity, patch);
            }));

            get().unregisterOptimistic(`optimistic:${requestId}`);
            get().setOperationSuccess(OP_PATCH, id, requestId);
            // Invalidate the cache
            get().invalidateQueryCache(() => true);
            showToast.success(`Guide banner ${patch.active ? "activated" : "deactivated"}`);
            return get().normalized.byId[stringId];
        } catch (err) {
            const error = getErrorObject(err);
            const regKey = `optimistic:${requestId}`;

            get().optimisticRegistry[regKey]?.rollback();
            get().unregisterOptimistic(regKey);

            get().setOperationFailed(OP_PATCH, error, id, requestId);
            showToast.error("Failed to toggle guide banner", error.message);
            throw error;
        }
    },

    /* Thunks: removeBanner ----------------------------------------------- */
    async removeBanner(id: ID) {
        const requestId = uuidv4();
        const stringId = String(id);

        // Take a snapshot for rollback
        const snapshot = get().normalized.byId[stringId] ? { ...get().normalized.byId[stringId] } : undefined;
        const indexSnapshot = get().normalized.allIds.indexOf(stringId);

        // --- Optimistic remove ---
        get().removeLocal(stringId);

        // Re-order banners after removal
        set(
            produce((s: GuideBannersState) => {
                const result = resolveGuideBannersOrderClient(s.normalized.byId, s.normalized.allIds);
                s.normalized.byId = result.byId;
                s.normalized.allIds = result.allIds;

                // Update total safely
                s.total = typeof s.total === "number" ? s.total - 1 : 0;
            })
        );

        // Register optimistic rollback
        get().registerOptimistic(`optimistic:${requestId}`, () => {
            if (!snapshot) return;
            set(
                produce((s: GuideBannersState) => {
                    // Restore entity at original index
                    s.normalized.byId[stringId] = snapshot;
                    const idx = indexSnapshot >= 0 ? Math.min(indexSnapshot, s.normalized.allIds.length) : s.normalized.allIds.length;
                    if (!s.normalized.allIds.includes(stringId)) s.normalized.allIds.splice(idx, 0, stringId);

                    // Restore total
                    s.total = typeof s.total === "number" ? s.total + 1 : 1;

                    // Reorder again for safety
                    const result = resolveGuideBannersOrderClient(s.normalized.byId, s.normalized.allIds);
                    s.normalized.byId = result.byId;
                    s.normalized.allIds = result.allIds;
                })
            );
        });

        try {
            get().setOperationPending(OP_DELETE, id, requestId);

            // Call API
            await api.delete(`${URL_AFTER_API}/${encodeURIComponent(stringId)}`);

            // Success: clear optimistic rollback **before cache invalidation**
            get().unregisterOptimistic(`optimistic:${requestId}`);
            get().setOperationSuccess(OP_DELETE, id, requestId);

            // Invalidate cache after successful deletion
            get().invalidateQueryCache(() => true);

            showToast.success("Guide banner removed");
        } catch (err) {
            const error = getErrorObject(err);

            // Rollback if API fails
            const regKey = `optimistic:${requestId}`;
            const reg = get().optimisticRegistry[regKey];
            if (reg) {
                try {
                    reg.rollback();
                } catch (_) {
                    // swallow
                }
                get().unregisterOptimistic(regKey);
            } else if (snapshot) {
                get().upsertLocal(snapshot);
            }

            get().setOperationFailed(OP_DELETE, error, id, requestId);
            showToast.error("Failed to remove guide banner", error.message);
            throw error;
        }
    }
}));
