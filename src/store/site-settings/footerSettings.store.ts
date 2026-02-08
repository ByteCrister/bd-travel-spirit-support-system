// stores/footerSettings.store.ts
import { create } from "zustand";
import { produce, enableMapSet } from "immer";

import type {
    FooterStoreState,
    FooterSettingsDTO,
    FooterSettingsResponse,
    SocialLinkDTO,
    SocialLinkInput,
    LocationEntryDTO,
    LocationEntryInput,
    FooterEntities,
    ObjectId,
    AsyncStatus,
    SocialLinkResponse,
    LocationEntryResponse,
} from "@/types/site-settings/footer-settings.types";

import api from "@/utils/axios";
import { showToast } from "@/components/global/showToast";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";

enableMapSet();

const URL_AFTER_API = "/site-settings/footer/v1";

/* ---------- Helpers ---------- */

function normalizeSocialLinks(links: SocialLinkDTO[] | undefined): {
    socialLinksById: Record<ObjectId, SocialLinkDTO>;
    socialLinkOrder: ObjectId[];
} {
    const byId: Record<ObjectId, SocialLinkDTO> = {};
    const orderPairs: { id: ObjectId; order: number }[] = [];

    (links ?? []).forEach((l) => {
        byId[l.id] = l;
        orderPairs.push({
            id: l.id,
            order: typeof l.order === "number" ? l.order : Number.MAX_SAFE_INTEGER,
        });
    });

    orderPairs.sort((a, b) => {
        if (a.order === b.order) return a.id.localeCompare(b.id);
        return a.order - b.order;
    });

    return {
        socialLinksById: byId,
        socialLinkOrder: orderPairs.map((p) => p.id),
    };
}

function normalizeLocations(locations?: LocationEntryDTO[]) {
    const byId: Record<string, LocationEntryDTO> = {};
    const order: string[] = [];

    (locations ?? []).forEach((loc) => {
        byId[loc.id] = loc;
        order.push(loc.id);
    });

    return {
        locationsById: byId,
        locationOrder: order,
    };
}


function buildEntitiesFromDto(dto?: FooterSettingsDTO | null): FooterEntities {
    const social = normalizeSocialLinks(dto?.socialLinks ?? []);
    const locs = normalizeLocations(dto?.locations ?? []);
    return {
        socialLinksById: social.socialLinksById,
        socialLinkOrder: social.socialLinkOrder,
        locationsById: locs.locationsById,
        locationOrder: locs.locationOrder,
    };
}

/* ---------- Initial state ---------- */

const initialEntities: FooterEntities = {
    socialLinksById: {},
    socialLinkOrder: [],
    locationsById: {},
    locationOrder: [],
};

const initialState = {
    canonical: null,
    entities: initialEntities,
    fetchStatus: "idle" as AsyncStatus,
    saveStatus: "idle" as AsyncStatus,
    lastError: null as string | null,
    editingSocialLinkId: null as ObjectId | null,
    editingLocationId: null as string | null,
};

/* ---------- Store implementation ---------- */

export const useFooterStore = create<FooterStoreState>((set, get) => ({
    ...initialState,

    /* Fetch singleton footer settings */
    fetchFooterSettings: async (force = false) => {
        const { fetchStatus } = get();
        if (!force && fetchStatus === "loading") return;
        set({ fetchStatus: "loading", lastError: null });

        try {
            const res = await api.get<FooterSettingsResponse>(URL_AFTER_API);
            if (!res.data.data) {
                throw new Error("Response data is missing");
            }
            const data = res.data.data;

            const entities = buildEntitiesFromDto(data);
            set(
                produce<FooterStoreState>((s) => {
                    s.canonical = data;
                    s.entities = entities;
                    s.fetchStatus = "success";
                    s.lastError = null;
                })
            );
        } catch (err) {
            const message = extractErrorMessage(err);
            set({ fetchStatus: "error", lastError: message });
            showToast.error("Failed to load footer settings", message);
        }
    },

    /* Social link CRUD (optimistic) */

    addOrUpdateSocialLink: async (payload: SocialLinkInput) => {
        set({ saveStatus: "loading", lastError: null });
        const prev = get().canonical;

        try {
            const endpoint = payload.id
                ? `${URL_AFTER_API}/social-links/${encodeURIComponent(payload.id)}`
                : `${URL_AFTER_API}/social-links`;
            const method = payload.id ? api.put : api.post;

            const res = await method<SocialLinkResponse>(endpoint, payload);
            if (!res.data.data) {
                throw new Error("Response data is missing");
            }

            const { socialLinks, link: saved } = res.data.data;

            set(
                produce<FooterStoreState>((s) => {
                    if (!s.entities) return;

                    const norm = normalizeSocialLinks(socialLinks);

                    s.entities.socialLinksById = norm.socialLinksById;
                    s.entities.socialLinkOrder = norm.socialLinkOrder;

                    if (s.canonical) {
                        s.canonical.socialLinks = socialLinks;
                    }

                    s.editingSocialLinkId = null;
                    s.saveStatus = "success";
                    s.lastError = null;
                })
            );

            showToast.success("Social link saved");
            return saved;

        } catch (err) {
            const message = extractErrorMessage(err);
            // rollback
            set(
                produce<FooterStoreState>((s) => {
                    s.canonical = prev ?? null;
                    s.entities = prev ? buildEntitiesFromDto(prev) : initialEntities;
                    s.saveStatus = "error";
                    s.lastError = message;
                })
            );
            showToast.error("Failed to save social link", message);
            return null;
        }
    },

    deleteSocialLink: async (id) => {
        set({ saveStatus: "loading", lastError: null });
        const prev = get().canonical;

        try {
            await api.delete<SocialLinkDTO>(`${URL_AFTER_API}/social-links/${encodeURIComponent(id)}`);
            set(
                produce<FooterStoreState>((s) => {
                    if (!s.entities) s.entities = initialEntities;
                    delete s.entities.socialLinksById[id];
                    s.entities.socialLinkOrder = s.entities.socialLinkOrder.filter((x) => x !== id);
                })
            );
            set({ saveStatus: "success", lastError: null });
            showToast.success("Social link deleted");
            return true;
        } catch (err) {
            const message = extractErrorMessage(err);
            // rollback
            set(
                produce<FooterStoreState>((s) => {
                    s.canonical = prev ?? null;
                    s.entities = prev ? buildEntitiesFromDto(prev) : initialEntities;
                    s.saveStatus = "error";
                    s.lastError = message;
                })
            );
            showToast.error("Failed to delete social link", message);
            return false;
        }
    },

    /* Location CRUD (optimistic) */

    addOrUpdateLocation: async (payload: LocationEntryInput) => {
        set({ saveStatus: "loading", lastError: null });
        const prev = get().canonical;
        const id = payload.id ?? "new"; // create "new" for new locations
        try {
            const endpoint = `${URL_AFTER_API}/locations/${encodeURIComponent(id)}`;
            // Use PUT for idempotent create/update; backend may accept POST as create
            const res = await api.put<LocationEntryResponse>(endpoint, payload);
            if (!res.data.data) {
                throw new Error("Response data is missing from : addOrUpdateLocation");
            }
            const saved = res.data.data;

            if (saved) {
                set(
                    produce<FooterStoreState>((s) => {
                        if (!s.entities) s.entities = initialEntities;
                        s.entities.locationsById[saved.id as string] = saved;
                        if (!s.entities.locationOrder.includes(saved.id)) s.entities.locationOrder.push(saved.id);

                        if (s.canonical) {
                            const idx = s.canonical.locations?.findIndex((l) => l.id === saved.id) ?? -1;
                            if (idx >= 0 && s.canonical.locations) s.canonical.locations[idx] = saved;
                            else s.canonical.locations = [...(s.canonical.locations ?? []), saved];
                        }

                        s.saveStatus = "success";
                        s.lastError = null;
                    })
                );

                showToast.success("Location saved");
                return saved;
            }

            set({ saveStatus: "error", lastError: "No data returned from server" });
            showToast.error("Save failed", "No data returned from server");
            return null;
        } catch (err) {
            const message = extractErrorMessage(err);
            // rollback
            set(
                produce<FooterStoreState>((s) => {
                    s.canonical = prev ?? null;
                    s.entities = prev ? buildEntitiesFromDto(prev) : initialEntities;
                    s.saveStatus = "error";
                    s.lastError = message;
                })
            );
            showToast.error("Failed to save location", message);
            return null;
        }
    },

    deleteLocation: async (id) => {
        set({ saveStatus: "loading", lastError: null });
        const prev = get().canonical;

        try {
            await api.delete<LocationEntryDTO>(`${URL_AFTER_API}/locations/${encodeURIComponent(id)}`);
            // optimistic remove
            set(
                produce<FooterStoreState>((s) => {
                    if (!s.entities) s.entities = initialEntities;
                    delete s.entities.locationsById[id];
                    s.entities!.locationOrder = s.entities!.locationOrder.filter(x => x !== id);
                })
            );

            set({ saveStatus: "success", lastError: null });
            showToast.success("Location deleted");
            return true;
        } catch (err) {
            const message = extractErrorMessage(err);
            // rollback
            set(
                produce<FooterStoreState>((s) => {
                    s.canonical = prev ?? null;
                    s.entities = prev ? buildEntitiesFromDto(prev) : initialEntities;
                    s.saveStatus = "error";
                    s.lastError = message;
                })
            );
            showToast.error("Failed to delete location", message);
            return false;
        }
    },

    /* UI helpers */

    setEditingSocialLinkId: (id) => set({ editingSocialLinkId: id ?? null }),
    setEditingLocationId: (id) => set({ editingLocationId: id ?? null }),

    resetStore: () =>
        set({
            canonical: null,
            entities: initialEntities,
            fetchStatus: "idle",
            saveStatus: "idle",
            lastError: null,
            editingSocialLinkId: null,
            editingLocationId: null,
        }),
}));
