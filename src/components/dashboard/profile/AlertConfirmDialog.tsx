"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX, FiCheck, FiInfo } from "react-icons/fi";
import { Spinner } from "@/components/ui/spinner";

// ── Neumorphism tokens ────────────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";

interface AlertConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "destructive" | "warning" | "info" | "success";
    icon?: React.ReactNode;
}

const variantConfig = {
    destructive: {
        iconWell: "bg-[#FF2157]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
        iconColor: "text-[#FF2157]",
        confirmBtn:
            "rounded-xl bg-[#FF2157] text-white font-[family-name:var(--font-space-mono)] font-bold " +
            "shadow-[4px_4px_8px_rgba(255,33,87,0.4),-2px_-2px_6px_rgba(255,100,130,0.3)] " +
            "hover:bg-[#e01e50] hover:shadow-[6px_6px_12px_rgba(255,33,87,0.5)] " +
            "active:shadow-[inset_3px_3px_6px_rgba(180,0,40,0.5)] " +
            "transition-all duration-200 disabled:opacity-50",
        accentBorder: "border-l-4 border-[#FF2157]",
    },
    warning: {
        iconWell: "bg-[#FE9900]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
        iconColor: "text-[#FE9900]",
        confirmBtn:
            "rounded-xl bg-[#FE9900] text-white font-[family-name:var(--font-space-mono)] font-bold " +
            "shadow-[4px_4px_8px_rgba(254,153,0,0.4),-2px_-2px_6px_rgba(255,190,80,0.3)] " +
            "hover:bg-[#e08800] hover:shadow-[6px_6px_12px_rgba(254,153,0,0.5)] " +
            "active:shadow-[inset_3px_3px_6px_rgba(180,110,0,0.5)] " +
            "transition-all duration-200 disabled:opacity-50",
        accentBorder: "border-l-4 border-[#FE9900]",
    },
    info: {
        iconWell: "bg-[#006666]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
        iconColor: "text-[#006666]",
        confirmBtn: NEU_BTN_PRIMARY + " disabled:opacity-50",
        accentBorder: "border-l-4 border-[#006666]",
    },
    success: {
        iconWell: "bg-[#00A63D]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
        iconColor: "text-[#00A63D]",
        confirmBtn:
            "rounded-xl bg-[#00A63D] text-white font-[family-name:var(--font-space-mono)] font-bold " +
            "shadow-[4px_4px_8px_rgba(0,166,61,0.4),-2px_-2px_6px_rgba(0,210,80,0.3)] " +
            "hover:bg-[#009935] hover:shadow-[6px_6px_12px_rgba(0,166,61,0.5)] " +
            "active:shadow-[inset_3px_3px_6px_rgba(0,100,30,0.5)] " +
            "transition-all duration-200 disabled:opacity-50",
        accentBorder: "border-l-4 border-[#00A63D]",
    },
};

const defaultIcons = {
    destructive: <FiAlertTriangle className="h-5 w-5" />,
    warning: <FiAlertTriangle className="h-5 w-5" />,
    info: <FiInfo className="h-5 w-5" />,
    success: <FiCheck className="h-5 w-5" />,
};

export function AlertConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "destructive",
    icon,
}: AlertConfirmDialogProps) {
    const config = variantConfig[variant];
    const IconComponent = icon || defaultIcons[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#1E2938]/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 12 }}
                        transition={{
                            duration: 0.22,
                            ease: "easeOut",
                            scale: { type: "spring", stiffness: 320, damping: 26 },
                        }}
                        className={`relative w-full max-w-md ${NEU_CARD} overflow-hidden`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Accent bar */}
                        <div className={`${config.accentBorder} absolute left-0 top-0 bottom-0 pointer-events-none`} />

                        {/* Header */}
                        <div className="relative p-6 pr-14">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                aria-label="Close"
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl ${NEU_SURFACE_INSET_SM} text-[#1E2938]/50 hover:text-[#1E2938] disabled:opacity-40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40`}
                            >
                                <FiX className="h-4 w-4" />
                            </button>

                            <div className="flex items-start gap-4">
                                {/* Icon well */}
                                <div className={`p-3 rounded-xl ${config.iconWell} ${config.iconColor} shrink-0`}>
                                    {IconComponent}
                                </div>
                                <div className="pt-0.5">
                                    <h3 className={`text-lg ${NEU_HEADING}`}>{title}</h3>
                                    {description && (
                                        <p className={`mt-1.5 ${NEU_MUTED}`}>{description}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={`mx-6 border-t ${NEU_DIVIDER}`} />

                        {/* Footer */}
                        <div className="p-6 space-y-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className={`flex-1 h-11 px-4 text-sm ${NEU_BTN_GHOST} disabled:opacity-50`}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 h-11 px-4 text-sm ${config.confirmBtn}`}
                                >
                                    {isLoading ? (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center justify-center gap-2"
                                        >
                                            <Spinner className="size-4 text-white" />
                                            Processing...
                                        </motion.span>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>

                            <p className={`text-center text-xs ${NEU_MUTED}`}>
                                This action cannot be undone.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}