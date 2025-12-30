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
    FiX
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

interface ForgotPasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onBackToLogin: () => void;
}

export default function ForgotPasswordDialog({
    isOpen,
    onClose,
    onBackToLogin
}: ForgotPasswordDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

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
            // Make API call using your axios instance
            await api.post("/support/v1/employees-password-requests", {
                email: values.email,
                description: values.description,
            });

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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
            form.reset();
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
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
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
                                        <DialogTitle className={`${inter.className} text-xl font-bold text-gray-900 dark:text-white`}>
                                            Reset Password
                                        </DialogTitle>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Tell us why you need password reset
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenChange(false)}
                                        className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        <FiX className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Form */}
                        <div className="relative px-6 pb-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                    {/* Email Field */}
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                                            className="pl-10 py-3 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
                                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                                            className="pl-10 py-3 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 min-h-[100px] resize-none"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="flex items-center gap-2 text-sm" />
                                                <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
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
                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <FiShield className="h-3 w-3" />
                                            <span>Your request will be reviewed by our support team</span>
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}