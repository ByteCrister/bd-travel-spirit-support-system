"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle, XCircle, Loader2, ShieldAlert } from "lucide-react";

// ─── Neumorphism Style Tokens ────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";

const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";
const NEU_BTN_DANGER =
    "rounded-xl bg-[#FF2157] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[4px_4px_8px_rgba(255,33,87,0.4),-2px_-2px_6px_rgba(255,100,130,0.3)] " +
    "hover:bg-[#e0103f] hover:shadow-[6px_6px_12px_rgba(255,33,87,0.5),-3px_-3px_8px_rgba(255,100,130,0.3)] " +
    "active:shadow-[inset_3px_3px_6px_rgba(180,0,30,0.4),inset_-2px_-2px_4px_rgba(255,100,130,0.2)] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";
const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#FF2157]/40 transition-all duration-200 resize-none";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_ICON_WELL_DANGER =
    "p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
// ────────────────────────────────────────────────────────────

interface DenyDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onConfirm: (reason: string) => Promise<void>;
}

export default function DenyDialog({ open, onOpenChange, onConfirm }: DenyDialogProps) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        if (!reason.trim()) {
            setError("Please provide a reason for denial");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await onConfirm(reason);
            setReason("");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Failed to deny request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!submitting) {
            setReason("");
            setError(null);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className={`sm:max-w-lg ${NEU_SURFACE} border border-white/60 shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff] rounded-2xl p-0 overflow-hidden`}>

                <AnimatePresence mode="wait">
                    {submitting ? (
                        /* ── Loading state ─────────────────────────────── */
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20 gap-4 px-8"
                        >
                            <div className={`${NEU_ICON_WELL_DANGER} p-4`}>
                                <Loader2 className="w-8 h-8 text-[#FF2157] animate-spin" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className={`${NEU_HEADING} text-base`}>Processing denial…</p>
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50">
                                    Notifying the requester
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        /* ── Form state ────────────────────────────────── */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="p-6 space-y-5"
                        >
                            {/* Header */}
                            <DialogHeader>
                                <div className="flex items-start gap-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.4 }}
                                        className={NEU_ICON_WELL_DANGER}
                                    >
                                        <XCircle className="w-6 h-6 text-[#FF2157]" />
                                    </motion.div>
                                    <div className="flex-1 space-y-1 pt-0.5">
                                        <DialogTitle className={`text-xl ${NEU_HEADING}`}>
                                            Deny Request
                                        </DialogTitle>
                                        <DialogDescription className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50">
                                            The requester will be notified via email with your reason
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Warning banner */}
                            <motion.div
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.08 }}
                                className={`${NEU_SURFACE_INSET} rounded-xl flex items-start gap-3 p-4`}
                            >
                                <ShieldAlert className="w-4 h-4 text-[#FE9900] flex-shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#FE9900] uppercase tracking-wide">
                                        Important
                                    </p>
                                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60 leading-relaxed">
                                        Please be clear and professional — this message is sent directly to the requester.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Reason textarea */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 }}
                                className="space-y-2"
                            >
                                <label className={`${NEU_LABEL} flex items-center gap-1.5`}>
                                    Reason for denial
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FF2157] text-white text-[10px] font-bold">
                                        *
                                    </span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="reason"
                                        placeholder="E.g., Request does not meet security verification requirements…"
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value);
                                            setError(null);
                                        }}
                                        rows={5}
                                        maxLength={500}
                                        className={`${NEU_INPUT} w-full p-3`}
                                    />
                                    <span className="absolute bottom-3 right-3 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[#1E2938]/30">
                                        {reason.length} / 500
                                    </span>
                                </div>
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    This message will be sent directly to the requester
                                </p>
                            </motion.div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`${NEU_SURFACE_INSET} rounded-xl flex items-center gap-3 p-3 border border-[#FF2157]/20`}>
                                            <AlertCircle className="w-4 h-4 text-[#FF2157] flex-shrink-0" />
                                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#FF2157]">
                                                {error}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-1">
                                <button
                                    onClick={handleCancel}
                                    disabled={submitting}
                                    className={`${NEU_BTN_GHOST} px-5 py-2.5 text-sm`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submit}
                                    disabled={!reason.trim() || submitting}
                                    className={`${NEU_BTN_DANGER} flex items-center gap-2 px-5 py-2.5 text-sm`}
                                >
                                    <XCircle className="w-4 h-4" />
                                    Deny Request
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}