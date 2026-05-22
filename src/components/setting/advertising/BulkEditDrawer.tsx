"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiX, HiCheck, HiAdjustments, HiLightningBolt, HiUsers } from "react-icons/hi";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdvertisingPriceRow,
  BulkUpdateAdvertisingPricesPayload,
  UpdateAdvertisingPricePayload,
} from "@/types/advertising/advertising-settings.types";
import { Currency, CURRENCY } from "@/constants/tour.const";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism style constants ───────────────────────────────
const S = {
  content: "max-h-[85vh] bg-[#E7E5E4]",
  inner: "mx-auto w-full max-w-2xl",
  header: "border-b border-[#1E2938]/10 pb-4 px-6 pt-4",
  headerIconWell:
    "h-12 w-12 rounded-xl bg-[#006666] flex items-center justify-center " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080]",
  drawerTitle:
    "text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
  drawerDesc:
    "flex items-center gap-1.5 mt-0.5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50",

  body: "p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-12rem)]",

  previewCard:
    "rounded-xl bg-[#E7E5E4] p-4 " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]",
  previewTitle:
    "flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938]/50",
  chip:
    "inline-flex px-2.5 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] " +
    "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  chipMore:
    "inline-flex px-2.5 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#006666]/10 text-[#006666] " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",

  fieldLabel:
    "flex items-center gap-2 text-xs font-bold uppercase tracking-widest " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938]/60 mb-2",

  input:
    "w-full rounded-xl px-4 py-3 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] " +
    "bg-[#E7E5E4] placeholder:text-[#1E2938]/30 " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200",

  hint:
    "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40 mt-1.5",

  infoBox:
    "rounded-xl p-3 bg-[#FE9900]/5 border border-[#FE9900]/20 " +
    "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60 mt-2",

  changesCard:
    "rounded-xl bg-[#E7E5E4] p-4 " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]",
  changesTitle:
    "text-xs font-bold uppercase tracking-widest font-[family-name:var(--font-space-mono)] text-[#1E2938]/50 mb-3",
  changeItem:
    "flex items-center gap-2 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70",

  footer: "border-t border-[#1E2938]/10 px-6 py-4 bg-[#E7E5E4]",
  footerInner: "flex items-center gap-3",

  btnCancel:
    "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "transition-all duration-200",

  btnApply:
    "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-white bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "transition-all duration-200",
};

interface Props {
  open: boolean;
  onClose: () => void;
  selectedRows: AdvertisingPriceRow[];
  onSubmit: (payload: BulkUpdateAdvertisingPricesPayload) => Promise<void>;
}

const currencies = Object.values(CURRENCY);

const BulkEditDrawer: React.FC<Props> = ({ open, onClose, selectedRows, onSubmit }) => {
  const [currency, setCurrency] = useState<Currency>(CURRENCY.USD);
  const [setActive, setSetActive] = useState<boolean | null>(null);
  const [multiplier, setMultiplier] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const hasChanges = currency !== CURRENCY.BDT || setActive !== null || multiplier !== "";

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const updates: UpdateAdvertisingPricePayload[] = selectedRows.map(
        (r): UpdateAdvertisingPricePayload => {
          const upd: UpdateAdvertisingPricePayload = { id: r.id, title: r.title };
          if (currency) upd.currency = currency;
          if (setActive !== null) upd.active = setActive;
          if (multiplier && multiplier.trim() !== "") {
            const m = Number(multiplier);
            if (!Number.isNaN(m)) {
              upd.price = Math.round((r.price * m + Number.EPSILON) * 100) / 100;
            }
          }
          return upd;
        }
      );

      await onSubmit({ updates });
      setCurrency(CURRENCY.BDT);
      setSetActive(null);
      setMultiplier("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerContent className={S.content}>
        <div className={S.inner}>
          {/* Header */}
          <DrawerHeader className={S.header}>
            <div className="flex items-center gap-3">
              <div className={S.headerIconWell}>
                <HiAdjustments className="h-6 w-6 text-white" />
              </div>
              <div>
                <DrawerTitle className={S.drawerTitle}>Bulk Edit</DrawerTitle>
                <DrawerDescription className={S.drawerDesc}>
                  <HiUsers className="h-4 w-4" />
                  Editing {selectedRows.length} selected{" "}
                  {selectedRows.length === 1 ? "item" : "items"}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          {/* Body */}
          <div className={S.body}>
            {/* Selected items preview */}
            <div className={S.previewCard}>
              <div className={S.previewTitle}>
                <HiLightningBolt className="h-4 w-4 text-[#006666]" />
                Selected Items
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRows.slice(0, 5).map((row) => (
                  <span key={row.id} className={S.chip}>{row.placementLabel}</span>
                ))}
                {selectedRows.length > 5 && (
                  <span className={S.chipMore}>+{selectedRows.length - 5} more</span>
                )}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className={S.fieldLabel}>
                <FaBangladeshiTakaSign className="h-4 w-4 text-[#006666]" />
                Update Currency
              </label>
              <Select value={currency} onValueChange={(c: Currency) => setCurrency(c)}>
                <SelectTrigger className="h-11 rounded-xl bg-[#E7E5E4] border-none font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] focus:ring-2 focus:ring-[#006666]/50">
                  <SelectValue placeholder="Keep current currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className={S.hint}>Apply the same currency to all selected items</p>
            </div>

            {/* Status */}
            <div>
              <label className={S.fieldLabel}>Set Active Status</label>
              <Select
                value={setActive === null ? undefined : setActive ? "true" : "false"}
                onValueChange={(val) => {
                  if (val === undefined) setSetActive(null);
                  else setSetActive(val === "true");
                }}
              >
                <SelectTrigger className="h-11 rounded-xl bg-[#E7E5E4] border-none font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] focus:ring-2 focus:ring-[#006666]/50">
                  <SelectValue placeholder="Keep current status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#00A63D]" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="false">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#1E2938]/30" />
                      Inactive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className={S.hint}>Enable or disable all selected items at once</p>
            </div>

            {/* Multiplier */}
            <div>
              <label className={S.fieldLabel}>Price Multiplier</label>
              <input
                type="number"
                step="0.01"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="e.g. 1.10"
                className={S.input}
                aria-label="Price multiplier"
              />
              <div className={S.infoBox}>
                <strong className="text-[#FE9900]">Example:</strong> 1.1 increases prices by 10% · 0.9 reduces by 10%
              </div>
            </div>

            {/* Changes preview */}
            {hasChanges && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className={S.changesCard}>
                  <p className={S.changesTitle}>Changes to Apply</p>
                  <ul className="space-y-2">
                    {currency && (
                      <li className={S.changeItem}>
                        <HiCheck className="h-4 w-4 text-[#00A63D] flex-shrink-0" />
                        Currency → {currency}
                      </li>
                    )}
                    {setActive !== null && (
                      <li className={S.changeItem}>
                        <HiCheck className="h-4 w-4 text-[#00A63D] flex-shrink-0" />
                        Status → {setActive ? "Active" : "Inactive"}
                      </li>
                    )}
                    {multiplier && (
                      <li className={S.changeItem}>
                        <HiCheck className="h-4 w-4 text-[#00A63D] flex-shrink-0" />
                        Price multiplier: ×{multiplier}
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className={S.footer}>
            <div className={S.footerInner}>
              <button onClick={onClose} disabled={submitting} className={S.btnCancel}>
                <HiX className="h-4 w-4" />
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: submitting || !hasChanges ? 1 : 1.02 }}
                whileTap={{ scale: submitting || !hasChanges ? 1 : 0.97 }}
                onClick={handleSubmit}
                disabled={submitting || !hasChanges}
                className={S.btnApply}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <HiCheck className="h-4 w-4" />
                    Apply Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BulkEditDrawer;