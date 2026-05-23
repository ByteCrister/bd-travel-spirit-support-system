// components/guide/ApproveConfirmDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_DIALOG_CONTENT =
  "sm:max-w-md border border-white/60 bg-[#E7E5E4] p-0 overflow-hidden " +
  "shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff] rounded-2xl";

const NEU_BODY = "px-8 py-7";

const NEU_ICON_RING =
  "mx-auto w-16 h-16 rounded-2xl bg-[#00A63D]/10 " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "flex items-center justify-center mb-5";

const NEU_HEADING =
  "text-center text-2xl font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_DESCRIPTION =
  "text-center text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60 leading-relaxed px-2 mt-2";

const NEU_FOOTER = "flex gap-3 px-8 pb-7 pt-0";

const NEU_BTN_GHOST =
  "flex-1 rounded-xl py-2.5 text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] " +
  "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
  "transition-all duration-200";

const NEU_BTN_SUCCESS =
  "flex-1 rounded-xl py-2.5 text-sm font-[family-name:var(--font-space-mono)] font-bold text-white " +
  "bg-[#00A63D] shadow-[4px_4px_8px_#007a2d,-2px_-2px_6px_#00cc4a] " +
  "hover:bg-[#009935] hover:shadow-[6px_6px_12px_#007a2d,-3px_-3px_8px_#00cc4a] " +
  "active:shadow-[inset_3px_3px_6px_#007a2d,inset_-2px_-2px_4px_#00cc4a] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A63D]/50 " +
  "transition-all duration-200";

// ─────────────────────────────────────────────────────────────────────────────

type ApproveConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
};

export function ApproveConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Approve Guide Request",
  description = "Are you sure you want to approve this guide request? This action cannot be undone.",
  loading = false,
}: ApproveConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={NEU_DIALOG_CONTENT}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className={NEU_BODY}>
            <DialogHeader className="space-y-0">
              {/* Icon */}
              <motion.div
                className={NEU_ICON_RING}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                  delay: 0.08,
                }}
              >
                <CheckCircle
                  className="h-8 w-8 text-[#00A63D]"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </motion.div>

              <DialogTitle className={NEU_HEADING}>{title}</DialogTitle>
              <DialogDescription className={NEU_DESCRIPTION}>
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className={NEU_FOOTER}>
            <button
              onClick={onClose}
              disabled={loading}
              className={NEU_BTN_GHOST}
              aria-label="Cancel"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={NEU_BTN_SUCCESS}
              aria-label="Confirm approval"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      aria-hidden="true"
                    />
                    Approving…
                  </motion.span>
                ) : (
                  <motion.span
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Confirm Approve
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
