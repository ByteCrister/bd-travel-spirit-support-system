// stores/ad.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce, enableMapSet } from "immer";
import {
  AdvertisementResponse,
  AdvertisementOverview,
  AdListQuery,
  ApiResponse,
  PaginatedResponse,
  AsyncMeta,
  AdminAdsActions,
  AdminAdsState,
  normalizeQueryKey,
  AdvertisementAdminActionDTO,
  FilterState,
} from "@/types/advertising.types";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";
import api from "@/utils/api/axios";
enableMapSet();

const URL_AFTER_API = "/mock/ads";
const CACHE_TTL = Number(process.env.NEXT_PUBLIC_CACHE_TTL ?? 60000); // ms

type InternalCacheList = {
  key: string;
  items: AdvertisementResponse[]; // ordered list for UI slicing
  pagination: { page: number; limit: number; total: number; pages: number };
  lastFetchedAt?: string | null;
  fetchedPages: Set<number>;
};

interface Store extends AdminAdsState, AdminAdsActions {
  _cacheLists: Record<string, InternalCacheList | undefined>;
}

const initialAsyncMeta = (): AsyncMeta => ({
  loading: false,
  error: null,
  lastFetchedAt: null,
});

function nowIso() {
  return new Date().toISOString();
}

/**
 * Runs an API call that returns ApiResponse<T> and resolves to T or throws an extracted error.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function commonRequest<T>(fn: () => Promise<any>) {
  try {
    let res = await fn();

    // If caller passed an AxiosResponse, unwrap its .data
    if (res && typeof res === "object" && "data" in res) {
      res = res.data;
    }

    // Now res should be the ApiResponse<T> envelope
    if (!res?.ok) {
      throw new Error(res?.error?.message ?? "API error");
    }

    return res.data as T;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

/**
 * Merge helper: append incoming unique items (by id) to existing while preserving order.
 * If append === false, incoming items are placed before existing (useful for prepend semantics).
 */
function mergeUniqueById(
  existing: AdvertisementResponse[],
  incoming: AdvertisementResponse[],
  append = true
): AdvertisementResponse[] {
  const seen = new Set<string>();
  const out: AdvertisementResponse[] = [];
  if (!append) {
    for (const it of incoming) {
      if (!seen.has(it.id)) {
        out.push(it);
        seen.add(it.id);
      }
    }
    for (const it of existing) {
      if (!seen.has(it.id)) {
        out.push(it);
        seen.add(it.id);
      }
    }
  } else {
    for (const it of existing) {
      if (!seen.has(it.id)) {
        out.push(it);
        seen.add(it.id);
      }
    }
    for (const it of incoming) {
      if (!seen.has(it.id)) {
        out.push(it);
        seen.add(it.id);
      }
    }
  }
  return out;
}

/**
 * Module-level maps for in-flight tracking and ad->list-key index.
 * These are intentionally not stored in Zustand persistence.
 */
const inFlightFetches = new Map<
  string,
  Promise<ApiResponse<PaginatedResponse<AdvertisementResponse>>>
>();
const adIdToListKeys = new Map<string, Set<string>>();

/**
 * Helper to register ad ids into adIdToListKeys index.
 */
function indexAdsForKey(key: string, items: AdvertisementResponse[]) {
  for (const ad of items) {
    let s = adIdToListKeys.get(ad.id);
    if (!s) {
      s = new Set();
      adIdToListKeys.set(ad.id, s);
    }
    s.add(key);
  }
}

/**
 * Helper to remove an ad id from all list keys (used on delete)
 */
function removeAdFromAllIndexedLists(state: Store, adId: string) {
  const keys = adIdToListKeys.get(adId);
  if (!keys) return;
  for (const key of keys) {
    const internal = state._cacheLists[key];
    if (!internal) continue;
    internal.items = internal.items.filter((it) => it.id !== adId);
    internal.fetchedPages = new Set(Array.from(internal.fetchedPages)); // keep set shape
  }
  adIdToListKeys.delete(adId);
}

/**
 * Helper to update ad across all cached lists and cache.byId
 */
function updateAdInAllLists(state: Store, ad: AdvertisementResponse) {
  const keys = adIdToListKeys.get(ad.id);
  if (keys) {
    for (const key of keys) {
      const internal = state._cacheLists[key];
      if (!internal) continue;
      const idx = internal.items.findIndex((it) => it.id === ad.id);
      if (idx >= 0) {
        internal.items[idx] = ad;
      } else {
        // Keep ordering: put updated ad at front so recent changes are visible,
        // but avoid creating duplicates (mergeUniqueById below ensures uniqueness when used)
        internal.items = mergeUniqueById(internal.items, [ad], false);
      }
    }
  }
  // Always ensure cache.byId has the latest
  state.cache.byId[ad.id] = {
    ad,
    meta: { loading: false, error: null, lastFetchedAt: nowIso() },
  };
  // Ensure index references exist for this ad and any active listKey
  const listKey = state.cache.listKey;
  if (listKey) {
    let s = adIdToListKeys.get(ad.id);
    if (!s) {
      s = new Set();
      adIdToListKeys.set(ad.id, s);
    }
    s.add(listKey);
  }
}

const useAdsStore = create<Store>()(
  persist(
    (set, get) => ({
      // state
      list: [],
      listMeta: {
        loading: false,
        error: null,
        lastFetchedAt: null,
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      },
      listQuery: { page: 1, limit: 20 },
      activeAd: null,
      activeAdMeta: initialAsyncMeta(),
      overview: null,
      overviewMeta: initialAsyncMeta(),
      adminActionMeta: {},
      deletionMeta: {},
      selection: {
        selectedIds: [],
        toggle(id: string) {
          const s = get().selection;
          const exists = s.selectedIds.includes(id);
          set(
            produce((state: Store) => {
              const idx = state.selection.selectedIds.indexOf(id);
              if (exists && idx >= 0)
                state.selection.selectedIds.splice(idx, 1);
              if (!exists) state.selection.selectedIds.push(id);
            }) as unknown as (s: Store) => Store
          );
        },
        set(ids: string[]) {
          set(
            produce((state: Store) => {
              state.selection.selectedIds = ids;
            }) as unknown as (s: Store) => Store
          );
        },
        clear() {
          set(
            produce((state: Store) => {
              state.selection.selectedIds = [];
            }) as unknown as (s: Store) => Store
          );
        },
        has(id: string) {
          return get().selection.selectedIds.includes(id);
        },
      },
      filters: {
        q: "",
        status: [],
        placements: [],
        dateRange: null,
        reset() {
          set(
            produce((state: Store) => {
              state.filters.q = "";
              state.filters.status = [];
              state.filters.placements = [];
              state.filters.dateRange = null;
            }) as unknown as (s: Store) => Store
          );
        },
      },
      columns: [],
      cache: { byId: {}, listKey: null, overviewKey: null },
      _cacheLists: {},

      // actions
      setQuery(q: Partial<AdListQuery>) {
        set(
          produce((state: Store) => {
            state.listQuery = { ...state.listQuery, ...q };
            if (q.page !== undefined) state.listMeta.pagination.page = q.page;
            if (q.limit !== undefined)
              state.listMeta.pagination.limit = q.limit;
          }) as unknown as (s: Store) => Store
        );
      },

      setPage(p: number) {
        get().setQuery({ page: p });
      },

      setLimit(l: number) {
        get().setQuery({ limit: l });
      },

      setFilters(f: Partial<FilterState>) {
        set(
          produce((state: Store) => {
            state.filters = { ...state.filters, ...f };
          }) as unknown as (s: Store) => Store
        );
      },

      clearFilters() {
        set(
          produce((state: Store) => {
            state.filters.q = "";
            state.filters.status = [];
            state.filters.placements = [];
            state.filters.dateRange = null;
          }) as unknown as (s: Store) => Store
        );
      },

      setActiveAd(ad: AdvertisementResponse | null) {
        set(
          produce((state: Store) => {
            state.activeAd = ad;
          }) as unknown as (s: Store) => Store
        );
      },

      writeAdToCache(ad: AdvertisementResponse) {
        set(
          produce((state: Store) => {
            state.cache.byId[ad.id] = { ad, meta: initialAsyncMeta() };
            // update index
            let s = adIdToListKeys.get(ad.id);
            if (!s) {
              s = new Set();
              adIdToListKeys.set(ad.id, s);
            }
            const listKey = state.cache.listKey;
            if (listKey) s.add(listKey);
          }) as unknown as (s: Store) => Store
        );
      },

      writeListToCache(
        list: AdvertisementResponse[],
        key: string,
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        }
      ) {
        const now = nowIso();
        set(
          produce((state: Store) => {
            state.list = list;
            state.listMeta.pagination = pagination;
            state.listMeta.lastFetchedAt = now;
            state.cache.listKey = key;
            for (const ad of list) {
              state.cache.byId[ad.id] = { ad, meta: initialAsyncMeta() };
            }
            state._cacheLists[key] = {
              key,
              items: list.slice(),
              pagination,
              lastFetchedAt: now,
              fetchedPages: new Set([pagination.page]),
            };
            // index all ads to this key
            indexAdsForKey(key, list);
          }) as unknown as (s: Store) => Store
        );
      },

      clearCache() {
        set(
          produce((state: Store) => {
            state.cache.byId = {};
            state.list = [];
            state._cacheLists = {};
            state.cache.listKey = null;
            state.cache.overviewKey = null;
            state.listMeta = {
              loading: false,
              error: null,
              lastFetchedAt: null,
              pagination: { page: 1, limit: 20, total: 0, pages: 0 },
            };
          }) as unknown as (s: Store) => Store
        );
        adIdToListKeys.clear();
        inFlightFetches.clear();
      },

      setMetaForList(meta: AsyncMeta) {
        set(
          produce((state: Store) => {
            state.listMeta = { ...state.listMeta, ...meta };
          }) as unknown as (s: Store) => Store
        );
      },

      setMetaForAd(id: string, meta: AsyncMeta) {
        set(
          produce((state: Store) => {
            const entry = state.cache.byId[id];
            if (entry) entry.meta = { ...entry.meta, ...meta };
            if (state.activeAd?.id === id)
              state.activeAdMeta = { ...state.activeAdMeta, ...meta };
          }) as unknown as (s: Store) => Store
        );
      },

      setMetaForOverview(meta: AsyncMeta) {
        set(
          produce((state: Store) => {
            state.overviewMeta = { ...state.overviewMeta, ...meta };
          }) as unknown as (s: Store) => Store
        );
      },

      // fetching implementations

      /**
       * Returns ApiResponse<PaginatedResponse<AdvertisementResponse>> as declared in types.
       * Behavior:
       * - Uses normalizedKey for caching.
       * - If caller explicitly provided page in query, we fetch that page (no unexpected prefetch).
       * - For infinite-load style calls (no explicit page) we prefetch next page if available.
       * - On limit changes we treat as replacement (avoid mixing different page-size schemes).
       * - Deduplicates incoming items by id.
       * - Coalesces concurrent identical requests.
       */
      async fetchList(
        query?: AdListQuery
      ): Promise<ApiResponse<PaginatedResponse<AdvertisementResponse>>> {
        const q = { ...get().listQuery, ...query };
        const normalizedKey = normalizeQueryKey(q);
        const cached = get()._cacheLists[normalizedKey];
        const now = Date.now();

        // Short-circuit: fresh cached list that satisfies requested page/limit
        if (cached && cached.lastFetchedAt) {
          const last = cached.lastFetchedAt;
          const age = last ? now - new Date(last).getTime() : Infinity;
          if (age < CACHE_TTL) {
            const requiredCount = (q.page ?? 1) * (q.limit ?? 20);
            if (cached.items.length >= requiredCount) {
              const slice = cached.items.slice(0, requiredCount);
              // reflect into store quickly
              get().writeListToCache(slice, normalizedKey, {
                page: q.page ?? 1,
                limit: q.limit ?? 20,
                total: cached.pagination.total,
                pages: cached.pagination.pages,
              });
              return {
                ok: true,
                data: {
                  items: slice,
                  total: cached.pagination.total,
                  page: q.page ?? 1,
                  limit: q.limit ?? 20,
                  pages: cached.pagination.pages,
                },
              };
            }
          }
        }

        // set loading
        set(
          produce((state: Store) => {
            state.listMeta.loading = true;
            state.listMeta.error = null;
          }) as unknown as (s: Store) => Store
        );

        try {
          const requestLimit = q.limit ?? 20;
          let requestPage = q.page ?? 1; // default to requested page if provided by caller

          // If caller did not explicitly set page (infinite-loading), we may prefetch next page
          const callerProvidedPage = query?.page !== undefined;

          const existing = get()._cacheLists[normalizedKey];

          if (existing) {
            // if limit unchanged and caller didn't provide a page, we can prefetch next page
            if (
              !callerProvidedPage &&
              existing.pagination.limit === requestLimit
            ) {
              let maxFetched = 0;
              existing.fetchedPages.forEach(
                (p) => (maxFetched = Math.max(maxFetched, p))
              );
              // fetch next page after maxFetched; if nothing fetched yet, fall back to requestPage
              requestPage = maxFetched > 0 ? maxFetched + 1 : requestPage;
            } else {
              // If caller provided page, respect it.
              // If limit changed, we will fetch the requested page and treat it as replacement below.
              requestPage = q.page ?? 1;
            }
          }

          // coalesce identical in-flight fetches for this normalized key + page + limit
          const inFlightKey = `${normalizedKey}::page=${requestPage}::limit=${requestLimit}`;
          let apiResponsePromise = inFlightFetches.get(inFlightKey) as
            | Promise<ApiResponse<PaginatedResponse<AdvertisementResponse>>>
            | undefined;

          if (!apiResponsePromise) {
            // create a wrapped promise that resolves to ApiResponse<T> (not AxiosResponse)
            const axiosPromise = api.get(`${URL_AFTER_API}`, {
              params: { ...q, page: requestPage, limit: requestLimit },
            });
            const wrapped = (async () => {
              const axiosRes = await axiosPromise; // AxiosResponse
              return axiosRes.data as ApiResponse<
                PaginatedResponse<AdvertisementResponse>
              >; // server envelope
            })();
            // register and ensure cleanup when settled
            inFlightFetches.set(inFlightKey, wrapped);
            wrapped.finally(() => inFlightFetches.delete(inFlightKey));
            apiResponsePromise = wrapped;
          }

          // Await the ApiResponse once and extract the inner payload for merging
          const apiRes = await apiResponsePromise;
          if (!apiRes.ok) throw new Error(apiRes.error?.message ?? "API error");
          const data = apiRes.data as PaginatedResponse<AdvertisementResponse>;

          // Merge into internal cache safely
          set(
            produce((state: Store) => {
              const key = normalizedKey;
              const nowIsoStr = nowIso();
              const prev = state._cacheLists[key];

              if (!prev) {
                // fresh entry
                state._cacheLists[key] = {
                  key,
                  items: data.items.slice(),
                  pagination: {
                    page: data.page,
                    limit: data.limit,
                    total: data.total,
                    pages: data.pages,
                  },
                  lastFetchedAt: nowIsoStr,
                  fetchedPages: new Set([data.page]),
                };
                // index
                indexAdsForKey(key, data.items);
              } else {
                // If limit changed, treat as replacement to avoid inconsistent mixes
                if (prev.pagination.limit !== data.limit) {
                  prev.items = data.items.slice();
                  prev.pagination = {
                    page: data.page,
                    limit: data.limit,
                    total: data.total,
                    pages: data.pages,
                  };
                  prev.lastFetchedAt = nowIsoStr;
                  prev.fetchedPages = new Set([data.page]);
                  // reindex: remove old references for items that are no longer present
                  for (const it of data.items) {
                    let s = adIdToListKeys.get(it.id);
                    if (!s) {
                      s = new Set();
                      adIdToListKeys.set(it.id, s);
                    }
                    s.add(key);
                  }
                } else {
                  // same limit
                  if (!prev.fetchedPages.has(data.page)) {
                    // Append new page but dedupe by id to avoid duplicates
                    prev.items = mergeUniqueById(prev.items, data.items, true);
                    prev.fetchedPages.add(data.page);
                    prev.pagination = {
                      page: data.page,
                      limit: data.limit,
                      total: data.total,
                      pages: data.pages,
                    };
                    prev.lastFetchedAt = nowIsoStr;
                    // index new items
                    indexAdsForKey(key, data.items);
                  } else {
                    // page already fetched; just update pagination & timestamp
                    prev.pagination = {
                      page: data.page,
                      limit: data.limit,
                      total: data.total,
                      pages: data.pages,
                    };
                    prev.lastFetchedAt = nowIsoStr;
                    // optionally update items by replacing those ids with latest payloads
                    const idToIncoming = new Map<
                      string,
                      AdvertisementResponse
                    >();
                    for (const it of data.items) idToIncoming.set(it.id, it);
                    prev.items = prev.items.map(
                      (it) => idToIncoming.get(it.id) ?? it
                    );
                  }
                }
              }

              // Final slice to satisfy requested page/limit for UI
              const neededCount =
                (q.page ?? data.page) * (q.limit ?? data.limit);
              const internal = state._cacheLists[key]!;
              const finalSlice = internal.items.slice(0, neededCount);

              state.list = finalSlice;
              state.listMeta.pagination = {
                page: q.page ?? data.page,
                limit: q.limit ?? data.limit,
                total: data.total,
                pages: data.pages,
              };
              state.listMeta.loading = false;
              state.listMeta.error = null;
              state.listMeta.lastFetchedAt = nowIsoStr;
              state.cache.listKey = key;

              for (const ad of finalSlice) {
                state.cache.byId[ad.id] = { ad, meta: initialAsyncMeta() };
              }
            }) as unknown as (s: Store) => Store
          );

          return {
            ok: true,
            data: {
              items: get().list,
              total: get().listMeta.pagination.total,
              page: get().listMeta.pagination.page,
              limit: get().listMeta.pagination.limit,
              pages: get().listMeta.pagination.pages,
            },
          };
        } catch (err) {
          const msg = extractErrorMessage(err);
          set(
            produce((state: Store) => {
              state.listMeta.loading = false;
              state.listMeta.error = msg;
            }) as unknown as (s: Store) => Store
          );
          return { ok: false, error: { message: msg } };
        }
      },

      async fetchById(id: string): Promise<ApiResponse<AdvertisementResponse>> {
        const cached = get().cache.byId[id];
        if (cached && cached.ad) {
          const last = cached.meta.lastFetchedAt;
          const age = last ? Date.now() - new Date(last).getTime() : Infinity;
          if (age < CACHE_TTL) {
            return { ok: true, data: cached.ad };
          }
        }

        set(
          produce((state: Store) => {
            state.activeAdMeta.loading = true;
            state.activeAdMeta.error = null;
          }) as unknown as (s: Store) => Store
        );

        try {
          const data = await commonRequest<AdvertisementResponse>(() =>
            api.get(`${URL_AFTER_API}/${id}`)
          );
          set(
            produce((state: Store) => {
              state.activeAd = data;
              state.activeAdMeta = {
                loading: false,
                error: null,
                lastFetchedAt: nowIso(),
              };
              state.cache.byId[data.id] = {
                ad: data,
                meta: { loading: false, error: null, lastFetchedAt: nowIso() },
              };
              // update all cached lists that contain this ad
              updateAdInAllLists(state as Store, data);
            }) as unknown as (s: Store) => Store
          );

          return { ok: true, data };
        } catch (err) {
          const msg = extractErrorMessage(err);
          set(
            produce((state: Store) => {
              state.activeAdMeta = {
                loading: false,
                error: msg,
                lastFetchedAt: null,
              };
            }) as unknown as (s: Store) => Store
          );
          return { ok: false, error: { message: msg } };
        }
      },

      async fetchOverview(): Promise<ApiResponse<AdvertisementOverview>> {
        const key = "ads_overview";
        const cachedOverview =
          get().cache.overviewKey === key ? get().overview : null;
        if (cachedOverview && get().overviewMeta.lastFetchedAt) {
          const last = get().overviewMeta.lastFetchedAt;
          if (last) {
            const age = Date.now() - new Date(last).getTime();
            if (age < CACHE_TTL) {
              return { ok: true, data: get().overview! };
            }
          }
        }

        set(
          produce((state: Store) => {
            state.overviewMeta.loading = true;
            state.overviewMeta.error = null;
          }) as unknown as (s: Store) => Store
        );

        try {
          const data = await commonRequest<AdvertisementOverview>(() =>
            api.get(`${URL_AFTER_API}/overview`)
          );
          set(
            produce((state: Store) => {
              state.overview = data;
              state.overviewMeta = {
                loading: false,
                error: null,
                lastFetchedAt: nowIso(),
              };
              state.cache.overviewKey = key;
            }) as unknown as (s: Store) => Store
          );

          return { ok: true, data };
        } catch (err) {
          const msg = extractErrorMessage(err);
          set(
            produce((state: Store) => {
              state.overviewMeta = {
                loading: false,
                error: msg,
                lastFetchedAt: null,
              };
            }) as unknown as (s: Store) => Store
          );
          return { ok: false, error: { message: msg } };
        }
      },

      async adminAction(
        actionDto: AdvertisementAdminActionDTO
      ): Promise<ApiResponse<AdvertisementResponse>> {
        const actionKey = `${actionDto.action}:${actionDto.id}`;

        set(
          produce((state: Store) => {
            state.adminActionMeta[actionKey] = {
              loading: true,
              error: null,
              lastFetchedAt: null,
            };
          }) as unknown as (s: Store) => Store
        );

        try {
          const data = await commonRequest<AdvertisementResponse>(() =>
            api.post(`${URL_AFTER_API}/${actionDto.id}/action`, actionDto)
          );
          set(
            produce((state: Store) => {
              // update per-id cache and all cached lists that reference this ad
              updateAdInAllLists(state as Store, data);

              // If there's an active listKey, ensure list slice reflects updated item
              const listKey = state.cache.listKey;
              if (listKey) {
                const internal = state._cacheLists[listKey];
                if (internal) {
                  // rebuild visible list slice
                  state.list = internal.items.slice(
                    0,
                    state.listMeta.pagination.page *
                    state.listMeta.pagination.limit
                  );
                }
              }

              if (state.activeAd?.id === data.id) state.activeAd = data;
              state.adminActionMeta[actionKey] = {
                loading: false,
                error: null,
                lastFetchedAt: nowIso(),
              };
            }) as unknown as (s: Store) => Store
          );

          return { ok: true, data };
        } catch (err) {
          const msg = extractErrorMessage(err);
          set(
            produce((state: Store) => {
              state.adminActionMeta[actionKey] = {
                loading: false,
                error: msg,
                lastFetchedAt: null,
              };
            }) as unknown as (s: Store) => Store
          );
          return { ok: false, error: { message: msg } };
        }
      },

      async softDelete(
        id: string
      ): Promise<ApiResponse<AdvertisementResponse | null>> {
        set(
          produce((state: Store) => {
            state.deletionMeta[id] = {
              loading: true,
              error: null,
              lastFetchedAt: null,
            };
          }) as unknown as (s: Store) => Store
        );

        try {
          const data = await commonRequest<AdvertisementResponse | null>(() =>
            api.delete(`${URL_AFTER_API}/${id}`)
          );
          set(
            produce((state: Store) => {
              state.deletionMeta[id] = {
                loading: false,
                error: null,
                lastFetchedAt: nowIso(),
              };
              if (data) {
                // update per-id cache
                if (state.cache.byId[id]) state.cache.byId[id].ad = data;
                // remove from all cached lists and rebuild visible list slice
                removeAdFromAllIndexedLists(state as Store, id);
                const listKey = state.cache.listKey;
                if (listKey) {
                  const internal = state._cacheLists[listKey];
                  if (internal) {
                    state.list = internal.items.slice(
                      0,
                      state.listMeta.pagination.page *
                      state.listMeta.pagination.limit
                    );
                  }
                }
              }
            }) as unknown as (s: Store) => Store
          );

          return { ok: true, data };
        } catch (err) {
          const msg = extractErrorMessage(err);
          set(
            produce((state: Store) => {
              state.deletionMeta[id] = {
                loading: false,
                error: msg,
                lastFetchedAt: null,
              };
            }) as unknown as (s: Store) => Store
          );
          return { ok: false, error: { message: msg } };
        }
      },

      async restore(
        id: string
      ): Promise<ApiResponse<AdvertisementResponse | null>> {
        set(
          produce((state: Store) => {
            state.deletionMeta[id] = {
              loading: true,
              error: null,
              lastFetchedAt: null,
            };
          }) as unknown as (s: Store) => Store
        );

        try {
          const data = await commonRequest<AdvertisementResponse | null>(() =>
            api.post(`${URL_AFTER_API}/${id}/restore`)
          );
          set(
            produce((state: Store) => {
              state.deletionMeta[id] = {
                loading: false,
                error: null,
                lastFetchedAt: nowIso(),
              };
              if (data) {
                // add back into per-id cache
                state.cache.byId[id] = {
                  ad: data,
                  meta: {
                    loading: false,
                    error: null,
                    lastFetchedAt: nowIso(),
                  },
                };
                // insert into all cached lists (we choose to unshift to make restored appear first)
                // and maintain dedupe via mergeUniqueById
                for (const key of Object.keys(state._cacheLists)) {
                  const internal = state._cacheLists[key];
                  if (!internal) continue;
                  internal.items = mergeUniqueById(
                    internal.items,
                    [data],
                    false
                  );
                  // index
                  let s = adIdToListKeys.get(data.id);
                  if (!s) {
                    s = new Set();
                    adIdToListKeys.set(data.id, s);
                  }
                  s.add(key);
                }
                // update visible slice
                const listKey = state.cache.listKey;
                if (listKey) {
                  const internal = state._cacheLists[listKey];
                  if (internal) {
                    state.list = internal.items.slice(
                      0,
                      state.listMeta.pagination.page *
                      state.listMeta.pagination.limit
                    );
                  }
                }
              }
            }) as unknown as (s: Store) => Store
          );

          return { ok: true, data };
        } catch (err) {
          const msg = extractErrorMessage(err);
          set(
            produce((state: Store) => {
              state.deletionMeta[id] = {
                loading: false,
                error: msg,
                lastFetchedAt: null,
              };
            }) as unknown as (s: Store) => Store
          );
          return { ok: false, error: { message: msg } };
        }
      },
    }),
    {
      name: "ads-store",
      partialize: (state) => ({
        listQuery: {
          page: 1,
          limit: state.listQuery.limit,
          q: state.listQuery.q,
          status: state.listQuery.status,
          placements: state.listQuery.placements,
          sortBy: state.listQuery.sortBy,
          sortDir: state.listQuery.sortDir,
          withDeleted: !!state.listQuery.withDeleted,
        },
      }),
      version: 1,
    }
  )
);

export default useAdsStore;
