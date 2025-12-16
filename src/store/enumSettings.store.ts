// /store/enumSettings.store.ts

import { create } from "zustand";
import { produce, Draft, enableMapSet } from "immer";
import { devtools } from "zustand/middleware";

import {
    EnumSettingsSlice,
    EnumGroup,
    EnumKey,
    CreateEnumGroupPayload,
    UpdateEnumGroupPayload,
    UpsertEnumValuesPayload,
    EnumGroupState,
    GetEnumGroupsResponse,
    GetEnumGroupResponse,
    EnumValue,
    EnumGroupResponse,
} from "../types/enum-settings.types";

import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "@/components/global/showToast";

enableMapSet();

// const URL_AFTER_API = "/mock/site-settings/enums";
const URL_AFTER_API = "/site-settings/v1/enums";

/* Helpers */
const nowIso = () => new Date().toISOString();

const genClientId = (prefix = "cm") =>
    `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Ensure a group's EnumGroupState exists (mutates groups object) */
function ensureGroupState(groups: Record<EnumKey, EnumGroupState>, name: EnumKey): void {
    if (!groups[name]) {
        groups[name] = {
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
    fetchGroup: (name: string) => `${URL_AFTER_API}/${encodeURIComponent(name)}`,
    createGroup: URL_AFTER_API,
    updateGroup: (name: string) => `${URL_AFTER_API}/${encodeURIComponent(name)}`,
    upsertValues: (name: string) => `${URL_AFTER_API}/${encodeURIComponent(name)}/values`,
    removeValue: (name: string, valueKey: string) =>
        `${URL_AFTER_API}/${encodeURIComponent(name)}/values/${encodeURIComponent(valueKey)}`,
    deleteGroup: (name: string) => `${URL_AFTER_API}/${encodeURIComponent(name)}`,
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
                        s.order = enums.map((g) => g.name);
                        s.status = "success";
                        s.error = null;
                        for (const g of enums) {
                            ensureGroupState(s.groups, g.name);
                            s.groups[g.name] = {
                                data: g,
                                status: "success",
                                error: null,
                                lastFetchedAt: fetchedAt,
                                optimistic: s.groups[g.name]?.optimistic ?? {},
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

        fetchGroup: async (name: EnumKey, opts = { force: false }) => {
            ensureGroupState(get().groups, name);
            const groupState = get().groups[name];
            if (!opts.force && groupState.data && groupState.status === "success") {
                return groupState.data;
            }
            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, name);
                    s.groups[name].status = "loading";
                    s.groups[name].error = null;
                })
            );

            try {
                const res = await api.get<GetEnumGroupResponse>(ROUTES.fetchGroup(name));
                const payload = res.data.data;

                if (!payload) {
                    throw new Error("Empty response payload");
                }
                const fetchedAt = payload.fetchedAt ?? nowIso();
                const enumGroup = payload.enumGroup ?? null;

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, name);
                        s.groups[name].data = enumGroup;
                        s.groups[name].status = "success";
                        s.groups[name].lastFetchedAt = fetchedAt;
                        if (!s.order.includes(name)) s.order.push(name);
                    })
                );
                return;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, name);
                        s.groups[name].status = "error";
                        s.groups[name].error = message;
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
                        ensureGroupState(s.groups, enumGroup.name);
                        s.groups[enumGroup.name] = {
                            data: enumGroup,
                            status: "success",
                            error: null,
                            lastFetchedAt: nowIso(),
                            optimistic: {},
                        };
                        if (!s.order.includes(enumGroup.name)) s.order.push(enumGroup.name);
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
            const { name, clientMutationId } = payload;
            const cmid = clientMutationId ?? genClientId("updateGroup");
            ensureGroupState(get().groups, name);

            const prev = get().groups[name].data ?? null;

            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, name);
                    s.groups[name].optimistic = s.groups[name].optimistic ?? {};
                    s.groups[name].optimistic![cmid] = nowIso();
                    s.groups[name].status = "loading";
                    s.groups[name].error = null;
                    const existing = s.groups[name].data;
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
                        s.groups[name].data = merged;
                    }
                })
            );

            try {
                const res = await api.put<EnumGroupResponse>(ROUTES.updateGroup(name), payload);
                const data = res.data.data;
                if (!data) {
                    throw new Error("Empty response data.");
                }
                const enumGroup = data.enumGroup;
                if (!enumGroup) throw new Error("Invalid response from server");

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, name);
                        s.groups[name].data = enumGroup;
                        s.groups[name].status = "success";
                        s.groups[name].error = null;
                        if (s.groups[name].optimistic) delete s.groups[name].optimistic![cmid];
                        if (!s.order.includes(name)) s.order.push(name);
                    })
                );

                showToast.success("Enum group updated", `Saved ${name}`);
                return enumGroup;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, name);
                        s.groups[name].data = prev;
                        s.groups[name].status = "error";
                        s.groups[name].error = message;
                        if (s.groups[name].optimistic) delete s.groups[name].optimistic![cmid];
                    })
                );
                showToast.error("Failed to update enum group", message);
                throw new Error(message);
            }
        },

        upsertValues: async (payload: UpsertEnumValuesPayload & { clientMutationId?: string }) => {
            const groupName = payload.groupName;
            const cmid = payload.clientMutationId ?? genClientId("upsertValues");
            ensureGroupState(get().groups, groupName);

            const prev = get().groups[groupName].data ?? null;
            const incoming = payload.values ?? [];

            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, groupName);
                    s.groups[groupName].optimistic = s.groups[groupName].optimistic ?? {};
                    s.groups[groupName].optimistic![cmid] = nowIso();
                    s.groups[groupName].status = "loading";
                    s.groups[groupName].error = null;

                    if (!s.groups[groupName].data) {
                        s.groups[groupName].data = {
                            name: groupName,
                            description: null,
                            values: incoming,
                        } as EnumGroup;
                    } else {
                        if (payload.replace) {
                            s.groups[groupName].data!.values = incoming;
                        } else {
                            const map = new Map((s.groups[groupName].data!.values ?? []).map((v) => [v.key, v]));
                            for (const v of incoming) map.set(v.key, v);
                            s.groups[groupName].data!.values = Array.from(map.values());
                        }
                    }
                })
            );

            try {
                const res = await api.post<EnumGroupResponse>(ROUTES.upsertValues(groupName), payload);

                const data = res.data.data;
                if (!data) {
                    throw new Error("Empty response data.");
                }
                const enumGroup = data.enumGroup;
                if (!enumGroup) throw new Error("Invalid response from server");

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, groupName);
                        s.groups[groupName].data = enumGroup;
                        s.groups[groupName].status = "success";
                        s.groups[groupName].error = null;
                        if (s.groups[groupName].optimistic) delete s.groups[groupName].optimistic![cmid];
                        if (!s.order.includes(groupName)) s.order.push(groupName);
                    })
                );

                showToast.success("Values saved", `Updated values for ${groupName}`);
                return enumGroup;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, groupName);
                        s.groups[groupName].data = prev;
                        s.groups[groupName].status = "error";
                        s.groups[groupName].error = message;
                        if (s.groups[groupName].optimistic) delete s.groups[groupName].optimistic![cmid];
                    })
                );
                showToast.error("Failed to update values", message);
                throw new Error(message);
            }
        },

        removeValue: async (groupName: EnumKey, valueKey: string, opts: { clientMutationId?: string } = {}) => {
            const cmid = opts.clientMutationId ?? genClientId("removeValue");
            ensureGroupState(get().groups, groupName);
            const prev = get().groups[groupName].data ?? null;

            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, groupName);
                    s.groups[groupName].optimistic = s.groups[groupName].optimistic ?? {};
                    s.groups[groupName].optimistic![cmid] = nowIso();
                    s.groups[groupName].status = "loading";
                    s.groups[groupName].error = null;
                    if (s.groups[groupName].data && Array.isArray(s.groups[groupName].data.values)) {
                        s.groups[groupName].data!.values = s.groups[groupName].data!.values.filter((v) => v.key !== valueKey);
                    }
                })
            );

            try {
                const res = await api.delete<EnumGroupResponse>(ROUTES.removeValue(groupName, valueKey));
                const data = res.data.data;
                if (!data) {
                    throw new Error("Empty response data.");
                }
                const enumGroup = data.enumGroup;
                if (!enumGroup) throw new Error("Invalid response from server");

                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, groupName);
                        s.groups[groupName].data = enumGroup;
                        s.groups[groupName].status = "success";
                        s.groups[groupName].error = null;
                        if (s.groups[groupName].optimistic) delete s.groups[groupName].optimistic![cmid];
                    })
                );

                showToast.success("Value removed", `Removed ${valueKey} from ${groupName}`);
                return enumGroup;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, groupName);
                        s.groups[groupName].data = prev;
                        s.groups[groupName].status = "error";
                        s.groups[groupName].error = message;
                        if (s.groups[groupName].optimistic) delete s.groups[groupName].optimistic![cmid];
                    })
                );
                showToast.error("Failed to remove value", message);
                throw new Error(message);
            }
        },

        setValueActive: async (groupName: EnumKey, valueKey: string, active: boolean, opts: { clientMutationId?: string } = {}) => {
            const cmid = opts.clientMutationId ?? genClientId("setActive");
            ensureGroupState(get().groups, groupName);
            const prev = get().groups[groupName].data ?? null;

            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, groupName);
                    s.groups[groupName].optimistic = s.groups[groupName].optimistic ?? {};
                    s.groups[groupName].optimistic![cmid] = nowIso();
                    s.groups[groupName].status = "loading";
                    s.groups[groupName].error = null;
                    if (s.groups[groupName].data && Array.isArray(s.groups[groupName].data.values)) {
                        s.groups[groupName].data!.values = s.groups[groupName].data!.values.map((v) =>
                            v.key === valueKey ? { ...v, active } : v
                        );
                    }
                })
            );

            try {
                const res = await api.patch<EnumGroupResponse>(`${URL_AFTER_API}/${groupName}`, {
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
                        ensureGroupState(s.groups, groupName);
                        s.groups[groupName].data = enumGroup;
                        s.groups[groupName].status = "success";
                        s.groups[groupName].error = null;
                        if (s.groups[groupName].optimistic) delete s.groups[groupName].optimistic![cmid];
                    })
                );

                showToast.success("Value updated", `${valueKey} set to ${active ? "active" : "inactive"}`);
                return enumGroup;
            } catch (err) {
                const message = extractErrorMessage(err);
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, groupName);
                        s.groups[groupName].data = prev;
                        s.groups[groupName].status = "error";
                        s.groups[groupName].error = message;
                        if (s.groups[groupName].optimistic) delete s.groups[groupName].optimistic![cmid];
                    })
                );
                showToast.error("Failed to update value", message);
                throw new Error(message);
            }
        },

        deleteGroup: async (name: EnumKey, opts: { clientMutationId?: string } = {}) => {
            const cmid = opts.clientMutationId ?? genClientId("deleteGroup");
            ensureGroupState(get().groups, name);

            // Save previous snapshot to revert on error
            const prevGroup = get().groups[name]?.data ?? null;
            const prevOrder = [...get().order];

            // Optimistic update: remove group data and remove from order
            set(
                produce((s: Draft<EnumSettingsSlice>) => {
                    ensureGroupState(s.groups, name);
                    s.groups[name].optimistic = s.groups[name].optimistic ?? {};
                    s.groups[name].optimistic![cmid] = nowIso();
                    s.groups[name].status = "loading";
                    s.groups[name].error = null;

                    // remove data locally
                    s.groups[name].data = null;
                    // remove from order
                    s.order = s.order.filter((n) => n !== name);
                })
            );

            try {
                // call API to delete group
                await api.delete<EnumGroupResponse>(ROUTES.deleteGroup(name));

                // success: clear optimistic marker and group state
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        // ensureGroupState(s.groups, name); // group state already exists
                        if (s.groups[name]) {
                            if (s.groups[name].optimistic) delete s.groups[name].optimistic![cmid];
                            s.groups[name].status = "success";
                            s.groups[name].error = null;
                            // keep data null (deleted)
                        }
                        // ensure order does not contain the deleted name
                        s.order = s.order.filter((n) => n !== name);
                        // optionally remove the group key entirely to keep store clean
                        delete s.groups[name];
                    })
                );

                showToast.success("Group deleted", `Removed group ${name}`);
                return;
            } catch (err) {
                const message = extractErrorMessage(err);

                // revert to previous snapshot
                set(
                    produce((s: Draft<EnumSettingsSlice>) => {
                        ensureGroupState(s.groups, name);
                        s.groups[name].data = prevGroup;
                        s.groups[name].status = "error";
                        s.groups[name].error = message;
                        if (s.groups[name].optimistic) delete s.groups[name].optimistic![cmid];
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

        getGroupOrNull: (name: EnumKey) => {
            const g = get().groups[name];
            return g?.data ?? null;
        },

        listGroups: () => {
            const s = get();
            return s.order.map((name) => s.groups[name]?.data).filter(Boolean) as EnumGroup[];
        },
    }))
);

export default useEnumSettingsStore;
