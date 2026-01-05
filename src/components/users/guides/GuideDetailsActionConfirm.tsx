"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiPause, FiAlertCircle, FiLoader } from "react-icons/fi";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ActionType = "approve" | "reject" | "suspend" | "unsuspend";

const actionConfig = {
    approve: {
        title: "Approve Guide",
        description: "This guide will be marked as approved and will be visible to users.",
        icon: FiCheckCircle,
        iconColor: "text-emerald-500",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        confirmColor: "bg-emerald-600 hover:bg-emerald-700",
        buttonText: "Approve Guide",
    },
    reject: {
        title: "Reject Guide",
        description: "This guide will be rejected and the applicant will be notified.",
        icon: FiXCircle,
        iconColor: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        confirmColor: "bg-red-600 hover:bg-red-700",
        buttonText: "Reject Guide",
    },
    suspend: {
        title: "Suspend Guide",
        description: "This guide will be temporarily suspended until the specified date.",
        icon: FiPause,
        iconColor: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        confirmColor: "bg-orange-600 hover:bg-orange-700",
        buttonText: "Suspend Guide",
    },
    unsuspend: {
        title: "Unsuspend Guide",
        description: "This guide will be reactivated and made available again.",
        icon: FiCheckCircle,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        confirmColor: "bg-blue-600 hover:bg-blue-700",
        buttonText: "Unsuspend Guide",
    },
};

function GuideDetailsActionConfirm({
    open,
    onOpenChange,
    action,
    onConfirm,
    isLoading,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: ActionType;
    onConfirm: (payload?: { reason?: string; until?: Date }) => void;
    isLoading: boolean;
}) {
    const [reason, setReason] = useState("");
    const [until, setUntil] = useState("");
    const [isValid, setIsValid] = useState(false);

    const config = actionConfig[action];
    const requireReason = action === "reject" || action === "suspend" || action === "unsuspend";
    const requireDate = action === "suspend";

    useEffect(() => {
        if (requireReason && requireDate) {
            setIsValid(reason.trim().length > 0 && !!until);
        } else if (requireReason) {
            setIsValid(reason.trim().length > 0);
        } else {
            setIsValid(true);
        }
    }, [reason, until, requireReason, requireDate]);

    useEffect(() => {
        if (!open) {
            setReason("");
            setUntil("");
        }
    }, [open]);

    const handleConfirm = () => {
        if (!isValid || isLoading) return;

        const payload: { reason?: string; until?: Date } = {};
        if (requireReason) payload.reason = reason.trim();
        if (requireDate) payload.until = new Date(until);

        onConfirm(payload);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className={cn("p-3 rounded-full border-2", config.bgColor, config.borderColor)}>
                            <config.icon className={cn("h-6 w-6", config.iconColor)} />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-xl font-bold text-gray-900 mb-1">
                                {config.title}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600">
                                {config.description}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="space-y-4 mt-6">
                        {requireDate && (
                            <div className="space-y-2">
                                <label htmlFor="suspend-until" className="block text-sm font-medium text-gray-700">
                                    Suspend Until <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="suspend-until"
                                    type="date"
                                    value={until}
                                    onChange={(e) => setUntil(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full rounded-lg border-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300",
                                        !until && requireDate ? "border-red-300" : "border-gray-300"
                                    )}
                                />
                                {!until && requireDate && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <FiAlertCircle className="h-3 w-3" />
                                        Please select a date
                                    </p>
                                )}
                            </div>
                        )}

                        {requireReason && (
                            <div className="space-y-2">
                                <label htmlFor="action-reason" className="block text-sm font-medium text-gray-700">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    id="action-reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={`Provide a reason for ${action}ing this guide...`}
                                    className={cn(
                                        "min-h-[100px] resize-none border-2",
                                        reason.trim().length === 0 && requireReason ? "border-red-300" : "border-gray-300"
                                    )}
                                    disabled={isLoading}
                                />
                                {reason.trim().length === 0 && requireReason && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <FiAlertCircle className="h-3 w-3" />
                                        Please provide a reason
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="flex-1 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!isValid || isLoading}
                            className={cn("flex-1 text-white font-semibold", config.confirmColor)}
                        >
                            {isLoading ? (
                                <>
                                    <FiLoader className="h-4 w-4 animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <config.icon className="h-4 w-4 mr-2" />
                                    {config.buttonText}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default GuideDetailsActionConfirm;