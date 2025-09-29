// components/guide/GuideModals.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type BaseProps = {
    open: boolean;
    onClose: () => void;
};

type RejectProps = BaseProps & {
    onSubmit: (reason: string) => void;
};

type CommentProps = BaseProps & {
    onSubmit: (comment: string) => void;
};

export function RejectReasonModal({ open, onClose, onSubmit }: RejectProps) {
    const [value, setValue] = useState("");

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-40 bg-black/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    aria-modal
                    role="dialog"
                >
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                    >
                        <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
                            <h2 className="text-lg font-semibold">Reject reason</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Provide a clear reason to help the applicant understand the decision.
                            </p>
                            <Textarea
                                className="mt-3"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Reason for rejection..."
                                aria-label="Reject reason"
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (!value.trim()) return;
                                        onSubmit(value.trim());
                                        setValue("");
                                    }}
                                >
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function ReviewCommentModal({ open, onClose, onSubmit }: CommentProps) {
    const [value, setValue] = useState("");

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-40 bg-black/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    aria-modal
                    role="dialog"
                >
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                    >
                        <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
                            <h2 className="text-lg font-semibold">Add review comment</h2>
                            <Textarea
                                className="mt-3"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Write your review note..."
                                aria-label="Review comment"
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (!value.trim()) return;
                                        onSubmit(value.trim());
                                        setValue("");
                                    }}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
