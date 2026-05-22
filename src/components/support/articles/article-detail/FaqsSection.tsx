'use client';

import { useState } from 'react';
import { useFormikContext, FieldArray, FieldArrayRenderProps } from 'formik';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { HiPlus, HiTrash, HiQuestionMarkCircle, HiChevronDown, HiSparkles } from 'react-icons/hi';
import { MdDragIndicator } from 'react-icons/md';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-6 sm:p-8';

const NEU_CARD_SM =
    'rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60 overflow-hidden';

const NEU_BTN_PRIMARY =
    'rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide ' +
    'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
    'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] ' +
    'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
    'transition-all duration-200 px-5 py-2 flex items-center gap-2 text-sm';

const NEU_BTN_DANGER =
    'rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] text-xs ' +
    'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
    'hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
    'transition-all duration-200 px-3 py-1.5 flex items-center gap-1.5';

const NEU_BTN_GHOST =
    'rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm ' +
    'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
    'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
    'transition-all duration-200 px-5 py-2';

const NEU_SURFACE_INSET =
    'bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] rounded-xl p-4 sm:p-5';

const NEU_INPUT =
    'rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';

const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';

const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';

const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';

const NEU_ICON_WELL_PRIMARY =
    'p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]';

const NEU_BADGE_SUCCESS =
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

const NEU_BADGE_WARNING =
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

// ─────────────────────────────────────────────────────────────

type FaqItem = { question: string; answer: string };
type Values = { faqs: FaqItem[] };

export function FaqsSection() {
    const { values, setFieldValue } = useFormikContext<Values>();
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    const [pendingRemoveIdx, setPendingRemoveIdx] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const toggleExpand = (idx: number) => {
        const next = new Set(expandedItems);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setExpandedItems(next);
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
        const next = new Set(expandedItems);
        next.delete(pendingRemoveIdx);
        const shifted = new Set<number>();
        next.forEach((i) => shifted.add(i > pendingRemoveIdx! ? i - 1 : i));
        setExpandedItems(shifted);
        closeConfirm();
    };

    return (
        <div className={NEU_CARD}>
            <FieldArray name="faqs">
                {(arrayHelpers) => (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={NEU_ICON_WELL_PRIMARY}>
                                    <HiQuestionMarkCircle className="w-5 h-5 text-[#006666]" />
                                </div>
                                <div>
                                    <h3 className={`${NEU_HEADING} text-lg`}>
                                        Frequently Asked Questions
                                    </h3>
                                    <p className={NEU_MUTED}>
                                        {values.faqs?.length || 0}{' '}
                                        {values.faqs?.length === 1 ? 'question' : 'questions'} added
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    arrayHelpers.push({ question: '', answer: '' });
                                    setExpandedItems(new Set([...expandedItems, values.faqs.length]));
                                }}
                                className={NEU_BTN_PRIMARY}
                            >
                                <HiPlus className="w-4 h-4" />
                                Add FAQ
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-[#1E2938]/10" />

                        {/* Empty state */}
                        {values.faqs?.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 px-4"
                            >
                                <motion.div
                                    className={`${NEU_ICON_WELL_PRIMARY} inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5`}
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <HiQuestionMarkCircle className="w-10 h-10 text-[#006666]" />
                                </motion.div>
                                <p className={`${NEU_HEADING} text-base mb-2`}>No FAQs yet</p>
                                <p className={`${NEU_MUTED} max-w-xs mx-auto`}>
                                    Click <span className="text-[#006666] font-bold">Add FAQ</span> to start
                                    building your FAQ section
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {values.faqs.map((faq, idx) => {
                                        const isExpanded = expandedItems.has(idx);
                                        const isFilled = faq.question && faq.answer;
                                        const hasContent = faq.question || faq.answer;

                                        return (
                                            <motion.div
                                                key={idx}
                                                layout
                                                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                                transition={{ duration: 0.25, type: 'spring' }}
                                            >
                                                <div className={NEU_CARD_SM}>
                                                    {/* Row header */}
                                                    <div
                                                        onClick={() => toggleExpand(idx)}
                                                        className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/30 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 text-left min-w-0">
                                                            <MdDragIndicator className="w-5 h-5 text-[#1E2938]/30 flex-shrink-0 cursor-grab" />

                                                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#006666]/10 text-[#006666] text-xs font-[family-name:var(--font-space-mono)] font-bold flex-shrink-0">
                                                                {idx + 1}
                                                            </div>

                                                            <span className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938] truncate">
                                                                {faq.question || 'FAQ Question'}
                                                            </span>

                                                            {hasContent && (
                                                                <span className={isFilled ? NEU_BADGE_SUCCESS : NEU_BADGE_WARNING}>
                                                                    {isFilled ? (
                                                                        <>
                                                                            <HiSparkles className="w-3 h-3" />
                                                                            Complete
                                                                        </>
                                                                    ) : 'In Progress'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); openConfirm(idx); }}
                                                                className={NEU_BTN_DANGER}
                                                            >
                                                                <HiTrash className="w-3.5 h-3.5" />
                                                                <span className="hidden sm:inline">Remove</span>
                                                            </button>

                                                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                                                <HiChevronDown className="w-5 h-5 text-[#1E2938]/40" />
                                                            </motion.div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded fields */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className={`${NEU_SURFACE_INSET} mx-4 mb-4 space-y-4`}>
                                                                    <div className="space-y-1.5">
                                                                        <label className={NEU_LABEL}>Question</label>
                                                                        <Input
                                                                            name={`faqs.${idx}.question`}
                                                                            placeholder="Enter the question..."
                                                                            value={faq.question}
                                                                            onChange={(e) =>
                                                                                setFieldValue(`faqs.${idx}.question`, e.target.value)
                                                                            }
                                                                            className={NEU_INPUT}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className={NEU_LABEL}>Answer</label>
                                                                        <Textarea
                                                                            name={`faqs.${idx}.answer`}
                                                                            placeholder="Provide a detailed answer..."
                                                                            value={faq.answer}
                                                                            onChange={(e) =>
                                                                                setFieldValue(`faqs.${idx}.answer`, e.target.value)
                                                                            }
                                                                            className={`${NEU_INPUT} min-h-[120px] resize-none`}
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

                        {/* Confirm remove dialog */}
                        <AlertDialog
                            open={confirmOpen}
                            onOpenChange={(open) => {
                                if (!open) setPendingRemoveIdx(null);
                                setConfirmOpen(open);
                            }}
                        >
                            <AlertDialogContent className="rounded-2xl bg-[#E7E5E4] shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff] border border-white/60 max-w-sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className={`${NEU_HEADING} text-xl`}>
                                        Delete FAQ
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className={NEU_MUTED}>
                                        Are you sure you want to remove this FAQ? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex items-center justify-end gap-3 mt-4">
                                    <button type="button" onClick={closeConfirm} className={NEU_BTN_GHOST}>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleConfirmRemove(arrayHelpers)}
                                        className={`${NEU_BTN_DANGER} px-5 py-2 text-sm`}
                                    >
                                        <HiTrash className="w-4 h-4" />
                                        Delete
                                    </button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </FieldArray>
        </div>
    );
}