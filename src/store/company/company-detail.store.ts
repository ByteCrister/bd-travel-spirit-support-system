import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { CompanyOverviewDTO, CompanyOverviewResponse } from "@/types/company/company.overview.types";
import { TourDetailDTO, TourFilterOptions, TourListItemDTO } from "@/types/tour/tour.types";
import { EmployeeDetailDTO, EmployeeListItemDTO } from "@/types/employee/employee.types";
import api from "@/utils/axios";
import { ReviewListItemDTO, ReviewSummaryDTO, TourReviewsResponseDTO } from "@/types/tour/tour-detail-review.type";
import { TourReportListItemDTO, TourReportsResponseDTO } from "@/types/tour/tour-detail-report.types";
import { GetTourFaqsResponse, TourFAQDTO } from "@/types/tour/tour-detail-faqs.types";
import { ApiResponse } from "@/types/common/api.types";

// const URL_AFTER_API = "/mock/users/companies";
const URL_AFTER_API = "/users/companies/v1";

// --------------------
// Types (updated)
// --------------------
type ApiCompanyListResponse = {
  companyId: string;
  data: {
    docs: TourListItemDTO[] | EmployeeListItemDTO[];
    total: number;
    page: number;
    pages: number;
  };
};

interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

interface ExtraParams extends PaginationParams {
  search?: string;
}

type TourFilterParams = ExtraParams;
type EmployeeFilterParams = ExtraParams;
type TourFaqFilterParams = ExtraParams;

interface TourReviewFilterParams extends PaginationParams {
  search?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  approvedOnly?: boolean;
}

interface ListCache<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  params: {
    pagination: PaginationParams;
    filters?: TourFilterOptions | TourReviewFilterParams | TourFaqFilterParams | TourFilterParams | EmployeeFilterParams;
  };
  meta?: {
    summary?: ReviewSummaryDTO;
  };
}

// --------------------
// Extended store types (updated)
// --------------------
type ListCacheBucket<T> = Record<string, ListCache<T>>; // cacheKey -> ListCache
type CompanyListCache = {
  tours: Record<string, ListCacheBucket<TourListItemDTO>>;
  employees: Record<string, ListCacheBucket<EmployeeListItemDTO>>;
  tourReviews: Record<string, ListCacheBucket<ReviewListItemDTO>>;
  tourReports: Record<string, ListCacheBucket<TourReportListItemDTO>>;
  tourFaqs: Record<string, ListCacheBucket<TourFAQDTO>>;
};

type ParamsMap = {
  tours: Record<string, TourFilterParams>;
  employees: Record<string, EmployeeFilterParams>;
  tourReviews: Record<string, TourReviewFilterParams>;
  tourReports: Record<string, PaginationParams>;
  tourFaqs: Record<string, TourFaqFilterParams>;
};

type ActiveCacheKeyMap = {
  tours: Record<string, string | undefined>;
  employees: Record<string, string | undefined>;
  tourReviews: Record<string, string | undefined>;
  tourReports: Record<string, string | undefined>;
  tourFaqs: Record<string, string | undefined>;
};

// --------------------
// Store interface (updated)
// --------------------
interface CompanyDetailState {
  companies: Record<string, CompanyOverviewDTO | undefined>;
  listCache: CompanyListCache;
  params: ParamsMap;
  activeCacheKey: ActiveCacheKeyMap;
  tourDetails: Record<string, TourDetailDTO | undefined>;
  employeeDetails: Record<string, EmployeeDetailDTO | undefined>;
  loading: Record<string, boolean>;
  error: Record<string, string | undefined>;
  cacheTimestamps: Record<string, number>;

  fetchCompany: (companyId: string, force?: boolean) => Promise<CompanyOverviewDTO>;
  fetchTours: (companyId: string, params?: Partial<TourFilterParams>, force?: boolean) => Promise<ListCache<TourListItemDTO>>;
  fetchEmployees: (companyId: string, params?: Partial<EmployeeFilterParams>, force?: boolean) => Promise<ListCache<EmployeeListItemDTO>>;
  fetchEmployeeDetail: (companyId: string, employeeId: string, force?: boolean) => Promise<EmployeeDetailDTO>;
  fetchTourDetail: (companyId: string, tourId: string, force?: boolean) => Promise<TourDetailDTO>;
  fetchReviews: (companyId: string, tourId: string, params?: Partial<TourReviewFilterParams>, force?: boolean) => Promise<ListCache<ReviewListItemDTO>>;
  fetchReports: (companyId: string, tourId: string, params?: Partial<PaginationParams>, force?: boolean) => Promise<ListCache<TourReportListItemDTO>>;
  fetchFaqs: (companyId: string, tourId: string, params?: Partial<TourFaqFilterParams>, force?: boolean) => Promise<ListCache<TourFAQDTO>>;

  // typed cache utilities
  invalidateCache?: (scope: "tours" | "employees" | "tourReviews" | "tourReports" | "tourFaqs" | "companies" | "tourDetails" | "employeeDetails", id?: string, key?: string) => void;
  clearAllCaches?: () => void;
}

// --------------------
// Helpers & cache TTL
// --------------------
const makeCacheKey = (params: PaginationParams) => `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;
const defaultParams: PaginationParams = { page: 1, limit: 10 };
const defaultReviewParams: TourReviewFilterParams = { page: 1, limit: 10 };
const defaultFaqParams: TourFaqFilterParams = { page: 1, limit: 10 };

const tourDetailLoadingKey = (id: string) => `tourDetail:${id}`;
const employeeDetailLoadingKey = (id: string) => `employeeDetail:${id}`;
const tourDetailErrorKey = (id: string) => `tourDetailError:${id}`;
const employeeDetailErrorKey = (id: string) => `employeeDetailError:${id}`;

const tourListLoadingKey = (tourId: string, type: "reviews" | "reports" | "faqs") => `${type}List:${tourId}`;
const tourListErrorKey = (tourId: string, type: "reviews" | "reports" | "faqs") => `${type}ListError:${tourId}`;

// TTL behavior: entries older than CACHE_TTL_MS are considered stale
const CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 1000 * 60 * 2; // 2 minutes; tuneable

// In-flight dedupe maps (typed)
const inFlightRequests: Map<string, Promise<unknown>> = new Map();

// Helper: returns true if timestamp still fresh
const isFresh = (ts?: number) => (typeof ts === "number" ? Date.now() - ts < CACHE_TTL_MS : false);

// Small helper to build request key for dedupe
const makeRequestKey = (method: string, url: string, params?: unknown) => `${method}:${url}:${JSON.stringify(params ?? {})}`;

const makeReviewCacheKey = (params: TourReviewFilterParams) => {
  const paginationKey = `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;
  const filterKey = JSON.stringify({
    search: params.search,
    rating: params.rating,
    approvedOnly: params.approvedOnly,
  });
  return `${paginationKey}-${filterKey}`;
};

const makeFaqCacheKey = (params: TourFaqFilterParams) => {
  const paginationKey = `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;
  const filterKey = JSON.stringify({
    search: params.search,
  });
  return `${paginationKey}-${filterKey}`;
}

const makeTourEmployeeCacheKey = (params: ExtraParams) => {
  const paginationKey = `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;
  const filterKey = JSON.stringify({
    search: params.search,
  });
  return `${paginationKey}-${filterKey}`;
};

// --------------------
// Store (fully updated)
// --------------------
export const useCompanyDetailStore = create<CompanyDetailState>()(
  devtools(
    persist(
      (set, get) => ({
        companies: {},
        listCache: {
          tours: {},
          employees: {},
          tourReviews: {},
          tourReports: {},
          tourFaqs: {},
        },
        params: { tours: {}, employees: {}, tourReviews: {}, tourReports: {}, tourFaqs: {} },
        activeCacheKey: { tours: {}, employees: {}, tourReviews: {}, tourReports: {}, tourFaqs: {} },
        tourDetails: {},
        employeeDetails: {},
        loading: {},
        error: {},
        cacheTimestamps: {},

        // --------------------
        // Cache utilities (exposed)
        // --------------------
        invalidateCache: (scope, id, key) => {
          set((state) => {
            const next = {
              ...state,
              listCache: {
                tours: { ...state.listCache.tours },
                employees: { ...state.listCache.employees },
                tourReviews: { ...state.listCache.tourReviews },
                tourReports: { ...state.listCache.tourReports },
                tourFaqs: { ...state.listCache.tourFaqs },
              },
              cacheTimestamps: { ...state.cacheTimestamps },
            };

            if (scope === "companies" && id) {
              delete next.companies[id];
            } else if (scope === "tourDetails" && id) {
              delete next.tourDetails[id];
            } else if (scope === "employeeDetails" && id) {
              delete next.employeeDetails[id];
            } else if (scope === "tours" && id) {
              if (key) {
                delete next.listCache.tours[id]?.[key];
                delete next.cacheTimestamps[`tours:${id}:${key}`];
              } else {
                delete next.listCache.tours[id];
                // remove matching timestamps
                Object.keys(next.cacheTimestamps).forEach((k) => {
                  if (k.startsWith(`tours:${id}:`)) delete next.cacheTimestamps[k];
                });
              }
            } else if (scope === "employees" && id) {
              if (key) {
                delete next.listCache.employees[id]?.[key];
                delete next.cacheTimestamps[`employees:${id}:${key}`];
              } else {
                delete next.listCache.employees[id];
                Object.keys(next.cacheTimestamps).forEach((k) => {
                  if (k.startsWith(`employees:${id}:`)) delete next.cacheTimestamps[k];
                });
              }
            } else if (scope === "tourReviews" && id) {
              if (key) {
                delete next.listCache.tourReviews[id]?.[key];
                delete next.cacheTimestamps[`tourReviews:${id}:${key}`];
              } else {
                delete next.listCache.tourReviews[id];
                Object.keys(next.cacheTimestamps).forEach((k) => {
                  if (k.startsWith(`tourReviews:${id}:`)) delete next.cacheTimestamps[k];
                });
              }
            } else if (scope === "tourReports" && id) {
              if (key) {
                delete next.listCache.tourReports[id]?.[key];
                delete next.cacheTimestamps[`tourReports:${id}:${key}`];
              } else {
                delete next.listCache.tourReports[id];
                Object.keys(next.cacheTimestamps).forEach((k) => {
                  if (k.startsWith(`tourReports:${id}:`)) delete next.cacheTimestamps[k];
                });
              }
            } else if (scope === "tourFaqs" && id) {
              if (key) {
                delete next.listCache.tourFaqs[id]?.[key];
                delete next.cacheTimestamps[`tourFaqs:${id}:${key}`];
              } else {
                delete next.listCache.tourFaqs[id];
                Object.keys(next.cacheTimestamps).forEach((k) => {
                  if (k.startsWith(`tourFaqs:${id}:`)) delete next.cacheTimestamps[k];
                });
              }
            }

            return next;
          });
        },

        clearAllCaches: () => {
          set(() => ({
            listCache: { tours: {}, employees: {}, tourReviews: {}, tourReports: {}, tourFaqs: {} },
            params: { tours: {}, employees: {}, tourReviews: {}, tourReports: {}, tourFaqs: {} },
            activeCacheKey: { tours: {}, employees: {}, tourReviews: {}, tourReports: {}, tourFaqs: {} },
            tourDetails: {},
            employeeDetails: {},
            companies: {},
            cacheTimestamps: {},
          }));
        },

        // --------------------
        // Fetch company overview
        // --------------------
        fetchCompany: async (companyId, force = false) => {
          const { companies } = get();
          if (!force && companies[companyId]) return companies[companyId]!;

          const loadingKey = `company:${companyId}`;
          set((s) => ({ loading: { ...s.loading, [loadingKey]: true }, error: { ...s.error, [loadingKey]: undefined } }));

          const url = `${URL_AFTER_API}/${companyId}/detail`;
          const reqKey = makeRequestKey("GET", url);

          if (!force && inFlightRequests.has(reqKey)) {
            return inFlightRequests.get(reqKey) as Promise<CompanyOverviewDTO>;
          }

          const p = api
            .get<CompanyOverviewResponse>(url)
            .then((res) => {
              set((s) => ({
                companies: { ...s.companies, [companyId]: res.data.data },
                loading: { ...s.loading, [loadingKey]: false },
              }));
              return res.data.data;
            })
            .catch((err) => {
              const message = extractErrorMessage(err);
              set((s) => ({ error: { ...s.error, [loadingKey]: message }, loading: { ...s.loading, [loadingKey]: false } }));
              throw new Error(message);
            })
            .finally(() => {
              inFlightRequests.delete(reqKey);
            });

          inFlightRequests.set(reqKey, p);
          return p;
        },

        // --------------------
        // Fetch tours
        // --------------------
        fetchTours: async (companyId, overrideParams = {}, force = false) => {
          const state = get();
          const prevParams = state.params.tours[companyId] ?? defaultParams;
          const params: ExtraParams = { ...defaultParams, ...prevParams, ...overrideParams };
          // const cacheKey = makeCacheKey(params);
          const cacheKey = makeTourEmployeeCacheKey(params);

          const cached = state.listCache.tours[companyId]?.[cacheKey];
          const tsKey = `tours:${companyId}:${cacheKey}`;
          const tsVal = state.cacheTimestamps[tsKey];

          if (!force && cached && isFresh(tsVal)) {
            set((s) => ({
              params: { ...s.params, tours: { ...s.params.tours, [companyId]: params } },
              activeCacheKey: { ...s.activeCacheKey, tours: { ...s.activeCacheKey.tours, [companyId]: cacheKey } },
              loading: { ...s.loading, tours: false },
              error: { ...s.error, tours: undefined },
            }));
            return cached;
          }

          const url = `${URL_AFTER_API}/${companyId}/tours`;
          const reqKey = makeRequestKey("GET", url, params);

          if (!force && inFlightRequests.has(reqKey)) {
            return inFlightRequests.get(reqKey) as Promise<ListCache<TourListItemDTO>>;
          }

          set((s) => ({ loading: { ...s.loading, tours: true }, error: { ...s.error, tours: undefined } }));

          const p = api
            .get<ApiCompanyListResponse>(url, { params })
            .then((res) => {
              const list: ListCache<TourListItemDTO> = {
                items: res.data.data.docs as TourListItemDTO[],
                total: res.data.data.total,
                page: res.data.data.page,
                pages: res.data.data.pages,
                params: {
                  pagination: params,
                  filters: params,
                },
              };

              set((s) => {
                const toursBucket: ListCacheBucket<TourListItemDTO> = { ...(s.listCache.tours[companyId] || {}), [cacheKey]: list };
                return {
                  listCache: { ...s.listCache, tours: { ...s.listCache.tours, [companyId]: toursBucket } },
                  params: { ...s.params, tours: { ...s.params.tours, [companyId]: params } },
                  activeCacheKey: { ...s.activeCacheKey, tours: { ...s.activeCacheKey.tours, [companyId]: cacheKey } },
                  loading: { ...s.loading, tours: false },
                  cacheTimestamps: { ...s.cacheTimestamps, [tsKey]: Date.now() },
                };
              });

              return list;
            })
            .catch((err) => {
              const message = extractErrorMessage(err);
              set((s) => ({ error: { ...s.error, tours: message }, loading: { ...s.loading, tours: false } }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        // --------------------
        // Fetch employees
        // --------------------
        fetchEmployees: async (companyId, overrideParams = {}, force = false) => {
          const state = get();
          const prevParams = state.params.employees?.[companyId] ?? defaultParams;
          const params: ExtraParams = { ...defaultParams, ...prevParams, ...overrideParams };
          // const cacheKey = makeCacheKey(params);
          const cacheKey = makeTourEmployeeCacheKey(params);

          const cached = state.listCache.employees?.[companyId]?.[cacheKey];
          const tsKey = `employees:${companyId}:${cacheKey}`;
          const tsVal = state.cacheTimestamps[tsKey];

          if (!force && cached && isFresh(tsVal)) {
            set((s) => ({
              params: { ...s.params, employees: { ...s.params.employees, [companyId]: params } },
              activeCacheKey: { ...s.activeCacheKey, employees: { ...s.activeCacheKey.employees, [companyId]: cacheKey } },
              loading: { ...s.loading, employees: false },
              error: { ...s.error, employees: undefined },
            }));
            return cached;
          }

          const url = `${URL_AFTER_API}/${companyId}/employees`;
          const reqKey = makeRequestKey("GET", url, params);

          if (!force && inFlightRequests.has(reqKey)) return inFlightRequests.get(reqKey) as Promise<ListCache<EmployeeListItemDTO>>;

          set((s) => ({ loading: { ...s.loading, employees: true }, error: { ...s.error, employees: undefined } }));

          const p = api
            .get<ApiCompanyListResponse>(url, { params })
            .then((res) => {
              const list: ListCache<EmployeeListItemDTO> = {
                items: res.data.data.docs as EmployeeListItemDTO[],
                page: res.data.data.page,
                pages: res.data.data.pages,
                total: res.data.data.total,
                params: {
                  pagination: params,
                  filters: params,
                },
              };

              set((s) => {
                const empBucket: ListCacheBucket<EmployeeListItemDTO> = { ...(s.listCache.employees[companyId] || {}), [cacheKey]: list };
                return {
                  listCache: { ...s.listCache, employees: { ...s.listCache.employees, [companyId]: empBucket } },
                  params: { ...s.params, employees: { ...s.params.employees, [companyId]: params } },
                  activeCacheKey: { ...s.activeCacheKey, employees: { ...s.activeCacheKey.employees, [companyId]: cacheKey } },
                  loading: { ...s.loading, employees: false },
                  cacheTimestamps: { ...s.cacheTimestamps, [tsKey]: Date.now() },
                };
              });

              return list;
            })
            .catch((err) => {
              const message = extractErrorMessage(err);
              set((s) => ({ error: { ...s.error, employees: message }, loading: { ...s.loading, employees: false } }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        // --------------------
        // Fetch detail (tour/employee) with per-item loading keys and dedupe
        // --------------------
        fetchTourDetail: async (companyId, tourId, force = false) => {
          const state = get();
          if (!force && state.tourDetails[tourId]) return state.tourDetails[tourId]!;

          const loadingKey = tourDetailLoadingKey(tourId);
          const errorKey = tourDetailErrorKey(tourId);

          set((s) => ({ loading: { ...s.loading, [loadingKey]: true }, error: { ...s.error, [errorKey]: undefined } }));

          const url = `${URL_AFTER_API}/${companyId}/tours/${tourId}`;
          const reqKey = makeRequestKey("GET", url);

          if (!force && inFlightRequests.has(reqKey)) return inFlightRequests.get(reqKey) as Promise<TourDetailDTO>;

          const p = api
            .get<{ data: TourDetailDTO }>(url)
            .then((res) => {
              set((s) => ({ tourDetails: { ...s.tourDetails, [tourId]: res.data.data }, loading: { ...s.loading, [loadingKey]: false } }));
              return res.data.data;
            })
            .catch((err) => {
              const message = extractErrorMessage(err);
              set((s) => ({ error: { ...s.error, [errorKey]: message }, loading: { ...s.loading, [loadingKey]: false } }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        fetchEmployeeDetail: async (companyId, employeeId, force = false) => {
          const state = get();
          if (!force && state.employeeDetails[employeeId]) return state.employeeDetails[employeeId]!;

          const loadingKey = employeeDetailLoadingKey(employeeId);
          const errorKey = employeeDetailErrorKey(employeeId);

          set((s) => ({ loading: { ...s.loading, [loadingKey]: true }, error: { ...s.error, [errorKey]: undefined } }));

          const url = `${URL_AFTER_API}/${companyId}/employees/${employeeId}`;
          const reqKey = makeRequestKey("GET", url);

          if (!force && inFlightRequests.has(reqKey)) return inFlightRequests.get(reqKey) as Promise<EmployeeDetailDTO>;

          const p = api
            .get<{ data: EmployeeDetailDTO }>(url)
            .then((res) => {
              set((s) => ({ employeeDetails: { ...s.employeeDetails, [employeeId]: res.data.data }, loading: { ...s.loading, [loadingKey]: false } }));
              return res.data.data;
            })
            .catch((err) => {
              const message = extractErrorMessage(err);
              set((s) => ({ error: { ...s.error, [errorKey]: message }, loading: { ...s.loading, [loadingKey]: false } }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        // --------------------
        // Per-tour lists: reviews/reports/faqs (dedupe + TTL + per-tour buckets)
        // --------------------
        fetchReviews: async (companyId, tourId, overrideParams = {}, force = false) => {
          const state = get();
          if (!state.params.tourReviews) state.params.tourReviews = {};
          if (!state.params.tourReviews[tourId]) state.params.tourReviews[tourId] = { ...defaultReviewParams };

          const currentParams = state.params.tourReviews[tourId];
          const params: TourReviewFilterParams = { ...defaultReviewParams, ...currentParams, ...overrideParams };
          const cacheKey = makeReviewCacheKey(params);

          const cached = state.listCache.tourReviews?.[tourId]?.[cacheKey];
          const tsKey = `tourReviews:${tourId}:${cacheKey}`;
          const tsVal = state.cacheTimestamps[tsKey];

          if (!force && cached && isFresh(tsVal)) {
            set((s) => ({
              params: { ...s.params, tourReviews: { ...s.params.tourReviews, [tourId]: params } },
              activeCacheKey: { ...s.activeCacheKey, tourReviews: { ...s.activeCacheKey.tourReviews, [tourId]: cacheKey } },
              loading: { ...s.loading, [tourListLoadingKey(tourId, "reviews")]: false },
              error: { ...s.error, [tourListErrorKey(tourId, "reviews")]: undefined },
            }));
            return cached;
          }

          const url = `${URL_AFTER_API}/${companyId}/tours/${tourId}/reviews`;
          const reqKey = makeRequestKey("GET", url, params);
          if (!force && inFlightRequests.has(reqKey)) return inFlightRequests.get(reqKey) as Promise<ListCache<ReviewListItemDTO>>;

          const loadingKey = tourListLoadingKey(tourId, "reviews");
          const errorKey = tourListErrorKey(tourId, "reviews");
          set((s) => ({ loading: { ...s.loading, [loadingKey]: true }, error: { ...s.error, [errorKey]: undefined } }));

          const p = api
            .get<ApiResponse<TourReviewsResponseDTO>>(url, { params })
            .then((res) => {
              if (!(res.data && res.data.data)) {
                throw new Error("Invalid response body.");
              }
              const list: ListCache<ReviewListItemDTO> = {
                items: res.data.data.docs,
                total: res.data.data.total,
                page: res.data.data.page,
                pages: res.data.data.pages,
                meta: { summary: res.data.data.summary },
                params: {
                  pagination: params,
                  filters: params,
                },
              };

              set((s) => {
                const bucket: ListCacheBucket<ReviewListItemDTO> = { ...(s.listCache.tourReviews[tourId] || {}), [cacheKey]: list };
                return {
                  listCache: { ...s.listCache, tourReviews: { ...s.listCache.tourReviews, [tourId]: bucket } },
                  params: { ...s.params, tourReviews: { ...s.params.tourReviews, [tourId]: params } },
                  activeCacheKey: { ...s.activeCacheKey, tourReviews: { ...s.activeCacheKey.tourReviews, [tourId]: cacheKey } },
                  loading: { ...s.loading, [loadingKey]: false },
                  cacheTimestamps: { ...s.cacheTimestamps, [tsKey]: Date.now() },
                };
              });

              return list;
            })
            .catch((err) => {
              const message = extractErrorMessage(err);
              set((s) => ({ error: { ...s.error, [errorKey]: message }, loading: { ...s.loading, [loadingKey]: false } }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        fetchReports: async (companyId, tourId, overrideParams = {}, force = false) => {
          const state = get();
          if (!state.params.tourReports) state.params.tourReports = {};
          if (!state.params.tourReports[tourId]) state.params.tourReports[tourId] = { ...defaultParams };

          const currentParams = state.params.tourReports[tourId];
          const params: PaginationParams = { ...defaultParams, ...currentParams, ...overrideParams };
          const cacheKey = makeCacheKey(params);

          const cached = state.listCache.tourReports?.[tourId]?.[cacheKey];
          const tsKey = `tourReports:${tourId}:${cacheKey}`;
          const tsVal = state.cacheTimestamps[tsKey];

          if (!force && cached && isFresh(tsVal)) {
            set((s) => ({
              params: { ...s.params, tourReports: { ...s.params.tourReports, [tourId]: params } },
              activeCacheKey: { ...s.activeCacheKey, tourReports: { ...s.activeCacheKey.tourReports, [tourId]: cacheKey } },
              loading: { ...s.loading, [tourListLoadingKey(tourId, "reports")]: false },
              error: { ...s.error, [tourListErrorKey(tourId, "reports")]: undefined },
            }));
            return cached;
          }

          const url = `${URL_AFTER_API}/${companyId}/tours/${tourId}/reports`;
          const reqKey = makeRequestKey("GET", url, params);
          if (!force && inFlightRequests.has(reqKey)) return inFlightRequests.get(reqKey) as Promise<ListCache<TourReportListItemDTO>>;

          const loadingKey = tourListLoadingKey(tourId, "reports");
          const errorKey = tourListErrorKey(tourId, "reports");
          set((s) => ({ loading: { ...s.loading, [loadingKey]: true }, error: { ...s.error, [errorKey]: undefined } }));

          const p = api
            .get<ApiResponse<TourReportsResponseDTO>>(url, { params })
            .then((res) => {
              if (!(res.data && res.data.data)) {
                throw new Error("Invalid response body.");
              }
              const list: ListCache<TourReportListItemDTO> = {
                items: res.data.data.docs,
                total: res.data.data.total,
                page: res.data.data.page,
                pages: res.data.data.pages,
                params: {
                  pagination: params,
                },
              };

              set((s) => {
                const bucket: ListCacheBucket<TourReportListItemDTO> = { ...(s.listCache.tourReports[tourId] || {}), [cacheKey]: list };
                return {
                  listCache: { ...s.listCache, tourReports: { ...s.listCache.tourReports, [tourId]: bucket } },
                  params: { ...s.params, tourReports: { ...s.params.tourReports, [tourId]: params } },
                  activeCacheKey: { ...s.activeCacheKey, tourReports: { ...s.activeCacheKey.tourReports, [tourId]: cacheKey } },
                  loading: { ...s.loading, [loadingKey]: false },
                  cacheTimestamps: { ...s.cacheTimestamps, [tsKey]: Date.now() },
                };
              });

              return list;
            })
            .catch((err) => {
              const message = extractErrorMessage(err);
              set((s) => ({ error: { ...s.error, [errorKey]: message }, loading: { ...s.loading, [loadingKey]: false } }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        fetchFaqs: async (companyId, tourId, overrideParams = {}, force = false) => {
          const state = get();
          if (!state.params.tourFaqs) state.params.tourFaqs = {};
          if (!state.params.tourFaqs[tourId]) state.params.tourFaqs[tourId] = { ...defaultFaqParams };

          const currentParams = state.params.tourFaqs[tourId];
          const params: TourFaqFilterParams = { ...defaultFaqParams, ...currentParams, ...overrideParams };
          const cacheKey = makeFaqCacheKey(params);

          const cached = state.listCache.tourFaqs?.[tourId]?.[cacheKey];
          const tsKey = `tourFaqs:${tourId}:${cacheKey}`;
          const tsVal = state.cacheTimestamps[tsKey];

          if (!force && cached && isFresh(tsVal)) {
            set((s) => ({
              params: { ...s.params, tourFaqs: { ...s.params.tourFaqs, [tourId]: params } },
              activeCacheKey: { ...s.activeCacheKey, tourFaqs: { ...s.activeCacheKey.tourFaqs, [tourId]: cacheKey } },
              loading: { ...s.loading, [tourListLoadingKey(tourId, "faqs")]: false },
              error: { ...s.error, [tourListErrorKey(tourId, "faqs")]: undefined },
            }));
            return cached;
          }

          const url = `${URL_AFTER_API}/${companyId}/tours/${tourId}/faqs`;
          const reqKey = makeRequestKey("GET", url, params);
          if (!force && inFlightRequests.has(reqKey)) return inFlightRequests.get(reqKey) as Promise<ListCache<TourFAQDTO>>;

          const loadingKey = tourListLoadingKey(tourId, "faqs");
          const errorKey = tourListErrorKey(tourId, "faqs");
          set((s) => ({ loading: { ...s.loading, [loadingKey]: true }, error: { ...s.error, [errorKey]: undefined } }));

          const p = api
            .get<ApiResponse<GetTourFaqsResponse>>(url, { params })
            .then((res) => {
              if (!(res.data && res.data.data)) {
                throw new Error("Invalid response body.");
              }
              const list: ListCache<TourFAQDTO> = {
                items: res.data.data.docs,
                total: res.data.data.total,
                page: res.data.data.page,
                pages: res.data.data.pages,
                params: {
                  pagination: params,
                  filters: params,
                },
              };

              set((s) => {
                const faqBucket: ListCacheBucket<TourFAQDTO> = { ...(s.listCache.tourFaqs[tourId] || {}), [cacheKey]: list };
                return {
                  listCache: { ...s.listCache, tourFaqs: { ...(s.listCache.tourFaqs || {}), [tourId]: faqBucket } },
                  params: { ...s.params, tourFaqs: { ...(s.params.tourFaqs || {}), [tourId]: params } },
                  activeCacheKey: { ...s.activeCacheKey, tourFaqs: { ...(s.activeCacheKey.tourFaqs || {}), [tourId]: cacheKey } },
                  loading: { ...s.loading, [loadingKey]: false },
                  cacheTimestamps: { ...s.cacheTimestamps, [tsKey]: Date.now() },
                };
              });

              return list;
            })
            .catch((err) => {
              const message = extractErrorMessage(err);
              console.log(err);
              set((s) => ({ error: { ...s.error, [errorKey]: message }, loading: { ...s.loading, [loadingKey]: false } }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

      }),
      
      {
        name: "company-detail.store",
        partialize: (state) => ({
          params: state.params,
          activeCacheKey: state.activeCacheKey,
        }),
      }
    )
  )
);