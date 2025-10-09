// components/forms/FaqForm.tsx
'use client';

import { FieldArray, FormikErrors, FormikTouched, FormikHelpers } from 'formik';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { Plus, Trash2, HelpCircle, MessageSquare } from 'lucide-react';
import { inter } from '@/styles/fonts';

interface FaqFormProps {
    values: CreateArticleFormValues;
    setFieldValue: FormikHelpers<CreateArticleFormValues>['setFieldValue'];
    errors: FormikErrors<CreateArticleFormValues>;
    touched: FormikTouched<CreateArticleFormValues>;
}

export function FaqForm({ values, setFieldValue, errors, touched }: FaqFormProps) {
    const faqs = values.faqs ?? [];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.05,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: {
                duration: 0.2,
            },
        },
    };

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4"
            >
                <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className={`${inter.className} text-sm font-medium text-blue-900`}>
                        Add frequently asked questions
                    </p>
                    <p className={`${inter.className} text-xs text-blue-700 mt-1`}>
                        Help readers find answers quickly about your travel destination
                    </p>
                </div>
            </motion.div>

            <FieldArray
                name="faqs"
                render={(arrayHelpers) => (
                    <div className="space-y-6">
                        {/* Add FAQ Button */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="button"
                                onClick={() => arrayHelpers.push({ question: '', answer: '' })}
                                className={`${inter.className} w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md`}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New FAQ
                            </Button>
                        </motion.div>

                        {/* FAQ List */}
                        <AnimatePresence mode="popLayout">
                            {faqs.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-col items-center justify-center py-16 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
                                >
                                    <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                                    <p className={`${inter.className} text-slate-500 text-sm`}>
                                        No FAQs added yet
                                    </p>
                                    <p className={`${inter.className} text-slate-400 text-xs mt-1`}>
                                        Click the button above to add your first FAQ
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4"
                                >
                                    {faqs.map((faq, idx) => {
                                        const errorObj = errors?.faqs?.[idx];
                                        const touchedObj = touched?.faqs?.[idx];

                                        const errorQ = errorObj && typeof errorObj === 'object' ? errorObj.question : undefined;
                                        const errorA = errorObj && typeof errorObj === 'object' ? errorObj.answer : undefined;

                                        const touchedQ = touchedObj && typeof touchedObj === 'object' ? touchedObj.question : undefined;
                                        const touchedA = touchedObj && typeof touchedObj === 'object' ? touchedObj.answer : undefined;

                                        return (
                                            <motion.div
                                                key={`faq-${idx}`}
                                                variants={itemVariants}
                                                layout
                                                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
                                            >
                                                {/* FAQ Index */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
                                                            <span className={`${inter.className} text-sm`}>
                                                                {idx + 1}
                                                            </span>
                                                        </div>
                                                        <span className={`${inter.className} text-sm font-medium text-slate-600`}>
                                                            Question {idx + 1}
                                                        </span>
                                                    </div>

                                                    {/* Delete Button */}
                                                    <motion.button
                                                        type="button"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => arrayHelpers.remove(idx)}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>

                                                {/* Question Input */}
                                                <motion.div
                                                    className="mb-5"
                                                    whileHover={{ scale: 1.01 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                >
                                                    <label className={`${inter.className} block text-sm font-semibold text-slate-700 mb-2`}>
                                                        Question
                                                    </label>
                                                    <Input
                                                        placeholder="e.g., What's the best time to visit?"
                                                        value={faq.question}
                                                        onChange={(e) =>
                                                            setFieldValue(`faqs.${idx}.question`, e.target.value)
                                                        }
                                                        className={`${inter.className} rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errorQ && touchedQ ? 'border-red-500 bg-red-50' : ''
                                                            }`}
                                                    />
                                                    <AnimatePresence>
                                                        {errorQ && touchedQ && (
                                                            <motion.p
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className={`${inter.className} text-xs text-red-600 mt-1.5 flex items-center gap-1`}
                                                            >
                                                                <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
                                                                {errorQ}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>

                                                {/* Answer Input */}
                                                <motion.div
                                                    whileHover={{ scale: 1.01 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                >
                                                    <label className={`${inter.className} block text-sm font-semibold text-slate-700 mb-2`}>
                                                        Answer
                                                    </label>
                                                    <Textarea
                                                        placeholder="Provide a helpful and detailed answer..."
                                                        value={faq.answer}
                                                        onChange={(e) =>
                                                            setFieldValue(`faqs.${idx}.answer`, e.target.value)
                                                        }
                                                        rows={4}
                                                        className={`${inter.className} rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${errorA && touchedA ? 'border-red-500 bg-red-50' : ''
                                                            }`}
                                                    />
                                                    <AnimatePresence>
                                                        {errorA && touchedA && (
                                                            <motion.p
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className={`${inter.className} text-xs text-red-600 mt-1.5 flex items-center gap-1`}
                                                            >
                                                                <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
                                                                {errorA}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>

                                                {/* Character Count */}
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className={`${inter.className} text-xs text-slate-500 mt-2`}
                                                >
                                                    Answer: {faq.answer?.length || 0} characters
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* FAQ Count Summary */}
                        {faqs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-4"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                    <p className={`${inter.className} text-sm font-medium text-slate-700`}>
                                        {faqs.length} {faqs.length === 1 ? 'FAQ' : 'FAQs'} added
                                    </p>
                                </div>
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => arrayHelpers.push({ question: '', answer: '' })}
                                    className={`${inter.className} flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-all duration-200`}
                                >
                                    <Plus className="w-3 h-3" />
                                    Add more
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                )}
            />
        </div>
    );
}