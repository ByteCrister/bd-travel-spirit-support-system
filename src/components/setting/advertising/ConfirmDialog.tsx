"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiExclamation } from "react-icons/hi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ── Neumorphism style constants ───────────────────────────────
const S = {
  content:
    "sm:max-w-md rounded-2xl bg-[#E7E5E4] border-none " +
    "shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff]",

  iconWell:
    "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 " +
    "bg-[#FF2157]/10 shadow-[3px_3px_8px_#c8c6c5,-3px_-3px_8px_#ffffff]",

  title:
    "text-base font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
  desc:
    "mt-1.5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 leading-relaxed",

  footer: "mt-6 flex items-center gap-3",

  btnCancel:
    "flex-1 flex items-center justify-center h-11 rounded-xl text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "transition-all duration-200",

  btnDelete:
    "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-white bg-[#FF2157] " +
    "shadow-[4px_4px_8px_rgba(255,33,87,0.4),-2px_-2px_6px_rgba(255,100,120,0.3)] " +
    "hover:bg-[#e01047] hover:shadow-[6px_6px_12px_rgba(255,33,87,0.5)] " +
    "active:shadow-[inset_3px_3px_6px_rgba(180,0,40,0.5)] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50 " +
    "transition-all duration-200",
};

interface Props {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const ConfirmDialog: React.FC<Props> = ({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}) => {
  const [confirming, setConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent className={S.content}>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="shrink-0"
            >
              <div className={S.iconWell}>
                <HiExclamation className="h-6 w-6 text-[#FF2157]" />
              </div>
            </motion.div>

            <div className="flex-1 pt-1">
              <AlertDialogTitle className={S.title}>{title}</AlertDialogTitle>
              <AlertDialogDescription className={S.desc}>
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className={S.footer}>
          <AlertDialogCancel asChild>
            <button
              onClick={onCancel}
              disabled={confirming}
              className={S.btnCancel}
            >
              Cancel
            </button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <motion.button
              whileHover={{ scale: confirming ? 1 : 1.02 }}
              whileTap={{ scale: confirming ? 1 : 0.97 }}
              onClick={handleConfirm}
              disabled={confirming}
              className={S.btnDelete}
            >
              {confirming ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </motion.button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;