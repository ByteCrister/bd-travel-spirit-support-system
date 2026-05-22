// components/shared/Toast/UndoSnackbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, X } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const SNACKBAR_WRAP =
  "fixed bottom-8 left-1/2 -translate-x-1/2 z-50";

const SNACKBAR_INNER =
  "flex items-center gap-4 px-5 py-3.5 rounded-2xl " +
  "bg-[#1E2938] border border-white/10 " +
  "shadow-[8px_8px_20px_rgba(0,0,0,0.35),-2px_-2px_8px_rgba(255,255,255,0.05)]";

const SNACKBAR_MSG =
  "text-sm text-white font-[family-name:var(--font-jetbrains-mono)]";

const BTN_UNDO =
  "gap-2 rounded-xl bg-[#006666] text-white text-xs h-8 px-3 " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[2px_2px_6px_rgba(0,0,0,0.3)] border-none " +
  "hover:bg-[#007777] transition-all duration-200";

const BTN_CLOSE =
  "h-8 w-8 p-0 rounded-xl bg-white/10 text-white border-none " +
  "hover:bg-white/20 transition-all duration-200";
// ─────────────────────────────────────────────────────────────

export interface UndoSnackbarProps {
  message: string;
  onUndo?: () => Promise<void> | void;
  timeoutMs?: number;
  actionLabel?: string;
}

export const UndoSnackbar: React.FC<UndoSnackbarProps> = ({
  message,
  onUndo,
  timeoutMs = 6000,
  actionLabel = "Undo",
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), timeoutMs);
    return () => clearTimeout(t);
  }, [timeoutMs]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={SNACKBAR_WRAP}
      >
        <div className={SNACKBAR_INNER}>
          <p className={SNACKBAR_MSG}>{message}</p>
          <div className="flex items-center gap-2">
            {onUndo && (
              <Button
                size="sm"
                onClick={() => { onUndo(); setVisible(false); }}
                className={BTN_UNDO}
              >
                <Undo2 size={14} />
                {actionLabel}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setVisible(false)}
              className={BTN_CLOSE}
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};