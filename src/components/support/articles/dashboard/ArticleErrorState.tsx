// components/article/ArticleErrorState.tsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { HiExclamationTriangle, HiMagnifyingGlass, HiSparkles } from 'react-icons/hi2';
import { ArticleListItem } from '@/types/article/article.types';

// ── Style tokens ──────────────────────────────────────────────
const S = {
    wrap:
        'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-6',
    iconWell:
        'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]',
    title:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-lg flex items-center gap-2',
    body:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/70 leading-relaxed',
    chipRow: 'flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#1E2938]/10',
    chip:
        'px-3 py-1.5 text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/70 ' +
        'bg-[#E7E5E4] rounded-lg shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] ' +
        'hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
        'cursor-pointer transition-all duration-200',
    bar: 'h-0.5 bg-[#FF2157]/40 rounded-full mt-4',
} as const;

const spring: Transition = { type: 'spring', stiffness: 300, damping: 28 };

type Props<T extends ArticleListItem = ArticleListItem> = {
    error?: string;
    items: T[];
    isLoading: boolean;
};

export default function ArticleErrorState<T extends ArticleListItem>({ error, items, isLoading }: Props<T>) {
    if (error) {
        return (
            <AnimatePresence>
                <motion.div
                    className={S.wrap}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.97 }}
                    transition={spring}
                >
                    <div className="flex items-start gap-4">
                        <motion.div
                            className={`${S.iconWell} bg-[#FF2157]/10 text-[#FF2157]`}
                            animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.05, 1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <HiExclamationTriangle className="h-5 w-5" />
                        </motion.div>

                        <div className="flex-1 space-y-1">
                            <p className={S.title}>
                                Something went wrong
                                <motion.span
                                    className="inline-block w-2 h-2 bg-[#FF2157] rounded-full"
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            </p>
                            <p className={S.body}>{error}</p>
                            <motion.div
                                className={S.bar}
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (!isLoading && items.length === 0) {
        return (
            <AnimatePresence>
                <motion.div
                    className={S.wrap}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.97 }}
                    transition={spring}
                >
                    <div className="flex items-start gap-4">
                        <motion.div
                            className={`${S.iconWell} bg-[#006666]/10 text-[#006666]`}
                            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                            transition={{
                                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                                scale: { duration: 2, repeat: Infinity, repeatDelay: 1 },
                            }}
                        >
                            <HiMagnifyingGlass className="h-5 w-5" />
                        </motion.div>

                        <div className="flex-1 space-y-1">
                            <p className={S.title}>
                                No articles found
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                    className="inline-flex"
                                >
                                    <HiSparkles className="h-4 w-4 text-[#006666]" />
                                </motion.span>
                            </p>
                            <p className={S.body}>
                                Try adjusting your filters, search terms, or sorting options to discover more content.
                            </p>

                            <div className={S.chipRow}>
                                {['Clear filters', 'Reset search', 'View all'].map((text, i) => (
                                    <motion.button
                                        key={text}
                                        className={S.chip}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.08 * i }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        {text}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return null;
}