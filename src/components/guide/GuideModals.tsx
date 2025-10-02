// components/guide/GuideModals.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FiAlertCircle, FiMessageSquare, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

type BaseProps = {
    open: boolean;
    onClose: () => void;
};

type RejectProps = BaseProps & {
    onSubmit: (reason: string) => void;
};

type CommentProps = BaseProps & {
    onSubmit: (comment: string) => void;
};

export function RejectReasonModal({ open, onClose, onSubmit }: RejectProps) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!value.trim()) {
            setError("Please provide a reason for rejection");
            return;
        }
        onSubmit(value.trim());
        setValue("");
        setError("");
        onClose();
    };

    const handleClose = () => {
        setValue("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-[540px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient and icon */}
                <DialogHeader className="relative bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 px-6 py-5 space-y-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5" />

                    <div className="relative flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg ring-4 ring-red-100">
                            <FiAlertCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Reject Application
                            </DialogTitle>
                            <DialogDescription className="mt-1.5 text-sm text-gray-600">
                                Provide a clear and constructive reason to help the applicant understand the decision.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="reject-reason"
                            className="text-sm font-semibold text-gray-900"
                        >
                            Reason for Rejection <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            id="reject-reason"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder="e.g., Incomplete documentation, missing required certifications..."
                            className={cn(
                                "min-h-[120px] resize-none",
                                error && "border-red-300 focus-visible:ring-red-500"
                            )}
                            aria-label="Rejection reason"
                            aria-invalid={!!error}
                            aria-describedby={error ? "error-message" : undefined}
                        />
                        {error && (
                            <p id="error-message" className="text-sm text-red-600 flex items-center gap-1.5">
                                <FiAlertCircle className="h-4 w-4" />
                                {error}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            {value.length}/500 characters
                        </p>
                    </div>

                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                        <p className="text-sm text-amber-900">
                            <strong className="font-semibold">Note:</strong> This message will be sent to the applicant. Please be professional and constructive.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex-row justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="min-w-[100px]"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={!value.trim()}
                        className="min-w-[100px] bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                    >
                        <FiX className="h-4 w-4 mr-2" />
                        Reject Application
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ReviewCommentModal({ open, onClose, onSubmit }: CommentProps) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!value.trim()) {
            setError("Please enter a comment");
            return;
        }
        onSubmit(value.trim());
        setValue("");
        setError("");
        onClose();
    };

    const handleClose = () => {
        setValue("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-[540px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient and icon */}
                <DialogHeader className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 space-y-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

                    <div className="relative flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg ring-4 ring-blue-100">
                            <FiMessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Add Review Comment
                            </DialogTitle>
                            <DialogDescription className="mt-1.5 text-sm text-gray-600">
                                Document your feedback and observations about this application.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="review-comment"
                            className="text-sm font-semibold text-gray-900"
                        >
                            Your Comment <span className="text-blue-500">*</span>
                        </label>
                        <Textarea
                            id="review-comment"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder="e.g., Strong qualifications but needs additional verification..."
                            className={cn(
                                "min-h-[120px] resize-none",
                                error && "border-red-300 focus-visible:ring-red-500"
                            )}
                            aria-label="Review comment"
                            aria-invalid={!!error}
                            aria-describedby={error ? "error-message" : undefined}
                        />
                        {error && (
                            <p id="error-message" className="text-sm text-red-600 flex items-center gap-1.5">
                                <FiAlertCircle className="h-4 w-4" />
                                {error}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            {value.length}/500 characters
                        </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                        <p className="text-sm text-blue-900">
                            <strong className="font-semibold">Tip:</strong> Internal comments are only visible to reviewers and administrators.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex-row justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="min-w-[100px]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!value.trim()}
                        className="min-w-[100px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                        <FiMessageSquare className="h-4 w-4 mr-2" />
                        Save Comment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}