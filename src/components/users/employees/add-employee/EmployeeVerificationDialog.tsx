"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ShieldCheck, Mail, ArrowRight, X } from "lucide-react";

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
        if (open) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [open]);

    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...digits];
        newDigits[index] = value.slice(-1);
        setDigits(newDigits);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "Enter" && tokenInput.length === 6 && !verifying) {
            handleVerify();
        }
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
            <DialogContent className="sm:max-w-[420px] p-0 border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Top accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

                    <div className="px-7 pt-6 pb-7">
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.08, duration: 0.35, type: "spring", stiffness: 220 }}
                            className="mb-5 w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center"
                        >
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                        </motion.div>

                        {/* Header */}
                        <DialogHeader className="mb-5 text-left space-y-1.5">
                            <DialogTitle className="text-[17px] font-semibold text-gray-900 tracking-tight">
                                Verify employee&apos;s identity
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 leading-relaxed">
                                We sent a 6-digit code to{" "}
                                <span className="inline-flex items-center gap-1 font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md px-1.5 py-0.5 text-xs">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    {email}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        {/* OTP inputs */}
                        <div className="mb-5">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                                Verification code
                            </p>
                            <div className="flex gap-2" onPaste={handlePaste}>
                                {digits.map((digit, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.12 + i * 0.04 }}
                                    >
                                        <input
                                            ref={(el) => { inputRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleDigitChange(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                            disabled={verifying}
                                            style={{
                                                width: "46px",
                                                height: "54px",
                                                textAlign: "center",
                                                fontSize: "20px",
                                                fontWeight: 600,
                                                borderRadius: "10px",
                                                outline: "none",
                                                transition: "all 0.15s ease",
                                                background: digit ? "#eff6ff" : "#f9fafb",
                                                border: digit ? "1.5px solid #3b82f6" : "1.5px solid #e5e7eb",
                                                color: digit ? "#1d4ed8" : "#6b7280",
                                                caretColor: "#3b82f6",
                                                boxShadow: digit ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
                                                opacity: verifying ? 0.6 : 1,
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = "1.5px solid #3b82f6";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
                                                e.target.style.background = "#eff6ff";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.border = digit ? "1.5px solid #3b82f6" : "1.5px solid #e5e7eb";
                                                e.target.style.boxShadow = digit ? "0 0 0 3px rgba(59,130,246,0.1)" : "none";
                                                e.target.style.background = digit ? "#eff6ff" : "#f9fafb";
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                                        <span>{error}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Buttons */}
                        <DialogFooter className="flex flex-row gap-2.5 sm:gap-2.5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={verifying}
                                className="flex-1 h-10 rounded-xl text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                            >
                                <X className="w-3.5 h-3.5 mr-1.5" />
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={handleVerify}
                                disabled={verifying || !isComplete}
                                className="flex-[2] h-10 rounded-xl text-sm font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border disabled:border-gray-200 shadow-sm disabled:shadow-none"
                            >
                                <AnimatePresence mode="wait">
                                    {verifying ? (
                                        <motion.span
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center justify-center gap-2"
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
                                            className="flex items-center justify-center gap-2"
                                        >
                                            Verify & Continue
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </DialogFooter>

                        {/* Resend */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45 }}
                            className="text-center text-xs text-gray-400 mt-4"
                        >
                            Didn&apos;t receive a code?{" "}
                            <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                Resend email
                            </button>
                        </motion.p>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}