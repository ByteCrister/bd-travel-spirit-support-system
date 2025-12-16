// types/footer-settings.types.ts
// Minimal types for Footer management — only SocialLink and LocationEntry are included.

import { ApiResponse } from "./api.types";

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
    id: string;
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
    id?: string;
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

/* -------------------------
 Specialized responses
------------------------- */

export type FooterSettingsResponse = ApiResponse<FooterSettingsDTO>;
export type SocialLinkResponse = ApiResponse<{ socialLinks: SocialLinkDTO[]; link: SocialLinkDTO }>;
export type LocationEntryResponse = ApiResponse<LocationEntryDTO>;

/* -------------------------
 Normalized store types for zustand
------------------------- */

export interface FooterEntities {
    socialLinksById: Record<ObjectId, SocialLinkDTO>;
    socialLinkOrder: ObjectId[]; // stable presentation order
    locationsById: Record<string, LocationEntryDTO>;
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
    editingLocationId?: string | null;

    // actions (signatures only; implementations live in the store)
    fetchFooterSettings: (force?: boolean) => Promise<void>;

    addOrUpdateSocialLink: (payload: SocialLinkInput) => Promise<SocialLinkDTO | null>;
    deleteSocialLink: (id: ObjectId) => Promise<boolean>;

    addOrUpdateLocation: (payload: LocationEntryInput) => Promise<LocationEntryDTO | null>;
    deleteLocation: (key: string) => Promise<boolean>;

    // local helpers
    setEditingSocialLinkId: (id?: ObjectId | null) => void;
    setEditingLocationId: (key?: string | null) => void;
    resetStore: () => void;
}
