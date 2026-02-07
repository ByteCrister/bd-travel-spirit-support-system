// components/support/tours/RejectDialog.tsx
"use client";

import { useTourApproval } from "@/store/tour-approval.store";
import React, { useState } from "react";
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
        setReason(""); // Reset after successful rejection
    };

    const handleCancel = () => {
        setReason("");
        setError("");
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
                            className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"
                        >
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </motion.div>
                        <div className="flex-1">
                            <AlertDialogTitle className="text-xl font-bold text-gray-900">
                                Reject Tour
                            </AlertDialogTitle>
                            <AlertDialogDescription className="mt-2 text-gray-600">
                                Provide a reason for rejecting{" "}
                                <span className="font-semibold text-gray-900">&quot;{tourTitle}&quot;</span>.
                                This will be visible to the author.
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="rejection-reason" className="text-sm font-semibold text-gray-700">
                            Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="rejection-reason"
                            className="w-full min-h-[120px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all resize-none"
                            placeholder="Please provide a detailed reason for rejection..."
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError("");
                            }}
                            disabled={isProcessing}
                        />
                        <p className="text-xs text-gray-500">
                            Be specific and constructive to help the author improve their tour.
                        </p>
                    </div>

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
                        className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Rejecting...
                            </>
                        ) : (
                            <>
                                <X className="w-4 h-4 mr-2" />
                                Reject Tour
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}