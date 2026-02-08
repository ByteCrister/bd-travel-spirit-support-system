// advertising.types.ts

import { AdStatusType, PlacementType } from "@/constants/advertising.const";

/* --------------------------------------------------------------------------
 * Denormalized snapshot embedded in an ad (read optimized)
 * -------------------------------------------------------------------------*/
export interface PlanSnapshot {
    name: string;
    placements: PlacementType[];
    price: number;
    currency: string;
    durationDays: number;
    description?: string;
}

/* --------------------------------------------------------------------------
 * DTOs: what client sends (guide) and admin action DTO
 * -------------------------------------------------------------------------*/
export interface AdvertisementCreateDTO {
    guideId: string;
    tourId?: string;
    title?: string;
    planName: string;
    placements: PlacementType[];
    startAt?: string;
    endAt?: string;
    autoRenew?: boolean;
    note?: string;
    paymentRef?: string | null;
}

export interface AdvertisementUpdateDTO {
    title?: string;
    startAt?: string | null;
    endAt?: string | null;
    autoRenew?: boolean;
    note?: string | null;
    paymentRef?: string | null;
    action?: "save_draft" | "submit_for_approval" | "cancel" | "pause" | "resume";
}

export type AdsActionTypes = "approve" | "reject" | "pause" | "resume" | "expire" | "cancel";

export interface AdvertisementAdminActionDTO {
    id: string;
    action: AdsActionTypes;
    reason?: string;
    endAt?: string | null;
}

/* --------------------------------------------------------------------------
 * Read model returned by APIs (stable shape for UI)
 * -------------------------------------------------------------------------*/
export interface AdvertisementResponse {
    id: string;
    guideId: string;
    guideName?: string;
    tourId?: string;
    tourTitle?: string;
    title?: string;
    snapshot: PlanSnapshot;
    placements: PlacementType[];
    status: AdStatusType;
    reason?: string;
    startAt?: string;
    endAt?: string;
    autoRenew: boolean;
    renewCount: number;
    impressions: number;
    clicks: number;
    paymentRef?: string | null;
    note?: string | null;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt?: string | null;
    deletedBy?: string | null;
    expiryDate?: string | null;
    ctr?: number | null;
}

/* --------------------------------------------------------------------------
 * List / Query helpers
 * -------------------------------------------------------------------------*/
export type AdListSortField =
    | "createdAt"
    | "startAt"
    | "endAt"
    | "status"
    | "impressions"
    | "clicks";

export type SortDirection = "asc" | "desc";

export interface AdListQuery {
    page?: number;
    limit?: number;
    q?: string;
    guideId?: string;
    tourId?: string;
    status?: AdStatusType | AdStatusType[];
    placements?: PlacementType | PlacementType[];
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    sortBy?: AdListSortField;
    sortDir?: SortDirection;
    withDeleted?: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

/* --------------------------------------------------------------------------
 * API response envelope
 * -------------------------------------------------------------------------*/
export interface ApiSuccess<T> {
    ok: true;
    data: T;
    message?: string;
    meta?: Record<string, unknown>;
}
export interface ApiFailure {
    ok: false;
    error: {
        code?: string;
        message: string;
        details?: Record<string, unknown> | string;
    };
}
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/* --------------------------------------------------------------------------
 * Dashboard / Overview
 * -------------------------------------------------------------------------*/
export interface AdvertisementStatusStat {
    status: AdStatusType;
    count: number;
}
export interface TopPlacement {
    placement: PlacementType;
    count: number;
}
export interface AdvertisementOverview {
    totalAds: number;
    activeAds: number;
    pendingAds: number;
    draftAds: number;
    pausedAds: number;
    cancelledAds: number;
    expiredAds: number;
    rejectedAds: number;
    statusStats: AdvertisementStatusStat[];
    topPlacements: TopPlacement[];
    impressionsTotal: number;
    clicksTotal: number;
    averageCTR?: number | null;
}

/* --------------------------------------------------------------------------
 * UI primitives
 * -------------------------------------------------------------------------*/
export type TableRenderType = "text" | "number" | "date" | "status" | "actions" | "custom";
export interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    width?: number | string;
    render?: TableRenderType;
    ariaLabel?: string;
}

export interface SelectionState {
    selectedIds: string[];
    toggle(id: string): void;
    set(ids: string[]): void;
    clear(): void;
    has(id: string): boolean;
}

export interface PaginationState {
    page: number;
    limit: number;
    total: number;
    setPage(p: number): void;
    setLimit(l: number): void;
}

/* --------------------------------------------------------------------------
 * Filter state used by toolbar components
 * -------------------------------------------------------------------------*/
export interface FilterState {
    q: string;
    status: AdStatusType[];
    placements: PlacementType[];
    dateRange?: { from?: string; to?: string } | null;
    reset(): void;
}

/* --------------------------------------------------------------------------
 * Cache keys + normalization helpers
 * -------------------------------------------------------------------------*/
export const AdCacheKeys = {
    ad: (id: string) => ["ads", "ad", id] as const,
    list: (q?: AdListQuery) => ["ads", "list", normalizeQueryKey(q)] as const,
    overview: () => ["ads", "overview"] as const,
};

export function normalizeQueryKey(q?: AdListQuery) {
  const normalizeArr = (v?: string[] | string | null) => {
    if (!v) return null;
    const arr = Array.isArray(v) ? v.slice() : [v];
    return arr.map(String).map(s => s.trim()).filter(Boolean).sort();
  };

  const normalized = {
    page: q?.page ?? 1,
    limit: q?.limit ?? 20,
    q: (q?.q ?? "").trim(),
    guideId: q?.guideId ?? null,
    tourId: q?.tourId ?? null,
    status: normalizeArr(q?.status ?? null),
    placements: normalizeArr(q?.placements ?? null),
    startDateFrom: q?.startDateFrom ?? null,
    startDateTo: q?.startDateTo ?? null,
    endDateFrom: q?.endDateFrom ?? null,
    endDateTo: q?.endDateTo ?? null,
    sortBy: q?.sortBy ?? "createdAt",
    sortDir: q?.sortDir ?? "desc",
    withDeleted: !!q?.withDeleted,
  };

  return JSON.stringify(normalized);
}


/* --------------------------------------------------------------------------
 * Fine-grained loading / error states
 * - every async domain has separate loading/error metadata
 * - store will also keep cache timestamps for each cached entity
 * -------------------------------------------------------------------------*/
export interface AsyncMeta {
    loading: boolean;
    error?: string | null;
    lastFetchedAt?: string | null; // ISO timestamp for cache staleness checks
}

/* --------------------------------------------------------------------------
 * Zustand admin store types — state and actions
 * - Admin cannot create ads; only change status via adminAction
 * - All API results are cached in store and meta tracks loading/errors separately
 * -------------------------------------------------------------------------*/
export interface AdminAdsState {
    // List slice
    list: AdvertisementResponse[];
    listMeta: AsyncMeta & { pagination: { page: number; limit: number; total: number; pages: number } };
    listQuery: AdListQuery;

    // Single ad slice
    activeAd?: AdvertisementResponse | null;
    activeAdMeta: AsyncMeta;

    // Overview slice
    overview?: AdvertisementOverview | null;
    overviewMeta: AsyncMeta;

    // Action/meta for admin-only operations (approve/reject/pause/resume/expire/cancel)
    adminActionMeta: Record<
        string, // action key (e.g., "approve:adId" or generic "adminAction")
        AsyncMeta
    >;

    // Soft delete / restore meta
    deletionMeta: Record<string, AsyncMeta>; // keyed by adId

    // Selection, filters, columns
    selection: SelectionState;
    filters: FilterState;
    columns: TableColumn[];

    // Cache map storing API responses by id (denormalized & used for fast lookups)
    cache: {
        byId: Record<string, { ad: AdvertisementResponse; meta: AsyncMeta }>;
        listKey?: string | null; // normalized query string used to populate list
        overviewKey?: string | null;
    };
}

export interface AdminAdsActions {
    // Fetching
    fetchList(query?: AdListQuery): Promise<ApiResponse<PaginatedResponse<AdvertisementResponse>>>;
    fetchById(id: string): Promise<ApiResponse<AdvertisementResponse>>;
    fetchOverview(): Promise<ApiResponse<AdvertisementOverview>>;

    // Admin-only state transitions
    adminAction(action: AdvertisementAdminActionDTO): Promise<ApiResponse<AdvertisementResponse>>;

    // Soft delete / restore
    softDelete(id: string): Promise<ApiResponse<AdvertisementResponse | null>>;
    restore(id: string): Promise<ApiResponse<AdvertisementResponse | null>>;

    // UI helpers
    setQuery(q: Partial<AdListQuery>): void;
    setPage(p: number): void;
    setLimit(l: number): void;
    setFilters(f: Partial<FilterState>): void;
    clearFilters(): void;
    setActiveAd(ad: AdvertisementResponse | null): void;

    // Cache control
    writeAdToCache(ad: AdvertisementResponse): void;
    writeListToCache(list: AdvertisementResponse[], key: string, pagination: { page: number; limit: number; total: number; pages: number }): void;
    clearCache(): void;

    // meta helpers (useful in tests / optimistic updates)
    setMetaForList(meta: AsyncMeta): void;
    setMetaForAd(id: string, meta: AsyncMeta): void;
    setMetaForOverview(meta: AsyncMeta): void;
}

/* --------------------------------------------------------------------------
 * Recommended server behavior (concise)
 * - server returns ApiResponse<T> envelope for all endpoints
 * - server populates computed fields (expiryDate, ctr) in AdvertisementResponse
 * - server enforces permissions:
 *     Guides: create/update own ads; can submit/cancel/pause/resume
 *     Admin: cannot create ads; only adminAction for status changes + reason
 * - server returns PlanSnapshot denormalized inside ad for UI convenience
 * -------------------------------------------------------------------------*/
