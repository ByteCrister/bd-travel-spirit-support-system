// types/guide-banner-settings.types.ts

import { ApiResponse } from "./api.types";

/* -------------------------
   Basic id and date helpers
   ------------------------- */

export type ID = string;
export type ISODateString = string;

/* -------------------------
   Constants and unions
   ------------------------- */

export const GUIDE_BANNER_SORT_KEYS = ["order", "createdAt", "active"] as const;
export type GuideBannerSortKey = typeof GUIDE_BANNER_SORT_KEYS[number];

export const DEFAULT_PAGE_LIMIT = 25 as const;

/* -------------------------
   Request status and error shapes
   ------------------------- */

/** Standardized request lifecycle states */
export enum RequestStatus {
    Idle = "idle",
    Pending = "pending",
    Success = "success",
    Failed = "failed",
    Cancelled = "cancelled",
}

/** Structured API error returned by backend or normalized by client */
export interface RequestError {
    /** short machine code, e.g., VALIDATION_ERROR, NOT_FOUND */
    code?: string;
    /** human message suitable for UI */
    message: string;
    /** optional structured details to show in logs or developer UI */
    details?: Record<string, unknown>;
    /** optional HTTP status */
    status?: number;
    /** optional trace id for support */
    traceId?: string;
}

/* -------------------------
   Core domain types
   ------------------------- */

/** Mirrors embedded GuideBanner in SiteSettings schema */
export interface GuideBannerDoc {
    asset: ID;
    alt?: string | null;
    caption?: string | null;
    order: number;
    active: boolean;
    createdAt?: ISODateString;
    updatedAt?: ISODateString;
}

/** Complete entity used in UI store; includes an id when persisted */
export interface GuideBannerEntity extends GuideBannerDoc {
    _id: ID;
}

/* -------------------------
   API DTOs
   ------------------------- */

/** Create guide banner payload from UI */
export interface GuideBannerCreateDTO {
    asset: ID;
    alt?: string | null;
    caption?: string | null;
    order?: number;
    active?: boolean;
}

/** Update/replace payload */
export interface GuideBannerUpdateDTO {
    asset?: ID;
    alt?: string | null;
    caption?: string | null;
    order?: number;
    active?: boolean;
}

/* -------------------------
   API response shapes
   ------------------------- */

/** Single entity response */
export type GuideBannerResponse = ApiResponse<GuideBannerEntity>;

/** List response with pagination metadata */
export type GuideBannerListResponse = ApiResponse<{
    data: GuideBannerEntity[];
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
}>

/** SiteSettings upsert response including embedded banners */
export interface SiteSettingsUpsertResponse {
    data: {
        _id?: ID;
        version: number;
        guideBanners: GuideBannerEntity[];
        createdAt?: ISODateString;
        updatedAt?: ISODateString;
    };
    error?: RequestError;
}

/* -------------------------
   UI form and validation
   ------------------------- */

export interface GuideBannerFormValues {
    asset: string;
    alt: string;
    caption: string;
    order: number;
    active: boolean;
}

export type GuideBannerFormErrors = Partial<Record<keyof GuideBannerFormValues, string>>;

/* -------------------------
   Queries, sorting and filters
   ------------------------- */

export interface GuideBannerQueryParams {
    limit?: number;
    offset?: number;
    sortBy?: GuideBannerSortKey;
    sortDir?: "asc" | "desc";
    active?: boolean;
    search?: string;
}

/* -------------------------
   Normalized store helpers
   ------------------------- */

export interface NormalizedMap<T> {
    byId: Record<string, T>;
    allIds: string[];
}

/* -------------------------
   Loading and error management for store
   ------------------------- */

/**
 * Per-entity request tracker for fine-grained UI feedback.
 * - status: current state of the operation
 * - error: last error for this operation
 * - startedAt/finishedAt: timestamps to support timeouts and stale indicators
 */
export interface EntityRequestState {
    status: RequestStatus;
    error?: RequestError | null;
    startedAt?: ISODateString;
    finishedAt?: ISODateString;
    // an opaque token to correlate inflight requests (optional)
    requestId?: string;
}

/** Aggregated operation tracker keyed by operation name */
export type OperationTracker = Record<string, {
    global: {
        status: RequestStatus;
        error?: RequestError | null;
        startedAt?: ISODateString;
        finishedAt?: ISODateString;
        requestId?: string;
    };
    byId?: Record<string, EntityRequestState>;
}>;

/* -------------------------
   Zustand store state
   ------------------------- */

/**
 * GuideBannersState supports:
 * - normalized storage for fast CRUD
 * - global and per-entity request tracking
 * - optimistic update helpers and rollback metadata
 * - pagination metadata and last query
 */
export interface GuideBannersState {
    // normalized storage
    normalized: NormalizedMap<GuideBannerEntity>;

    // metadata
    total?: number;
    lastFetchedAt?: ISODateString;
    lastQuery?: GuideBannerQueryParams | null;

    // global list-level request state
    listRequest: {
        status: RequestStatus;
        error?: RequestError | null;
        startedAt?: ISODateString;
        finishedAt?: ISODateString;
        requestId?: string;
    };

    // operation-level trackers (create, update, patch, delete, reorder)
    operations: OperationTracker;

    // optimistic operations registry: maps optimistic id to rollback
    optimisticRegistry: Record<string, { rollback: () => void; createdAt: ISODateString }>;

    // UI flags
    isHydrated: boolean;
}

/* -------------------------
   Store actions and thunks
   ------------------------- */

export interface GuideBannersActions {
    fetchList: (params?: GuideBannerQueryParams) => Promise<void>;
    fetchById: (id: ID) => Promise<GuideBannerEntity>;
    createBanner: (payload: GuideBannerCreateDTO) => Promise<GuideBannerEntity>;
    updateBanner: (id: ID, payload: GuideBannerUpdateDTO) => Promise<GuideBannerEntity>;
    toggleActive: (id: ID) => Promise<GuideBannerEntity>;
    removeBanner: (id: ID) => Promise<void>;

    // Local-only helpers for optimistic patterns
    upsertLocal: (entity: GuideBannerEntity) => void;
    removeLocal: (id: ID) => void;
    registerOptimistic: (key: string, rollback: () => void) => void;
    unregisterOptimistic: (key: string) => void;

    // request state helpers
    setOperationPending: (operation: string, id?: ID, requestId?: string) => void;
    setOperationSuccess: (operation: string, id?: ID, requestId?: string) => void;
    setOperationFailed: (operation: string, error: RequestError, id?: ID, requestId?: string) => void;

    clearErrors: () => void;
}

/* Combined store type for Zustand */
export type GuideBannersStore = GuideBannersState & GuideBannersActions;

/* -------------------------
   Optimistic update helpers and utility types
   ------------------------- */

export interface OptimisticEntity<T> {
    tempId: ID; // temporary local id while inflight
    entity: T;
    createdAt: ISODateString;
    rollback: () => void;
}

/* -------------------------
   Business constraints for validation
   ------------------------- */

export const GUIDE_BANNER_CONSTRAINTS = {
    altMaxLength: 250,
    captionMaxLength: 500,
    minOrder: 0,
    maxOrder: 1_000_000,
    defaultLimit: DEFAULT_PAGE_LIMIT,
} as const;

export type GuideBannerConstraints = typeof GUIDE_BANNER_CONSTRAINTS;

/* -------------------------
   Utility selector types for typed hooks
   ------------------------- */

export type GuideBannersSelector<T> = (state: GuideBannersStore) => T;