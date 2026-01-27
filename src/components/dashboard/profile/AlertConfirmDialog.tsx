"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX, FiCheck, FiInfo } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface AlertConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "destructive" | "warning" | "info" | "success";
    icon?: React.ReactNode;
}

const variantConfig = {
    destructive: {
        bg: "bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        button: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
        border: "border-red-200",
        textColor: "text-gray-800",
    },
    warning: {
        bg: "bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        button: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
        border: "border-amber-200",
        textColor: "text-gray-800",
    },
    info: {
        bg: "bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        button: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
        border: "border-blue-200",
        textColor: "text-gray-800",
    },
    success: {
        bg: "bg-gradient-to-r from-emerald-50 to-white border-l-4 border-emerald-500",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        button: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
        border: "border-emerald-200",
        textColor: "text-gray-800",
    },
};

const defaultIcons = {
    destructive: <FiAlertTriangle className="h-5 w-5" />,
    warning: <FiAlertTriangle className="h-5 w-5" />,
    info: <FiInfo className="h-5 w-5" />,
    success: <FiCheck className="h-5 w-5" />,
};

export function AlertConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "destructive",
    icon,
}: AlertConfirmDialogProps) {
    const config = variantConfig[variant];
    const IconComponent = icon || defaultIcons[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Light Background with subtle blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/30"
                        onClick={onClose}
                    />

                    {/* Confirmation Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut",
                            scale: { type: "spring", stiffness: 300, damping: 25 }
                        }}
                        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with light gradient */}
                        <div className={`relative ${config.bg} p-5 ${config.textColor} border-b ${config.border}`}>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                            >
                                <FiX className="h-4 w-4" />
                            </button>

                            <div className="flex items-center gap-4 pr-8">
                                <div className={`p-3 rounded-lg ${config.iconBg} ${config.iconColor}`}>
                                    {IconComponent}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{title}</h3>
                                    {description && (
                                        <p className="text-gray-600 text-sm mt-1">{description}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 disabled:opacity-50 transition-all duration-200"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 ${config.button} text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50`}
                                >
                                    {isLoading ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center justify-center gap-2"
                                        >
                                            <Spinner className="size-6 text-white" />
                                            Processing...
                                        </motion.div>
                                    ) : (
                                        confirmText
                                    )}
                                </Button>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}