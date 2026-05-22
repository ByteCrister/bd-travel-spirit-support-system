// components/article/ArticleRefreshButton.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { HiArrowPath } from 'react-icons/hi2';
import { useArticleStore } from '@/store/article/article.store';

// ── Style tokens ──────────────────────────────────────────────
const S = {
    btn:
        'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ' +
        'font-[family-name:var(--font-space-mono)] text-sm font-bold tracking-wide ' +
        'bg-[#E7E5E4] text-[#1E2938] ' +
        'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
        'active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ' +
        'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40',
} as const;

export default function ArticleRefreshButton() {
    const invalidateStats = useArticleStore((s) => s.invalidateStats);
    const invalidateList = useArticleStore((s) => s.invalidateList);
    const fetchArticleStats = useArticleStore((s) => s.fetchArticleStats);
    const fetchArticleList = useArticleStore((s) => s.fetchArticleList);
    const loading = useArticleStore((s) => s.loading);

    const [isRotating, setIsRotating] = React.useState(false);
    const isLoading = loading.isLoadingList || loading.isLoadingStats;

    const onRefresh = async () => {
        setIsRotating(true);
        invalidateStats();
        invalidateList();
        await Promise.all([fetchArticleStats(true), fetchArticleList()]);
        setTimeout(() => setIsRotating(false), 600);
    };

    return (
        <motion.button
            className={S.btn}
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh data"
            whileTap={{ scale: 0.97 }}
        >
            <motion.span
                animate={{ rotate: isRotating || isLoading ? 360 : 0 }}
                transition={{
                    duration: 0.6,
                    ease: 'easeInOut',
                    repeat: isLoading ? Infinity : 0,
                }}
                className="flex items-center"
            >
                <HiArrowPath className="h-4 w-4" />
            </motion.span>
            Refresh
        </motion.button>
    );
}