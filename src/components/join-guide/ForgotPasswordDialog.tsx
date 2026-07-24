"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    FiMail,
    FiMessageSquare,
    FiSend,
    FiShield,
    FiArrowRight,
    FiX,
    FiLock,
    FiRefreshCw,
    FiCheckCircle,
} from "react-icons/fi";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ForgotPasswordFormValues, forgotPasswordValidator } from "@/utils/validators/forgotPassword.validator";
import api from "@/utils/axios";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "../global/showToast";
import { inter, jakarta } from "@/styles/fonts";
import { EmailVerificationService } from "@/utils/api/email-verification.api";
import { EMAIL_VERIFICATION_PURPOSE } from "@/constants/email-verification-purpose.const";
import { Loader2 } from "lucide-react";

interface ForgotPasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onBackToLogin: () => void;
}

type DialogStep = "request" | "otp" | "reset";

export default function ForgotPasswordDialog({
    isOpen,
    onClose,
    onBackToLogin
}: ForgotPasswordDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<DialogStep>("request");
    
    // For Admin OTP flow
    const [adminEmail, setAdminEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otpError, setOtpError] = useState("");

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordValidator),
        defaultValues: {
            email: "",
            description: "",
        },
    });

    const handleSubmit = async (values: ForgotPasswordFormValues) => {
        setIsLoading(true);

        try {
            const response = await api.post("/support/employees-password-requests/v1", {
                email: values.email,
                description: values.description,
            });

            if (response.data?.data?.isAdmin) {
                setAdminEmail(values.email);
                setStep("otp");
                // Trigger OTP
                const service = new EmailVerificationService(values.email);
                await service.sendVerificationEmail(EMAIL_VERIFICATION_PURPOSE.PASSWORD_RESET);
                return;
            }

            showToast.success("Password reset request submitted successfully")
            onClose();
            form.reset();
        } catch (err: unknown) {
            console.error("Unexpected error:", err);
            const message = extractErrorMessage(err)
            showToast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const token = otp.join("");
        if (token.length < 6) return;
        
        setIsLoading(true);
        setOtpError("");
        try {
            const service = new EmailVerificationService(adminEmail);
            const res = await service.verifyToken(token, EMAIL_VERIFICATION_PURPOSE.PASSWORD_RESET);
            if (res.success) {
                setStep("reset");
            } else {
                setOtpError(res.message);
            }
        } catch (err) {
            setOtpError(extractErrorMessage(err) || "Failed to verify OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            const service = new EmailVerificationService(adminEmail);
            await service.sendVerificationEmail(EMAIL_VERIFICATION_PURPOSE.PASSWORD_RESET);
            showToast.success("Verification code resent");
        } catch (err) {
            showToast.error("Failed to resend code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            showToast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            // Note: OTP token is already consumed by the verify step above.
            // This endpoint only needs email + new password for the admin account.
            await api.post("/auth/user/v1/reset-password", {
                email: adminEmail,
                newPassword: newPassword,
            });
            showToast.success("Password reset successfully!");
            onClose();
            form.reset();
            setStep("request");
            setOtp(Array(6).fill(""));
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            showToast.error(extractErrorMessage(err) || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
            setTimeout(() => {
                form.reset();
                setStep("request");
                setOtp(Array(6).fill(""));
                setNewPassword("");
                setConfirmPassword("");
            }, 300);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className={`max-w-md p-0 gap-0 border-0 bg-transparent shadow-none ${jakarta.className}`}
                showCloseButton={false}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative w-full"
                >
                    {/* Main Container */}
                    <div className="relative bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5"></div>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>

                        {/* Header */}
                        <DialogHeader className="relative px-6 pt-6 pb-4 space-y-0">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 shadow-lg shadow-orange-500/30">
                                        <FiShield className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle className={`${inter.className} text-xl font-bold text-foreground`}>
                                            {step === "request" ? "Reset Password" : step === "otp" ? "Verify Email" : "New Password"}
                                        </DialogTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {step === "request" ? "Tell us why you need password reset" : step === "otp" ? "Enter the 6-digit code sent to your email" : "Enter a strong new password"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenChange(false)}
                                        className="h-8 w-8 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    >
                                        <FiX className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Form */}
                        <div className="relative px-6 pb-6">
                            {step === "request" && (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                        {/* Email Field */}
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-foreground">
                                                        Email Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <FiMail className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                            <Input
                                                                {...field}
                                                                type="email"
                                                                placeholder="Enter your email"
                                                                className="pl-10 py-3 rounded-xl border-input bg-background hover:border-input focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="flex items-center gap-2 text-sm" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Description Field */}
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-foreground">
                                                        Reason for Password Reset
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                                                                <FiMessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                                                            </div>
                                                            <Textarea
                                                                {...field}
                                                                placeholder="Please explain why you need a password reset (e.g., forgot password, account compromised, etc.)"
                                                                className="pl-10 py-3 rounded-xl border-input bg-background hover:border-input focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 min-h-[100px] resize-none"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="flex items-center gap-2 text-sm" />
                                                    <div className="text-xs text-muted-foreground text-right">
                                                        {field.value?.length || 0}/500 characters
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Actions */}
                                        <div className="mt-6 space-y-4">
                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="group relative w-full rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 hover:bg-gradient-to-r hover:from-orange-500 hover:via-red-500 hover:to-pink-500"
                                            >
                                                {/* Background Glow */}
                                                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-30"></div>

                                                <div className="relative flex items-center justify-center gap-2">
                                                    {isLoading ? (
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                                                        />
                                                    ) : (
                                                        <FiSend className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                                                    )}
                                                    <span>{isLoading ? "Sending Request..." : "Send Reset Request"}</span>
                                                    {!isLoading && (
                                                        <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                    )}
                                                </div>
                                            </Button>

                                            {/* Back to Login */}
                                            <div className="text-center">
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    onClick={onBackToLogin}
                                                    className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 p-0 h-auto font-normal"
                                                >
                                                    ← Back to Login
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-6 pt-4 border-t border-border">
                                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                                <FiShield className="h-3 w-3" />
                                                <span>Your request will be reviewed by our support team</span>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                            )}

                            {step === "otp" && (
                                <div className="space-y-6 mt-4">
                                    <div className="flex justify-center gap-2">
                                        {otp.map((digit, idx) => (
                                            <Input
                                                key={idx}
                                                id={`otp-${idx}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, "");
                                                    const newOtp = [...otp];
                                                    newOtp[idx] = val;
                                                    setOtp(newOtp);
                                                    if (val && idx < 5) {
                                                        const nextInput = document.getElementById(`otp-${idx + 1}`);
                                                        if (nextInput) nextInput.focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !digit && idx > 0) {
                                                        const prevInput = document.getElementById(`otp-${idx - 1}`);
                                                        if (prevInput) {
                                                            prevInput.focus();
                                                            const newOtp = [...otp];
                                                            newOtp[idx - 1] = "";
                                                            setOtp(newOtp);
                                                        }
                                                    }
                                                }}
                                                className="w-12 h-12 text-center text-xl font-bold bg-background focus:ring-2 focus:ring-orange-500 rounded-xl transition-all"
                                            />
                                        ))}
                                    </div>

                                    {otpError && (
                                        <p className="text-sm text-red-500 text-center">{otpError}</p>
                                    )}

                                    <div className="space-y-4">
                                        <Button
                                            onClick={handleVerifyOtp}
                                            disabled={isLoading || otp.some(d => !d)}
                                            className="group relative w-full rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-30"></div>
                                            <div className="relative flex items-center justify-center gap-2">
                                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FiCheckCircle className="h-4 w-4" />}
                                                <span>Verify Code</span>
                                            </div>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleResendOtp}
                                            disabled={isLoading}
                                            className="w-full text-muted-foreground hover:text-foreground"
                                        >
                                            <FiRefreshCw className="mr-2 h-4 w-4" />
                                            Resend Code
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === "reset" && (
                                <div className="space-y-4 mt-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiLock className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="pl-10 py-3 rounded-xl border-input bg-background focus:ring-2 focus:ring-orange-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1 block">Confirm Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiLock className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    className="pl-10 py-3 rounded-xl border-input bg-background focus:ring-2 focus:ring-orange-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleResetPassword}
                                        disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                                        className="group relative w-full rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 mt-6 transition-all duration-300 focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                                    >
                                        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-30"></div>
                                        <div className="relative flex items-center justify-center gap-2">
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FiCheckCircle className="h-4 w-4" />}
                                            <span>Set New Password</span>
                                        </div>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}