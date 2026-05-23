// components/support/tours/UnsuspendDialog.tsx
"use client";

import { useTourApproval } from "@/store/tour-approval.store";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Play, Loader2, CheckCircle, Info } from "lucide-react";
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
    "rounded-2xl bg-[#E7E5E4] shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-white/60";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_INPUT =
    "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 resize-none";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_ICON_WELL_SUCCESS =
    "p-2.5 rounded-xl bg-[#00A63D]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

type UnsuspendDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: string;
    tourTitle: string;
};

export function UnsuspendDialog({ open, onOpenChange, tourId, tourTitle }: UnsuspendDialogProps) {
    const { unsuspendTour, refreshCurrentPage, isProcessing } = useTourApproval();
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const confirm = async () => {
        if (!reason.trim()) {
            setError("Unsuspension reason is required.");
            return;
        }
        setError("");
        onOpenChange(false);
        await unsuspendTour(tourId, reason.trim());
        await refreshCurrentPage();
        resetForm();
    };

    const resetForm = () => {
        setReason("");
        setError("");
    };

    const handleCancel = () => {
        resetForm();
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
                                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${NEU_ICON_WELL_SUCCESS}`}
                            >
                                <Play className="w-6 h-6 text-[#00A63D]" />
                            </motion.div>
                            <div className="flex-1 pt-1">
                                <AlertDialogTitle className={`text-lg ${NEU_HEADING}`}>
                                    Unsuspend Tour
                                </AlertDialogTitle>
                                <AlertDialogDescription className={`mt-1.5 ${NEU_MUTED}`}>
                                    Reactivate{" "}
                                    <span className="font-semibold text-[#1E2938]">&quot;{tourTitle}&quot;</span>.
                                    This will make the tour available for bookings again.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label htmlFor="unsuspension-reason" className={NEU_LABEL}>
                            Unsuspension Reason <span className="text-[#FF2157]">*</span>
                        </label>
                        <textarea
                            id="unsuspension-reason"
                            rows={4}
                            className={`${NEU_INPUT} min-h-[100px] px-4 py-3`}
                            placeholder="Please provide a reason for reactivating the tour…"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError("");
                            }}
                            disabled={isProcessing}
                        />
                        <div className="flex items-start gap-1.5">
                            <Info className="w-3 h-3 text-[#1E2938]/40 mt-0.5 flex-shrink-0" />
                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                                This helps maintain a record of why the tour was reactivated.
                            </p>
                        </div>
                    </div>

                    {/* Confirmation checklist */}
                    <div className={`rounded-xl p-4 ${NEU_SURFACE_INSET}`}>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-[#FE9900] mt-0.5 flex-shrink-0" />
                            <div className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60 space-y-1">
                                <p className="font-bold text-[#1E2938]/80">Please confirm the following:</p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    <li>The issues that led to suspension have been resolved</li>
                                    <li>The tour complies with all platform policies</li>
                                    <li>All content is up-to-date and accurate</li>
                                    <li>The tour is ready to be visible to the public</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className={`rounded-xl p-4 ${NEU_SURFACE_INSET}`}>
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-[#006666] mt-0.5 flex-shrink-0" />
                            <div className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60 space-y-1">
                                <p className="font-bold text-[#1E2938]/80">What happens when a tour is unsuspended?</p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    <li>The tour will be visible in public listings again</li>
                                    <li>New bookings can be made immediately</li>
                                    <li>Moderation status will change to &quot;Approved&quot;</li>
                                    <li>The tour author will be notified</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FF2157]/5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]"
                            >
                                <AlertCircle className="w-4 h-4 text-[#FF2157] flex-shrink-0" />
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#FF2157]">{error}</p>
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
                            className={`flex-1 px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 border-none ${NEU_BTN_PRIMARY} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Unsuspending…</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    <span>Unsuspend Tour</span>
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}