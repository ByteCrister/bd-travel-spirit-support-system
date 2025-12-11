// src/stores/guide-banners.store.ts
import { create } from "zustand";
import { produce, enableMapSet } from "immer";
import type { AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";

import {
    ID,
    ISODateString,
    GuideBannersStore,
    GuideBannersState,
    GuideBannerEntity,
    GuideBannerCreateDTO,
    GuideBannerUpdateDTO,
    GuideBannerPatchOperation,
    GuideBannerQueryParams,
    RequestError,
    RequestStatus,
    OperationTracker,
    EntityRequestState,
    GUIDE_BANNER_CONSTRAINTS,
} from "../types/guide-banner-settings.types";

import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import api from "@/utils/axios";
import { showToast } from "@/components/global/showToast";

enableMapSet();

/* Main API path constant requested */
export const URL_AFTER_API = "/mock/site-settings/guide-banners";

/* Operation keys used by the store */
const OP_CREATE = "create";
const OP_UPDATE = "update";
const OP_PATCH = "patch";
const OP_DELETE = "delete";
const OP_REORDER = "reorder";
const OP_FETCH_LIST = "fetchList";
const OP_FETCH_BY_ID = "fetchById";

/* Config */
const OPTIMISTIC_TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 60_000; // auto-rollback and cleanup after 60s

/* Helpers ------------------------------------------------------------------ */
function nowISO(): ISODateString {
    return new Date().toISOString();
}

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
    isHydrated: false,
};

/* Small utilities for optimistic registry TTL management ----------------- */
type OptimisticEntry = { rollback: () => void; createdAt: ISODateString; timerId?: ReturnType<typeof setTimeout> };

function scheduleOptimisticCleanup(key: string, entry: OptimisticEntry, unregister: (k: string) => void) {
    // Ensure existing timer is cleared then set a new one
    if (entry.timerId) clearTimeout(entry.timerId);
    entry.timerId = setTimeout(() => {
        try {
            entry.rollback();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        set(
            produce((s: GuideBannersState) => {
                // create entry and schedule cleanup
                const entry: OptimisticEntry = { rollback, createdAt: nowISO() };
                s.optimisticRegistry[key] = { rollback: entry.rollback, createdAt: entry.createdAt };
                // schedule local timer outside produce to avoid closure issues (we'll schedule after set)
            })
        );
        // schedule timer (use get().unregisterOptimistic to clear)
        const entryForTimer: OptimisticEntry = { rollback, createdAt: nowISO() };
        scheduleOptimisticCleanup(key, entryForTimer, (k) => {
            // call store's unregisterOptimistic to remove registry entry
            get().unregisterOptimistic(k);
        });
    },

    unregisterOptimistic(key: string) {
        set(
            produce((s: GuideBannersState) => {
                delete s.optimisticRegistry[key];
            })
        );
    },

    /* Thunks: fetchList ----------------------------------------------------- */
    async fetchList(params?: GuideBannerQueryParams) {
        const requestId = uuidv4();

        // sanitize and build request params with sensible defaults
        const reqParams: GuideBannerQueryParams = {
            limit: params?.limit ?? GUIDE_BANNER_CONSTRAINTS.defaultLimit,
            offset: params?.offset ?? 0,
            sortBy: params?.sortBy ?? "order",
            sortDir: params?.sortDir ?? "asc",
            active: typeof params?.active === "boolean" ? params!.active : undefined,
            search: params?.search ? String(params.search).trim() : undefined,
        };

        try {
            // set list-level pending
            set(
                produce((s: GuideBannersState) => {
                    s.listRequest = { status: RequestStatus.Pending, error: null, startedAt: nowISO(), requestId };
                })
            );

            get().setOperationPending(OP_FETCH_LIST, undefined, requestId);

            // forward reqParams to API
            const resp: AxiosResponse = await api.get(URL_AFTER_API, { params: reqParams });

            // defensive shape checking
            if (!resp?.data || typeof resp.data !== "object") {
                throw new Error("Invalid API response");
            }

            const data = resp.data as {
                data?: GuideBannerEntity[];
                meta?: { total?: number; limit?: number; offset?: number; version?: number };
            };

            const list = Array.isArray(data.data) ? data.data : [];
            const normalized = normalizeList(list);

            set(
                produce((s: GuideBannersState) => {
                    s.normalized = normalized;
                    // prefer server meta when provided
                    s.total = typeof data.meta?.total === "number" ? data.meta!.total : list.length;
                    s.lastFetchedAt = nowISO();
                    s.lastQuery = reqParams;
                    // persist server offset/limit if present
                    if (typeof data.meta?.offset === "number") {
                        s.listRequest = { ...(s.listRequest ?? {}), /* keep prior fields */ status: RequestStatus.Success, error: null, finishedAt: nowISO(), requestId };
                        // nothing else required, client component should read lastQuery for offset/limit if needed
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

            const resp = await api.post(URL_AFTER_API, payload);
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

                    // update total/version if provided by meta (safe guard)
                    // meta handling left to caller or list fetch; if response returns meta it can be applied here
                })
            );

            get().unregisterOptimistic(tempId);
            get().setOperationSuccess(OP_CREATE, created._id, requestId);
            showToast.success("Guide banner created");
            return created;
        } catch (err) {
            const error = getErrorObject(err);

            // rollback optimistic update - try using registry first
            const reg = get().optimisticRegistry[tempId];
            if (reg) {
                try {
                    reg.rollback();
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                })
            );

            // unregister optimistic keyed by requestId
            get().unregisterOptimistic(`optimistic:${requestId}`);
            get().setOperationSuccess(OP_UPDATE, id, requestId);
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
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    /* Thunks: patchBanner (small partial updates) --------------------------- */
    async patchBanner(id: ID, ops: GuideBannerPatchOperation[]) {
        const requestId = uuidv4();
        const stringId = String(id);
        const snapshot = get().normalized.byId[stringId] ? { ...get().normalized.byId[stringId] } : undefined;

        // build optimistic mutated entity from ops
        const optimistic = produce(snapshot ?? ({} as GuideBannerEntity), (draft: Partial<GuideBannerEntity>) => {
            for (const op of ops) {
                if (op.path === "/active" && op.op === "set") draft.active = Boolean(op.value);
                if (op.path === "/order" && op.op === "set") draft.order = Number(op.value);
                if ((op.path === "/caption" || op.path === "/alt") && op.op === "replace") {
                    if (op.path === "/caption") draft.caption = op.value as string | null;
                    if (op.path === "/alt") draft.alt = op.value as string | null;
                }
                if (op.path === "/asset" && op.op === "replace") draft.asset = op.value as ID;
            }
            draft.updatedAt = nowISO();
        });

        // optimistic apply
        set(
            produce((s: GuideBannersState) => {
                s.normalized.byId[stringId] = optimistic as GuideBannerEntity;
            })
        );

        // register rollback keyed by requestId
        get().registerOptimistic(`optimistic:${requestId}`, () => {
            if (snapshot) get().upsertLocal(snapshot);
        });

        try {
            get().setOperationPending(OP_PATCH, id, requestId);
            const resp = await api.patch(`${URL_AFTER_API}/${encodeURIComponent(stringId)}`, { ops });
            if (!resp?.data || typeof resp.data !== "object" || !resp.data.data) {
                throw new Error("Invalid API response");
            }
            const body = resp.data as { data: GuideBannerEntity };
            const updated = body.data;
            if (!updated || !updated._id) throw new Error("Invalid updated entity");

            set(
                produce((s: GuideBannersState) => {
                    s.normalized.byId[stringId] = updated;
                })
            );

            get().unregisterOptimistic(`optimistic:${requestId}`);
            get().setOperationSuccess(OP_PATCH, id, requestId);
            showToast.success("Guide banner updated");
            return updated;
        } catch (err) {
            const error = getErrorObject(err);
            const regKey = `optimistic:${requestId}`;
            const reg = get().optimisticRegistry[regKey];
            if (reg) {
                try {
                    reg.rollback();
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (_) {
                    // swallow
                }
                get().unregisterOptimistic(regKey);
            } else if (snapshot) {
                get().upsertLocal(snapshot);
            }
            get().setOperationFailed(OP_PATCH, error, id, requestId);
            showToast.error("Failed to update guide banner", error.message);
            throw error;
        }
    },

    /* Thunks: toggleActive (convenience wrapper) --------------------------- */
    async toggleActive(id: ID) {
        const current = get().normalized.byId[String(id)];
        if (!current) {
            const err: RequestError = { message: "Entity not found" };
            get().setOperationFailed(OP_PATCH, err, id);
            throw err;
        }
        return get().patchBanner(id, [{ op: "set", path: "/active", value: !current.active }]);
    },

    /* Thunks: removeBanner ----------------------------------------------- */
    async removeBanner(id: ID) {
        const requestId = uuidv4();
        const stringId = String(id);
        const snapshot = get().normalized.byId[stringId] ? { ...get().normalized.byId[stringId] } : undefined;

        // optimistic remove - capture index so rollback restores position
        const indexSnapshot = get().normalized.allIds.indexOf(stringId);
        get().removeLocal(stringId);

        get().registerOptimistic(`optimistic:${requestId}`, () => {
            if (snapshot) {
                set(
                    produce((s: GuideBannersState) => {
                        // restore entity and insert at previous index
                        s.normalized.byId[stringId] = snapshot;
                        const idx = indexSnapshot >= 0 ? Math.min(indexSnapshot, s.normalized.allIds.length) : s.normalized.allIds.length;
                        if (!s.normalized.allIds.includes(stringId)) s.normalized.allIds.splice(idx, 0, stringId);
                    })
                );
            }
        });

        try {
            get().setOperationPending(OP_DELETE, id, requestId);
            await api.delete(`${URL_AFTER_API}/${encodeURIComponent(stringId)}`);
            get().unregisterOptimistic(`optimistic:${requestId}`);
            get().setOperationSuccess(OP_DELETE, id, requestId);
            showToast.success("Guide banner removed");
        } catch (err) {
            const error = getErrorObject(err);
            const regKey = `optimistic:${requestId}`;
            const reg = get().optimisticRegistry[regKey];
            if (reg) {
                try {
                    reg.rollback();
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (_) {
                    // swallow
                }
                get().unregisterOptimistic(regKey);
            } else if (snapshot) {
                // fallback restore
                get().upsertLocal(snapshot);
            }
            get().setOperationFailed(OP_DELETE, error, id, requestId);
            showToast.error("Failed to remove guide banner", error.message);
            throw error;
        }
    },

    /* Thunks: reorder (persist full order) ------------------------------- */
    async reorder(orderedIds: ID[]) {
        const requestId = uuidv4();
        const stringIds = orderedIds.map(String);

        // snapshot ids to allow safe rollback
        const snapshotIds = [...get().normalized.allIds];

        // optimistic reorder locally (do not create placeholder entities)
        set(
            produce((s: GuideBannersState) => {
                s.normalized.allIds = stringIds;
            })
        );

        get().registerOptimistic(`optimistic:${requestId}`, () => {
            set(
                produce((s: GuideBannersState) => {
                    s.normalized.allIds = snapshotIds;
                })
            );
        });

        try {
            get().setOperationPending(OP_REORDER, undefined, requestId);
            const resp = await api.post(`${URL_AFTER_API}/reorder`, { orderedIds: stringIds });
            if (!resp?.data || typeof resp.data !== "object" || !resp.data.data) {
                throw new Error("Invalid API response");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const body = resp.data as { data: GuideBannerEntity[]; meta?: any };
            const updatedList = Array.isArray(body.data) ? body.data : [];

            // apply server truth; defensive normalizeList ensures only valid items are applied
            const normalized = normalizeList(updatedList);
            set(
                produce((s: GuideBannersState) => {
                    // merge server truth for byId preserving any local unknown entries
                    s.normalized.byId = { ...(s.normalized.byId ?? {}), ...(normalized.byId ?? {}) };
                    s.normalized.allIds = normalized.allIds;
                    s.lastFetchedAt = nowISO();
                    if (typeof body.meta?.total === "number") s.total = body.meta.total;
                })
            );

            get().unregisterOptimistic(`optimistic:${requestId}`);
            get().setOperationSuccess(OP_REORDER, undefined, requestId);
            showToast.success("Banners reordered");
            return updatedList;
        } catch (err) {
            const error = getErrorObject(err);
            const regKey = `optimistic:${requestId}`;
            const reg = get().optimisticRegistry[regKey];
            if (reg) {
                try {
                    reg.rollback();
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (_) {
                    // swallow
                }
                get().unregisterOptimistic(regKey);
            } else {
                // fallback restore
                set(
                    produce((s: GuideBannersState) => {
                        s.normalized.allIds = snapshotIds;
                    })
                );
            }
            get().setOperationFailed(OP_REORDER, error, undefined, requestId);
            showToast.error("Failed to reorder banners", error.message);
            throw error;
        }
    },
}));
