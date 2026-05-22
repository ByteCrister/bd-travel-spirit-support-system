// src/components/enums/ConfirmDeleteDialog.tsx
"use client";

import React, { JSX, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
    content:
        "sm:max-w-md p-0 overflow-hidden bg-[#E7E5E4] border border-white/60 " +
        "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] rounded-2xl",
    inner: "bg-[#E7E5E4]",
    header: "px-6 pt-6 pb-5",
    headerRow: "flex items-start gap-4",
    iconWell:
        "flex-none p-3 rounded-xl bg-[#FF2157]/10 text-[#FF2157] " +
        "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]",
    titleText:
        "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
    desc:
        "mt-1.5 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60 leading-relaxed",
    closeBtn:
        "ml-auto -mr-1 p-1.5 rounded-xl text-[#1E2938]/40 bg-[#E7E5E4] " +
        "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
        "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
        "hover:text-[#1E2938] transition-all duration-200",
    footer: "px-6 py-4 border-t border-[#1E2938]/10",
    footerRow: "flex w-full gap-3",
    cancelBtn:
        "flex-1 px-4 py-2.5 rounded-xl text-sm font-bold " +
        "font-[family-name:var(--font-space-mono)] text-[#1E2938] bg-[#E7E5E4] " +
        "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
        "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40",
    confirmBtn:
        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold " +
        "font-[family-name:var(--font-space-mono)] text-white bg-[#FF2157] " +
        "shadow-[3px_3px_6px_rgba(255,33,87,0.4),-2px_-2px_5px_rgba(255,100,130,0.2)] " +
        "hover:bg-[#e01d4f] hover:shadow-[5px_5px_10px_rgba(255,33,87,0.4),-3px_-3px_7px_rgba(255,100,130,0.2)] " +
        "active:shadow-[inset_2px_2px_5px_rgba(180,0,40,0.5)] " +
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50 " +
        "disabled:opacity-50 disabled:cursor-not-allowed",
    defaultConfirmBtn:
        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold " +
        "font-[family-name:var(--font-space-mono)] text-white bg-[#006666] " +
        "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
        "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
        "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
        "disabled:opacity-50 disabled:cursor-not-allowed",
    defaultTriggerBtn:
        "rounded-xl w-8 h-8 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
        "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
        "hover:text-[#FF2157] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/40",
};

type ConfirmDeleteDialogProps = {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => Promise<void> | void;
    confirmVariant?: "destructive" | "default";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export default function ConfirmDeleteDialog({
    children,
    title = "Delete item",
    description = "This action cannot be undone. Are you sure you want to continue?",
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    confirmVariant = "destructive",
    open,
    onOpenChange,
}: ConfirmDeleteDialogProps): JSX.Element {
    const [loading, setLoading] = useState(false);

    async function handleConfirm() {
        try {
            setLoading(true);
            await onConfirm();
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {children ? (
                <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            ) : (
                <AlertDialogTrigger asChild>
                    <button type="button" aria-label="Delete" className={S.defaultTriggerBtn}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </AlertDialogTrigger>
            )}

            <AlertDialogContent className={S.content}>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16 }}
                    className={S.inner}
                >
                    <AlertDialogHeader className={S.header}>
                        <div className={S.headerRow}>
                            <div className={S.iconWell}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>

                            <div className="min-w-0">
                                <AlertDialogTitle className={S.titleText}>
                                    {title}
                                </AlertDialogTitle>
                                <p className={S.desc}>{description}</p>
                            </div>

                            <button
                                type="button"
                                aria-label="Close"
                                onClick={() => onOpenChange?.(false)}
                                className={S.closeBtn}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter className={S.footer}>
                        <div className={S.footerRow}>
                            <AlertDialogCancel asChild>
                                <button className={S.cancelBtn}>{cancelLabel}</button>
                            </AlertDialogCancel>

                            <AlertDialogAction asChild>
                                <button
                                    className={confirmVariant === "destructive" ? S.confirmBtn : S.defaultConfirmBtn}
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    {confirmLabel}
                                </button>
                            </AlertDialogAction>
                        </div>
                    </AlertDialogFooter>
                </motion.div>
            </AlertDialogContent>
        </AlertDialog>
    );
}