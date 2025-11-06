'use client';

import React, { useState } from 'react';
import { useFormikContext, FieldArray, FieldArrayRenderProps } from 'formik';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { HiPlus, HiTrash, HiQuestionMarkCircle, HiChevronDown, HiChevronUp, HiSparkles } from 'react-icons/hi';
import { MdDragIndicator } from 'react-icons/md';

type FaqItem = { question: string; answer: string };
type Values = { faqs: FaqItem[] };

export function FaqsSection() {
    const { values, setFieldValue } = useFormikContext<Values>();
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    const [pendingRemoveIdx, setPendingRemoveIdx] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const toggleExpand = (idx: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(idx)) newExpanded.delete(idx);
        else newExpanded.add(idx);
        setExpandedItems(newExpanded);
    };

    const openConfirm = (idx: number) => {
        setPendingRemoveIdx(idx);
        setConfirmOpen(true);
    };

    const closeConfirm = () => {
        setConfirmOpen(false);
        setPendingRemoveIdx(null);
    };

    const handleConfirmRemove = (arrayHelpers: FieldArrayRenderProps) => {
        if (pendingRemoveIdx == null) return;

        arrayHelpers.remove(pendingRemoveIdx);

        const newExpanded = new Set(expandedItems);
        newExpanded.delete(pendingRemoveIdx);

        const shifted = new Set<number>();
        newExpanded.forEach((i) => shifted.add(i > pendingRemoveIdx! ? i - 1 : i));
        setExpandedItems(shifted);

        closeConfirm();
    };

    return (
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative p-8 space-y-6">
                <FieldArray name="faqs">
                    {(arrayHelpers) => {
                        return (
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <motion.div 
                                            className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg"
                                            whileHover={{ scale: 1.05, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <HiQuestionMarkCircle className="w-7 h-7 text-white" />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                                Frequently Asked Questions
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                                {values.faqs?.length || 0} {values.faqs?.length === 1 ? 'question' : 'questions'} added
                                            </p>
                                        </div>
                                    </div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                arrayHelpers.push({ question: '', answer: '' });
                                                setExpandedItems(new Set([...expandedItems, values.faqs.length]));
                                            }}
                                            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-6 py-2.5 rounded-xl"
                                        >
                                            <HiPlus className="w-5 h-5" />
                                            Add FAQ
                                        </Button>
                                    </motion.div>
                                </div>

                                <Separator className="bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

                                {/* Content */}
                                {values.faqs?.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }} 
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="text-center py-16 px-4"
                                    >
                                        <motion.div 
                                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-3xl mb-5 shadow-inner"
                                            animate={{ 
                                                y: [0, -10, 0],
                                            }}
                                            transition={{ 
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <HiQuestionMarkCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                        </motion.div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">No FAQs yet</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                            Start building your FAQ section by clicking the <span className="font-semibold text-blue-600 dark:text-blue-400">&quot;Add FAQ&quot;</span> button above
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-4">
                                        <AnimatePresence mode="popLayout">
                                            {values.faqs.map((faq, idx) => {
                                                const isExpanded = expandedItems.has(idx);
                                                const hasContent = faq.question || faq.answer;
                                                const isFilled = faq.question && faq.answer;

                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        layout
                                                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, x: -30, scale: 0.9 }}
                                                        transition={{ duration: 0.3, type: "spring" }}
                                                        className="group"
                                                    >
                                                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                                            <motion.div
                                                                onClick={() => toggleExpand(idx)}
                                                                className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                            >
                                                                <div className="flex items-center gap-4 flex-1 text-left">
                                                                    <motion.div
                                                                        whileHover={{ scale: 1.1 }}
                                                                        className="cursor-grab active:cursor-grabbing"
                                                                    >
                                                                        <MdDragIndicator className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                                                    </motion.div>
                                                                    
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-sm">
                                                                            {idx + 1}
                                                                        </div>
                                                                        <span className="text-base font-bold text-gray-900 dark:text-white">
                                                                            FAQ Question
                                                                        </span>
                                                                    </div>

                                                                    {hasContent && (
                                                                        <motion.span 
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm ${
                                                                                isFilled 
                                                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                                                                    : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                                                                            }`}
                                                                        >
                                                                            {isFilled ? (
                                                                                <span className="flex items-center gap-1">
                                                                                    <HiSparkles className="w-3 h-3" />
                                                                                    Complete
                                                                                </span>
                                                                            ) : 'In Progress'}
                                                                        </motion.span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openConfirm(idx);
                                                                            }}
                                                                            className="gap-2 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold rounded-xl transition-all"
                                                                        >
                                                                            <HiTrash className="w-4 h-4" />
                                                                            Remove
                                                                        </Button>
                                                                    </motion.div>

                                                                    <motion.div
                                                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                                                        transition={{ duration: 0.3 }}
                                                                    >
                                                                        {isExpanded ? (
                                                                            <HiChevronUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                                        ) : (
                                                                            <HiChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                                                        )}
                                                                    </motion.div>
                                                                </div>
                                                            </motion.div>

                                                            <AnimatePresence>
                                                                {isExpanded && (
                                                                    <motion.div 
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="px-5 pb-5 pt-2 space-y-4 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                                                                    Question
                                                                                </label>
                                                                                <Input
                                                                                    name={`faqs.${idx}.question`}
                                                                                    placeholder="Enter your question here..."
                                                                                    value={faq.question}
                                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                                        setFieldValue(`faqs.${idx}.question`, e.target.value)
                                                                                    }
                                                                                    className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl font-medium transition-all shadow-sm focus:shadow-md"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                                                                    Answer
                                                                                </label>
                                                                                <Textarea
                                                                                    name={`faqs.${idx}.answer`}
                                                                                    placeholder="Provide a detailed answer..."
                                                                                    value={faq.answer}
                                                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                                                        setFieldValue(`faqs.${idx}.answer`, e.target.value)
                                                                                    }
                                                                                    className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl font-medium min-h-[120px] transition-all shadow-sm focus:shadow-md"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Confirmation AlertDialog */}
                                <AlertDialog open={confirmOpen} onOpenChange={(open) => { if (!open) { setPendingRemoveIdx(null); } setConfirmOpen(open); }}>
                                    <AlertDialogContent className="rounded-2xl border-2 shadow-2xl">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                                Delete FAQ
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
                                                Are you sure you want to remove this FAQ? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex items-center justify-end gap-3 mt-4">
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    variant="ghost"
                                                    onClick={closeConfirm}
                                                    className="px-6 py-2.5 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                                >
                                                    Cancel
                                                </Button>
                                            </motion.div>

                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleConfirmRemove(arrayHelpers)}
                                                    className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    Delete
                                                </Button>
                                            </motion.div>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        );
                    }}
                </FieldArray>
            </div>
        </Card>
    );
}