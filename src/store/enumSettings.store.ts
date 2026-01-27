// /store/enumSettings.store.ts

import { create } from "zustand";
import { produce, Draft, enableMapSet } from "immer";
import { devtools } from "zustand/middleware";

import {
    EnumSettingsSlice,
    EnumGroup,
    CreateEnumGroupPayload,
    UpdateEnumGroupPayload,
    UpsertEnumValuesPayload,
    EnumGroupState,
    GetEnumGroupsResponse,
    GetEnumGroupResponse,
    EnumValue,
    EnumGroupResponse,
    ID,
} from "../types/enum-settings.types";

import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "@/components/global/showToast";

enableMapSet();

const URL_AFTER_API = "/site-settings/enums/v1";

/* Helpers */
const nowIso = () => new Date().toISOString();

const genClientId = (prefix = "cm") =>
    `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Ensure a group's EnumGroupState exists (mutates groups object) */
function ensureGroupState(groups: Record<ID, EnumGroupState>, _id: ID): void {
    if (!groups[_id]) {
        groups[_id] = {
            data: null,
            status: "idle",
            error: null,
            lastFetchedAt: null,
            optimistic: {},
        };
    }
}


/* Routes */
const ROUTES = {
    fetchAll: URL_AFTER_API,
    fetchGroup: (_id: string) => `${URL_AFTER_API}/${encodeURIComponent(_id)}`,
    createGroup: URL_AFTER_API,
    updateGroup: (_id: string) => `${URL_AFTER_API}/${encodeURIComponent(_id)}`,
    upsertValues: (_id: string) => `${URL_AFTER_API}/${encodeURIComponent(_id)}/values`,
    removeValue: (_id: string, valueKey: string) =>
        `${URL_AFTER_API}/${encodeURIComponent(_id)}/values/${encodeURIComponent(valueKey)}`,
    deleteGroup: (_id: string) => `${URL_AFTER_API}/${encodeURIComponent(_id)}`,
};

/** Merge partial EnumValue updates into existing EnumValue[] */
function mergePartialValues(existing: EnumValue[] = [], partials: Partial<EnumValue>[] = []): EnumValue[] {
    const map = new Map<string, EnumValue>(existing.map((v) => [v.key, { ...v }]));
    for (const p of partials) {
        if (!p || !p.key) continue; // skip invalid partials without key
        const key = p.key;
        const prev = map.get(key);
        if (prev) {
            map.set(key, { ...prev, ...p } as EnumValue);
        } else {
            // Construct a minimal EnumValue from partial: require key, attempt to fill sensible defaults
            const created: EnumValue = {
                key,
                value: (p as Partial<EnumValue>).value ?? key,
                label: (p as Partial<EnumValue>).label ?? `label: ${key}`,
                description: (p as Partial<EnumValue>).description ?? null,
                active: (p as Partial<EnumValue>).active ?? true,
            };
            map.set(key, created);
        }
    }
    return Array.from(map.values());
}

/* Store */
export const useEnumSettingsStore = create<EnumSettingsSlice>()(
    devtools((set, get) => ({
        groups: {},
        order: [],
        status: "idle",
        error: null,

        fetchAll: async (opts = { force: false }) => {
            const { force } = opts;
            const state = get();
            if (state.status === "loading" && !force) return;

            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    s.status = "loading";
                    s.error = null;
                })
            );

            try {
                const res = await api.get<GetEnumGroupsResponse>(ROUTES.fetchAll);
                const payload = res.data.data;
                if (!payload) {
                    throw new Error("Empty response payload");
                }
                const enums = payload.enums ?? [];
                const fetchedAt = payload.fetchedAt ?? nowIso();

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        s.order = enums.map((g) => g._id);
                        s.status = "success";
                        s.error = null;
                        for (const g of enums) {
                            ensureGroupState(s.groups, g._id);
                            s.groups[g._id] = {
                                data: g,
                                status: "success",
                                error: null,
                                lastFetchedAt: fetchedAt,
                                optimistic: s.groups[g._id]?.optimistic ?? {},
                            };
                        }
                    })
                );
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        s.status = "error";
                        s.error = message;
                    })
                );
                showToast.error("Failed to load enums", message);
                throw new Error(message);
            }
        },

        fetchGroup: async (_id: ID, opts = { force: false }) => {
            ensureGroupState(get().groups, _id)

            const groupState = get().groups[_id];
            if (!opts.force && groupState.data && groupState.status === "success") {
                return groupState.data;
            }
            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, _id);
                    s.groups[_id].status = "loading";
                    s.groups[_id].error = null;
                })
            );

            try {
                const res = await api.get<GetEnumGroupResponse>(ROUTES.fetchGroup(_id));
                const payload = res.data.data;

                if (!payload) {
                    throw new Error("Empty response payload");
                }
                const fetchedAt = payload.fetchedAt ?? nowIso();
                const enumGroup = payload.enumGroup ?? null;

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = enumGroup;
                        s.groups[_id].status = "success";
                        s.groups[_id].lastFetchedAt = fetchedAt;
                        if (!s.order.includes(_id)) s.order.push(_id);
                    })
                );
                return;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].status = "error";
                        s.groups[_id].error = message;
                    })
                );
                showToast.error("Failed to load enum group", message);
                throw new Error(message);
            }
        },

        createGroup: async (payload: CreateEnumGroupPayload) => {
            try {
                const res = await api.post<EnumGroupResponse>(ROUTES.createGroup, payload);
                const data = res.data.data;

                if (!data) {
                    throw new Error("Empty response data");
                }
                const enumGroup = data.enumGroup;
                if (!enumGroup) throw new Error("Invalid response from server");

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, enumGroup._id);
                        s.groups[enumGroup._id] = {
                            data: enumGroup,
                            status: "success",
                            error: null,
                            lastFetchedAt: nowIso(),
                            optimistic: {},
                        };
                        if (!s.order.includes(enumGroup._id)) s.order.push(enumGroup._id);
                    })
                );

                showToast.success("Enum group created", `Group ${enumGroup.name} created`);
                return enumGroup;
            } catch (err) {
                const message = extractErrorMessage(err);
                showToast.error("Failed to create enum group", message);
                throw new Error(message);
            }
        },

        updateGroup: async (payload: UpdateEnumGroupPayload) => {
            const { _id, clientMutationId } = payload;
            const cmid = clientMutationId ?? genClientId("updateGroup");
            ensureGroupState(get().groups, _id);

            const prev = get().groups[_id].data ?? null;

            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, _id);
                    s.groups[_id].optimistic = s.groups[_id].optimistic ?? {};
                    s.groups[_id].optimistic![cmid] = nowIso();
                    s.groups[_id].status = "loading";
                    s.groups[_id].error = null;
                    const existing = s.groups[_id].data;
                    if (existing) {
                        // merge top-level fields from payload, and merge values properly
                        const merged: EnumGroup = {
                            ...existing,
                            ...payload,
                            // if payload.values provided (Partial[]), merge into existing values
                            values: Array.isArray(payload.values)
                                ? mergePartialValues(existing.values ?? [], payload.values)
                                : existing.values ?? [],
                        };
                        s.groups[_id].data = merged;
                    }
                })
            );

            try {
                const res = await api.put<EnumGroupResponse>(ROUTES.updateGroup(_id), payload);
                const data = res.data.data;
                if (!data) {
                    throw new Error("Empty response data.");
                }
                const enumGroup = data.enumGroup;
                if (!enumGroup) throw new Error("Invalid response from server");

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = enumGroup;
                        s.groups[_id].status = "success";
                        s.groups[_id].error = null;
                        if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                        if (!s.order.includes(_id)) s.order.push(_id);
                    })
                );

                showToast.success("Enum group updated", `Saved ${data.enumGroup.name}`);
                return enumGroup;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = prev;
                        s.groups[_id].status = "error";
                        s.groups[_id].error = message;
                        if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                    })
                );
                showToast.error("Failed to update enum group", message);
                throw new Error(message);
            }
        },

        upsertValues: async (payload: UpsertEnumValuesPayload & { clientMutationId?: string }) => {
            const _id = payload._id;
            const cmid = payload.clientMutationId ?? genClientId("upsertValues");
            ensureGroupState(get().groups, _id);

            const prev = get().groups[_id].data ?? null;
            const name = payload.name;
            const incoming = payload.values ?? [];

            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, _id);
                    s.groups[_id].optimistic = s.groups[_id].optimistic ?? {};
                    s.groups[_id].optimistic![cmid] = nowIso();
                    s.groups[_id].status = "loading";
                    s.groups[_id].error = null;

                    if (!s.groups[_id].data) {
                        s.groups[_id].data = {
                            _id,
                            name,
                            description: null,
                            values: incoming,
                        } as EnumGroup;
                    } else {
                        if (payload.replace) {
                            s.groups[_id].data!.values = incoming;
                        } else {
                            const map = new Map((s.groups[_id].data!.values ?? []).map((v) => [v.key, v]));
                            for (const v of incoming) map.set(v.key, v);
                            s.groups[_id].data!.values = Array.from(map.values());
                        }
                    }
                })
            );

            try {
                const res = await api.post<EnumGroupResponse>(ROUTES.upsertValues(_id), payload);

                const data = res.data.data;
                if (!data) {
                    throw new Error("Empty response data.");
                }
                const enumGroup = data.enumGroup;
                if (!enumGroup) throw new Error("Invalid response from server");

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = enumGroup;
                        s.groups[_id].status = "success";
                        s.groups[_id].error = null;
                        if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                        if (!s.order.includes(_id)) s.order.push(_id);
                    })
                );

                showToast.success("Values saved", `Updated values for ${enumGroup.name}`);
                return enumGroup;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = prev;
                        s.groups[_id].status = "error";
                        s.groups[_id].error = message;
                        if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                    })
                );
                showToast.error("Failed to update values", message);
                throw new Error(message);
            }
        },

        removeValue: async (_id: ID, valueKey: string, opts: { clientMutationId?: string } = {}) => {
            const cmid = opts.clientMutationId ?? genClientId("removeValue");
            ensureGroupState(get().groups, _id);
            const prev = get().groups[_id].data ?? null;

            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, _id);
                    s.groups[_id].optimistic = s.groups[_id].optimistic ?? {};
                    s.groups[_id].optimistic![cmid] = nowIso();
                    s.groups[_id].status = "loading";
                    s.groups[_id].error = null;
                    if (s.groups[_id].data && Array.isArray(s.groups[_id].data.values)) {
                        s.groups[_id].data!.values = s.groups[_id].data!.values.filter((v) => v.key !== valueKey);
                    }
                })
            );

            try {
                const res = await api.delete<EnumGroupResponse>(ROUTES.removeValue(_id, valueKey));
                const data = res.data.data;
                if (!data) {
                    throw new Error("Empty response data.");
                }
                const enumGroup = data.enumGroup;
                if (!enumGroup) throw new Error("Invalid response from server");

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = enumGroup;
                        s.groups[_id].status = "success";
                        s.groups[_id].error = null;
                        if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                    })
                );

                showToast.success("Value removed", `Removed ${valueKey} from ${prev?.name}`);
                return enumGroup;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = prev;
                        s.groups[_id].status = "error";
                        s.groups[_id].error = message;
                        if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                    })
                );
                showToast.error("Failed to remove value", message);
                throw new Error(message);
            }
        },

        setValueActive: async (_id: ID, valueKey: string, active: boolean, opts: { clientMutationId?: string } = {}) => {
            const cmid = opts.clientMutationId ?? genClientId("setActive");
            ensureGroupState(get().groups, _id);
            const prev = get().groups[_id].data ?? null;

            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, _id);
                    s.groups[_id].optimistic = s.groups[_id].optimistic ?? {};
                    s.groups[_id].optimistic![cmid] = nowIso();
                    s.groups[_id].status = "loading";
                    s.groups[_id].error = null;
                    if (s.groups[_id].data && Array.isArray(s.groups[_id].data.values)) {
                        s.groups[_id].data!.values = s.groups[_id].data!.values.map((v) =>
                            v.key === valueKey ? { ...v, active } : v
                        );
                    }
                })
            );

            try {
                const res = await api.patch<EnumGroupResponse>(`${URL_AFTER_API}/${_id}`, {
                    values: [{ key: valueKey, active }],
                    replace: false,
                });
                const data = res.data.data;
                if (!data) {
                    throw new Error("Empty response data.");
                }
                const enumGroup = data.enumGroup;
                if (!enumGroup) throw new Error("Invalid response from server");

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = enumGroup;
                        s.groups[_id].status = "success";
                        s.groups[_id].error = null;
                        if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                    })
                );

                showToast.success("Value updated", `${valueKey} set to ${active ? "active" : "inactive"}`);
                return enumGroup;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = prev;
                        s.groups[_id].status = "error";
                        s.groups[_id].error = message;
                        if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                    })
                );
                showToast.error("Failed to update value", message);
                throw new Error(message);
            }
        },

        deleteGroup: async (_id: ID, opts: { clientMutationId?: string } = {}) => {
            const cmid = opts.clientMutationId ?? genClientId("deleteGroup");
            ensureGroupState(get().groups, _id);

            // Save previous snapshot to revert on error
            const prevGroup = get().groups[_id]?.data ?? null;
            const prevOrder = [...get().order];

            // Optimistic update: remove group data and remove from order
            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, _id);
                    s.groups[_id].optimistic = s.groups[_id].optimistic ?? {};
                    s.groups[_id].optimistic![cmid] = nowIso();
                    s.groups[_id].status = "loading";
                    s.groups[_id].error = null;

                    // remove data locally
                    s.groups[_id].data = null;
                    // remove from order
                    s.order = s.order.filter((n) => n !== _id);
                })
            );

            try {
                // call API to delete group
                await api.delete<EnumGroupResponse>(ROUTES.deleteGroup(_id));

                // success: clear optimistic marker and group state
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        // ensureGroupState(s.groups, _id); // group state already exists
                        if (s.groups[_id]) {
                            if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                            s.groups[_id].status = "success";
                            s.groups[_id].error = null;
                            // keep data null (deleted)
                        }
                        // ensure order does not contain the deleted _id
                        s.order = s.order.filter((n) => n !== _id);
                        // optionally remove the group key entirely to keep store clean
                        delete s.groups[_id];
                    })
                );

                showToast.success("Group deleted", `Removed group ${prevGroup?.name}`);
                return;
            } catch (err) {
                const message = extractErrorMessage(err);

                // revert to previous snapshot
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, _id);
                        s.groups[_id].data = prevGroup;
                        s.groups[_id].status = "error";
                        s.groups[_id].error = message;
                        if (s.groups[_id].optimistic) delete s.groups[_id].optimistic![cmid];
                        s.order = prevOrder;
                    })
                );

                showToast.error("Failed to delete group", message);
                throw new Error(message);
            }
        },

        clearError: () => {
            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    s.error = null;
                    for (const k of Object.keys(s.groups)) {
                        if (s.groups[k]) s.groups[k].error = null;
                    }
                })
            );
        },

        getGroupOrNull: (_id: ID) => {
            const g = get().groups[_id];
            return g?.data ?? null;
        },

        listGroups: () => {
            const s = get();
            return s.order.map((_id) => s.groups[_id]?.data).filter(Boolean) as EnumGroup[];
        },
    }))
);

export default useEnumSettingsStore;
