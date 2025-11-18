"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ConfirmDialogProps {
    title: string;
    description?: string;
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
    open: boolean;
    variant?: "danger" | "warning" | "success" | "info";
}

export default function ConfirmDialog({ 
    title, 
    description, 
    onConfirm, 
    onCancel, 
    open,
    variant = "warning" 
}: ConfirmDialogProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm();
        } finally {
            setIsConfirming(false);
        }
    };

    const variantStyles = {
        danger: {
            icon: XCircle,
            iconColor: "text-red-500",
            bgGradient: "from-red-50 to-red-100/50",
            buttonColor: "bg-red-600 hover:bg-red-700",
            accentColor: "border-red-200"
        },
        warning: {
            icon: AlertTriangle,
            iconColor: "text-amber-500",
            bgGradient: "from-amber-50 to-amber-100/50",
            buttonColor: "bg-amber-600 hover:bg-amber-700",
            accentColor: "border-amber-200"
        },
        success: {
            icon: CheckCircle,
            iconColor: "text-emerald-500",
            bgGradient: "from-emerald-50 to-emerald-100/50",
            buttonColor: "bg-emerald-600 hover:bg-emerald-700",
            accentColor: "border-emerald-200"
        },
        info: {
            icon: AlertCircle,
            iconColor: "text-blue-500",
            bgGradient: "from-blue-50 to-blue-100/50",
            buttonColor: "bg-blue-600 hover:bg-blue-700",
            accentColor: "border-blue-200"
        }
    };

    const currentVariant = variantStyles[variant];
    const Icon = currentVariant.icon;

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onCancel() : undefined)}>
            <AnimatePresence>
                {open && (
                    <DialogContent 
                        aria-describedby="confirm-desc"
                        className="sm:max-w-md overflow-hidden border-0 shadow-2xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Decorative gradient background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${currentVariant.bgGradient} opacity-30`} />
                            
                            {/* Animated icon */}
                            <div className="relative flex justify-center mb-4 pt-6">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 200, 
                                        damping: 15,
                                        delay: 0.1 
                                    }}
                                    className={`rounded-full p-3 bg-white shadow-lg border-2 ${currentVariant.accentColor}`}
                                >
                                    <Icon className={`w-8 h-8 ${currentVariant.iconColor}`} />
                                </motion.div>
                            </div>

                            <DialogHeader className="relative space-y-3 text-center pb-2">
                                <DialogTitle className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    {title}
                                </DialogTitle>
                                {description && (
                                    <DialogDescription 
                                        id="confirm-desc" 
                                        className="text-base text-gray-600 leading-relaxed px-2"
                                    >
                                        {description}
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            <DialogFooter className="relative gap-3 pt-6 pb-2 flex-row sm:flex-row justify-center">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button 
                                        variant="outline" 
                                        onClick={onCancel}
                                        disabled={isConfirming}
                                        className="min-w-[100px] border-2 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        Cancel
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button 
                                        className={`min-w-[100px] ${currentVariant.buttonColor} shadow-lg transition-all duration-200`}
                                        onClick={handleConfirm}
                                        disabled={isConfirming}
                                    >
                                        {isConfirming ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            "Confirm"
                                        )}
                                    </Button>
                                </motion.div>
                            </DialogFooter>
                        </motion.div>
                    </DialogContent>
                )}
            </AnimatePresence>
        </Dialog>
    );
}