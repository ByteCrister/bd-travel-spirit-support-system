'use client';

import { FieldArray, FormikErrors, FormikTouched, FormikHelpers } from 'formik';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { Plus, Trash2, HelpCircle, MessageSquare } from 'lucide-react';
import { spaceMono, jetbrainsMono } from '@/styles/fonts';

// ---------------------
// Design System Tokens — Neumorphism Club
// ---------------------
const NEU = {
    // Info banner — inset teal tint
    infoBanner: [
        'flex items-start gap-3 rounded-2xl p-4',
        'bg-[#E7E5E4]',
        'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
        'border-l-4 border-[#006666]',
    ].join(' '),
    // Add FAQ button — full-width raised
    addBtn: [
        'w-full rounded-xl border-0 py-4 flex items-center justify-center gap-2',
        'bg-[#006666] text-white text-sm font-semibold',
        'shadow-[3px_3px_8px_#004d4d,_-2px_-2px_6px_#008080]',
        'hover:shadow-[1px_1px_4px_#004d4d,_-1px_-1px_4px_#008080] hover:translate-y-px',
        'active:shadow-[inset_2px_2px_5px_#004d4d,_inset_-2px_-2px_5px_#008080]',
        'transition-all duration-150',
    ].join(' '),
    // FAQ card — raised
    faqCard: [
        'group rounded-2xl border-0 p-6',
        'bg-[#E7E5E4]',
        'shadow-[5px_5px_10px_#c8c6c4,_-5px_-5px_10px_#ffffff]',
        'transition-all duration-200',
    ].join(' '),
    // Number badge — inset circle
    numBadge: [
        'flex items-center justify-center w-8 h-8 rounded-full',
        'bg-[#E7E5E4]',
        'shadow-[inset_3px_3px_5px_#c8c6c4,_inset_-3px_-3px_5px_#ffffff]',
        'text-[#006666] font-bold text-sm',
    ].join(' '),
    // Delete button
    deleteBtn: [
        'p-2 rounded-xl',
        'bg-[#E7E5E4] text-[#1E2938]/40',
        'shadow-[2px_2px_4px_#c8c6c4,_-2px_-2px_4px_#ffffff]',
        'hover:text-[#FF2157] hover:shadow-[1px_1px_2px_#c8c6c4,_-1px_-1px_2px_#ffffff]',
        'opacity-0 group-hover:opacity-100',
        'transition-all duration-200',
    ].join(' '),
    // Input — inset
    inputBase: [
        'w-full rounded-xl border-0 bg-[#E7E5E4] text-[#1E2938] text-sm',
        'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
        'placeholder:text-[#1E2938]/40 px-4 py-2.5 h-11',
        'focus:outline-none focus:ring-2 focus:ring-[#006666]/30',
        'transition-all duration-150',
    ].join(' '),
    inputError: 'ring-2 ring-[#FF2157]/40 bg-[#E7E5E4]',
    textareaBase: [
        'w-full rounded-xl border-0 bg-[#E7E5E4] text-[#1E2938] text-sm',
        'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
        'placeholder:text-[#1E2938]/40 px-4 py-3 resize-none',
        'focus:outline-none focus:ring-2 focus:ring-[#006666]/30',
        'transition-all duration-150',
    ].join(' '),
    // Empty state
    emptyState: [
        'flex flex-col items-center justify-center py-16 rounded-2xl',
        'bg-[#E7E5E4]',
        'shadow-[inset_4px_4px_8px_#c8c6c4,_inset_-4px_-4px_8px_#ffffff]',
    ].join(' '),
    // Summary bar
    summaryBar: [
        'flex items-center justify-between rounded-2xl p-4',
        'bg-[#E7E5E4]',
        'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
    ].join(' '),
    addMoreBtn: [
        'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold',
        'bg-[#E7E5E4] text-[#006666]',
        'shadow-[2px_2px_4px_#c8c6c4,_-2px_-2px_4px_#ffffff]',
        'hover:shadow-[1px_1px_2px_#c8c6c4,_-1px_-1px_2px_#ffffff] hover:translate-y-px',
        'transition-all duration-150',
    ].join(' '),
    label: `block text-xs font-semibold text-[#1E2938] tracking-wide uppercase mb-2 ${spaceMono.className}`,
    errorText: `flex items-center gap-1 text-xs text-[#FF2157] mt-1.5 ${jetbrainsMono.className}`,
    hintText: `text-xs text-[#1E2938]/50 ${jetbrainsMono.className}`,
    fontMono: spaceMono.className,
    fontData: jetbrainsMono.className,
    textPrimary: 'text-[#1E2938]',
    textMuted: 'text-[#1E2938]/60',
} as const;

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
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2 } },
    };

    return (
        <div className="space-y-6">

            {/* ── Info Banner ── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={NEU.infoBanner}>
                <HelpCircle className="w-5 h-5 text-[#006666] shrink-0 mt-0.5" />
                <div>
                    <p className={`text-sm font-medium text-[#1E2938] ${NEU.fontMono}`}>
                        Add frequently asked questions
                    </p>
                    <p className={`text-xs text-[#1E2938]/60 mt-1 ${NEU.fontData}`}>
                        Help readers find answers quickly about your travel destination
                    </p>
                </div>
            </motion.div>

            <FieldArray
                name="faqs"
                render={(arrayHelpers) => (
                    <div className="space-y-6">

                        {/* ── Add FAQ Button ── */}
                        <motion.button
                            type="button"
                            onClick={() => arrayHelpers.push({ question: '', answer: '' })}
                            whileTap={{ scale: 0.98 }}
                            className={`${NEU.addBtn} ${NEU.fontMono}`}
                        >
                            <Plus className="w-5 h-5" />
                            Add New FAQ
                        </motion.button>

                        {/* ── FAQ List ── */}
                        <AnimatePresence mode="popLayout">
                            {faqs.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={NEU.emptyState}
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c4,_inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mb-4">
                                        <MessageSquare className="w-7 h-7 text-[#1E2938]/30" />
                                    </div>
                                    <p className={`text-sm text-[#1E2938]/50 ${NEU.fontMono}`}>No FAQs added yet</p>
                                    <p className={`text-xs text-[#1E2938]/40 mt-1 ${NEU.fontData}`}>Click the button above to add your first FAQ</p>
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
                                                className={NEU.faqCard}
                                            >
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`${NEU.numBadge} ${NEU.fontMono}`}>{idx + 1}</span>
                                                        <span className={`text-sm font-medium text-[#1E2938]/60 ${NEU.fontMono}`}>
                                                            Question {idx + 1}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => arrayHelpers.remove(idx)}
                                                        className={NEU.deleteBtn}
                                                        aria-label={`Remove FAQ ${idx + 1}`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Question */}
                                                <div className="mb-5">
                                                    <label className={NEU.label}>Question</label>
                                                    <input
                                                        placeholder="e.g., What's the best time to visit?"
                                                        value={faq.question}
                                                        onChange={(e) => setFieldValue(`faqs.${idx}.question`, e.target.value)}
                                                        className={`${NEU.inputBase} ${errorQ && touchedQ ? NEU.inputError : ''} ${NEU.fontData}`}
                                                    />
                                                    <AnimatePresence>
                                                        {errorQ && touchedQ && (
                                                            <motion.p
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className={NEU.errorText}
                                                            >
                                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF2157] shrink-0" />
                                                                {errorQ}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Answer */}
                                                <div>
                                                    <label className={NEU.label}>Answer</label>
                                                    <textarea
                                                        placeholder="Provide a helpful and detailed answer…"
                                                        value={faq.answer}
                                                        onChange={(e) => setFieldValue(`faqs.${idx}.answer`, e.target.value)}
                                                        rows={4}
                                                        className={`${NEU.textareaBase} ${errorA && touchedA ? NEU.inputError : ''} ${NEU.fontData}`}
                                                    />
                                                    <AnimatePresence>
                                                        {errorA && touchedA && (
                                                            <motion.p
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className={NEU.errorText}
                                                            >
                                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF2157] shrink-0" />
                                                                {errorA}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                    <p className={`${NEU.hintText} mt-2`}>
                                                        {faq.answer?.length || 0} characters
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Summary ── */}
                        {faqs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={NEU.summaryBar}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#006666] shrink-0" />
                                    <p className={`text-sm font-medium text-[#1E2938] ${NEU.fontMono}`}>
                                        {faqs.length} {faqs.length === 1 ? 'FAQ' : 'FAQs'} added
                                    </p>
                                </div>
                                <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => arrayHelpers.push({ question: '', answer: '' })}
                                    className={`${NEU.addMoreBtn} ${NEU.fontMono}`}
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