// components/support/tours/SuspendDialog.tsx
"use client";

import { useTourApproval } from "@/store/tour-approval.store";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Pause, Loader2, Calendar, Info } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
const NEU_BTN_WARNING =
    "rounded-xl bg-[#FE9900] text-white font-[family-name:var(--font-space-mono)] font-bold " +
    "shadow-[4px_4px_8px_#c8c6c5,-2px_-2px_6px_#ffb84d] " +
    "hover:shadow-[6px_6px_12px_#c8c6c5,-3px_-3px_8px_#ffb84d] hover:bg-[#e68a00] " +
    "active:shadow-[inset_3px_3px_6px_#cc7700,inset_-2px_-2px_4px_#ffb84d] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE9900]/50";
const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#FE9900]/40 transition-all duration-200";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_RAISED =
    "bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_ICON_WELL_WARNING =
    "p-2.5 rounded-xl bg-[#FE9900]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

type SuspendDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: string;
    tourTitle: string;
};

export function SuspendDialog({ open, onOpenChange, tourId, tourTitle }: SuspendDialogProps) {
    const { suspendTour, refreshCurrentPage, isProcessing } = useTourApproval();
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [suspensionType, setSuspensionType] = useState<"temporary" | "indefinite">("temporary");
    const [durationDays, setDurationDays] = useState<number>(7);

    const validateInput = () => {
        if (!reason.trim()) {
            setError("Suspension reason is required.");
            return false;
        }
        if (suspensionType === "temporary" && (!durationDays || durationDays < 1)) {
            setError("Please enter a valid duration (minimum 1 day).");
            return false;
        }
        if (suspensionType === "temporary" && durationDays > 365) {
            setError("Duration cannot exceed 365 days.");
            return false;
        }
        return true;
    };

    const confirm = async () => {
        if (!validateInput()) return;
        setError("");
        onOpenChange(false);
        const suspensionDuration = suspensionType === "indefinite" ? 0 : durationDays;
        await suspendTour(tourId, reason.trim(), suspensionDuration);
        await refreshCurrentPage();
        resetForm();
    };

    const resetForm = () => {
        setReason("");
        setError("");
        setSuspensionType("temporary");
        setDurationDays(7);
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
                                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${NEU_ICON_WELL_WARNING}`}
                            >
                                <Pause className="w-6 h-6 text-[#FE9900]" />
                            </motion.div>
                            <div className="flex-1 pt-1">
                                <AlertDialogTitle className={`text-lg ${NEU_HEADING}`}>
                                    Suspend Tour
                                </AlertDialogTitle>
                                <AlertDialogDescription className={`mt-1.5 ${NEU_MUTED}`}>
                                    Temporarily suspend{" "}
                                    <span className="font-semibold text-[#1E2938]">&quot;{tourTitle}&quot;</span>.
                                    This will prevent new bookings while under review.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    {/* Suspension type */}
                    <div className="space-y-2">
                        <span className={NEU_LABEL}>Suspension Type <span className="text-[#FF2157]">*</span></span>
                        <RadioGroup
                            value={suspensionType}
                            onValueChange={(v: "temporary" | "indefinite") => setSuspensionType(v)}
                            className="grid grid-cols-2 gap-3 mt-2"
                        >
                            {/* Temporary */}
                            <div className="relative">
                                <RadioGroupItem value="temporary" id="temporary" className="peer sr-only" disabled={isProcessing} />
                                <Label
                                    htmlFor="temporary"
                                    className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl cursor-pointer transition-all duration-200
                                        ${NEU_SURFACE_RAISED}
                                        peer-data-[state=checked]:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff]
                                        peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-[#FE9900]/50`}
                                >
                                    <Calendar className="w-5 h-5 text-[#FE9900]" />
                                    <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">Temporary</span>
                                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 text-center">
                                        Suspend for a set period
                                    </span>
                                </Label>
                            </div>

                            {/* Indefinite */}
                            <div className="relative">
                                <RadioGroupItem value="indefinite" id="indefinite" className="peer sr-only" disabled={isProcessing} />
                                <Label
                                    htmlFor="indefinite"
                                    className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl cursor-pointer transition-all duration-200
                                        ${NEU_SURFACE_RAISED}
                                        peer-data-[state=checked]:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff]
                                        peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-[#FE9900]/50`}
                                >
                                    <AlertCircle className="w-5 h-5 text-[#FE9900]" />
                                    <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">Indefinite</span>
                                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 text-center">
                                        Suspend until further notice
                                    </span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Duration (temporary only) */}
                    <AnimatePresence>
                        {suspensionType === "temporary" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden space-y-2"
                            >
                                <label htmlFor="duration" className={NEU_LABEL}>
                                    Duration (Days) <span className="text-[#FF2157]">*</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="duration"
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={durationDays}
                                        onChange={(e) => {
                                            const v = parseInt(e.target.value);
                                            if (!isNaN(v)) setDurationDays(v);
                                            if (error) setError("");
                                        }}
                                        disabled={isProcessing}
                                        className={`${NEU_INPUT} w-28 px-4 py-2.5 text-center`}
                                    />
                                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                                        day{durationDays !== 1 ? "s" : ""} &nbsp;·&nbsp; max 365
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label htmlFor="suspension-reason" className={NEU_LABEL}>
                            Suspension Reason <span className="text-[#FF2157]">*</span>
                        </label>
                        <textarea
                            id="suspension-reason"
                            rows={4}
                            className={`${NEU_INPUT} w-full min-h-[100px] px-4 py-3 resize-none`}
                            placeholder="Please provide a detailed reason for suspension…"
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
                                This reason will be visible to the tour author.
                            </p>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className={`rounded-xl p-4 ${NEU_SURFACE_INSET}`}>
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-[#006666] mt-0.5 flex-shrink-0" />
                            <div className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60 space-y-1">
                                <p className="font-bold text-[#1E2938]/80">What happens when a tour is suspended?</p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    <li>The tour is hidden from public listings</li>
                                    <li>No new bookings can be made</li>
                                    <li>Existing bookings remain unaffected</li>
                                    <li>Author can re-submit after addressing issues</li>
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
                            className={`flex-1 px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 border-none ${NEU_BTN_WARNING} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Suspending…</span>
                                </>
                            ) : (
                                <>
                                    <Pause className="w-4 h-4" />
                                    <span>
                                        {suspensionType === "indefinite"
                                            ? "Suspend Indefinitely"
                                            : `Suspend for ${durationDays} Day${durationDays !== 1 ? "s" : ""}`}
                                    </span>
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}