// types/guide-subscription-settings.types.ts
import { ApiResponse } from "../common/api.types";

export type ID = string;

export enum Currency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    BDT = "BDT",
}

export enum SubscriptionStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export interface SubscriptionTierDTO {
    _id: ID;
    key: string;
    title: string;
    price: number;
    currency: Currency | string;
    billingCycleDays: number[];
    perks?: string[];
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

/* ---------------------------
API request/response shapes
--------------------------- */

export type GuideSubscriptionsApiResponse = ApiResponse<{
    guideSubscriptions: SubscriptionTierDTO[];
    updatedAt?: string;
}>;

export interface UpsertGuideSubscriptionsPayload {
    guideSubscriptions: SubscriptionTierDTO[];
}

export interface ReorderGuideSubscriptionsPayload {
    orderedIds: ID[];
    editorId?: ID;
    note?: string;
}

export type CreateSubscriptionTierPayload = Omit<SubscriptionTierDTO, "_id" | "createdAt" | "updatedAt">;

export type UpdateSubscriptionTierPayload = Omit<SubscriptionTierDTO, "createdAt" | "updatedAt">;

export type UpsertSubscriptionTierPayload =
  | CreateSubscriptionTierPayload
  | UpdateSubscriptionTierPayload;

export type SubscriptionTierApiResponse = ApiResponse<{
    tier: SubscriptionTierDTO;
    updatedAt?: string;
}>;

/* ---------------------------
Store types (zustand)
--------------------------- */

export type SubscriptionTierMap = Record<ID, SubscriptionTierDTO>;

export interface TierListQuery {
    search?: string;
    onlyActive?: boolean;
    sortBy?: "price" | "title" | "createdAt";
    sortDir?: "asc" | "desc";
}

export interface ValidationError {
    field?: string;
    message: string;
}

/* Cache types */

export type CacheKey = string;

export interface QueryCacheEntry<T = unknown> {
    key: CacheKey;
    query: TierListQuery;
    value: T;
    createdAt: string;
    ttlMs: number;
    updatedAt?: string;
}

export interface CacheIndex {
    [k: string]: QueryCacheEntry;
}

/* GuideSubscriptionsState */

export interface GuideSubscriptionsState {
    // data
    list: SubscriptionTierDTO[];
    map: SubscriptionTierMap;

    // metadata
    loading: boolean;
    saving: boolean;
    error?: string | null;
    lastFetchedAt?: string;

    // ui
    draft?: SubscriptionTierDTO | null;
    validations: ValidationError[];

    // query
    query: TierListQuery;

    // optional debug snapshot of cache keys (kept in sync by store helpers)
    cacheIndex?: Record<string, unknown>;

    // actions
    fetchAll: (force?: boolean, query?: TierListQuery) => Promise<void>;
    upsertTier: (payload: UpsertSubscriptionTierPayload) => Promise<SubscriptionTierDTO>;
    removeTier: (id: ID) => Promise<void>;

    setDraft: (d?: SubscriptionTierDTO | null) => void;
    setQuery: (q: Partial<TierListQuery>) => void;
    validateDraft: (d?: SubscriptionTierDTO | null) => ValidationError[];
    clearError: () => void;
}

/* ---------------------------
Form-level types
--------------------------- */

export interface SubscriptionTierFormValues {
    _id?: ID;
    key: string;
    title: string;
    price: number | string;
    currency: Currency | string;
    billingCycleDays: number[];
    perks: string[];
    active: boolean;
}

/* ---------------------------
Notes
--------------------------- */

/*
- QueryCacheEntry.ttlMs is required and used by the in-memory cache.
- fetchAll now accepts an optional query parameter to support query-keyed caching.
*/