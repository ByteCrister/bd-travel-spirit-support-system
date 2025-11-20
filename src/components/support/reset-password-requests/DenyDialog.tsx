"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, XCircle, Loader2, ShieldAlert } from "lucide-react";

interface DenyDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onConfirm: (reason: string) => Promise<void>;
}

export default function DenyDialog({ open, onOpenChange, onConfirm }: DenyDialogProps) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        if (!reason.trim()) {
            setError("Please provide a reason for denial");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await onConfirm(reason);
            setReason("");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Failed to deny request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!submitting) {
            setReason("");
            setError(null);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-lg bg-white dark:from-slate-900 dark:via-red-950/10 dark:to-rose-950/10 border-red-200 dark:border-red-900/50">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5 pointer-events-none rounded-lg" />

                <DialogHeader className="relative">
                    <div className="flex items-start gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative"
                        >
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/30">
                                <XCircle className="w-7 h-7 text-white" />
                            </div>
                            <div className="absolute inset-0 bg-red-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
                        </motion.div>
                        <div className="flex-1 space-y-1">
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                                Deny Request
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                                This action will notify the requester via email with your reason
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {submitting ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-16 gap-4"
                        >
                            <div className="relative">
                                <Loader2 className="w-12 h-12 animate-spin text-red-500" />
                                <div className="absolute inset-0 blur-xl bg-red-500/30 animate-pulse" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                    Processing denial...
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Notifying the requester
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6 py-4 relative"
                        >
                            {/* Warning Banner */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl"
                            >
                                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                        Important Notice
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                        The requester will receive an email notification with your denial reason. Please be clear and professional.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-3"
                            >
                                <Label htmlFor="reason" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    Reason for denial
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                                        *
                                    </span>
                                </Label>
                                <div className="relative">
                                    <Textarea
                                        id="reason"
                                        placeholder="E.g., Request does not meet security verification requirements..."
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value);
                                            setError(null);
                                        }}
                                        rows={5}
                                        className="resize-none bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-red-400 dark:focus:border-red-600 focus:ring-red-400/20 rounded-xl transition-all"
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                                        {reason.length} / 500
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3" />
                                    This message will be sent directly to the requester
                                </p>
                            </motion.div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-200 dark:border-red-900 rounded-xl">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                            {error}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={submitting}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submit}
                                    disabled={!reason.trim() || submitting}
                                    className="gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all rounded-xl"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Deny Request
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}