import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";
import { CompanyOverviewDTO, CompanyOverviewResponse } from "@/types/company.overview.types";
import { TourDetailDTO, TourListItemDTO } from "@/types/tour.types";
import { EmployeeDetailDTO, EmployeeListItemDTO } from "@/types/employee.types";
import api from "@/utils/api/axios";
import { GetTourReviewsResponse, ReviewListItemDTO } from "@/types/review.tour.response.type";
import { GetTourReportsResponse, TourReportListItemDTO } from "@/types/report.tour.response.types";

const ROOT_DIR = "/users-management/companies";

// --------------------
// Types
// --------------------

type ApiResponse = {
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

interface ListCache<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
    params: PaginationParams;
}

interface CompanyDetailState {
    // Overview
    companies: Record<string, CompanyOverviewDTO | undefined>;

    // Lists
    listCache: {
        tours: Record<string, Record<string, ListCache<TourListItemDTO>>>;
        employees: Record<string, Record<string, ListCache<EmployeeListItemDTO>>>;
        // per-tour lists
        tourReviews: Record<string, Record<string, ListCache<ReviewListItemDTO>>>; // keyed by tourId
        tourReports: Record<string, Record<string, ListCache<TourReportListItemDTO>>>; // keyed by tourId
    };

    params: {
        tours: Record<string, PaginationParams>;
        employees: Record<string, PaginationParams>;
        tourReviews: Record<string, PaginationParams>; // keyed by tourId
        tourReports: Record<string, PaginationParams>; // keyed by tourId
    };

    activeCacheKey: {
        tours: Record<string, string | undefined>;
        employees: Record<string, string | undefined>;
        tourReviews: Record<string, string | undefined>; // keyed by tourId
        tourReports: Record<string, string | undefined>; // keyed by tourId
    };

    // Details
    tourDetails: Record<string, TourDetailDTO | undefined>;
    employeeDetails: Record<string, EmployeeDetailDTO | undefined>;

    // Loading & error
    loading: Record<string, boolean>;
    error: Record<string, string | undefined>;

    // Actions
    fetchCompany: (companyId: string, force?: boolean) => Promise<CompanyOverviewDTO>;

    fetchTours: (
        companyId: string,
        params?: Partial<PaginationParams>,
        force?: boolean
    ) => Promise<ListCache<TourListItemDTO>>;

    fetchEmployees: (
        companyId: string,
        params?: Partial<PaginationParams>,
        force?: boolean
    ) => Promise<ListCache<EmployeeListItemDTO>>;

    fetchTourDetail: (companyId: string, tourId: string, force?: boolean) => Promise<TourDetailDTO>;

    fetchEmployeeDetail: (
        companyId: string,
        employeeId: string,
        force?: boolean
    ) => Promise<EmployeeDetailDTO>;

    // New actions
    fetchReviews: (
        companyId: string,
        tourId: string,
        params?: Partial<PaginationParams>,
        force?: boolean
    ) => Promise<ListCache<ReviewListItemDTO>>;

    fetchReports: (
        companyId: string,
        tourId: string,
        params?: Partial<PaginationParams>,
        force?: boolean
    ) => Promise<ListCache<TourReportListItemDTO>>;
}

// --------------------
// Helpers
// --------------------

const makeCacheKey = (params: PaginationParams) =>
    `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;

const defaultParams: PaginationParams = { page: 1, limit: 10 };

const tourDetailLoadingKey = (id: string) => `tourDetail:${id}`;
const employeeDetailLoadingKey = (id: string) => `employeeDetail:${id}`;
const tourDetailErrorKey = (id: string) => `tourDetailError:${id}`;
const employeeDetailErrorKey = (id: string) => `employeeDetailError:${id}`;

// per-tour list loading/error keys
const tourListLoadingKey = (tourId: string, type: "reviews" | "reports") => `${type}List:${tourId}`;
const tourListErrorKey = (tourId: string, type: "reviews" | "reports") => `${type}ListError:${tourId}`;

// --------------------
// Store
// --------------------

export const useCompanyDetailStore = create<CompanyDetailState>()(
    devtools(
        persist(
            (set, get) => ({
                companies: {},
                listCache: { tours: {}, employees: {}, tourReviews: {}, tourReports: {} },
                params: { tours: {}, employees: {}, tourReviews: {}, tourReports: {} },
                activeCacheKey: { tours: {}, employees: {}, tourReviews: {}, tourReports: {} },
                tourDetails: {},
                employeeDetails: {},
                loading: {},
                error: {},

                // --------------------
                // Fetch company overview
                // --------------------
                fetchCompany: async (companyId, force = false) => {
                    const { companies } = get();
                    if (!force && companies[companyId]) return companies[companyId]!;

                    set((state) => ({ loading: { ...state.loading, company: true } }));
                    try {
                        const res = await api.get<CompanyOverviewResponse>(`${ROOT_DIR}/${companyId}`);
                        set((state) => ({
                            companies: { ...state.companies, [companyId]: res.data.data },
                            loading: { ...state.loading, company: false },
                        }));
                        return res.data.data;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set((state) => ({
                            error: { ...state.error, company: message },
                            loading: { ...state.loading, company: false },
                        }));
                        throw new Error(message);
                    }
                },

                // --------------------
                // Fetch list (tours/employees)
                // --------------------
                fetchTours: async (companyId, overrideParams = {}, force = false) => {
                    const params = { ...defaultParams, ...get().params.tours[companyId], ...overrideParams };
                    const cacheKey = makeCacheKey(params);
                    const cached = get().listCache.tours[companyId]?.[cacheKey];

                    if (!force && cached) {
                        set((state) => ({
                            params: { ...state.params, tours: { ...state.params.tours, [companyId]: params } },
                            activeCacheKey: {
                                ...state.activeCacheKey,
                                tours: { ...state.activeCacheKey.tours, [companyId]: cacheKey },
                            },
                            loading: { ...state.loading, tours: false },
                            error: { ...state.error, tours: undefined },
                        }));
                        return cached;
                    }

                    set((state) => ({ loading: { ...state.loading, tours: true } }));
                    try {
                        const res = await api.get<ApiResponse>(`${ROOT_DIR}/${companyId}/tours`, { params });
                        const list: ListCache<TourListItemDTO> = {
                            items: res.data.data.docs as TourListItemDTO[],
                            total: res.data.data.total,
                            page: res.data.data.page,
                            pages: res.data.data.pages,
                            params,
                        };
                        set((state) => ({
                            listCache: {
                                ...state.listCache,
                                tours: {
                                    ...state.listCache.tours,
                                    [companyId]: { ...(state.listCache.tours[companyId] || {}), [cacheKey]: list },
                                },
                            },
                            params: { ...state.params, tours: { ...state.params.tours, [companyId]: params } },
                            activeCacheKey: {
                                ...state.activeCacheKey,
                                tours: { ...state.activeCacheKey.tours, [companyId]: cacheKey },
                            },
                            loading: { ...state.loading, tours: false },
                        }));
                        return list;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set((state) => ({
                            error: { ...state.error, tours: message },
                            loading: { ...state.loading, tours: false },
                        }));
                        throw new Error(message);
                    }
                },

                fetchEmployees: async (companyId, overrideParams = {}, force = false) => {
                    const params = { ...defaultParams, ...get().params.employees[companyId], ...overrideParams };
                    const cacheKey = makeCacheKey(params);
                    const cached = get().listCache.employees[companyId]?.[cacheKey];

                    if (!force && cached) {
                        set((state) => ({
                            params: { ...state.params, employees: { ...state.params.employees, [companyId]: params } },
                            activeCacheKey: {
                                ...state.activeCacheKey,
                                employees: { ...state.activeCacheKey.employees, [companyId]: cacheKey },
                            },
                            loading: { ...state.loading, employees: false },
                            error: { ...state.error, employees: undefined },
                        }));
                        return cached;
                    }

                    set((state) => ({ loading: { ...state.loading, employees: true } }));
                    try {
                        const res = await api.get<ApiResponse>(`${ROOT_DIR}/${companyId}/employees`, { params });
                        const list: ListCache<EmployeeListItemDTO> = {
                            items: res.data.data.docs as EmployeeListItemDTO[],
                            page: res.data.data.page,
                            pages: res.data.data.pages,
                            total: res.data.data.total,
                            params,
                        };
                        set((state) => ({
                            listCache: {
                                ...state.listCache,
                                employees: {
                                    ...state.listCache.employees,
                                    [companyId]: { ...(state.listCache.employees[companyId] || {}), [cacheKey]: list },
                                },
                            },
                            params: { ...state.params, employees: { ...state.params.employees, [companyId]: params } },
                            activeCacheKey: {
                                ...state.activeCacheKey,
                                employees: { ...state.activeCacheKey.employees, [companyId]: cacheKey },
                            },
                            loading: { ...state.loading, employees: false },
                        }));
                        return list;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set((state) => ({
                            error: { ...state.error, employees: message },
                            loading: { ...state.loading, employees: false },
                        }));
                        throw new Error(message);
                    }
                },

                // --------------------
                // Fetch detail (tour/employee) with per-item loading keys
                // --------------------
                fetchTourDetail: async (companyId, tourId, force = false) => {
                    const { tourDetails } = get();
                    const loadingKey = tourDetailLoadingKey(tourId);
                    const errorKey = tourDetailErrorKey(tourId);
                    if (!force && tourDetails[tourId]) return tourDetails[tourId]!;

                    set((state) => ({ loading: { ...state.loading, [loadingKey]: true } }));
                    set((state) => ({ error: { ...state.error, [errorKey]: undefined } }));

                    try {
                        const res = await api.get<{ data: TourDetailDTO }>(`${ROOT_DIR}/${companyId}/tours/${tourId}`);
                        set((state) => ({
                            tourDetails: { ...state.tourDetails, [tourId]: res.data.data },
                            loading: { ...state.loading, [loadingKey]: false },
                        }));
                        return res.data.data;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set((state) => ({
                            error: { ...state.error, [errorKey]: message },
                            loading: { ...state.loading, [loadingKey]: false },
                        }));
                        throw new Error(message);
                    }
                },

                fetchEmployeeDetail: async (companyId, employeeId, force = false) => {
                    const { employeeDetails } = get();
                    const loadingKey = employeeDetailLoadingKey(employeeId);
                    const errorKey = employeeDetailErrorKey(employeeId);
                    if (!force && employeeDetails[employeeId]) return employeeDetails[employeeId]!;

                    set((state) => ({ loading: { ...state.loading, [loadingKey]: true } }));
                    set((state) => ({ error: { ...state.error, [errorKey]: undefined } }));

                    try {
                        const res = await api.get<{ data: EmployeeDetailDTO }>(`${ROOT_DIR}/${companyId}/employees/${employeeId}`);
                        set((state) => ({
                            employeeDetails: { ...state.employeeDetails, [employeeId]: res.data.data },
                            loading: { ...state.loading, [loadingKey]: false },
                        }));
                        return res.data.data;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set((state) => ({
                            error: { ...state.error, [errorKey]: message },
                            loading: { ...state.loading, [loadingKey]: false },
                        }));
                        throw new Error(message);
                    }
                },

                // --------------------
                // New: Fetch reviews for a specific tour (paginated, cached per tour)
                // --------------------
                fetchReviews: async (companyId, tourId, overrideParams = {}, force = false) => {
                    // Ensure params.tourReviews and tourReviews[tourId] exist
                    const state = get();
                    if (!state.params.tourReviews) state.params.tourReviews = {};
                    if (!state.params.tourReviews[tourId]) state.params.tourReviews[tourId] = { ...defaultParams };

                    const currentParams = state.params.tourReviews[tourId];
                    const params = { ...defaultParams, ...currentParams, ...overrideParams };
                    const cacheKey = makeCacheKey(params);

                    const cached = state.listCache.tourReviews?.[tourId]?.[cacheKey];

                    if (!force && cached) {
                        set((state) => ({
                            params: { ...state.params, tourReviews: { ...state.params.tourReviews, [tourId]: params } },
                            activeCacheKey: {
                                ...state.activeCacheKey,
                                tourReviews: { ...state.activeCacheKey.tourReviews, [tourId]: cacheKey },
                            },
                            loading: { ...state.loading, [tourListLoadingKey(tourId, "reviews")]: false },
                            error: { ...state.error, [tourListErrorKey(tourId, "reviews")]: undefined },
                        }));
                        return cached;
                    }

                    const loadingKey = tourListLoadingKey(tourId, "reviews");
                    const errorKey = tourListErrorKey(tourId, "reviews");

                    set((state) => ({ loading: { ...state.loading, [loadingKey]: true } }));
                    set((state) => ({ error: { ...state.error, [errorKey]: undefined } }));

                    try {
                        const res = await api.get<GetTourReviewsResponse>(`${ROOT_DIR}/${companyId}/tours/${tourId}/reviews`, { params });

                        const list: ListCache<ReviewListItemDTO> = {
                            items: res.data.data.docs,
                            total: res.data.data.total,
                            page: res.data.data.page,
                            pages: res.data.data.pages,
                            params,
                        };

                        set((state) => ({
                            listCache: {
                                ...state.listCache,
                                tourReviews: {
                                    ...state.listCache.tourReviews,
                                    [tourId]: { ...(state.listCache.tourReviews[tourId] || {}), [cacheKey]: list },
                                },
                            },
                            params: { ...state.params, tourReviews: { ...state.params.tourReviews, [tourId]: params } },
                            activeCacheKey: {
                                ...state.activeCacheKey,
                                tourReviews: { ...state.activeCacheKey.tourReviews, [tourId]: cacheKey },
                            },
                            loading: { ...state.loading, [loadingKey]: false },
                        }));

                        return list;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set((state) => ({
                            error: { ...state.error, [errorKey]: message },
                            loading: { ...state.loading, [loadingKey]: false },
                        }));
                        throw new Error(message);
                    }
                },

                // --------------------
                // New: Fetch reports for a specific tour (paginated, cached per tour)
                // --------------------
                fetchReports: async (companyId, tourId, overrideParams = {}, force = false) => {
                    const state = get();

                    // Ensure params.tourReports and tourReports[tourId] exist
                    if (!state.params.tourReports) state.params.tourReports = {};
                    if (!state.params.tourReports[tourId]) state.params.tourReports[tourId] = { ...defaultParams };

                    const currentParams = state.params.tourReports[tourId];
                    const params = { ...defaultParams, ...currentParams, ...overrideParams };
                    const cacheKey = makeCacheKey(params);

                    const cached = state.listCache.tourReports?.[tourId]?.[cacheKey];

                    if (!force && cached) {
                        set((state) => ({
                            params: { ...state.params, tourReports: { ...state.params.tourReports, [tourId]: params } },
                            activeCacheKey: {
                                ...state.activeCacheKey,
                                tourReports: { ...state.activeCacheKey.tourReports, [tourId]: cacheKey },
                            },
                            loading: { ...state.loading, [tourListLoadingKey(tourId, "reports")]: false },
                            error: { ...state.error, [tourListErrorKey(tourId, "reports")]: undefined },
                        }));
                        return cached;
                    }

                    const loadingKey = tourListLoadingKey(tourId, "reports");
                    const errorKey = tourListErrorKey(tourId, "reports");

                    set((state) => ({ loading: { ...state.loading, [loadingKey]: true } }));
                    set((state) => ({ error: { ...state.error, [errorKey]: undefined } }));

                    try {
                        const res = await api.get<GetTourReportsResponse>(
                            `${ROOT_DIR}/${companyId}/tours/${tourId}/reports`,
                            { params }
                        );

                        const list: ListCache<TourReportListItemDTO> = {
                            items: res.data.data.docs,
                            total: res.data.data.total,
                            page: res.data.data.page,
                            pages: res.data.data.pages,
                            params,
                        };

                        set((state) => ({
                            listCache: {
                                ...state.listCache,
                                tourReports: {
                                    ...state.listCache.tourReports,
                                    [tourId]: { ...(state.listCache.tourReports[tourId] || {}), [cacheKey]: list },
                                },
                            },
                            params: { ...state.params, tourReports: { ...state.params.tourReports, [tourId]: params } },
                            activeCacheKey: {
                                ...state.activeCacheKey,
                                tourReports: { ...state.activeCacheKey.tourReports, [tourId]: cacheKey },
                            },
                            loading: { ...state.loading, [loadingKey]: false },
                        }));

                        return list;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set((state) => ({
                            error: { ...state.error, [errorKey]: message },
                            loading: { ...state.loading, [loadingKey]: false },
                        }));
                        throw new Error(message);
                    }
                },
            }),
            {
                name: "company-detail-store",
                partialize: (state) => ({
                    companies: state.companies,
                    listCache: state.listCache,
                    params: state.params,
                    activeCacheKey: state.activeCacheKey,
                    tourDetails: state.tourDetails,
                    employeeDetails: state.employeeDetails,
                }),
            }
        )
    )
);
