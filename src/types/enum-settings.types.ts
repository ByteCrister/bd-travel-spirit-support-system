// src/types/enum-settings.types.ts
// Production-grade types for managing SiteSettings.enums
// - Domain types match models/siteSettings.ts EnumGroup / EnumValue
// - API DTOs (requests/responses) are explicit and version-friendly
// - Zustand store types are ready for strictly typed store slices
// - UI types for forms, tables, sorting, filtering, selection

/* -------------------------
  Shared primitives
------------------------- */

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
    label?: string | null;
    /** Canonical underlying value (string or numeric) */
    value: string | number;
    /** Optional description for tooling / admin */
    description?: string | null;
    /** Optional order used for presentation */
    order?: number;
    /** Toggle to hide inactive values without deleting */
    active?: boolean;
}

/** Grouping of enum values (stored as SiteSettings.enums item) */
export interface EnumGroup {
    /** Stable name/key for the group, e.g. "ad_placements" */
    name: EnumKey;
    /** Short description for admins */
    description?: string | null;
    /** Values contained in this group */
    values: EnumValue[];
    /** Version number for this group (useful for caching / migrations) */
    version?: number;
}

/* -------------------------
  API types (requests & responses)
  - Designed for Next.js app router handlers and clients
------------------------- */

/** Response when fetching all enum groups */
export interface GetEnumGroupsResponse {
    enums: EnumGroup[];
    fetchedAt: string; // ISO date-time
}

/** Request payload to create a new EnumGroup */
export interface CreateEnumGroupPayload {
    name: EnumKey;
    description?: string | null;
    values?: Omit<EnumValue, "order">[]; // order assigned by server if absent
}

/** Request to update an existing EnumGroup (partial allowed) */
export interface UpdateEnumGroupPayload {
    name: EnumKey; // identifies group to update
    description?: string | null;
    values?: Partial<EnumValue>[]; // partial updates; server resolves by key
    /** optional optimistic update id for client-side concurrency handling */
    clientMutationId?: string;
}

/** Request to add/replace values within a group */
export interface UpsertEnumValuesPayload {
    groupName: EnumKey;
    values: EnumValue[]; // server will upsert by key
    replace?: boolean; // true = replace all values, false = merge/upsert
}

/** Response for single group fetch */
export interface GetEnumGroupResponse {
    enumGroup: EnumGroup | null;
    fetchedAt: string;
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
    fetchGroup: (name: EnumKey, opts?: { force?: boolean }) => Promise<void>;

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
        groupName: EnumKey,
        valueKey: string,
        opts?: { clientMutationId?: string }
    ) => Promise<EnumGroup>;

    /** set value active/inactive */
    setValueActive: (
        groupName: EnumKey,
        valueKey: string,
        active: boolean,
        opts?: { clientMutationId?: string }
    ) => Promise<EnumGroup>;

    /** local utility to clear errors */
    clearError: () => void;

    /** selectors/helpers usable in components */
    getGroupOrNull: (name: EnumKey) => EnumGroup | null;
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
    order?: number;
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
    order?: number | null;
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

/* -------------------------
  Example typed selectors (for reference)
------------------------- */

/**
 * Example usage in a React component with zustand:
 *
 * const group = useStore((s) => s.enumSettings.getGroupOrNull('ad_placements'));
 * if (group) { const activeValues = group.values.filter(v => v.active); }
 *
 * The store actions return fully typed EnumGroup objects for immediate UI updates.
 */

/* -------------------------
  Notes and rationale
  - Keep DB <-> API <-> UI aligned: domain models mirror SiteSettings.enums
  - API DTOs are explicit and avoid using 'any' or ambiguous arrays
  - Zustand slice includes optimistic mutation support via clientMutationId
  - UI types separate form shape from persisted shape to allow client-side helpers
  - Metadata fields are intentionally permissive (Record<string, unknown>) for forward compatibility
------------------------- */
