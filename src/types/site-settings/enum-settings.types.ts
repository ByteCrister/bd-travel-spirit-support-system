// src/types/enum-settings.types.ts
/* -------------------------
  Shared primitives
------------------------- */

import { ApiResponse } from "../common/api.types";

export type ID = string;

/** A stable string key used to identify enum groups (e.g., "ad_placements") */
export type EnumKey = string;

/* -------------------------
  Domain models (match DB schema)
------------------------- */

/** Single value within an enum group */
export interface EnumValue {
    /** Unique key within the group (used in code & forms) */
    key: string;
    /** Human-visible label shown in UI */
    label: string;
    /** Canonical underlying value (string or numeric) */
    value: string | number;
    /** Optional description for tooling / admin */
    description?: string | null;
    /** Toggle to hide inactive values without deleting */
    active: boolean;
}

/** Grouping of enum values (stored as SiteSettings.enums item) */
export interface EnumGroup {
    _id: ID;
    /** Stable name/key for the group, e.g. "ad_placements" */
    name: EnumKey;
    /** Short description for admins */
    description?: string | null;
    /** Values contained in this group */
    values: EnumValue[];
}

/* --------------------API types (requests & responses)------------------------ */

/** Response when fetching all enum groups */
export type GetEnumGroupsResponse = ApiResponse<{
    enums: EnumGroup[];
    fetchedAt: string; // ISO date-time
}>
export type GetEnumGroupResponse = ApiResponse<{
    enumGroup: EnumGroup | null;
    fetchedAt: string;
}>
export type EnumGroupResponse = ApiResponse<{ enumGroup: EnumGroup }>;
/* --------------------------------------------------------------------- */

/** Request payload to create a new EnumGroup */
export interface CreateEnumGroupPayload {
    name: EnumKey;
    description?: string | null;
    values?: Omit<EnumValue, "order">[]; // order assigned by server if absent
}

/** Request to update an existing EnumGroup (partial allowed) */
export interface UpdateEnumGroupPayload {
    _id: ID;
    name: EnumKey; // identifies group to update
    description?: string | null;
    values?: Partial<EnumValue>[]; // partial updates; server resolves by key
    /** optional optimistic update id for client-side concurrency handling */
    clientMutationId?: string;
}

/** Request to add/replace values within a group */
export interface UpsertEnumValuesPayload {
    _id: ID;
    name: string
    values: EnumValue[]; // server will upsert by key
    replace?: boolean; // true = replace all values, false = merge/upsert
}


/* -------------------------
  Zustand store slice types
  - Built to be integrated into a larger store
  - Includes support for loading/error states, optimistic updates,
    and selectors for UI consumption
------------------------- */

export type FetchStatus = "idle" | "loading" | "success" | "error";

/** Minimal per-group store state */
export interface EnumGroupState {
    data?: EnumGroup | null;
    status: FetchStatus;
    error?: string | null;
    lastFetchedAt?: string | null;
    // optimistic mutation tracking (clientMutationId -> timestamp)
    optimistic?: Record<string, string>;
}

/** Root slice for enum settings inside zustand */
export interface EnumSettingsSlice {
    /** keyed by group.name */
    groups: Record<EnumKey, EnumGroupState>;

    /** global list order (cached) */
    order: EnumKey[];

    /** global status / errors for bulk operations */
    status: FetchStatus;
    error?: string | null;

    /* -------------------------
       Actions
    ------------------------- */

    /** fetch all enum groups from API (populates groups & order) */
    fetchAll: (opts?: { force?: boolean }) => Promise<void>;

    /** fetch single group */
    fetchGroup: (_id: EnumKey, opts?: { force?: boolean }) => Promise<void>;

    /** create a new group */
    createGroup: (payload: CreateEnumGroupPayload) => Promise<EnumGroup>;

    /** update group partially (supports optimistic) */
    updateGroup: (payload: UpdateEnumGroupPayload) => Promise<EnumGroup>;

    /** upsert values into group (supports optimistic) */
    upsertValues: (
        payload: UpsertEnumValuesPayload & { clientMutationId?: string }
    ) => Promise<EnumGroup>;

    /** remove a value by key from a group */
    removeValue: (
        _id: ID,
        valueKey: string,
        opts?: { clientMutationId?: string }
    ) => Promise<EnumGroup>;

    /** set value active/inactive */
    setValueActive: (
        _id: ID,
        valueKey: string,
        active: boolean,
        opts?: { clientMutationId?: string }
    ) => Promise<EnumGroup>;

    /** delete an entire enum group */
    deleteGroup: (_id: ID, opts?: { clientMutationId?: string }) => Promise<void>;

    /** local utility to clear errors */
    clearError: () => void;

    /** selectors/helpers usable in components */
    getGroupOrNull: (_id: ID) => EnumGroup | null;
    listGroups: () => EnumGroup[];
}

/* -------------------------
  UI types
  - Form shapes, table rows, sorting & filters
------------------------- */

/** Form payload used by admin UI to edit/create enum value */
export interface EnumValueForm {
    key: string;
    label?: string;
    value: string | number;
    description?: string;
    active?: boolean;
}

/** Form payload used by admin UI to create/edit a group */
export interface EnumGroupForm {
    name: EnumKey;
    description?: string;
    values?: EnumValueForm[];
}

/** Table row used by the management UI list components */
export interface EnumValueRow {
    key: string;
    label: string;
    value: string | number;
    description?: string | null;
    active: boolean;
}

/** Pagination and sorting for UI tables */
export interface ListQuery {
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    filter?: string; // free text filter applied to key/label/description
}

/* -------------------------
  Utility / helper types
------------------------- */

/** Narrow union helper for known scalar enum values */
export type Narrow<T> = T extends string | number ? T : T;

/** Strictly typed map for lookup by key */
export type EnumValueMap<T extends EnumValue = EnumValue> = Record<T["key"], T>;
