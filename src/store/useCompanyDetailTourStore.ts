import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";
import { ReviewDetailDTO } from "@/types/review.types";
import { ReportDetailDTO } from "@/types/report.types";
import { TourDetailDTO } from "@/types/tour.types";

const ROOT_DIR = "/users-management/companies";

type SortOrder = "asc" | "desc";
interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: SortOrder;
    search?: string;
}
interface ListResponse<T> {
    items: T[];
    total: number;
}
type TourTab = "reviews" | "reports";

const DEFAULT_PARAMS: PaginationParams = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
};

function makeCacheKey(params: PaginationParams): string {
    const { page, limit, sortBy = "", sortOrder = "", search = "" } = params;
    return `p=${page}&l=${limit}&sb=${sortBy}&so=${sortOrder}&q=${search}`;
}

type Resource = "reviews" | "reports";
type DTOMap = {
    reviews: ReviewDetailDTO;
    reports: ReportDetailDTO;
};

interface TourState {
    tourDetails: Record<string, TourDetailDTO>;
    listCache: {
        [R in Resource]: Record<string, Record<string, ListResponse<DTOMap[R]>>>;
    };
    tourTabs: Record<string, TourTab>;
    params: { [R in Resource]: Record<string, PaginationParams> };
    activeCacheKey: { [R in Resource]: Record<string, string> };
    loading: { [R in "tourDetail" | Resource]: Record<string, boolean> };
    error: { [R in "tourDetail" | Resource]: Record<string, string | undefined> };

    // selectors
    getTourDetail: (tourId: string) => TourDetailDTO | undefined;
    getActiveList: {
        [R in Resource]: (tourId: string) => ListResponse<DTOMap[R]> | undefined;
    };

    // actions
    setTourTab: (tourId: string, tab: TourTab, companyId: string) => Promise<void>;
    setParams: (
        resource: Resource,
        tourId: string,
        next: Partial<PaginationParams>,
        companyId: string
    ) => Promise<void>;

    initTourPage: (companyId: string, tourId: string) => Promise<void>;
    fetchTourDetail: (companyId: string, tourId: string, opts?: { force?: boolean }) => Promise<void>;
    fetchResource: <R extends Resource>(
        resource: R,
        companyId: string,
        tourId: string,
        opts?: { force?: boolean }
    ) => Promise<void>;
    refreshTourScope: (companyId: string, tourId: string) => Promise<void>;
}

export const useCompanyDetailTourStore = create<TourState>()(
    devtools(
        persist(
            (set, get) => ({
                tourDetails: {},
                listCache: { reviews: {}, reports: {} },
                tourTabs: {},
                params: { reviews: {}, reports: {} },
                activeCacheKey: { reviews: {}, reports: {} },
                loading: { tourDetail: {}, reviews: {}, reports: {} },
                error: { tourDetail: {}, reviews: {}, reports: {} },

                getTourDetail: (tourId) => get().tourDetails[tourId],

                getActiveList: {
                    reviews: (tourId) => {
                        const key = get().activeCacheKey.reviews[tourId];
                        return key ? get().listCache.reviews[tourId]?.[key] : undefined;
                    },
                    reports: (tourId) => {
                        const key = get().activeCacheKey.reports[tourId];
                        return key ? get().listCache.reports[tourId]?.[key] : undefined;
                    },
                },

                setTourTab: async (tourId, tab, companyId) => {
                    set((s) => ({ tourTabs: { ...s.tourTabs, [tourId]: tab } }));
                    await get().fetchResource(tab, companyId, tourId);
                },

                setParams: async (resource, tourId, next, companyId) => {
                    const current = get().params[resource][tourId] ?? DEFAULT_PARAMS;
                    const merged = { ...current, ...next };
                    set((s) => ({
                        params: { ...s.params, [resource]: { ...s.params[resource], [tourId]: merged } },
                    }));
                    await get().fetchResource(resource, companyId, tourId);
                },

                initTourPage: async (companyId, tourId) => {
                    if (!get().tourTabs[tourId]) {
                        set((s) => ({ tourTabs: { ...s.tourTabs, [tourId]: "reviews" } }));
                    }
                    set((s) => ({
                        params: {
                            reviews: { ...s.params.reviews, [tourId]: s.params.reviews[tourId] ?? DEFAULT_PARAMS },
                            reports: { ...s.params.reports, [tourId]: s.params.reports[tourId] ?? DEFAULT_PARAMS },
                        },
                    }));
                    await get().fetchTourDetail(companyId, tourId);
                    const tab = get().tourTabs[tourId];
                    await get().fetchResource(tab, companyId, tourId);
                },

                fetchTourDetail: async (companyId, tourId, opts) => {
                    if (!opts?.force && get().tourDetails[tourId]) return;
                    set((s) => ({
                        loading: { ...s.loading, tourDetail: { ...s.loading.tourDetail, [tourId]: true } },
                        error: { ...s.error, tourDetail: { ...s.error.tourDetail, [tourId]: undefined } },
                    }));
                    try {
                        const res = await api.get<{ data: TourDetailDTO }>(
                            `${ROOT_DIR}/${companyId}/tours/${tourId}`
                        );
                        set((s) => ({ tourDetails: { ...s.tourDetails, [tourId]: res.data.data } }));
                    } catch (err) {
                        set((s) => ({
                            error: { ...s.error, tourDetail: { ...s.error.tourDetail, [tourId]: extractErrorMessage(err) } },
                        }));
                    } finally {
                        set((s) => ({
                            loading: { ...s.loading, tourDetail: { ...s.loading.tourDetail, [tourId]: false } },
                        }));
                    }
                },

                fetchResource: async (resource, companyId, tourId, opts) => {
                    const params = get().params[resource][tourId] ?? DEFAULT_PARAMS;
                    const cacheKey = makeCacheKey(params);

                    if (!opts?.force) {
                        const cached = get().listCache[resource][tourId]?.[cacheKey];
                        if (cached) {
                            set((s) => ({
                                activeCacheKey: { ...s.activeCacheKey, [resource]: { ...s.activeCacheKey[resource], [tourId]: cacheKey } },
                            }));
                            return;
                        }
                    }

                    set((s) => ({
                        loading: { ...s.loading, [resource]: { ...s.loading[resource], [tourId]: true } },
                        error: { ...s.error, [resource]: { ...s.error[resource], [tourId]: undefined } },
                    }));

                    try {
                        const res = await api.get<{ data: ListResponse<DTOMap[typeof resource]> }>(
                            `${ROOT_DIR}/${companyId}/tours/${tourId}/${resource}`,
                            { params }
                        );
                        set((s) => ({
                            listCache: {
                                ...s.listCache,
                                [resource]: {
                                    ...s.listCache[resource],
                                    [tourId]: {
                                        ...(s.listCache[resource][tourId] ?? {}),
                                        [cacheKey]: res.data.data,
                                    },
                                },
                            },
                            activeCacheKey: {
                                ...s.activeCacheKey,
                                [resource]: { ...s.activeCacheKey[resource], [tourId]: cacheKey },
                            },
                        }));
                    } catch (err) {
                        set((s) => ({
                            error: { ...s.error, [resource]: { ...s.error[resource], [tourId]: extractErrorMessage(err) } },
                        }));
                    } finally {
                        set((s) => ({
                            loading: { ...s.loading, [resource]: { ...s.loading[resource], [tourId]: false } },
                        }));
                    }
                },

                refreshTourScope: async (companyId, tourId) => {
                    await get().fetchTourDetail(companyId, tourId, { force: true });
                    const tab = get().tourTabs[tourId] ?? "reviews";
                    await get().fetchResource(tab, companyId, tourId, { force: true });
                },
            }),
            {
                name: "company:tours-store",
                partialize: (state) => ({
                    // persist only lightweight UI state
                    params: state.params,
                    tourTabs: state.tourTabs,
                }),
            }
        )
    )
);
