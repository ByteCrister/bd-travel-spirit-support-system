"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  HiPencil,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiCalendar,
} from "react-icons/hi";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import type {
  AdvertisingPriceRow,
  ObjectId,
} from "@/types/advertising/advertising-settings.types";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism style constants ───────────────────────────────
const S = {
  wrap:
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] " +
    "border border-white/60 overflow-hidden",
  scrollArea: "overflow-x-auto",

  thead: "bg-[#E7E5E4]",
  theadRow: "border-b border-[#1E2938]/10",
  th:
    "px-4 py-3 text-left text-xs font-bold uppercase tracking-widest " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938]/50",
  thRight: "px-4 py-3 text-right text-xs font-bold uppercase tracking-widest " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938]/50",

  tbody: "",
  tr: "group border-b border-[#1E2938]/8 last:border-0 " +
    "hover:bg-white/40 transition-colors duration-150",
  td: "px-4 py-3 align-middle",
  tdRight: "px-4 py-3 align-middle text-right",

  placementAvatar:
    "h-8 w-8 rounded-xl bg-[#006666] flex items-center justify-center " +
    "shadow-[2px_2px_5px_#004d4d,-1px_-1px_3px_#008080] flex-shrink-0",
  placementName:
    "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
  placementSub:
    "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40 mt-0.5",

  priceValue:
    "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
  priceSub:
    "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40 mt-0.5",

  durationPill:
    "inline-flex items-center px-2 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938]/60 " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",

  badgeActive:
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  badgeInactive:
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#1E2938]/5 text-[#1E2938]/40 " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",

  dateText:
    "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70",
  timeSub:
    "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40 mt-0.5",

  actionBtn:
    "w-8 h-8 flex items-center justify-center rounded-xl bg-[#E7E5E4] " +
    "text-[#1E2938]/50 " +
    "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40",
  actionBtnEdit: "hover:text-[#006666]",
  actionBtnDel: "hover:text-[#FF2157]",

  loadingWrap: "p-8 flex justify-center",
  spinner:
    "h-8 w-8 rounded-full border-4 border-[#006666] border-t-transparent animate-spin",
};

interface Props {
  rows: AdvertisingPriceRow[];
  loading: boolean;
  selectedIds: Set<ObjectId>;
  onToggleSelect: (id: ObjectId) => void;
  onEdit: (row: AdvertisingPriceRow) => void;
  onDelete: (id: ObjectId) => void;
  onToggleActive: (id: ObjectId) => void;
}

const formatCurrency = (price: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(price);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const AdsTable: React.FC<Props> = ({
  rows,
  loading,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  const handleToggleAll = (checked: boolean) => {
    rows.forEach((row) => {
      const has = selectedIds.has(row.id);
      if (checked && !has) onToggleSelect(row.id);
      else if (!checked && has) onToggleSelect(row.id);
    });
  };

  return (
    <div className={S.wrap}>
      <div className={S.scrollArea}>
        <table className="w-full border-collapse">
          <thead className={S.thead}>
            <tr className={S.theadRow}>
              <th className={S.th} style={{ width: "3rem" }}>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => handleToggleAll(!!v)}
                  aria-label="Select all"
                />
              </th>
              <th className={S.th}>Placement</th>
              <th className={S.th}>Price</th>
              <th className={S.th}>Duration</th>
              <th className={S.th}>Status</th>
              <th className={S.th}>Updated</th>
              <th className={S.thRight}>Actions</th>
            </tr>
          </thead>
          <tbody className={S.tbody}>
            {rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={S.tr}
              >
                {/* Checkbox */}
                <td className={S.td}>
                  <Checkbox
                    checked={selectedIds.has(row.id)}
                    onCheckedChange={() => onToggleSelect(row.id)}
                    aria-label={`Select ${row.placementLabel}`}
                  />
                </td>

                {/* Placement */}
                <td className={S.td}>
                  <div className="flex items-center gap-2.5">
                    <div className={S.placementAvatar}>
                      <span className="text-white text-xs font-bold">
                        {row.placementLabel.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className={S.placementName}>{row.placementLabel}</div>
                      <div className={S.placementSub}>{row.placement}</div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className={S.td}>
                  <div className="flex items-center gap-1">
                    <FaBangladeshiTakaSign className="h-3.5 w-3.5 text-[#006666] flex-shrink-0" />
                    <span className={S.priceValue}>
                      {formatCurrency(row.price, row.currency)}
                    </span>
                  </div>
                  <div className={S.priceSub}>{row.currency}</div>
                </td>

                {/* Duration */}
                <td className={S.td}>
                  <div className="space-y-1.5">
                    {row.defaultDurationDays && (
                      <div className="flex items-center gap-1 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60">
                        <HiCalendar className="h-3 w-3 text-[#006666]" />
                        {row.defaultDurationDays}d default
                      </div>
                    )}
                    {row.allowedDurationsDays.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {row.allowedDurationsDays.slice(0, 3).map((d) => (
                          <span key={d} className={S.durationPill}>{d}d</span>
                        ))}
                        {row.allowedDurationsDays.length > 3 && (
                          <span className={S.durationPill}>
                            +{row.allowedDurationsDays.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className={S.td}>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={row.active}
                      onCheckedChange={() => onToggleActive(row.id)}
                      className="data-[state=checked]:bg-[#006666]"
                      aria-label={`Toggle active for ${row.placementLabel}`}
                    />
                    <span className={row.active ? S.badgeActive : S.badgeInactive}>
                      {row.active ? (
                        <><HiCheckCircle className="h-3 w-3" /> Active</>
                      ) : (
                        <><HiXCircle className="h-3 w-3" /> Inactive</>
                      )}
                    </span>
                  </div>
                </td>

                {/* Updated */}
                <td className={S.td}>
                  <div className={S.dateText}>{formatDate(row.updatedAt)}</div>
                  <div className={S.timeSub}>{formatTime(row.updatedAt)}</div>
                </td>

                {/* Actions */}
                <td className={S.tdRight}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      onClick={() => onEdit(row)}
                      className={`${S.actionBtn} ${S.actionBtnEdit}`}
                      aria-label={`Edit ${row.placementLabel}`}
                    >
                      <HiPencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(row.id)}
                      className={`${S.actionBtn} ${S.actionBtnDel}`}
                      aria-label={`Delete ${row.placementLabel}`}
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className={S.loadingWrap}>
          <div className={S.spinner} />
        </div>
      )}
    </div>
  );
};

export default AdsTable;