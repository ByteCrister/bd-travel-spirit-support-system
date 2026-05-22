"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_DANGER =
    "rounded-xl bg-[#FF2157] text-white font-[family-name:var(--font-space-mono)] font-bold " +
    "shadow-[4px_4px_8px_#c8190f,-2px_-2px_6px_#ff6b87] " +
    "hover:bg-[#e01a4a] hover:shadow-[6px_6px_12px_#c8190f,-3px_-3px_8px_#ff6b87] " +
    "active:shadow-[inset_3px_3px_6px_#c8190f,inset_-2px_-2px_4px_#ff6b87] " +
    "transition-all duration-200";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL = "p-3 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

interface ConfirmDialogProps {
    title: string;
    description?: string;
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
    open: boolean;
    variant?: "danger" | "warning" | "success" | "info";
}

const VARIANT_CONFIG = {
    danger: { icon: XCircle, iconColor: "text-[#FF2157]", confirmBtn: NEU_BTN_DANGER },
    warning: { icon: AlertTriangle, iconColor: "text-[#FE9900]", confirmBtn: NEU_BTN_PRIMARY },
    success: { icon: CheckCircle, iconColor: "text-[#00A63D]", confirmBtn: NEU_BTN_PRIMARY },
    info: { icon: AlertCircle, iconColor: "text-[#006666]", confirmBtn: NEU_BTN_PRIMARY },
} as const;

export default function ConfirmDialog({
    title,
    description,
    onConfirm,
    onCancel,
    open,
    variant = "warning",
}: ConfirmDialogProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm();
        } finally {
            setIsConfirming(false);
        }
    };

    const { icon: Icon, iconColor, confirmBtn } = VARIANT_CONFIG[variant];

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onCancel() : undefined)}>
            <AnimatePresence>
                {open && (
                    <DialogContent
                        aria-describedby="confirm-desc"
                        className={`sm:max-w-md overflow-hidden border-0 p-0 ${NEU_SURFACE} shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff]`}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                            className="p-8"
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <motion.div
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.05 }}
                                    className={NEU_ICON_WELL}
                                >
                                    <Icon className={`w-9 h-9 ${iconColor}`} />
                                </motion.div>
                            </div>

                            <DialogHeader className="space-y-2 text-center mb-6">
                                <DialogTitle className={`text-xl ${NEU_HEADING}`}>{title}</DialogTitle>
                                {description && (
                                    <DialogDescription id="confirm-desc" className={NEU_MUTED}>
                                        {description}
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onCancel}
                                    disabled={isConfirming}
                                    className={`${NEU_BTN_GHOST} px-6 py-2.5 text-sm min-w-[100px] disabled:opacity-50`}
                                >
                                    Cancel
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => void handleConfirm()}
                                    disabled={isConfirming}
                                    className={`${confirmBtn} px-6 py-2.5 text-sm min-w-[100px] disabled:opacity-70 flex items-center justify-center gap-2`}
                                >
                                    {isConfirming ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                        />
                                    ) : (
                                        "Confirm"
                                    )}
                                </motion.button>
                            </DialogFooter>
                        </motion.div>
                    </DialogContent>
                )}
            </AnimatePresence>
        </Dialog>
    );
}