// types/footer-settings.types.ts
// Minimal types for Footer management — only SocialLink and LocationEntry are included.

export type ObjectId = string;

/* -------------------------
 Sub document DTOs (server -> client)
------------------------- */

export interface SocialLinkDTO {
    id: ObjectId;
    key: string;
    label?: string | null;
    icon?: string | null;
    url: string;
    active: boolean;
    order?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface LocationEntryDTO {
    key: string;
    country: string;
    region?: string | null;
    city?: string | null;
    slug?: string | null;
    lat: number;
    lng: number;
    active: boolean;
    location?: {
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    } | null;
}

/* -------------------------
 Top-level FooterSettings DTO
------------------------- */

export interface FooterSettingsDTO {
    id?: ObjectId;
    socialLinks: SocialLinkDTO[];
    locations?: LocationEntryDTO[]; // optional; footer management may include location entries
    version?: number;
    createdAt?: string | null;
    updatedAt?: string | null;
}

/* -------------------------
 Input shapes (client -> server)
------------------------- */

export interface SocialLinkInput {
    id?: ObjectId;
    key: string;
    label?: string | null;
    icon?: string | null;
    url: string;
    active?: boolean;
    order?: number | null;
}

export interface LocationEntryInput {
    key: string;
    country: string;
    region?: string | null;
    city?: string | null;
    slug?: string | null;
    lat: number;
    lng: number;
    active?: boolean;
    location?: {
        type: "Point";
        coordinates: [number, number];
    } | null;
}

export interface FooterSettingsInput {
    socialLinks?: SocialLinkInput[];
    locations?: LocationEntryInput[];
    version?: number;
}

/* -------------------------
 API envelope
------------------------- */

export interface ApiMeta {
    ok: boolean;
    message?: string;
    statusCode?: number;
    traceId?: string;
}

export interface ApiResponse<T = unknown> {
    meta: ApiMeta;
    data?: T;
    errors?: Record<string, string[]>;
}

/* -------------------------
 Specialized responses
------------------------- */

export type FooterSettingsResponse = ApiResponse<FooterSettingsDTO>;
export type SocialLinkResponse = ApiResponse<SocialLinkDTO>;
export type LocationEntryResponse = ApiResponse<LocationEntryDTO>;

/* -------------------------
 Normalized store types for zustand
------------------------- */

export interface FooterEntities {
    socialLinksById: Record<ObjectId, SocialLinkDTO>;
    socialLinkOrder: ObjectId[]; // stable presentation order
    locationsByKey: Record<string, LocationEntryDTO>;
    locationOrder: string[]; // stable order for UI (by key)
}

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface FooterStoreState {
    canonical?: FooterSettingsDTO | null;
    entities: FooterEntities | null;
    fetchStatus: AsyncStatus;
    saveStatus: AsyncStatus;
    lastError?: string | null;

    // UI ephemeral state
    editingSocialLinkId?: ObjectId | null;
    editingLocationKey?: string | null;

    // actions (signatures only; implementations live in the store)
    fetchFooterSettings: (force?: boolean) => Promise<void>;
    upsertFooterSettings: (payload: FooterSettingsInput) => Promise<FooterSettingsDTO | null>;

    addOrUpdateSocialLink: (payload: SocialLinkInput) => Promise<SocialLinkDTO | null>;
    deleteSocialLink: (id: ObjectId) => Promise<boolean>;

    addOrUpdateLocation: (payload: LocationEntryInput) => Promise<LocationEntryDTO | null>;
    deleteLocation: (key: string) => Promise<boolean>;

    // local helpers
    setEditingSocialLinkId: (id?: ObjectId | null) => void;
    setEditingLocationKey: (key?: string | null) => void;
    resetStore: () => void;
}
