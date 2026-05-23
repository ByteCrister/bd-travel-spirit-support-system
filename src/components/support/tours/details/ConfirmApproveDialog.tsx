// components/support/tours/ConfirmApproveDialog.tsx
"use client";

import { useTourApproval } from "@/store/tour-approval.store";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
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
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL_SUCCESS =
    "p-2.5 rounded-xl bg-[#00A63D]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

type ConfirmApproveDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: string;
    tourTitle: string;
};

export function ConfirmApproveDialog({ open, onOpenChange, tourId, tourTitle }: ConfirmApproveDialogProps) {
    const { approveTour, refreshCurrentPage, isProcessing } = useTourApproval();

    const confirm = async () => {
        onOpenChange(false);
        await approveTour(tourId);
        await refreshCurrentPage();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={`max-w-lg border-none p-0 overflow-hidden ${NEU_SURFACE} ${NEU_CARD}`}>
                <div className="p-6 space-y-5">
                    <AlertDialogHeader>
                        <div className="flex items-start gap-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${NEU_ICON_WELL_SUCCESS}`}
                            >
                                <CheckCircle2 className="w-6 h-6 text-[#00A63D]" />
                            </motion.div>
                            <div className="flex-1 pt-1">
                                <AlertDialogTitle className={`text-lg ${NEU_HEADING}`}>
                                    Approve Tour
                                </AlertDialogTitle>
                                <AlertDialogDescription className={`mt-1.5 ${NEU_MUTED}`}>
                                    Are you sure you want to approve{" "}
                                    <span className="font-semibold text-[#1E2938]">&quot;{tourTitle}&quot;</span>?
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    {/* Info note */}
                    <div className={`rounded-xl p-4 ${NEU_SURFACE_INSET}`}>
                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70 leading-relaxed">
                            <span className="font-bold text-[#006666]">Note —</span>{" "}
                            Once approved, this tour will be published and visible to all users on the platform.
                        </p>
                    </div>

                    <AlertDialogFooter className="flex flex-row gap-3 pt-1">
                        <AlertDialogCancel
                            disabled={isProcessing}
                            className={`flex-1 px-4 py-2.5 text-sm border-none ${NEU_BTN_GHOST} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirm}
                            disabled={isProcessing}
                            className={`flex-1 px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 border-none ${NEU_BTN_PRIMARY} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Approving…</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Approve Tour</span>
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}