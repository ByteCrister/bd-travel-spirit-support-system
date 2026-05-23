"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Key, Loader2, AlertCircle, Mail, CheckCircle2, Shield, RefreshCw } from "lucide-react";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";

// ─── Neumorphism Style Tokens ────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";
const NEU_BTN_ICON =
    "rounded-xl w-10 h-10 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:text-[#006666] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_ICON_WELL_PRIMARY =
    "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
// ────────────────────────────────────────────────────────────

const PASSWORD_LENGTH = 10;

interface UpdatePasswordDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onConfirm: (newPassword: string, notify: boolean) => Promise<void>;
}

const StrengthCheck = ({
    met,
    label,
}: {
    met: boolean;
    label: string;
}) => (
    <div
        className={`flex items-center gap-1.5 text-xs font-[family-name:var(--font-jetbrains-mono)] transition-colors duration-200 ${met ? "text-[#00A63D]" : "text-[#1E2938]/30"
            }`}
    >
        {met ? (
            <CheckCircle2 className="w-3 h-3" />
        ) : (
            <div className="w-3 h-3 rounded-full border-2 border-current" />
        )}
        {label}
    </div>
);

export default function UpdatePasswordDialog({
    open,
    onOpenChange,
    onConfirm,
}: UpdatePasswordDialogProps) {
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [notifyRequester, setNotifyRequester] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
    }, [open]);

    const handleGenerateNew = () => {
        setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
        setError(null);
    };

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
            <DialogContent
                className={`sm:max-w-lg ${NEU_SURFACE} border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)] rounded-2xl p-0 overflow-hidden`}
            >
                <AnimatePresence mode="wait">
                    {submitting ? (
                        /* ── Loading state ─────────────────────────────── */
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20 gap-4 px-8"
                        >
                            <div className={`${NEU_ICON_WELL_PRIMARY} p-4`}>
                                <Loader2 className="w-8 h-8 text-[#006666] animate-spin" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className={`${NEU_HEADING} text-base`}>Updating password…</p>
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50">
                                    {notifyRequester ? "Sending notification to requester" : "Completing update"}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        /* ── Form state ────────────────────────────────── */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="p-6 space-y-5"
                        >
                            {/* Header */}
                            <DialogHeader>
                                <div className="flex items-start gap-4">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", duration: 0.4 }}
                                        className={NEU_ICON_WELL_PRIMARY}
                                    >
                                        <Key className="w-6 h-6 text-[#006666]" />
                                    </motion.div>
                                    <div className="flex-1 space-y-1 pt-0.5">
                                        <DialogTitle className={`text-xl ${NEU_HEADING}`}>
                                            Update Password
                                        </DialogTitle>
                                        <DialogDescription className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50">
                                            A secure password has been generated for you
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Generated password field */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 }}
                                className="space-y-2"
                            >
                                <label className={`${NEU_LABEL} flex items-center gap-1.5`}>
                                    Generated Password
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#006666] text-white text-[10px] font-bold">
                                        *
                                    </span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        type="password"
                                        value={generatedPassword}
                                        className={`${NEU_INPUT} flex-1 px-4 py-3 font-mono`}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleGenerateNew}
                                        type="button"
                                        aria-label="Generate new password"
                                        className={NEU_BTN_ICON}
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </motion.button>
                                </div>

                                {/* Strength indicators */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 space-y-2`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Shield className="w-3 h-3 text-[#1E2938]/40" />
                                        <span className={NEU_LABEL}>Password Strength</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4">
                                        <StrengthCheck met={hasMinLength} label="8+ characters" />
                                        <StrengthCheck met={hasUpperCase} label="Uppercase" />
                                        <StrengthCheck met={hasLowerCase} label="Lowercase" />
                                        <StrengthCheck met={hasNumber} label="Number" />
                                        <StrengthCheck met={hasSpecial} label="Special char" />
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Notify toggle */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.14 }}
                                className={`${NEU_SURFACE_INSET} rounded-xl flex items-start gap-3 p-4`}
                            >
                                <Checkbox
                                    id="notify"
                                    checked={notifyRequester}
                                    onCheckedChange={(checked) => setNotifyRequester(checked as boolean)}
                                    className="mt-0.5 data-[state=checked]:bg-[#006666] data-[state=checked]:border-[#006666]"
                                />
                                <div className="flex-1">
                                    <label
                                        htmlFor="notify"
                                        className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938] flex items-center gap-2 cursor-pointer"
                                    >
                                        <Mail className="w-4 h-4 text-[#006666]" />
                                        Notify requester via email
                                    </label>
                                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-1 leading-relaxed">
                                        Send the new password securely to the requester&apos;s registered email address
                                    </p>
                                </div>
                            </motion.div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`${NEU_SURFACE_INSET} rounded-xl flex items-center gap-3 p-3 border border-[#FF2157]/20`}>
                                            <AlertCircle className="w-4 h-4 text-[#FF2157] flex-shrink-0" />
                                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#FF2157]">
                                                {error}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-1">
                                <button
                                    onClick={handleCancel}
                                    disabled={submitting}
                                    className={`${NEU_BTN_GHOST} px-5 py-2.5 text-sm`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submit}
                                    disabled={!generatedPassword || submitting}
                                    className={`${NEU_BTN_PRIMARY} flex items-center gap-2 px-5 py-2.5 text-sm`}
                                >
                                    <Key className="w-4 h-4" />
                                    Update Password
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}