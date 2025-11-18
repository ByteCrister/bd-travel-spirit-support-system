// stores/footerSettings.store.ts
import { create } from "zustand";
import { produce, enableMapSet } from "immer";

import type {
    FooterStoreState,
    FooterSettingsDTO,
    FooterSettingsInput,
    FooterSettingsResponse,
    SocialLinkDTO,
    SocialLinkInput,
    LocationEntryDTO,
    LocationEntryInput,
    FooterEntities,
    ObjectId,
    AsyncStatus,
    ApiResponse,
} from "@/types/footer-settings.types";

import api from "@/utils/api/axios";
import { showToast } from "@/components/global/showToast";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";

enableMapSet();

const URL_AFTER_API = "/mock/site-settings/footer";

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

function normalizeLocations(locations: LocationEntryDTO[] | undefined): {
    locationsByKey: Record<string, LocationEntryDTO>;
    locationOrder: string[];
} {
    const byKey: Record<string, LocationEntryDTO> = {};
    const order: string[] = [];

    (locations ?? []).forEach((loc) => {
        const key = loc.key;
        byKey[key] = loc;
        order.push(key);
    });

    return { locationsByKey: byKey, locationOrder: order };
}

function buildEntitiesFromDto(dto?: FooterSettingsDTO | null): FooterEntities {
    const social = normalizeSocialLinks(dto?.socialLinks ?? []);
    const locs = normalizeLocations(dto?.locations ?? []);
    return {
        socialLinksById: social.socialLinksById,
        socialLinkOrder: social.socialLinkOrder,
        locationsByKey: locs.locationsByKey,
        locationOrder: locs.locationOrder,
    };
}

/* ---------- Initial state ---------- */

const initialEntities: FooterEntities = {
    socialLinksById: {},
    socialLinkOrder: [],
    locationsByKey: {},
    locationOrder: [],
};

const initialState = {
    canonical: null,
    entities: initialEntities,
    fetchStatus: "idle" as AsyncStatus,
    saveStatus: "idle" as AsyncStatus,
    lastError: null as string | null,
    editingSocialLinkId: null as ObjectId | null,
    editingLocationKey: null as string | null,
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
            const data = res.data.data ?? null;

            if (!data) {
                const message = res.data.meta?.message ?? "Empty response from server";
                set({ fetchStatus: "error", lastError: message });
                showToast.error("Failed to load footer settings", message);
                return;
            }

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

    /* Upsert full footer settings */
    upsertFooterSettings: async (payload: FooterSettingsInput) => {
        set({ saveStatus: "loading", lastError: null });
        try {
            const res = await api.post<FooterSettingsResponse>(URL_AFTER_API, payload);
            const data = res.data.data ?? null;

            if (!data) {
                const message = res.data.meta?.message ?? "Empty response from server";
                set({ saveStatus: "error", lastError: message });
                showToast.error("Failed to save footer settings", message);
                return null;
            }

            const entities = buildEntitiesFromDto(data);
            set(
                produce<FooterStoreState>((s) => {
                    s.canonical = data;
                    s.entities = entities;
                    s.saveStatus = "success";
                    s.lastError = null;
                })
            );

            showToast.success("Footer settings saved", undefined);
            return data;
        } catch (err) {
            const message = extractErrorMessage(err);
            set({ saveStatus: "error", lastError: message });
            showToast.error("Failed to save footer settings", message);
            return null;
        }
    },

    /* Social link CRUD (optimistic) */

    addOrUpdateSocialLink: async (payload: SocialLinkInput) => {
        set({ saveStatus: "loading", lastError: null });
        const optimisticId = payload.id ?? `tmp_${Date.now()}`;
        const prev = get().canonical;

        // optimistic update
        set(
            produce<FooterStoreState>((s) => {
                const entities = s.entities ?? initialEntities;
                const incoming: SocialLinkDTO = {
                    id: optimisticId,
                    key: payload.key,
                    label: payload.label ?? null,
                    url: payload.url,
                    active: typeof payload.active === "boolean" ? payload.active : true,
                    order: payload.order ?? null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                entities.socialLinksById = { ...entities.socialLinksById, [optimisticId]: incoming };
                if (!entities.socialLinkOrder.includes(optimisticId)) {
                    entities.socialLinkOrder = [...entities.socialLinkOrder, optimisticId];
                }
                s.entities = entities;
            })
        );

        try {
            const endpoint = payload.id
                ? `${URL_AFTER_API}/social-links/${payload.id}`
                : `${URL_AFTER_API}/social-links`;
            const method = payload.id ? api.put : api.post;

            const res = await method<ApiResponse<SocialLinkDTO>>(endpoint, payload);
            const saved = res.data.data ?? null;

            if (saved) {
                set(
                    produce<FooterStoreState>((s) => {
                        const entities = s.entities ?? initialEntities;
                        entities.socialLinksById[saved.id] = saved;
                        if (!entities.socialLinkOrder.includes(saved.id)) entities.socialLinkOrder.push(saved.id);

                        if (s.canonical) {
                            const idx = s.canonical.socialLinks.findIndex((f) => f.id === saved.id);
                            if (idx >= 0) s.canonical.socialLinks[idx] = saved;
                            else s.canonical.socialLinks.push(saved);
                        }
                        s.entities = entities;
                        s.saveStatus = "success";
                        s.lastError = null;
                    })
                );
                showToast.success("Social link saved");
                return saved;
            }

            // fallback: server returned canonical payload
            const fullRes = (res as unknown) as { data: { data?: FooterSettingsDTO } };
            if (fullRes?.data?.data) {
                const canonical = fullRes.data.data;
                const entities = buildEntitiesFromDto(canonical);
                set({ canonical, entities, saveStatus: "success", lastError: null });
                showToast.success("Social link saved");
                const found = canonical.socialLinks.find((l) => l.key === payload.key && l.url === payload.url) ?? null;
                return found ?? null;
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
            showToast.error("Failed to save social link", message);
            return null;
        }
    },

    deleteSocialLink: async (id) => {
        set({ saveStatus: "loading", lastError: null });
        const prev = get().canonical;

        // optimistic remove
        set(
            produce<FooterStoreState>((s) => {
                if (!s.entities) s.entities = initialEntities;
                delete s.entities.socialLinksById[id];
                s.entities.socialLinkOrder = s.entities.socialLinkOrder.filter((x) => x !== id);
            })
        );

        try {
            const res = await api.delete<ApiResponse<void>>(`${URL_AFTER_API}/social-links/${id}`);
            const ok = res.data.meta?.ok ?? true;
            if (!ok) {
                const message = res.data.meta?.message ?? "Failed to delete";
                throw new Error(message);
            }

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
        const key = payload.key;

        // optimistic update
        set(
            produce<FooterStoreState>((s) => {
                const entities = s.entities ?? initialEntities;
                const incoming: LocationEntryDTO = {
                    key: payload.key,
                    country: payload.country,
                    region: payload.region ?? null,
                    city: payload.city ?? null,
                    slug: payload.slug ?? null,
                    lat: payload.lat,
                    lng: payload.lng,
                    active: typeof payload.active === "boolean" ? payload.active : true,
                    location: payload.location ?? null,
                };
                entities.locationsByKey = { ...entities.locationsByKey, [key]: incoming };
                if (!entities.locationOrder.includes(key)) entities.locationOrder.push(key);
                s.entities = entities;
            })
        );

        try {
            const endpoint = `${URL_AFTER_API}/locations/${encodeURIComponent(key)}`;
            // Use PUT for idempotent create/update; backend may accept POST as create
            const res = await api.put<ApiResponse<LocationEntryDTO>>(endpoint, payload);
            const saved = res.data.data ?? null;

            if (saved) {
                set(
                    produce<FooterStoreState>((s) => {
                        if (!s.entities) s.entities = initialEntities;
                        s.entities.locationsByKey[saved.key] = saved;
                        if (!s.entities.locationOrder.includes(saved.key)) s.entities.locationOrder.push(saved.key);

                        if (s.canonical) {
                            const idx = s.canonical.locations?.findIndex((l) => l.key === saved.key) ?? -1;
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

            const fullRes = (res as unknown) as { data: { data?: FooterSettingsDTO } };
            if (fullRes?.data?.data) {
                const canonical = fullRes.data.data;
                const entities = buildEntitiesFromDto(canonical);
                set({ canonical, entities, saveStatus: "success", lastError: null });
                const found = canonical.locations?.find((l) => l.key === key) ?? null;
                showToast.success("Location saved");
                return found ?? null;
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

    deleteLocation: async (key) => {
        set({ saveStatus: "loading", lastError: null });
        const prev = get().canonical;

        // optimistic remove
        set(
            produce<FooterStoreState>((s) => {
                if (!s.entities) s.entities = initialEntities;
                delete s.entities.locationsByKey[key];
                s.entities.locationOrder = s.entities.locationOrder.filter((k) => k !== key);
            })
        );

        try {
            const res = await api.delete<ApiResponse<void>>(`${URL_AFTER_API}/locations/${encodeURIComponent(key)}`);
            const ok = res.data.meta?.ok ?? true;
            if (!ok) {
                const message = res.data.meta?.message ?? "Failed to delete";
                throw new Error(message);
            }

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
    setEditingLocationKey: (key) => set({ editingLocationKey: key ?? null }),

    resetStore: () =>
        set({
            canonical: null,
            entities: initialEntities,
            fetchStatus: "idle",
            saveStatus: "idle",
            lastError: null,
            editingSocialLinkId: null,
            editingLocationKey: null,
        }),
}));
