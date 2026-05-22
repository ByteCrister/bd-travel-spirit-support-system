// components/GuideSubscriptions/ConfirmDeleteDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const DIALOG_CONTENT =
  "max-w-md bg-[#E7E5E4] border-white/60 shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff] rounded-2xl p-0 gap-0 overflow-hidden";

const DIALOG_HEADER =
  "px-6 pt-6 pb-5 border-b border-[#1E2938]/08";

const ICON_WELL_DANGER =
  "p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const DIALOG_TITLE =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight flex items-center gap-3";

const ALERT_BOX =
  "flex items-start gap-3 p-4 rounded-xl " +
  "bg-[#FF2157]/08 border border-[#FF2157]/20 " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const ALERT_TEXT =
  "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157]";

const INFO_CARD =
  "space-y-3 p-4 rounded-xl bg-[#E7E5E4] " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]";

const INFO_LABEL =
  "text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/50 uppercase tracking-widest";

const INFO_VALUE =
  "text-sm font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[#1E2938] mt-0.5";

const BTN_CANCEL =
  "gap-2 rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border-none " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200";

const BTN_DELETE =
  "gap-2 rounded-xl bg-[#FF2157] text-white " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[4px_4px_8px_#c8c6c5,-2px_-2px_6px_#ffffff] border-none " +
  "hover:bg-[#e01f4f] hover:shadow-[6px_6px_12px_#c8c6c5,-3px_-3px_8px_#ffffff] " +
  "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)] " +
  "transition-all duration-200";
// ─────────────────────────────────────────────────────────────

export interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  keyName: string;
  price?: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  title,
  keyName,
  price,
  onConfirm,
  onCancel,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className={DIALOG_CONTENT}>
        <DialogHeader className={DIALOG_HEADER}>
          <DialogTitle className={DIALOG_TITLE}>
            <span className={ICON_WELL_DANGER}>
              <Trash2 size={18} className="text-[#FF2157]" />
            </span>
            Delete Subscription Tier
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {/* Alert */}
          <div className={ALERT_BOX}>
            <AlertTriangle size={16} className="text-[#FF2157] mt-0.5 shrink-0" />
            <p className={ALERT_TEXT}>
              This action cannot be undone. This will permanently delete the subscription tier.
            </p>
          </div>

          {/* Info card */}
          <div className={INFO_CARD}>
            <div>
              <p className={INFO_LABEL}>Title</p>
              <p className={INFO_VALUE}>{title}</p>
            </div>
            <div className="border-t border-[#1E2938]/08 pt-3">
              <p className={INFO_LABEL}>Key</p>
              <p className={`${INFO_VALUE} font-mono`}>{keyName}</p>
            </div>
            {price != null && (
              <div className="border-t border-[#1E2938]/08 pt-3">
                <p className={INFO_LABEL}>Price</p>
                <p className={INFO_VALUE}>${price}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 px-6 pb-6">
          <Button onClick={onCancel} disabled={loading} className={BTN_CANCEL}>
            <X size={16} />
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading} className={BTN_DELETE}>
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Trash2 size={16} />
                </motion.div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Tier
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};