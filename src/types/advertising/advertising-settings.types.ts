// types/advertising-settings.types.ts
// Types for admin advertising prices management (singleton SiteSettings.advertising)

import { PlacementType } from "@/constants/advertising.const";
import { Currency } from "@/constants/tour.const";
import { ApiResponse } from "../common/api.types";

/* -------------------------
   Primitives
------------------------- */

export type ObjectId = string;
/* -------------------------
   Placement literals
   Keep these values in sync with constants/advertising.const.ts
------------------------- */

export interface AdvertisingPriceDTO {
    id: ObjectId;                 // server-generated id for the pricing entry
    title: string;
    placement: PlacementType;
    price: number;                // canonical numeric price (non-negative)
    currency: Currency;
    defaultDurationDays?: number; // optional default duration in days
    allowedDurationsDays: number[]; // explicit allowed durations; empty => no restriction
    active: boolean;
    createdAt: string;            // ISO timestamp
    updatedAt: string;            // ISO timestamp
}

export type CreateAdvertisingPriceRes = ApiResponse<AdvertisingPriceDTO>;
export type UpdateAdvertisingPriceRes = CreateAdvertisingPriceRes;

export interface AdvertisingConfigDTO {
    pricing: AdvertisingPriceDTO[];
    notes?: string | null;
    version?: number;
}

export type FetchAdvertisingConfigRes = ApiResponse<AdvertisingConfigDTO>;

export type BulkUpdateRes = FetchAdvertisingConfigRes;

/* -------------------------
   API request payloads
   Minimal, explicit shapes clients send to server endpoints.
------------------------- */

export interface CreateAdvertisingPricePayload {
    title: string;
    placement: PlacementType;
    price: number;
    currency?: Currency;           // optional; server default applies
    defaultDurationDays?: number;
    allowedDurationsDays?: number[]; // if omitted, server may default to []
    active?: boolean;              // defaults to true if omitted
}

export interface UpdateAdvertisingPricePayload {
    id: ObjectId;
    title: string;
    placement?: PlacementType;
    price?: number;
    currency?: Currency;
    defaultDurationDays?: number | null; // null to remove default
    allowedDurationsDays?: number[];     // full-replace array
    active?: boolean;
}

export interface BulkUpdateAdvertisingPricesPayload {
    updates: UpdateAdvertisingPricePayload[]; // partial updates
    removeIds?: ObjectId[];                   // entries to delete
    editorId?: ObjectId;                      // optional audit
    note?: string;                            // optional changelog note
}

/* -------------------------
   Form types (editable, tolerant)
   Use with React Hook Form / Formik — allows empty strings while editing.
------------------------- */

export interface AdvertisingPriceForm {
    id?: ObjectId;                // undefined for new entries
    title: string | "";
    placement: PlacementType | "";    // allow empty for validation UX
    price: number | "";           // number or blank during editing
    currency: Currency | "";
    defaultDurationDays?: number | "" | null;
    allowedDurationsDays: number[]; // selection UI -> numbers
    active: boolean;
}

export type AdvertisingFormErrors = Partial<Record<keyof AdvertisingPriceForm, string>>;

/* -------------------------
   Table / UI row (denormalized)
   Optimized for rendering lists and sorting without heavy compute.
------------------------- */

export interface AdvertisingPriceRow {
    id: ObjectId;
    title: string;
    placement: PlacementType;
    placementLabel: string;        // e.g., "Landing banner" for human display
    price: number;
    currency: Currency;
    defaultDurationDays?: number | null;
    allowedDurationsDays: number[]; // for display comma-join
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

/* -------------------------
   Zustand store interface
   Deterministic async actions returning DTOs for downstream UI handling.
------------------------- */

export interface AdvertisingSettingsState {
    // data
    config?: AdvertisingConfigDTO | null;
    pricingRows: AdvertisingPriceRow[]; // denormalized for UI
    selectedIds: Set<ObjectId>;
    loading: boolean;
    saving: boolean;
    lastError?: string | null;

    // selectors / derived
    getRowById: (id: ObjectId) => AdvertisingPriceRow | undefined;
    listActiveRows: () => AdvertisingPriceRow[];

    // actions (all return Promises for composability)
    fetchConfig: () => Promise<void>;
    createPrice: (payload: CreateAdvertisingPricePayload) => Promise<AdvertisingPriceDTO>;
    updatePrice: (payload: UpdateAdvertisingPricePayload) => Promise<AdvertisingPriceDTO>;
    bulkUpdate: (payload: BulkUpdateAdvertisingPricesPayload) => Promise<AdvertisingConfigDTO>;
    deletePrice: (id: ObjectId) => Promise<void>;
    toggleActive: (id: string) => Promise<AdvertisingPriceDTO>;
    toggleSelect: (id: ObjectId) => void;
    clearSelection: () => void;
    setLastError: (err?: string | null) => void;
}

/* -------------------------
   Small shared helpers
------------------------- */

export interface SelectOption<T = string> {
    label: string;
    value: T;
    disabled?: boolean;
}

/* -------------------------
   Validation result
   Standard shape for sync validation routines used by forms/handlers.
------------------------- */

export interface ValidationResult<T = AdvertisingPriceForm> {
    valid: boolean;
    errors: Partial<Record<keyof T, string>>;
}
