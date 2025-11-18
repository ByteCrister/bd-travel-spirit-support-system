// types/guide-subscription-settings.types.ts
// Production-grade TypeScript types for guide subscription settings.
// Usable by: zustand store, API routes/responses, admin UI forms and components.

/* ---------------------------
Core enums and scalars
--------------------------- */

export type ID = string; // string representation for ObjectId across client/server

export enum Currency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    BDT = "BDT",
    // add more as needed
}

export enum SubscriptionStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

/* ---------------------------
Domain model: SubscriptionTier (matches Mongoose schema)
--------------------------- */

export interface SubscriptionTierDTO {
    /**
     * Unique key for programmatic access (e.g., "basic_monthly")
     * - recommended to be kebab-case or snake_case
     */
    key: string;

    /**
     * Human-facing title (e.g., "Basic — Monthly")
     */
    title: string;

    /**
     * Price amount in minor currency units is optional.
     * For simplicity we use decimal number representing major units (e.g., 9.99).
     */
    price: number;

    /**
     * ISO currency code
     */
    currency: Currency | string;

    /**
     * Available billing cycle durations expressed in days.
     * e.g., [30] for monthly, [365] for yearly, or [7, 30] if both weekly and monthly allowed.
     */
    billingCycleDays: number[];

    /**
     * Optional perks to display in UI / marketing copy
     */
    perks?: string[];

    /**
     * Admin toggle.
     */
    active: boolean;

    /**
     * Optional metadata bag for extensibility (analytics flags, plan id, feature flags)
     */
    metadata?: Record<string, unknown>;

    /**
     * Document id when persisted.
     */
    _id?: ID;

    /**
     * Timestamps (optional on DTO, present on saved documents)
     */
    createdAt?: string; // ISO date
    updatedAt?: string; // ISO date
}

/* ---------------------------
API request/response shapes
--------------------------- */

/**
 * API shape when returning the site settings singleton response
 * focused on guideSubscriptions. Keep consistent with backend SiteSettingsDoc.guideSubscriptions.
 */
export interface GuideSubscriptionsApiResponse {
    /**
     * The full array of subscription tiers stored in site settings
     */
    guideSubscriptions: SubscriptionTierDTO[];

    /**
     * Version number of site settings (from the singleton document)
     */
    version: number;

    /**
     * Last updated timestamp for caching
     */
    updatedAt?: string;
}

/**
 * API payload to upsert the full guideSubscriptions array (admin action).
 * This mirrors the backend upsertSingleton expectations: partial site settings where
 * guideSubscriptions is replaced by the provided array.
 */
export interface UpsertGuideSubscriptionsPayload {
    guideSubscriptions: SubscriptionTierDTO[];
    editorId?: ID; // admin user id performing edit
    note?: string; // changelog note
}

export interface ReorderGuideSubscriptionsPayload {
  orderedIds: ID[];
  editorId?: ID;
  note?: string;
}

/**
 * API payload for creating or updating a single subscription tier (UI form).
 * - For create: omit _id
 * - For update: include _id
 */
export interface UpsertSubscriptionTierPayload {
    tier: Omit<SubscriptionTierDTO, "_id" | "createdAt" | "updatedAt"> & Partial<Pick<SubscriptionTierDTO, "_id">>;
    editorId?: ID;
    note?: string;
}

/**
 * API response for single-tier CRUD
 */
export interface SubscriptionTierApiResponse {
    tier: SubscriptionTierDTO;
    version?: number;
    updatedAt?: string;
}

/* ---------------------------
Store types (zustand)
--------------------------- */

/**
 * Normalized map for fast lookup in the client store
 */
export type SubscriptionTierMap = Record<ID, SubscriptionTierDTO>;

/**
 * Sort and filter arguments used by the UI
 */
export interface TierListQuery {
    search?: string; // search on key/title
    onlyActive?: boolean;
    sortBy?: "price" | "title" | "createdAt" | "order";
    sortDir?: "asc" | "desc";
}

/**
 * Minimal runtime validation result for forms and API responses
 */
export interface ValidationError {
    field?: string; // optional field path (e.g., "price")
    message: string;
}

/**
 * The shape of the guide-subscriptions zustand slice
 */
export interface GuideSubscriptionsState {
    // data
    list: SubscriptionTierDTO[]; // source-of-truth array (keeps order)
    map: SubscriptionTierMap; // normalized access by id (if persisted) or key (if local)

    // metadata
    loading: boolean;
    saving: boolean;
    error?: string | null;
    version?: number; // site settings version number for concurrency checks
    lastFetchedAt?: string;

    // UI helpers
    draft?: SubscriptionTierDTO | null; // tier currently edited in modal/form
    validations: ValidationError[]; // last validation results

    // queries/filters
    query: TierListQuery;

    // actions
    fetchAll: (force?: boolean) => Promise<void>;
    upsertTier: (payload: UpsertSubscriptionTierPayload) => Promise<SubscriptionTierDTO>;
    removeTier: (id: ID) => Promise<void>;
    reorderTiers: (orderedIds: ID[], editorId?: ID, note?: string) => Promise<void>;
    setDraft: (d?: SubscriptionTierDTO | null) => void;
    setQuery: (q: Partial<TierListQuery>) => void;
    validateDraft: (d?: SubscriptionTierDTO | null) => ValidationError[];
    clearError: () => void;
}

/* ---------------------------
Form-level types for UI components
--------------------------- */

/**
 * Fields used in admin create/update forms.
 * Use this for React Hook Form or Formik types.
 */
export interface SubscriptionTierFormValues {
    key: string;
    title: string;
    price: number | string; // string allowed if input controlled; convert before submit
    currency: Currency | string;
    billingCycleDays: number[]; // selected billing durations in days
    perks: string[]; // array of lines or tags
    active: boolean;
    metadata?: Record<string, unknown>;
}

/* Props for reusable UI components */

/**
 * TierList props for index/table component
 */
export interface TierListProps {
    tiers: SubscriptionTierDTO[];
    loading?: boolean;
    onEdit: (tier: SubscriptionTierDTO) => void;
    onDelete: (id: ID) => void;
    onReorder?: (orderedIds: ID[]) => void;
    onToggleActive?: (id: ID, active: boolean) => void;
}

/**
 * TierForm props for modal / edit panel
 */
export interface TierFormProps {
    initialValues?: Partial<SubscriptionTierFormValues>;
    onCancel: () => void;
    onSubmit: (values: SubscriptionTierFormValues) => Promise<void>;
    loading?: boolean;
    validations?: ValidationError[];
}

/* ---------------------------
Utilities and helpers (types only)
--------------------------- */

/**
 * Minimal server-side validation result for API routes:
 */
export interface ApiValidationResponse {
    ok: false;
    errors: ValidationError[];
}

/**
 * Generic API success wrapper
 */
export interface ApiSuccessResponse<T = unknown> {
    ok: true;
    data: T;
    version?: number;
    updatedAt?: string;
}

/* ---------------------------
Notes and usage guidance
--------------------------- */

/*
- Use SubscriptionTierDTO as the canonical type for data transferred between server <-> client.
- Use SubscriptionTierFormValues for React forms; ensure you coerce/parse `price` to number
  and convert billingCycleDays to the expected numeric array before calling UpsertSubscriptionTierPayload.
- The zustand slice should keep both `list` (ordered) and `map` (by id) to enable:
    - stable ordering for UI
    - O(1) lookups by id
- Use `version` from GuideSubscriptionsApiResponse when upserting to detect concurrent edits.
- Keep ValidationError exhaustive but small; field should match dot-paths used in forms.
*/
