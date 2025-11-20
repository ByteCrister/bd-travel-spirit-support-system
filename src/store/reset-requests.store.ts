// src/stores/reset-requests.store.ts
import { create } from "zustand";
import { produce, enableMapSet } from "immer";
import qs from "qs";

import {
    ResetRequestId,
    ResetPasswordRequestDTO,
    ResetRequestListQuery,
    ResetRequestListResponse,
    ResetRequestEntityMap,
    PagedCacheEntry,
    ResetRequestsStoreState,
    ApiErrorShape,
} from "@/types/password-reset.types";

import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";
import { showToast } from "@/components/global/showToast";

enableMapSet();

/* ---------------------- Constants & Defaults ----------------------------- */

const URL_AFTER_API = "/mock/reset-password-requests"

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/* ---------------------- Helper utilities (typed) ------------------------- */

/** Canonical stable key for a query object (sorted keys) */
function canonicalQueryKey(q: ResetRequestListQuery | undefined): string {
    const normalized: ResetRequestListQuery = {
        search: q?.search ?? undefined,
        status: q?.status ?? undefined,
        sortBy: q?.sortBy ?? undefined,
        sortDir: q?.sortDir ?? undefined,
        page: q?.page ?? DEFAULT_PAGE,
        limit: q?.limit ?? DEFAULT_LIMIT,
        filters: q?.filters ?? undefined,
    };

    // Use encoded form to avoid collisions due to special characters
    return qs.stringify(normalized, { sort: (a, b) => a.localeCompare(b), encode: true });
}

/** Convert server DTO list response into normalized entities and PagedCacheEntry */
function normalizeListResponse(
    res: ResetRequestListResponse,
    query: ResetRequestListQuery
): { entities: ResetRequestEntityMap; pageEntry: PagedCacheEntry } {
    const entities: ResetRequestEntityMap = {};
    const ids: ResetRequestId[] = res.data.map((d) => {
        const id = d._id;
        entities[id] = { id, attributes: d };
        return id;
    });

    const page = res.meta.page ?? query.page ?? DEFAULT_PAGE;
    const limit = res.meta.limit ?? query.limit ?? DEFAULT_LIMIT;

    const pageEntry: PagedCacheEntry = {
        query: { ...query },
        ids,
        fetchedAt: Date.now(),
        total: res.meta.total,
        page,
        limit,
    };

    return { entities, pageEntry };
}

/* ------------------------ Zustand store implementation -------------------- */

export const useResetRequestsStore = create<ResetRequestsStoreState>((set, get) => {
    const initialQuery: ResetRequestListQuery = { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT };

    return {
        /* State */
        entities: {},
        queryCache: {},
        currentQuery: initialQuery,
        currentPageIds: [],
        loading: false,
        isFetching: false,
        isFetchingById: false,
        revalidating: false, // indicates background revalidation while cached data is shown
        error: null,
        lastFetchedAt: undefined,

        /* Actions */

        setQuery: (partial) => {
            set(
                produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                    s.currentQuery = { ...s.currentQuery, ...partial };
                })
            );
        },

        fetchList: async (query) => {
            const effectiveQuery = { ...get().currentQuery, ...(query ?? {}) };
            effectiveQuery.page = effectiveQuery.page ?? DEFAULT_PAGE;
            effectiveQuery.limit = effectiveQuery.limit ?? DEFAULT_LIMIT;

            const queryKey = canonicalQueryKey(effectiveQuery);
            const cached = get().queryCache[queryKey];

            if (cached) {
                // Serve cached ids immediately and mark revalidating (non-blocking)
                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        s.currentQuery = effectiveQuery;
                        s.currentPageIds = cached.ids;
                        s.revalidating = true; // background revalidation
                        s.loading = false; // not blocking
                        s.error = null;
                    })
                );
            } else {
                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        s.isFetching = true;
                        s.revalidating = false;
                        s.error = null;
                        s.currentQuery = effectiveQuery;
                        s.currentPageIds = [];
                    })
                );
            }

            try {
                // IMPORTANT: enforce filters precedence so explicit fields win
                // - spread filters first, then explicit fields (explicit fields override)
                const params = {
                    ...(effectiveQuery.filters ?? {}),
                    search: effectiveQuery.search,
                    status: effectiveQuery.status,
                    sortBy: effectiveQuery.sortBy,
                    sortDir: effectiveQuery.sortDir,
                    page: effectiveQuery.page,
                    limit: effectiveQuery.limit,
                };

                const resp = await api.get<ResetRequestListResponse>(URL_AFTER_API, { params });
                const { entities, pageEntry } = normalizeListResponse(resp.data, effectiveQuery);

                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        // merge entities efficiently
                        Object.assign(s.entities, entities);

                        // cache page entry
                        s.queryCache[queryKey] = pageEntry;

                        // set visible ids
                        s.currentPageIds = pageEntry.ids;
                        s.isFetching = false;
                        s.revalidating = false;
                        s.error = null;
                        s.lastFetchedAt = Date.now();
                    })
                );
            } catch (err) {
                const message = extractErrorMessage(err);
                const apiErr: ApiErrorShape = { message };

                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        s.isFetching = false;
                        s.revalidating = false;
                        s.error = apiErr;
                    })
                );

                showToast.error("Failed to load requests", message);
                throw apiErr;
            }
        },

        fetchById: async (id) => {
            set(
                produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                    s.isFetchingById = true;
                    s.error = null;
                    s.revalidating = false;
                })
            );

            try {
                const resp = await api.get<{ data: ResetPasswordRequestDTO }>(`${URL_AFTER_API}/${id}`);
                const dto = resp.data.data;

                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        s.entities[dto._id] = { id: dto._id, attributes: dto };
                        s.isFetchingById = false;
                        s.revalidating = false;
                        s.error = null;
                        s.lastFetchedAt = Date.now();
                    })
                );

                return;
            } catch (err) {
                const message = extractErrorMessage(err);
                const apiErr: ApiErrorShape = { message };

                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        s.isFetchingById = false;
                        s.revalidating = false;
                        s.error = apiErr;
                    })
                );

                showToast.error("Failed to fetch request", message);
                throw apiErr;
            }
        },

        denyRequest: async (payload) => {
            set(
                produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                    s.loading = true;
                    s.revalidating = false;
                    s.error = null;
                })
            );

            try {
                const resp = await api.post<{ data: ResetPasswordRequestDTO }>(
                    `${URL_AFTER_API}/${payload.requestId}/deny`,
                    { reason: payload.reason }
                );
                const dto = resp.data.data;

                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        s.entities[dto._id] = { id: dto._id, attributes: dto }; // corrected assignment below in note
                        s.loading = false;
                        s.revalidating = false;
                        s.error = null;
                        s.lastFetchedAt = Date.now();
                    })
                );

                showToast.info("Request denied", "The request has been marked as denied");
                return dto;
            } catch (err) {
                const message = extractErrorMessage(err);
                const apiErr: ApiErrorShape = { message };

                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        s.loading = false;
                        s.revalidating = false;
                        s.error = apiErr;
                    })
                );

                showToast.error("Deny request failed", message);
                throw apiErr;
            }
        },

        updatePassword: async (payload) => {
            set(
                produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                    s.loading = true;
                    s.revalidating = false;
                    s.error = null;
                })
            );

            try {
                // body intentionally names the field newPassword so intent is explicit
                const body = {
                    newPassword: payload.newPassword,
                    notifyRequester: payload.notifyRequester ?? false,
                };

                const resp = await api.post<{ data: ResetPasswordRequestDTO }>(
                    `${URL_AFTER_API}/${payload.requestId}/update-password`,
                    body
                );

                const dto = resp.data.data;

                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        // update cached entity (do NOT store the password)
                        s.entities[dto._id] = { id: dto._id, attributes: dto };

                        // Invalidate listing caches to reflect status/order changes if any
                        s.queryCache = {};

                        s.loading = false;
                        s.revalidating = false;
                        s.error = null;
                        s.lastFetchedAt = Date.now();
                    })
                );

                showToast.success("Password updated", "Password has been updated for the requester");

                return dto;
            } catch (err) {
                const message = extractErrorMessage(err);
                const apiErr: ApiErrorShape = { message };

                set(
                    produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                        s.loading = false;
                        s.revalidating = false;
                        s.error = apiErr;
                    })
                );

                showToast.error("Update password failed", message);

                throw apiErr;
            }
        },

        invalidateQueryCache: (queryKey) => {
            set(
                produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                    if (!queryKey) {
                        s.queryCache = {};
                        return;
                    }
                    if (s.queryCache[queryKey]) {
                        delete s.queryCache[queryKey];
                    }
                })
            );
        },

        clearAll: () => {
            set(
                produce((s: ResetRequestsStoreState & { revalidating?: boolean }) => {
                    s.entities = {};
                    s.queryCache = {};
                    s.currentQuery = initialQuery;
                    s.currentPageIds = [];
                    s.loading = false;
                    s.revalidating = false;
                    s.error = null;
                    s.lastFetchedAt = undefined;
                })
            );
        },
    };
});