// components/support/tours/UnsuspendDialog.tsx
"use client";

import { useTourApproval } from "@/store/tour-approval.store";
import React, { useState } from "react";
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
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <div className="flex items-start gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"
                        >
                            <Play className="w-6 h-6 text-green-600" />
                        </motion.div>
                        <div className="flex-1">
                            <AlertDialogTitle className="text-xl font-bold text-gray-900">
                                Unsuspend Tour
                            </AlertDialogTitle>
                            <AlertDialogDescription className="mt-2 text-gray-600">
                                Reactivate the suspended tour{" "}
                                <span className="font-semibold text-gray-900">&quot;{tourTitle}&quot;</span>.
                                This will make the tour available for bookings again.
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="space-y-6 py-4">
                    {/* Reason Input */}
                    <div className="space-y-2">
                        <label htmlFor="unsuspension-reason" className="text-sm font-semibold text-gray-700">
                            Unsuspension Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="unsuspension-reason"
                            className="w-full min-h-[120px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
                            placeholder="Please provide a reason for reactivating the tour..."
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
                                This helps maintain a record of why the tour was reactivated.
                            </p>
                        </div>
                    </div>

                    {/* Confirmation Section */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-amber-700">
                                <p className="font-medium mb-1">Please confirm the following:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>The issues that led to suspension have been resolved</li>
                                    <li>The tour complies with all platform policies</li>
                                    <li>All content is up-to-date and accurate</li>
                                    <li>The tour is ready to be visible to the public</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-green-700">
                                <p className="font-medium mb-1">What happens when a tour is unsuspended?</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>The tour will be visible in public listings again</li>
                                    <li>New bookings can be made immediately</li>
                                    <li>Moderation status will change to &quot;Approved&quot;</li>
                                    <li>The tour author will be notified</li>
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
                        className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Unsuspending...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Unsuspend Tour
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}