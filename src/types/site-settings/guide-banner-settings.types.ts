// types/guide-banner-settings.types.ts
import { ApiResponse } from "../common/api.types";

/* -------------------------
   Basic id and date helpers
   ------------------------- */

/** Generic identifier used across domain objects */
export type ID = string;

/** ISO 8601 timestamp string */
export type ISODateString = string;

/* -------------------------
   Constants and unions
   ------------------------- */

/** Allowed sort keys for guide banner lists */
export const GUIDE_BANNER_SORT_KEYS = ["order", "createdAt", "active"] as const;
export type GuideBannerSortKey = typeof GUIDE_BANNER_SORT_KEYS[number];

/** Default page size used by list endpoints */
export const DEFAULT_PAGE_LIMIT = 25 as const;

/* -------------------------
   Request status and error shapes
   ------------------------- */

/** Standardized request lifecycle states for UI and trackers */
export enum RequestStatus {
  Idle = "idle",
  Pending = "pending",
  Success = "success",
  Failed = "failed",
  Cancelled = "cancelled",
}

/** Structured API error normalized for client usage */
export interface RequestError {
  /** short machine code, e.g., VALIDATION_ERROR, NOT_FOUND */
  code?: string;
  /** human message suitable for UI */
  message: string;
  /** optional structured details for logs or developer UI */
  details?: Record<string, unknown>;
  /** optional HTTP status code */
  status?: number;
  /** optional trace id returned by server for support */
  traceId?: string;
}

/* -------------------------
   Core domain types
   ------------------------- */

/** Embedded guide banner document shape (fields stored in SiteSettings) */
export interface GuideBannerDoc {
  asset: ID;
  alt?: string | null;
  caption?: string | null;
  order: number;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

/** Persisted guide banner entity used by UI and store (includes id) */
export interface GuideBannerEntity extends GuideBannerDoc {
  _id: ID;
}

/* -------------------------
   API DTOs
   ------------------------- */

/** Payload used to create a guide banner from UI */
export interface GuideBannerCreateDTO {
  asset: ID;
  alt?: string | null;
  caption?: string | null;
  order?: number;
  active?: boolean;
}

/** Payload used to update/replace a guide banner */
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

/** Single entity API response wrapper */
export type GuideBannerResponse = ApiResponse<GuideBannerEntity>;

/** Canonical list metadata returned by server for pagination */
export interface GuideBannerListMeta {
  /** total number of items across all pages when provided by server */
  total?: number;
  /** page size returned by server */
  limit?: number;
  /** offset of the first item in this page */
  offset?: number;
  /** optional server-side version or etag for the list */
  version?: number | string;
  /** extension point for additional server metadata */
  [key: string]: unknown;
}

/** List response with data and pagination metadata */
export type GuideBannerListResponse = ApiResponse<{
  data: GuideBannerEntity[];
  meta: GuideBannerListMeta;
}>;

/* -------------------------
   Caching shapes
   ------------------------- */

/** Cache entry stored per query key in the store's Map cache */
export interface GuideBannerQueryCacheEntry {
  data: GuideBannerEntity[];
  meta?: GuideBannerListMeta;
  createdAt: ISODateString;
}

/* -------------------------
   Site settings response
   ------------------------- */

/** Response shape for SiteSettings upsert that includes embedded banners */
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

/** Form values used by banner edit/create UI */
export interface GuideBannerFormValues {
  asset: string;
  alt: string;
  caption: string;
  order: number;
  active: boolean;
}

/** Validation errors keyed by form field */
export type GuideBannerFormErrors = Partial<Record<keyof GuideBannerFormValues, string>>;

/* -------------------------
   Queries, sorting and filters
   ------------------------- */

/** Query parameters accepted by list endpoints and client helpers */
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

/** Simple normalized map for fast CRUD and lookups */
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
  /** opaque token to correlate inflight requests (optional) */
  requestId?: string;
}

/** Aggregated operation tracker keyed by operation name */
export type OperationTracker = Record<
  string,
  {
    global: {
      status: RequestStatus;
      error?: RequestError | null;
      startedAt?: ISODateString;
      finishedAt?: ISODateString;
      requestId?: string;
    };
    byId?: Record<string, EntityRequestState>;
  }
>;

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
  /** normalized storage */
  normalized: NormalizedMap<GuideBannerEntity>;

  /** list metadata */
  total?: number;
  lastFetchedAt?: ISODateString;
  lastQuery?: GuideBannerQueryParams | null;

  /** global list-level request state */
  listRequest: {
    status: RequestStatus;
    error?: RequestError | null;
    startedAt?: ISODateString;
    finishedAt?: ISODateString;
    requestId?: string;
  };

  /** operation-level trackers (create, update, patch, delete, reorder) */
  operations: OperationTracker;

  /** optimistic operations registry: maps optimistic id to rollback */
  optimisticRegistry: Record<string, { rollback: () => void; createdAt: ISODateString }>;

  /** Map-based query cache keyed by serialized query params */
  queryCache: Map<string, GuideBannerQueryCacheEntry>;

  /** UI hydration flag */
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

  /** Local-only helpers for optimistic patterns */
  upsertLocal: (entity: GuideBannerEntity) => void;
  removeLocal: (id: ID) => void;
  registerOptimistic: (key: string, rollback: () => void) => void;
  unregisterOptimistic: (key: string) => void;

  /** Cache helpers */
  getCachedList: (key: string) => GuideBannerQueryCacheEntry | null;
  setCachedList: (key: string, data: GuideBannerEntity[], meta?: GuideBannerListMeta) => void;
  invalidateQueryCache: (predicate?: (params: GuideBannerQueryParams) => boolean) => void;

  /** Request state helpers */
  setOperationPending: (operation: string, id?: ID, requestId?: string) => void;
  setOperationSuccess: (operation: string, id?: ID, requestId?: string) => void;
  setOperationFailed: (operation: string, error: RequestError, id?: ID, requestId?: string) => void;

  clearErrors: () => void;
}

/** Combined store type for Zustand */
export type GuideBannersStore = GuideBannersState & GuideBannersActions;

/* -------------------------
   Optimistic update helpers and utility types
   ------------------------- */

/** Metadata for an optimistic entity tracked while inflight */
export interface OptimisticEntity<T> {
  tempId: ID;
  entity: T;
  createdAt: ISODateString;
  rollback: () => void;
}

/* -------------------------
   Business constraints for validation
   ------------------------- */

/** Validation and business constraints used by UI and server calls */
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

/** Typed selector for Zustand hooks */
export type GuideBannersSelector<T> = (state: GuideBannersStore) => T;