// components/support/tours/RejectDialog.tsx
"use client";

import { useTourApproval } from "@/store/tour-approval.store";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Loader2, AlertTriangle } from "lucide-react";
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

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200";
const NEU_BTN_DANGER =
    "rounded-xl bg-[#FF2157] text-white font-[family-name:var(--font-space-mono)] font-bold " +
    "shadow-[4px_4px_8px_#c8c6c5,-2px_-2px_6px_#ff4d75] " +
    "hover:shadow-[6px_6px_12px_#c8c6c5,-3px_-3px_8px_#ff4d75] hover:bg-[#e01a4a] " +
    "active:shadow-[inset_3px_3px_6px_#cc0033,inset_-2px_-2px_4px_#ff4d75] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50";
const NEU_INPUT =
    "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#FF2157]/40 transition-all duration-200 resize-none";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_ICON_WELL_DANGER =
    "p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

type RejectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: string;
    tourTitle: string;
};

export function RejectDialog({ open, onOpenChange, tourId, tourTitle }: RejectDialogProps) {
    const { rejectTour, refreshCurrentPage, isProcessing } = useTourApproval();
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const confirm = async () => {
        if (!reason.trim()) {
            setError("Rejection reason is required.");
            return;
        }
        setError("");
        onOpenChange(false);
        await rejectTour(tourId, reason.trim());
        await refreshCurrentPage();
        setReason("");
    };

    const handleCancel = () => {
        setReason("");
        setError("");
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={`max-w-2xl border-none p-0 overflow-hidden ${NEU_SURFACE} ${NEU_CARD}`}>
                <div className="p-6 space-y-5">
                    <AlertDialogHeader>
                        <div className="flex items-start gap-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${NEU_ICON_WELL_DANGER}`}
                            >
                                <AlertTriangle className="w-6 h-6 text-[#FF2157]" />
                            </motion.div>
                            <div className="flex-1 pt-1">
                                <AlertDialogTitle className={`text-lg ${NEU_HEADING}`}>
                                    Reject Tour
                                </AlertDialogTitle>
                                <AlertDialogDescription className={`mt-1.5 ${NEU_MUTED}`}>
                                    Provide a reason for rejecting{" "}
                                    <span className="font-semibold text-[#1E2938]">&quot;{tourTitle}&quot;</span>.
                                    This will be visible to the author.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    {/* Rejection reason */}
                    <div className="space-y-2">
                        <label htmlFor="rejection-reason" className={NEU_LABEL}>
                            Rejection Reason <span className="text-[#FF2157]">*</span>
                        </label>
                        <textarea
                            id="rejection-reason"
                            rows={4}
                            className={`${NEU_INPUT} min-h-[110px] px-4 py-3`}
                            placeholder="Please provide a detailed reason for rejection…"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError("");
                            }}
                            disabled={isProcessing}
                        />
                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40 pl-1">
                            Be specific and constructive to help the author improve their tour.
                        </p>
                    </div>

                    {/* Char / validation hint */}
                    <div className={`rounded-xl p-3 ${NEU_SURFACE_INSET}`}>
                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60 leading-relaxed">
                            <span className="font-bold text-[#FF2157]">Important —</span>{" "}
                            This rejection reason will be sent to the tour author so they can address the issues.
                        </p>
                    </div>

                    {/* Inline error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FF2157]/5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]"
                            >
                                <AlertCircle className="w-4 h-4 text-[#FF2157] flex-shrink-0" />
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#FF2157]">
                                    {error}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AlertDialogFooter className="flex flex-row gap-3 pt-1">
                        <AlertDialogCancel
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className={`flex-1 px-4 py-2.5 text-sm border-none ${NEU_BTN_GHOST} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirm}
                            disabled={isProcessing || !reason.trim()}
                            className={`flex-1 px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 border-none ${NEU_BTN_DANGER} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Rejecting…</span>
                                </>
                            ) : (
                                <>
                                    <X className="w-4 h-4" />
                                    <span>Reject Tour</span>
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}