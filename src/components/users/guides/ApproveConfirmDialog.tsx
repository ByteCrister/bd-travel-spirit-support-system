"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ApproveConfirmDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
};

export function ApproveConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = "Approve Guide Request",
    description = "Are you sure you want to approve this guide request? This action cannot be undone.",
    loading = false,
}: ApproveConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border-0 shadow-2xl overflow-hidden">
                {/* Gradient Background Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 opacity-60" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                >
                    <DialogHeader className="space-y-4">
                        {/* Icon with Animation */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.1
                            }}
                            className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
                        >
                            <CheckCircle className="h-8 w-8 text-white" strokeWidth={2.5} />
                        </motion.div>

                        <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                            {title}
                        </DialogTitle>

                        <DialogDescription className="text-center text-base text-gray-600 leading-relaxed px-2">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Decorative Element */}
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute top-4 right-4 text-emerald-300 opacity-30"
                    >
                        <Sparkles className="h-6 w-6" />
                    </motion.div>

                    <DialogFooter className="gap-3 sm:gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 border-2 hover:bg-gray-50 transition-all duration-200"
                        >
                            Cancel
                        </Button>

                        <motion.div
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="flex-1"
                        >
                            <Button
                                onClick={onConfirm}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                            >
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <motion.span
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                            />
                                            Approving...
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="confirm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            Confirm Approve
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </motion.div>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}