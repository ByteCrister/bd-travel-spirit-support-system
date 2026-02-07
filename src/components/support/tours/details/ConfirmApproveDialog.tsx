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
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <div className="flex items-start gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"
                        >
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </motion.div>
                        <div className="flex-1">
                            <AlertDialogTitle className="text-xl font-bold text-gray-900">
                                Approve Tour
                            </AlertDialogTitle>
                            <AlertDialogDescription className="mt-2 text-gray-600">
                                Are you sure you want to approve{" "}
                                <span className="font-semibold text-gray-900">&quot;{tourTitle}&quot;</span>?
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="py-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Once approved, this tour will be published and visible to all users.
                        </p>
                    </div>
                </div>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        disabled={isProcessing}
                        className="px-4 py-2 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirm}
                        disabled={isProcessing}
                        className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Approving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve Tour
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}