// components/articles/FaqsSection.tsx
'use client';

import React, { useState } from 'react';
import { useFormikContext, FieldArray } from 'formik';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { HiPlus, HiTrash, HiQuestionMarkCircle, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { MdDragIndicator } from 'react-icons/md';

type FaqItem = { question: string; answer: string };
type Values = { faqs: FaqItem[] };

export function FaqsSection() {
    const { values, setFieldValue } = useFormikContext<Values>();
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const toggleExpand = (idx: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(idx)) {
            newExpanded.delete(idx);
        } else {
            newExpanded.add(idx);
        }
        setExpandedItems(newExpanded);
    };

    return (
        <Card className="p-6 space-y-6 shadow-sm border-2">
            <FieldArray name="faqs">
                {(arrayHelpers) => (
                    <div className="space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <HiQuestionMarkCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">FAQs</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {values.faqs?.length || 0} question{values.faqs?.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={() => {
                                    arrayHelpers.push({ question: '', answer: '' });
                                    setExpandedItems(new Set([...expandedItems, values.faqs.length]));
                                }}
                                className="gap-2 shadow-sm hover:shadow transition-shadow"
                            >
                                <HiPlus className="w-4 h-4" />
                                Add FAQ
                            </Button>
                        </div>

                        <Separator />

                        {/* Content */}
                        {values.faqs?.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12 px-4"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                    <HiQuestionMarkCircle className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">No FAQs yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Click &quot;Add FAQ&quot; to create your first question
                                </p>
                            </motion.div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                <div className="space-y-3">
                                    {values.faqs.map((faq, idx) => {
                                        const isExpanded = expandedItems.has(idx);
                                        const hasContent = faq.question || faq.answer;

                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                                className="group"
                                            >
                                                <div className="border-2 rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-colors">
                                                    {/* FAQ Header */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpand(idx)}
                                                        className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 text-left">
                                                            <MdDragIndicator className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                                            <span className="text-sm font-semibold text-foreground">
                                                                FAQ #{idx + 1}
                                                            </span>
                                                            {hasContent && (
                                                                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                                                    {faq.question ? 'Filled' : 'In Progress'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    arrayHelpers.remove(idx);
                                                                    const newExpanded = new Set(expandedItems);
                                                                    newExpanded.delete(idx);
                                                                    setExpandedItems(newExpanded);
                                                                }}
                                                                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <HiTrash className="w-4 h-4" />
                                                                Remove
                                                            </Button>
                                                            {isExpanded ? (
                                                                <HiChevronUp className="w-5 h-5 text-muted-foreground" />
                                                            ) : (
                                                                <HiChevronDown className="w-5 h-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </button>

                                                    {/* FAQ Content */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-5 space-y-4 bg-card">
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                                            Question
                                                                            <span className="text-destructive">*</span>
                                                                        </label>
                                                                        <Input
                                                                            value={faq.question}
                                                                            onChange={(e) =>
                                                                                setFieldValue(`faqs.${idx}.question`, e.target.value)
                                                                            }
                                                                            placeholder="Enter your question here..."
                                                                            className="h-11 border-2 focus-visible:ring-2"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                                            Answer
                                                                            <span className="text-destructive">*</span>
                                                                        </label>
                                                                        <Textarea
                                                                            value={faq.answer}
                                                                            onChange={(e) =>
                                                                                setFieldValue(`faqs.${idx}.answer`, e.target.value)
                                                                            }
                                                                            placeholder="Provide a detailed answer..."
                                                                            className="min-h-[120px] border-2 focus-visible:ring-2 resize-none"
                                                                        />
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {faq.answer?.length || 0} characters
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </AnimatePresence>
                        )}
                    </div>
                )}
            </FieldArray>
        </Card>
    );
}