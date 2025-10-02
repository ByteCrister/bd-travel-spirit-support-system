import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";
import { CompanyOverviewDTO, CompanyOverviewResponse } from "@/types/company.overview.types";
import { TourDetailDTO, TourListItemDTO } from "@/types/tour.types";
import { EmployeeDetailDTO, EmployeeListItemDTO } from "@/types/employee.types";
import api from "@/utils/api/axios";

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
    }
}

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
    };
    params: {
        tours: Record<string, PaginationParams>;
        employees: Record<string, PaginationParams>;
    };
    activeCacheKey: {
        tours: Record<string, string | undefined>;
        employees: Record<string, string | undefined>;
    };

    // Details
    tourDetails: Record<string, TourDetailDTO | undefined>;
    employeeDetails: Record<string, EmployeeDetailDTO | undefined>;

    // Loading & error
    loading: Record<string, boolean>;
    error: Record<string, string | undefined>;

    // Actions
    fetchCompany: (companyId: string, force?: boolean) => Promise<CompanyOverviewDTO>;
    fetchTours: (companyId: string, params?: Partial<PaginationParams>, force?: boolean) => Promise<ListCache<TourListItemDTO>>;
    fetchEmployees: (companyId: string, params?: Partial<PaginationParams>, force?: boolean) => Promise<ListCache<EmployeeListItemDTO>>;
    fetchTourDetail: (companyId: string, tourId: string, force?: boolean) => Promise<TourDetailDTO>;
    fetchEmployeeDetail: (companyId: string, employeeId: string, force?: boolean) => Promise<EmployeeDetailDTO>;
}

// --------------------
// Helpers
// --------------------
const makeCacheKey = (params: PaginationParams) =>
    `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;

const defaultParams: PaginationParams = { page: 1, limit: 10 };

// --------------------
// Store
// --------------------
export const useCompanyDetailStore = create<CompanyDetailState>()(
    devtools(
        persist(
            (set, get) => ({
                companies: {},
                listCache: { tours: {}, employees: {} },
                params: { tours: {}, employees: {} },
                activeCacheKey: { tours: {}, employees: {} },
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

                    set(state => ({ loading: { ...state.loading, company: true } }));
                    try {
                        const res = await api.get<CompanyOverviewResponse>(`${ROOT_DIR}/${companyId}`);
                        set(state => ({
                            companies: { ...state.companies, [companyId]: res.data.data },
                            loading: { ...state.loading, company: false },
                        }));
                        return res.data.data;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set(state => ({
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
                    if (!force && cached) return cached;

                    set(state => ({ loading: { ...state.loading, tours: true } }));
                    try {
                        const res = await api.get<ApiResponse>(
                            `${ROOT_DIR}/${companyId}/tours`,
                            { params }
                        );
                        const list: ListCache<TourListItemDTO> = {
                            items: res.data.data.docs as TourListItemDTO[],
                            total: res.data.data.total,
                            page: res.data.data.page,
                            pages: res.data.data.pages,
                            params,
                        };
                        set(state => ({
                            listCache: {
                                ...state.listCache,
                                tours: {
                                    ...state.listCache.tours,
                                    [companyId]: { ...(state.listCache.tours[companyId] || {}), [cacheKey]: list },
                                },
                            },
                            params: { ...state.params, tours: { ...state.params.tours, [companyId]: params } },
                            activeCacheKey: { ...state.activeCacheKey, tours: { ...state.activeCacheKey.tours, [companyId]: cacheKey } },
                            loading: { ...state.loading, tours: false },
                        }));
                        return list;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set(state => ({
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
                    if (!force && cached) return cached;

                    set(state => ({ loading: { ...state.loading, employees: true } }));
                    try {
                        const res = await api.get<ApiResponse>(
                            `${ROOT_DIR}/${companyId}/employees`,
                            { params }
                        );
                        const list: ListCache<EmployeeListItemDTO> = {
                            items: res.data.data.docs as EmployeeListItemDTO[],
                            page: res.data.data.page,
                            pages: res.data.data.pages,
                            total: res.data.data.total,
                            params
                        };
                        set(state => ({
                            listCache: {
                                ...state.listCache,
                                employees: {
                                    ...state.listCache.employees,
                                    [companyId]: { ...(state.listCache.employees[companyId] || {}), [cacheKey]: list },
                                },
                            },
                            params: { ...state.params, employees: { ...state.params.employees, [companyId]: params } },
                            activeCacheKey: { ...state.activeCacheKey, employees: { ...state.activeCacheKey.employees, [companyId]: cacheKey } },
                            loading: { ...state.loading, employees: false },
                        }));
                        return list;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set(state => ({
                            error: { ...state.error, employees: message },
                            loading: { ...state.loading, employees: false },
                        }));
                        throw new Error(message);
                    }
                },

                // --------------------
                // Fetch detail (tour/employee)
                // --------------------
                fetchTourDetail: async (companyId, tourId, force = false) => {
                    const { tourDetails } = get();
                    if (!force && tourDetails[tourId]) return tourDetails[tourId]!;

                    set(state => ({ loading: { ...state.loading, tourDetail: true } }));
                    try {
                        const res = await api.get<TourDetailDTO>(`${ROOT_DIR}/${companyId}/tours/${tourId}`);
                        set(state => ({
                            tourDetails: { ...state.tourDetails, [tourId]: res.data },
                            loading: { ...state.loading, tourDetail: false },
                        }));
                        return res.data;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set(state => ({
                            error: { ...state.error, tourDetail: message },
                            loading: { ...state.loading, tourDetail: false },
                        }));
                        throw new Error(message);
                    }
                },

                fetchEmployeeDetail: async (companyId, employeeId, force = false) => {
                    const { employeeDetails } = get();
                    if (!force && employeeDetails[employeeId]) return employeeDetails[employeeId]!;

                    set(state => ({ loading: { ...state.loading, employeeDetail: true } }));
                    try {
                        const res = await api.get<{ data: EmployeeDetailDTO }>(
                            `${ROOT_DIR}/${companyId}/employees/${employeeId}`
                        );
                        set(state => ({
                            employeeDetails: { ...state.employeeDetails, [employeeId]: res.data.data },
                            loading: { ...state.loading, employeeDetail: false },
                        }));
                        return res.data.data;
                    } catch (err: unknown) {
                        const message = extractErrorMessage(err);
                        set(state => ({
                            error: { ...state.error, employeeDetail: message },
                            loading: { ...state.loading, employeeDetail: false },
                        }));
                        throw new Error(message);
                    }
                },
            }),
            {
                name: "company-detail-store",
                partialize: state => ({
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
