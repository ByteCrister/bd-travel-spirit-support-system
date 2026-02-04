"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Key, Loader2, AlertCircle, Mail, CheckCircle2, Shield, RefreshCw } from "lucide-react";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";

// Set the length of the generated password
const PASSWORD_LENGTH = 10;

interface UpdatePasswordDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onConfirm: (newPassword: string, notify: boolean) => Promise<void>;
}

export default function UpdatePasswordDialog({
    open,
    onOpenChange,
    onConfirm,
}: UpdatePasswordDialogProps) {
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [notifyRequester, setNotifyRequester] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate initial password when dialog opens
    useEffect(() => {
        if (open) {
            setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
        }
    }, [open]);

    const handleGenerateNew = () => {
        setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
        setError(null);
    };

    // Password strength checks
    const hasMinLength = generatedPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(generatedPassword);
    const hasLowerCase = /[a-z]/.test(generatedPassword);
    const hasNumber = /[0-9]/.test(generatedPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(generatedPassword);

    const submit = async () => {
        if (!generatedPassword) {
            setError("Please generate a password first");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await onConfirm(generatedPassword, notifyRequester);
            // Reset on success
            setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
            setNotifyRequester(true);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Failed to update password. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!submitting) {
            setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
            setNotifyRequester(true);
            setError(null);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-auto rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 shadow-xl p-6">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none rounded-lg" />

                <DialogHeader className="relative">
                    <div className="flex items-start gap-4">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="relative"
                        >
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-xl shadow-violet-500/30">
                                <Key className="w-7 h-7 text-white" />
                            </div>
                            <div className="absolute inset-0 bg-violet-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
                        </motion.div>
                        <div className="flex-1 space-y-1">
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                                Update Password
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                                A secure password has been generated for you
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
                                <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
                                <div className="absolute inset-0 blur-xl bg-violet-500/30 animate-pulse" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                    Updating password...
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {notifyRequester ? "Sending notification to requester" : "Completing update"}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5 py-4 relative"
                        >
                            {/* Generated Password Display */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-3"
                            >
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    Generated Password
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-500 text-white text-xs font-bold">
                                        *
                                    </span>
                                </Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            readOnly
                                            type={"password"}
                                            value={generatedPassword}
                                            className="pr-12 h-12 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-violet-400 dark:focus:border-violet-600 focus:ring-violet-400/20 rounded-xl transition-all font-mono"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleGenerateNew}
                                        variant="outline"
                                        className="h-12 px-4 rounded-xl border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Password Strength Indicators */}
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                                            Password Strength
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={`flex items-center gap-1.5 text-xs ${hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                            {hasMinLength ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                                            8+ characters
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-xs ${hasUpperCase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                            {hasUpperCase ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                                            Uppercase
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-xs ${hasLowerCase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                            {hasLowerCase ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                                            Lowercase
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-xs ${hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                            {hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                                            Number
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-xs ${hasSpecial ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                            {hasSpecial ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                                            Special char
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Notification Toggle */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="relative overflow-hidden"
                            >
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl">
                                    <Checkbox
                                        id="notify"
                                        checked={notifyRequester}
                                        onCheckedChange={(checked) => setNotifyRequester(checked as boolean)}
                                        className="mt-1 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-600 data-[state=checked]:to-fuchsia-600 data-[state=checked]:border-0"
                                    />
                                    <div className="flex-1">
                                        <label
                                            htmlFor="notify"
                                            className="text-sm font-semibold cursor-pointer flex items-center gap-2 text-blue-900 dark:text-blue-100"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Notify requester via email
                                        </label>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                                            Send the new password securely to the requester&apos;s registered email address
                                        </p>
                                    </div>
                                </div>
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
                                    disabled={!generatedPassword || submitting}
                                    className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all rounded-xl"
                                >
                                    <Key className="w-4 h-4" />
                                    Update Password
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}