"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { HiPencil, HiTrash, HiCheckCircle, HiXCircle } from "react-icons/hi";
import { AdvertisingPriceRow } from "@/types/advertising/advertising-settings.types";

// ── Neumorphism style constants ───────────────────────────────
const S = {
  tr: "group border-b border-[#1E2938]/8 last:border-0 hover:bg-white/40 transition-colors duration-150",
  td: "px-4 py-3 align-middle",
  tdRight: "px-4 py-3 align-middle text-right",

  checkbox:
    "h-4 w-4 rounded border-[#1E2938]/20 bg-[#E7E5E4] " +
    "shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff] " +
    "accent-[#006666] cursor-pointer",

  avatarWell:
    "h-8 w-8 rounded-xl bg-[#006666] flex items-center justify-center flex-shrink-0 " +
    "shadow-[2px_2px_5px_#004d4d,-1px_-1px_3px_#008080]",

  placementName:
    "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
  placementTag:
    "inline-flex px-2 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#006666]/10 text-[#006666] " +
    "shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]",

  price:
    "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
  mono:
    "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60",

  badgeActive:
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  badgeInactive:
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#1E2938]/5 text-[#1E2938]/40 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",

  actionBtn:
    "w-8 h-8 flex items-center justify-center rounded-xl bg-[#E7E5E4] " +
    "text-[#1E2938]/50 " +
    "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40",
};

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);

interface Props {
  row: AdvertisingPriceRow;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (row: AdvertisingPriceRow) => void;
  onDelete: (id: string) => void;
  onToggleActive: (active: boolean) => void;
}

const AdsTableRow: React.FC<Props> = ({
  row,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <tr className={S.tr}>
      {/* Checkbox */}
      <td className={S.td}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(row.id)}
          aria-label={`Select ${row.placementLabel}`}
          className={S.checkbox}
        />
      </td>

      {/* Placement */}
      <td className={S.td}>
        <div className="flex items-center gap-2.5">
          <div className={S.avatarWell}>
            <span className="text-white text-xs font-bold">
              {row.placementLabel.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className={S.placementName}>{row.placementLabel}</div>
            <span className={S.placementTag}>{row.placement}</span>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className={S.td}>
        <span className={S.price}>{formatCurrency(row.price, row.currency)}</span>
      </td>

      {/* Default duration */}
      <td className={S.td}>
        <span className={S.mono}>{row.defaultDurationDays ?? "—"}</span>
      </td>

      {/* Allowed durations */}
      <td className={S.td}>
        <span className={S.mono}>
          {row.allowedDurationsDays.length
            ? row.allowedDurationsDays.join(", ")
            : "Any"}
        </span>
      </td>

      {/* Active toggle */}
      <td className={S.td}>
        <div className="flex items-center gap-2">
          <Switch
            checked={row.active}
            onCheckedChange={(v) => onToggleActive(v as boolean)}
            className="data-[state=checked]:bg-[#006666]"
            aria-label={`Active ${row.placementLabel}`}
          />
          <span className={row.active ? S.badgeActive : S.badgeInactive}>
            {row.active
              ? <><HiCheckCircle className="h-3 w-3" /> Active</>
              : <><HiXCircle className="h-3 w-3" /> Inactive</>}
          </span>
        </div>
      </td>

      {/* Created date */}
      <td className={S.td}>
        <span className={S.mono}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      </td>

      {/* Actions */}
      <td className={S.tdRight}>
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.placementLabel}`}
            className={`${S.actionBtn} hover:text-[#006666]`}
          >
            <HiPencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(row.id)}
            aria-label={`Delete ${row.placementLabel}`}
            className={`${S.actionBtn} hover:text-[#FF2157]`}
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdsTableRow;