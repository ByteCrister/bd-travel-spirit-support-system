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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
        if (!validateInput()) {
            return;
        }

        setError("");
        onOpenChange(false);

        // Convert to indefinite suspension (0 days) or temporary suspension with duration
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
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <div className="flex items-start gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"
                        >
                            <Pause className="w-6 h-6 text-amber-600" />
                        </motion.div>
                        <div className="flex-1">
                            <AlertDialogTitle className="text-xl font-bold text-gray-900">
                                Suspend Tour
                            </AlertDialogTitle>
                            <AlertDialogDescription className="mt-2 text-gray-600">
                                Temporarily suspend the tour{" "}
                                <span className="font-semibold text-gray-900">&quot;{tourTitle}&quot;</span>.
                                This will prevent bookings while the tour is under review.
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="space-y-6 py-4">
                    {/* Suspension Type */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">
                            Suspension Type <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                            value={suspensionType}
                            onValueChange={(value: "temporary" | "indefinite") => setSuspensionType(value as "temporary" | "indefinite")}
                            className="grid grid-cols-2 gap-3"
                        >
                            <div className="relative">
                                <RadioGroupItem
                                    value="temporary"
                                    id="temporary"
                                    className="peer sr-only"
                                    disabled={isProcessing}
                                />
                                <Label
                                    htmlFor="temporary"
                                    className="flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-amber-50 hover:border-amber-300 peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50 cursor-pointer transition-all"
                                >
                                    <Calendar className="w-5 h-5 text-amber-600 mb-2" />
                                    <span className="font-medium">Temporary</span>
                                    <span className="text-xs text-gray-500 text-center mt-1">
                                        Suspend for a specific period
                                    </span>
                                </Label>
                            </div>
                            <div className="relative">
                                <RadioGroupItem
                                    value="indefinite"
                                    id="indefinite"
                                    className="peer sr-only"
                                    disabled={isProcessing}
                                />
                                <Label
                                    htmlFor="indefinite"
                                    className="flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-amber-50 hover:border-amber-300 peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50 cursor-pointer transition-all"
                                >
                                    <AlertCircle className="w-5 h-5 text-amber-600 mb-2" />
                                    <span className="font-medium">Indefinite</span>
                                    <span className="text-xs text-gray-500 text-center mt-1">
                                        Suspend until further notice
                                    </span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Duration Input (only for temporary suspension) */}
                    {suspensionType === "temporary" && (
                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
                                Suspension Duration (Days) <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={durationDays}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value)) {
                                            setDurationDays(value);
                                        }
                                        if (error) setError("");
                                    }}
                                    disabled={isProcessing}
                                    className="w-32"
                                />
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500">
                                        The tour will be suspended for {durationDays} day{durationDays !== 1 ? 's' : ''}.
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Range: 1 to 365 days
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reason Input */}
                    <div className="space-y-2">
                        <Label htmlFor="suspension-reason" className="text-sm font-semibold text-gray-700">
                            Suspension Reason <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                            id="suspension-reason"
                            className="w-full min-h-[120px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
                            placeholder="Please provide a detailed reason for suspension..."
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError("");
                            }}
                            disabled={isProcessing}
                        />
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <p>
                                This reason will be visible to the tour author and will help them understand what needs to be addressed.
                            </p>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-1">What happens when a tour is suspended?</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>The tour will be hidden from public listings</li>
                                    <li>No new bookings can be made</li>
                                    <li>Existing bookings remain unaffected</li>
                                    <li>Tour author can submit for re-approval after addressing issues</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                            >
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        onClick={handleCancel}
                        disabled={isProcessing}
                        className="px-4 py-2 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirm}
                        disabled={isProcessing || !reason.trim()}
                        className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Suspending...
                            </>
                        ) : (
                            <>
                                <Pause className="w-4 h-4 mr-2" />
                                {suspensionType === "indefinite" ? "Suspend Indefinitely" : `Suspend for ${durationDays} Days`}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}