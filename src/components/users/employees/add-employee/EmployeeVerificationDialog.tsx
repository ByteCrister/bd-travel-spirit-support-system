"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, ShieldCheck, Mail, ArrowRight, X } from "lucide-react";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_CARD =
    "bg-[#E7E5E4] shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none";

const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none";

const NEU_INPUT_INSET =
    "bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]";

const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

const NEU_ICON_WELL_PRIMARY =
    "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
// ─────────────────────────────────────────────────────────────

interface EmployeeVerificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: string;
    onVerify: (token: string) => Promise<void>;
    onCancel: () => void;
    verifying: boolean;
    error: string | null;
}

export default function EmployeeVerificationDialog({
    open,
    onOpenChange,
    email,
    onVerify,
    onCancel,
    verifying,
    error,
}: EmployeeVerificationDialogProps) {
    const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const tokenInput = digits.join("");

    useEffect(() => {
        if (open) setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, [open]);

    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...digits];
        newDigits[index] = value.slice(-1);
        setDigits(newDigits);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === "Enter" && tokenInput.length === 6 && !verifying) handleVerify();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted) {
            const newDigits = [...digits];
            pasted.split("").forEach((char, i) => { newDigits[i] = char; });
            setDigits(newDigits);
            inputRefs.current[Math.min(pasted.length, 5)]?.focus();
        }
    };

    const handleVerify = async () => await onVerify(tokenInput);

    const handleCancel = () => {
        setDigits(["", "", "", "", "", ""]);
        onCancel();
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) handleCancel();
        onOpenChange(newOpen);
    };

    const isComplete = tokenInput.length === 6;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[440px] p-0 border-0 shadow-none bg-transparent overflow-visible">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className={`${NEU_CARD} rounded-2xl border border-white/60 overflow-hidden`}
                >
                    {/* Teal accent bar */}
                    <div className="h-1 w-full bg-[#006666]" />

                    <div className="px-7 pt-6 pb-7 space-y-6">
                        {/* Icon + Header */}
                        <DialogHeader className="text-left space-y-3">
                            <motion.div
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.08, duration: 0.35, type: "spring", stiffness: 220 }}
                                className={`${NEU_ICON_WELL_PRIMARY} w-11 h-11 flex items-center justify-center`}
                            >
                                <ShieldCheck className="w-5 h-5 text-[#006666]" />
                            </motion.div>

                            <DialogTitle className={`${NEU_HEADING} text-lg`}>
                                Verify employee&apos;s identity
                            </DialogTitle>
                            <DialogDescription className={NEU_MUTED}>
                                We sent a 6-digit code to{" "}
                                <span className="inline-flex items-center gap-1 font-[family-name:var(--font-space-mono)] font-bold text-[#006666] bg-[#006666]/10 rounded-lg px-2 py-0.5 text-xs shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                                    <Mail className="w-3 h-3" />
                                    {email}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        {/* OTP inputs */}
                        <div className="space-y-3">
                            <p className={NEU_LABEL}>Verification code</p>
                            <div className="flex gap-2" onPaste={handlePaste}>
                                {digits.map((digit, i) => (
                                    <motion.input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleDigitChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        disabled={verifying}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + i * 0.04 }}
                                        className={`
                                            w-[46px] h-[54px] text-center text-xl font-bold rounded-xl border-none
                                            font-[family-name:var(--font-space-mono)] text-[#1E2938]
                                            outline-none transition-all duration-150
                                            focus:ring-2 focus:ring-[#006666]/50
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            ${digit
                                                ? "bg-[#006666]/10 text-[#006666] shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff]"
                                                : `${NEU_INPUT_INSET} text-[#1E2938]/40`
                                            }
                                        `}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm bg-[#FF2157]/5 border border-[#FF2157]/20 text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]"
                                >
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={verifying}
                                className={`${NEU_BTN_GHOST} flex-1 flex items-center justify-center gap-2 h-11 text-sm`}
                            >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleVerify}
                                disabled={verifying || !isComplete}
                                className={`${NEU_BTN_PRIMARY} flex-[2] flex items-center justify-center h-11 text-sm`}
                            >
                                <AnimatePresence mode="wait">
                                    {verifying ? (
                                        <motion.span
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Verifying…
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="idle"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            Verify &amp; Continue
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>

                        {/* Resend */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45 }}
                            className="text-center font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40"
                        >
                            Didn&apos;t receive a code?{" "}
                            <button
                                type="button"
                                className="text-[#006666] hover:text-[#007777] font-bold transition-colors"
                            >
                                Resend email
                            </button>
                        </motion.p>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}