/* lib/stores/advertisingSettings.store.ts
 *
 * Production-ready zustand store for AdvertisingSettingsState.
 * - Uses axios instance at lib/utils/axios.ts (imported as `api`)
 * - Uses extractErrorMessage from your utils
 * - Uses showToast for user notifications
 *
 * Notes:
 * - No persistence is enabled by default (server-backed singleton config better kept server-side).
 * - optimistic update patterns are used where appropriate with rollback on failure.
 */

import { create } from "zustand";
import type { StateCreator } from "zustand";
import { produce, enableMapSet } from "immer";
import type {
  AdvertisingSettingsState,
  AdvertisingPriceRow,
  AdvertisingPriceDTO,
  AdvertisingConfigDTO,
  CreateAdvertisingPricePayload,
  UpdateAdvertisingPricePayload,
  BulkUpdateAdvertisingPricesPayload,
  ObjectId,
  FetchAdvertisingConfigRes,
  CreateAdvertisingPriceRes,
  UpdateAdvertisingPriceRes,
  BulkUpdateRes,
} from "@/types/advertising-settings.types";
import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "@/components/global/showToast";
import { PLACEMENT } from "@/constants/advertising.const";
enableMapSet();

// const URL_AFTER_API = "/mock/site-settings/advertising";
const URL_AFTER_API = "/site-settings/v1/advertising";

const mapDtoToRow = (dto: AdvertisingPriceDTO): AdvertisingPriceRow => ({
  id: dto.id,
  title: dto.title,
  placement: dto.placement,
  placementLabel: humanizePlacement(dto.placement),
  price: dto.price,
  currency: dto.currency,
  defaultDurationDays: dto.defaultDurationDays ?? null,
  allowedDurationsDays: dto.allowedDurationsDays ?? [],
  active: dto.active,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

function humanizePlacement(placement: string): string {
  // minimal mapping: can be replaced with i18n or constants mapping
  switch (placement) {
    case PLACEMENT.LANDING_BANNER:
      return "Landing banner";
    case PLACEMENT.POPUP_MODAL:
      return "Popup modal";
    case PLACEMENT.EMAIL:
      return "Email";
    case PLACEMENT.SIDEBAR:
      return "Sidebar";
    case PLACEMENT.SPONSORED_LIST:
      return "Sponsored list";
    default:
      return placement
        .replace(/_|-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/* ---------- Store implementation ---------- */

const initialState = {
  config: null as AdvertisingConfigDTO | null,
  pricingRows: [] as AdvertisingPriceRow[],
  selectedIds: new Set<string>() as Set<ObjectId>,
  loading: false,
  saving: false,
  lastError: null as string | null,
};

type Creator = StateCreator<AdvertisingSettingsState>;

const storeCreator: Creator = (set, get) => ({
  // data
  config: initialState.config,
  pricingRows: initialState.pricingRows,
  selectedIds: initialState.selectedIds,
  loading: initialState.loading,
  saving: initialState.saving,
  lastError: initialState.lastError,

  // selectors / derived
  getRowById: (id: ObjectId) => {
    return get().pricingRows.find((r) => r.id === id);
  },

  listActiveRows: () => {
    return get().pricingRows.filter((r) => r.active);
  },

  // actions
  fetchConfig: async () => {
    set((s) => ({ ...s, loading: true, lastError: null }));
    try {
      const res = await api.get<FetchAdvertisingConfigRes>(
        `${URL_AFTER_API}/config`
      );
      if (!res.data.data) {
        throw new Error("Invalid response body.");
      }
      const config = res.data.data;
      // Denormalize to rows for UI
      const rows = (config.pricing ?? []).map(mapDtoToRow);
      set((s) =>
        produce(s, (draft) => {
          draft.config = config;
          draft.pricingRows = rows;
          draft.loading = false;
          draft.lastError = null;
        })
      );
      return;
    } catch (err) {
      const message = extractErrorMessage(err);
      set((s) => ({ ...s, loading: false, lastError: message }));
      showToast.error("Failed to fetch advertising config", message);
      throw err;
    }
  },

  createPrice: async (payload: CreateAdvertisingPricePayload) => {
    set((s) => ({ ...s, saving: true, lastError: null }));
    try {
      const res = await api.post<CreateAdvertisingPriceRes>(
        `${URL_AFTER_API}/prices`,
        payload
      );
      if (!res.data.data) {
        throw new Error("Invalid response body.");
      }
      const dto = res.data.data;
      const row = mapDtoToRow(dto);
      set((s) =>
        produce(s, (draft) => {
          draft.pricingRows = [row, ...draft.pricingRows];
          // keep config pricing in sync if present (non-authoritative)
          if (draft.config) {
            draft.config.pricing = [dto, ...draft.config.pricing];
          }
          draft.saving = false;
        })
      );
      showToast.success("Price created", `Placement: ${row.placementLabel}`);
      return dto;
    } catch (err) {
      const message = extractErrorMessage(err);
      set((s) => ({ ...s, saving: false, lastError: message }));
      showToast.error("Failed to create price", message);
      throw err;
    }
  },

  updatePrice: async (payload: UpdateAdvertisingPricePayload) => {
    set((s) => ({ ...s, saving: true, lastError: null }));
    const prevRows = get().pricingRows;
    // optimistic update: apply partial changes to row immediately for snappy UI
    try {
      if (payload.id) {
        set((s) =>
          produce(s, (draft) => {
            const idx = draft.pricingRows.findIndex((r) => r.id === payload.id);
            if (idx !== -1) {
              const current = draft.pricingRows[idx];
              const patched: AdvertisingPriceRow = {
                ...current,
                title: payload.title ?? current.title,
                placement: payload.placement ?? current.placement,
                placementLabel: payload.placement
                  ? humanizePlacement(payload.placement)
                  : current.placementLabel,
                price: payload.price ?? current.price,
                currency: payload.currency ?? current.currency,
                defaultDurationDays:
                  payload.defaultDurationDays === undefined
                    ? current.defaultDurationDays
                    : payload.defaultDurationDays,
                allowedDurationsDays:
                  payload.allowedDurationsDays ?? current.allowedDurationsDays,
                active: payload.active ?? current.active,
                updatedAt: new Date().toISOString(),
              };
              draft.pricingRows[idx] = patched;
            }
          })
        );
      }

      const res = await api.put<UpdateAdvertisingPriceRes>(
        `${URL_AFTER_API}/prices/${payload.id}`,
        payload
      );
      if (!res.data.data) {
        throw new Error("Invalid response body.");
      }
      const dto = res.data.data;
      const row = mapDtoToRow(dto);
      set((s) =>
        produce(s, (draft) => {
          const idx = draft.pricingRows.findIndex((r) => r.id === dto.id);
          if (idx !== -1) draft.pricingRows[idx] = row;
          if (draft.config) {
            draft.config.pricing = draft.config.pricing.map((p) =>
              p.id === dto.id ? dto : p
            );
          }
          draft.saving = false;
        })
      );
      showToast.success("Price updated", `Placement: ${row.placementLabel}`);
      return dto;
    } catch (err) {
      const message = extractErrorMessage(err);
      // rollback optimistic change
      set((s) => ({
        ...s,
        pricingRows: prevRows,
        saving: false,
        lastError: message,
      }));
      showToast.error("Failed to update price", message);
      throw err;
    }
  },

  bulkUpdate: async (payload: BulkUpdateAdvertisingPricesPayload) => {
    set((s) => ({ ...s, saving: true, lastError: null }));
    const prevRows = get().pricingRows;
    try {
      // apply optimistic local changes if updates provided (partial)
      if (payload.updates && payload.updates.length > 0) {
        set((s) =>
          produce(s, (draft) => {
            for (const u of payload.updates) {
              const idx = draft.pricingRows.findIndex((r) => r.id === u.id);
              if (idx !== -1) {
                const curr = draft.pricingRows[idx];
                draft.pricingRows[idx] = {
                  ...curr,
                  placement: u.placement ?? curr.placement,
                  placementLabel: u.placement
                    ? humanizePlacement(u.placement)
                    : curr.placementLabel,
                  price: u.price ?? curr.price,
                  currency: u.currency ?? curr.currency,
                  defaultDurationDays:
                    u.defaultDurationDays === undefined
                      ? curr.defaultDurationDays
                      : u.defaultDurationDays,
                  allowedDurationsDays:
                    u.allowedDurationsDays ?? curr.allowedDurationsDays,
                  active: u.active ?? curr.active,
                  updatedAt: new Date().toISOString(),
                };
              }
            }
            if (payload.removeIds && payload.removeIds.length > 0) {
              draft.pricingRows = draft.pricingRows.filter(
                (r) => !payload.removeIds!.includes(r.id)
              );
              payload.removeIds.forEach((id) => draft.selectedIds.delete(id));
            }
          })
        );
      }

      const res = await api.put<BulkUpdateRes>(
        `${URL_AFTER_API}/prices/bulk`,
        payload
      );
      if (!res.data.data) {
        throw new Error("Invalid response body.");
      }
      const config = res.data.data;
      const rows = (config.pricing ?? []).map(mapDtoToRow);
      set((s) =>
        produce(s, (draft) => {
          draft.config = config;
          draft.pricingRows = rows;
          draft.saving = false;
        })
      );
      showToast.success(
        "Bulk update applied",
        `Updated ${config.pricing.length} entries`
      );
      return config;
    } catch (err) {
      const message = extractErrorMessage(err);
      // rollback
      set((s) => ({
        ...s,
        pricingRows: prevRows,
        saving: false,
        lastError: message,
      }));
      showToast.error("Bulk update failed", message);
      throw err;
    }
  },

  deletePrice: async (id: ObjectId) => {
    set((s) => ({ ...s, saving: true, lastError: null }));
    const prevRows = get().pricingRows;
    try {
      // optimistic removal
      set((s) =>
        produce(s, (draft) => {
          draft.pricingRows = draft.pricingRows.filter((r) => r.id !== id);
          draft.selectedIds.delete(id);
        })
      );

      await api.delete<void>(`${URL_AFTER_API}/prices/${id}`);

      // Sync config if present by removing id
      set((s) =>
        produce(s, (draft) => {
          if (draft.config) {
            draft.config.pricing = draft.config.pricing.filter(
              (p) => p.id !== id
            );
          }
          draft.saving = false;
        })
      );

      showToast.success("Price removed");
      return;
    } catch (err) {
      const message = extractErrorMessage(err);
      // rollback
      set((s) => ({
        ...s,
        pricingRows: prevRows,
        saving: false,
        lastError: message,
      }));
      showToast.error("Failed to remove price", message);
      throw err;
    }
  },

  toggleActive: async (id: ObjectId) => {
    set((s) => ({ ...s, saving: true, lastError: null }));
    const prevRows = get().pricingRows;

    try {
      // Optimistic update
      set((s) =>
        produce(s, (draft) => {
          const idx = draft.pricingRows.findIndex((r) => r.id === id);
          if (idx !== -1) {
            draft.pricingRows[idx].active = !draft.pricingRows[idx].active;
            draft.pricingRows[idx].updatedAt = new Date().toISOString();
          }
        })
      );

      // Call server API to toggle active status
      const res = await api.put<UpdateAdvertisingPriceRes>(
        `${URL_AFTER_API}/prices/${id}/toggle-active`
      );

      if (!res.data.data) throw new Error("Invalid response body");

      // Sync updated DTO
      const dto = res.data.data;
      const row = mapDtoToRow(dto);

      set((s) =>
        produce(s, (draft) => {
          const idx = draft.pricingRows.findIndex((r) => r.id === dto.id);
          if (idx !== -1) draft.pricingRows[idx] = row;
          if (draft.config) {
            draft.config.pricing = draft.config.pricing.map((p) =>
              p.id === dto.id ? dto : p
            );
          }
          draft.saving = false;
        })
      );

      showToast.success(
        dto.active ? "Price activated" : "Price deactivated",
        `Placement: ${row.placementLabel}`
      );

      return dto;
    } catch (err) {
      const message = extractErrorMessage(err);
      // rollback optimistic change
      set((s) => ({
        ...s,
        pricingRows: prevRows,
        saving: false,
        lastError: message,
      }));
      showToast.error("Failed to toggle active", message);
      throw err;
    }
  },

  toggleSelect: (id: ObjectId) => {
    set((s) =>
      produce(s, (draft) => {
        if (draft.selectedIds.has(id)) {
          draft.selectedIds.delete(id);
        } else {
          draft.selectedIds.add(id);
        }
      })
    );
  },

  clearSelection: () => {
    set((s) =>
      produce(s, (draft) => {
        draft.selectedIds = new Set<ObjectId>();
      })
    );
  },

  setLastError: (err?: string | null) => {
    set((s) =>
      produce(s, (draft) => {
        draft.lastError = err ?? null;
      })
    );
  },
});

const useAdvertisingSettingsStore =
  create<AdvertisingSettingsState>(storeCreator);

export default useAdvertisingSettingsStore;
