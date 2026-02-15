"use client";

import React, { JSX, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";

type ConfirmDeleteDialogProps = {
    children?: React.ReactNode; // optional trigger element (asChild)
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => Promise<void> | void;
    confirmVariant?: "destructive" | "default";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export default function ConfirmDeleteDialog({
    children,
    title = "Delete item",
    description = "This action cannot be undone. Are you sure you want to continue?",
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    confirmVariant = "destructive",
    open,
    onOpenChange,
}: ConfirmDeleteDialogProps): JSX.Element {
    const [loading, setLoading] = useState(false);

    async function handleConfirm() {
        try {
            setLoading(true);
            await onConfirm();
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {children ? (
                <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            ) : (
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
            )}

            <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16 }}
                    className="bg-white dark:bg-slate-900"
                >
                    <AlertDialogHeader className="px-6 pt-6 pb-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-none rounded-lg p-3 bg-rose-50/70 text-rose-700">
                                <AlertTriangle className="w-5 h-5" />
                            </div>

                            <div className="min-w-0">
                                <AlertDialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {title}
                                </AlertDialogTitle>

                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            <div className="ml-auto -mr-2">
                                <button
                                    type="button"
                                    aria-label="Close"
                                    onClick={() => onOpenChange?.(false)}
                                    className="inline-flex items-center justify-center rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="px-6 py-4">
                        <div className="flex w-full gap-3">
                            <AlertDialogCancel asChild>
                                <Button variant="outline" className="flex-1">
                                    {cancelLabel}
                                </Button>
                            </AlertDialogCancel>

                            <AlertDialogAction asChild>
                                <Button
                                    variant={confirmVariant === "destructive" ? "destructive" : "default"}
                                    className="flex-1 inline-flex items-center justify-center gap-2"
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    {confirmLabel}
                                </Button>
                            </AlertDialogAction>
                        </div>
                    </AlertDialogFooter>
                </motion.div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
