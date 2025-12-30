// types/password-reset.types.ts
// Production-grade types for ResetPasswordRequest UI, API and zustand store
// Derived from models/reset-password-request.model.ts
// Note: single super-admin in the system — admin metadata removed
// Pagination model: page-based (button) pagination only

import { RequestStatus } from "@/constants/reset-password-request.const";

/* -------------------------------------------------------------------------- */
/*  Core domain types (model-derived)                                         */
/* -------------------------------------------------------------------------- */

export type ResetRequestId = string;

export interface ResetPasswordRequestDTO {
    _id: ResetRequestId;
    requesterEmail: string;
    requesterMobile?: string;
    requesterName?: string;
    description?: string;
    reason?: string; // present when status === "denied"
    status: RequestStatus;
    requestedAt: string; // ISO date string
    reviewedAt?: string;
    fulfilledAt?: string;
    requestedFromIP?: string;
    requestedAgent?: string;
    createdAt?: string;
    updatedAt?: string;
}

/** Matches model.toEmailPayload */
export interface ResetPasswordEmailPayload {
    requesterEmail: string;
    requesterName?: string;
    requesterMobile?: string;
    status: RequestStatus;
    description?: string;
    reason?: string | undefined;
}

/* -------------------------------------------------------------------------- */
/*  API request / response shapes                                              */
/* -------------------------------------------------------------------------- */

export interface CreateResetRequestPayload {
    email: string;
    mobile?: string;
    name?: string;
    description?: string;
    requestedFromIP?: string;
    requestedAgent?: string;
}

export interface SingleResetRequestResponse {
    data: ResetPasswordRequestDTO;
    meta?: { message?: string };
}

export interface ApiErrorShape {
    message: string;
    code?: string | number;
    details?: Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/*  List / search / pagination / sorting types                                 */
/* -------------------------------------------------------------------------- */

export type ResetRequestSortableField =
    | "requesterEmail"
    | "requesterName"
    | "status"
    | "requestedAt"
    | "reviewedAt"
    | "fulfilledAt";

export type SortDirection = "asc" | "desc";

/** Page-based (button) query used by the UI to request lists from the API */
export interface ResetRequestListQuery {
    search?: string; // fuzzy across email/name/mobile
    status?: RequestStatus | "all";
    sortBy?: ResetRequestSortableField;
    sortDir?: SortDirection;
    page?: number; // 1-based page index (button pagination)
    limit?: number; // items per page
    filters?: Record<string, string | number | boolean | undefined>;
}

/** Server response for listing requests (page-based) */
export interface ResetRequestListResponse {
    data: ResetPasswordRequestDTO[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/* -------------------------------------------------------------------------- */
/*  Admin actions (super-admin only; no admin metadata required)               */
/* -------------------------------------------------------------------------- */

export interface DenyResetRequestPayload {
    requestId: ResetRequestId;
    reason: string;
}

export interface FulfillResetRequestPayload {
    requestId: ResetRequestId;
    // tempPassword delivered via email; do NOT persist in client cache
    tempPassword?: string;
}

export interface ApproveResetRequestPayload {
    requestId: ResetRequestId;
}

export interface UpdatePasswordPayload {
    requestId: ResetRequestId;
    /**
     * New password to set for the account.
     * Prefer server-generated temporary passwords where possible.
     * Do NOT persist this value in client caches or state.
     */
    newPassword: string;
    /** If true, server should notify the requester by email/SMS */
    notifyRequester?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Normalized store / cache friendly shapes (for zustand + caching layer)     */
/* -------------------------------------------------------------------------- */

export interface ResetRequestEntity {
    id: ResetRequestId;
    attributes: ResetPasswordRequestDTO;
}

export type ResetRequestEntityMap = Record<ResetRequestId, ResetRequestEntity>;

export interface PagedCacheEntry {
    query: ResetRequestListQuery;
    ids: ResetRequestId[]; // ordered ids for this query/page
    fetchedAt: number; // Date.now() when fetched
    total: number;
    page: number;
    limit: number;
}

/* -------------------------------------------------------------------------- */
/*  Zustand store contract                                                     */
/* -------------------------------------------------------------------------- */

export interface ResetRequestsStoreState {
    entities: ResetRequestEntityMap;
    queryCache: Record<string, PagedCacheEntry>;
    currentQuery: ResetRequestListQuery;
    currentPageIds: ResetRequestId[]; // ids visible for currentQuery/page
    loading: boolean;
    isFetching: boolean;
    isFetchingById: boolean;
    revalidating: boolean;
    error?: ApiErrorShape | null;
    lastFetchedAt?: number;

    // Actions
    setQuery(query: Partial<ResetRequestListQuery>): void; // merges into currentQuery
    fetchList(query?: ResetRequestListQuery): Promise<void>; // populates queryCache and currentPageIds
    fetchById(id: ResetRequestId): Promise<void>;
    denyRequest(
        payload: DenyResetRequestPayload
    ): Promise<ResetPasswordRequestDTO>;
    invalidateQueryCache(queryKey?: string): void;
    updatePassword(payload: UpdatePasswordPayload): Promise<ResetPasswordRequestDTO>;
    clearAll(): void;
}