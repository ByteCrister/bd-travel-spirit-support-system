// stores/useGuideSubscriptionsStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
    ID,
    GuideSubscriptionsApiResponse,
    GuideSubscriptionsState,
    SubscriptionTierDTO,
    SubscriptionTierMap,
    UpsertSubscriptionTierPayload,
    ValidationError,
    TierListQuery
} from "@/types/guide-subscription-settings.types";
import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";
import { showToast } from "@/components/global/showToast";

/* -------------------------
  Local helper types
------------------------- */

type ReorderPayload = { orderedIds: ID[]; editorId?: ID; note?: string };
type ServerValidationShape = { errors?: ValidationError[] };

/* -------------------------
  Constants
------------------------- */

const URL_AFTER_API = "/mock/site-settings/guide-subscriptions";
const FETCH_TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 1000 * 60 * 2; // 2 minutes

/* -------------------------
  Pure helpers
------------------------- */

function canonicalId(t: SubscriptionTierDTO): ID {
    // prefer stable `key`, fallback to _id if provided
    return (t.key ?? t._id ?? "") as ID;
}

function buildMap(list: SubscriptionTierDTO[]): SubscriptionTierMap {
    return list.reduce<SubscriptionTierMap>((acc, t) => {
        acc[canonicalId(t)] = t;
        return acc;
    }, {});
}

function parseServerValidations(payload: unknown): ValidationError[] {
    const p = payload as ServerValidationShape | null;
    if (!p) return [];
    if (Array.isArray(p.errors)) return p.errors;
    return [];
}

/**
 * Defensive sanitizer: converts form-like shape into DTO-shaped values.
 * Throws a descriptive Error on invalid fields.
 */
function sanitizeToDto(input: Partial<SubscriptionTierDTO>): SubscriptionTierDTO {
    const priceRaw = input.price as unknown;
    const price = typeof priceRaw === "string" ? priceRaw.trim() : priceRaw;
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || !isFinite(priceNum)) {
        throw new Error("Invalid price: must be a finite number");
    }

    const billingRaw = input.billingCycleDays ?? [];
    if (!Array.isArray(billingRaw) || billingRaw.length === 0) {
        throw new Error("billingCycleDays required: provide an array of positive integers (days)");
    }
    const billing = billingRaw.map((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
            throw new Error("Invalid billingCycleDays: each entry must be a positive integer (days)");
        }
        return Math.floor(n);
    });

    return {
        key: String(input.key ?? "").trim(),
        title: String(input.title ?? "").trim(),
        price: priceNum,
        currency: input.currency ?? "USD",
        billingCycleDays: billing,
        perks: input.perks ?? [],
        active: input.active ?? true,
        metadata: input.metadata ?? {},
        _id: input._id,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}

/* -------------------------
  Default query
------------------------- */

const DEFAULT_QUERY: TierListQuery = {
    search: undefined,
    onlyActive: false,
    sortBy: "title",
    sortDir: "asc",
};

/* -------------------------
  Store
------------------------- */

export const useGuideSubscriptionsStore = create<GuideSubscriptionsState>()(
    devtools(
        immer((set, get) => ({
            // data
            list: [],
            map: {},

            // meta
            loading: false,
            saving: false,
            error: null,
            version: undefined,
            lastFetchedAt: undefined,

            // ui
            draft: null,
            validations: [],

            // query
            query: DEFAULT_QUERY,

            /* -------------------------
               fetchAll - TTL aware
               ------------------------- */
            fetchAll: async (force = false) => {
                const { loading, lastFetchedAt } = get();
                if (loading) return;
                const now = Date.now();
                if (!force && lastFetchedAt) {
                    const age = now - Date.parse(lastFetchedAt);
                    if (!Number.isNaN(age) && age < FETCH_TTL_MS) return;
                }

                set((s) => {
                    s.loading = true;
                    s.error = null;
                });

                try {
                    const resp = await api.get<GuideSubscriptionsApiResponse>(
                        `${URL_AFTER_API}`
                    );
                    const payload = resp.data;
                    const list = payload.guideSubscriptions ?? [];
                    set((s) => {
                        s.list = list;
                        s.map = buildMap(list);
                        s.version = payload.version;
                        s.lastFetchedAt = payload.updatedAt ?? new Date().toISOString();
                        s.loading = false;
                        s.error = null;
                    });
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set((s) => {
                        s.loading = false;
                        s.error = message;
                    });
                    showToast.error("Failed to load subscriptions", message);
                    throw new Error(message);
                }
            },

            /* -------------------------
               upsertTier - create or update single tier
               includes version for concurrency
               ------------------------- */
            upsertTier: async (payload: UpsertSubscriptionTierPayload) => {
                set((s) => {
                    s.saving = true;
                    s.error = null;
                    s.validations = [];
                });

                // sanitize and validate on client
                let sanitized: SubscriptionTierDTO;
                try {
                    sanitized = sanitizeToDto(payload.tier as Partial<SubscriptionTierDTO>);
                } catch (e) {
                    const msg = e instanceof Error ? e.message : "Invalid input";
                    set((s) => {
                        s.saving = false;
                        s.validations = [{ message: msg }];
                    });
                    showToast.error("Validation error", msg);
                    throw new Error(msg);
                }

                // client form-level validation with same rules (keeps validations array useful)
                const localErrors = get().validateDraft(sanitized);
                if (localErrors.length > 0) {
                    set((s) => {
                        s.saving = false;
                        s.validations = localErrors;
                    });
                    throw new Error("Validation failed");
                }

                try {
                    const resp = await api.post<{
                        tier: SubscriptionTierDTO;
                        version?: number;
                        updatedAt?: string;
                    }>(`${URL_AFTER_API}/tier`, {
                        tier: sanitized,
                        editorId: payload.editorId,
                        note: payload.note,
                        version: get().version, // include for concurrency check
                    } as unknown);

                    const returned = resp.data.tier;
                    set((s) => {
                        const id = canonicalId(returned);
                        const idx = s.list.findIndex((x) => canonicalId(x) === id);
                        if (idx >= 0) {
                            s.list[idx] = returned;
                        } else {
                            s.list.push(returned);
                        }
                        s.map = buildMap(s.list);
                        s.saving = false;
                        s.version = resp.data.version ?? s.version;
                        s.lastFetchedAt = resp.data.updatedAt ?? s.lastFetchedAt;
                        s.validations = [];
                    });

                    showToast.success("Subscription saved", `Plan ${returned.title} saved.`);
                    return returned;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    const serverValidations = parseServerValidations(
                        // safe access to response body
                        (err as { response?: { data?: unknown } })?.response?.data
                    );

                    set((s) => {
                        s.saving = false;
                        s.error = message;
                        s.validations = serverValidations;
                    });

                    // If concurrency conflict (server should return 409), fetch latest and inform user
                    const status = (err as { response?: { status?: number } })?.response?.status;
                    if (status === 409) {
                        try {
                            await get().fetchAll(true);
                        } catch {
                            /* best-effort */
                        }
                        showToast.warning("Conflict detected", "Another admin updated settings; data refreshed.");
                    } else {
                        showToast.error("Failed to save subscription", message);
                    }

                    throw new Error(message);
                }
            },

            /* -------------------------
               removeTier
               ------------------------- */
            removeTier: async (id: ID) => {
                set((s) => {
                    s.saving = true;
                    s.error = null;
                });

                const encodedId = encodeURIComponent(id);
                // optimistic snapshot
                const prev = get().list.slice();

                set((s) => {
                    s.list = s.list.filter((t) => canonicalId(t) !== id);
                    s.map = buildMap(s.list);
                });

                try {
                    await api.delete<{ version?: number; updatedAt?: string }>(
                        `${URL_AFTER_API}/tier/${encodedId}`
                    );

                    set((s) => {
                        s.saving = false;
                    });

                    showToast.success("Subscription removed", "The plan has been deleted.");
                } catch (err) {
                    const message = extractErrorMessage(err);
                    // rollback immediately
                    set((s) => {
                        s.list = prev;
                        s.map = buildMap(prev);
                        s.saving = false;
                        s.error = message;
                    });
                    showToast.error("Failed to remove subscription", message);
                    throw new Error(message);
                }
            },

            /* -------------------------
               reorderTiers - optimistic with rollback
               ------------------------- */
            reorderTiers: async (orderedIds: ID[], editorId?: ID, note?: string) => {
                set((s) => {
                    s.saving = true;
                    s.error = null;
                });

                const prev = get().list.slice();

                // optimistic local reorder
                set((s) => {
                    const idToTier: Record<ID, SubscriptionTierDTO> = {};
                    for (const t of s.list) idToTier[canonicalId(t)] = t;
                    const newList: SubscriptionTierDTO[] = [];
                    for (const id of orderedIds) {
                        const item = idToTier[id];
                        if (item) newList.push(item);
                    }
                    for (const t of s.list) {
                        if (!orderedIds.includes(canonicalId(t))) newList.push(t);
                    }
                    s.list = newList;
                    s.map = buildMap(s.list);
                });

                try {
                    await api.post(`${URL_AFTER_API}/reorder`, {
                        orderedIds,
                        editorId,
                        note,
                        version: get().version,
                    } as ReorderPayload & { version?: number });

                    set((s) => {
                        s.saving = false;
                    });

                    showToast.success("Order updated", "Subscription tiers order updated.");
                } catch (err) {
                    const message = extractErrorMessage(err);
                    // rollback
                    set((s) => {
                        s.list = prev;
                        s.map = buildMap(prev);
                        s.saving = false;
                        s.error = message;
                    });
                    showToast.error("Failed to reorder", message);

                    // try authoritative reload (best-effort)
                    try {
                        await get().fetchAll(true);
                    } catch {
                        /* swallow */
                    }

                    throw new Error(message);
                }
            },

            /* -------------------------
               UI / helpers
               ------------------------- */
            setDraft: (d?: SubscriptionTierDTO | null) => {
                set((s) => {
                    s.draft = d ?? null;
                    s.validations = [];
                });
            },

            setQuery: (q: Partial<TierListQuery>) => {
                set((s) => {
                    s.query = { ...s.query, ...q };
                });
            },

            validateDraft: (d?: SubscriptionTierDTO | null) => {
                const target = d ?? get().draft;
                const errors: ValidationError[] = [];
                if (!target) return [];

                if (!target.key || String(target.key).trim().length === 0) {
                    errors.push({ field: "key", message: "Key is required" });
                } else if (!/^[a-z0-9-_]+$/i.test(target.key)) {
                    errors.push({ field: "key", message: "Key must be alphanumeric, dash or underscore" });
                }

                if (!target.title || String(target.title).trim().length === 0) {
                    errors.push({ field: "title", message: "Title is required" });
                }

                if (target.price === undefined || target.price === null || Number.isNaN(Number(target.price))) {
                    errors.push({ field: "price", message: "Price is required and must be a number" });
                } else if (!isFinite(Number(target.price)) || Number(target.price) < 0) {
                    errors.push({ field: "price", message: "Price must be a finite number >= 0" });
                }

                if (!Array.isArray(target.billingCycleDays) || target.billingCycleDays.length === 0) {
                    errors.push({ field: "billingCycleDays", message: "At least one billing cycle is required" });
                } else if (target.billingCycleDays.some((v) => !Number.isInteger(Number(v)) || Number(v) <= 0)) {
                    errors.push({ field: "billingCycleDays", message: "Billing cycles must be positive integers (days)" });
                }

                set((s) => {
                    s.validations = errors;
                });

                return errors;
            },

            clearError: () => {
                set((s) => {
                    s.error = null;
                    s.validations = [];
                });
            },
        }))
    )
);

export default useGuideSubscriptionsStore;
