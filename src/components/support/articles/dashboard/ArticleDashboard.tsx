// components/article/ArticleDashboard.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';
import ArticleStatsGrid from './ArticleStatsGrid';
import ArticleToolbar from './ArticleToolbar';
import ArticleTable from './ArticleTable';
import ArticlePagination from './ArticlePagination';
import ArticleRefreshButton from './ArticleRefreshButton';
import ArticleErrorState from './ArticleErrorState';
import { useArticleStore } from '@/store/article/article.store';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';

// ── Style tokens ──────────────────────────────────────────────
const S = {
    page: 'min-h-screen bg-[#E7E5E4] p-4 lg:p-6 xl:p-8',
    inner: 'max-w-7xl mx-auto space-y-8',
    headerRow: 'flex items-center justify-between flex-wrap gap-4',
    iconWell:
        'p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] flex items-center justify-center',
    heading:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight text-2xl lg:text-3xl',
    subheading:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50 mt-0.5',
    card:
        'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 overflow-hidden',
    cardHeader:
        'px-6 py-5 border-b border-[#1E2938]/10 flex items-center gap-3',
    cardAccent:
        'w-1 h-6 bg-[#006666] rounded-full flex-shrink-0',
    cardTitle:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-lg',
    cardBody: 'p-6 space-y-6',
} as const;

const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Articles', href: '/support/articles' },
];

export default function ArticleDashboard() {
    const fetchArticleStats = useArticleStore((s) => s.fetchArticleStats);
    const fetchArticleList = useArticleStore((s) => s.fetchArticleList);
    const loading = useArticleStore((s) => s.loading);
    const error = useArticleStore((s) => s.error);
    const stats = useArticleStore((s) => s.stats);
    const listItems = useArticleStore((s) => s.listItems);
    const totalPages = useArticleStore((s) => s.totalPages);
    const totalCount = useArticleStore((s) => s.totalCount);

    React.useEffect(() => {
        fetchArticleStats();
        fetchArticleList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={S.page}>
            <Breadcrumbs items={breadcrumbItems} />

            <div className={S.inner}>
                {/* Header */}
                <motion.div
                    className={S.headerRow}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            className={S.iconWell}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            <HiSparkles className="w-6 h-6 text-[#006666]" />
                        </motion.div>
                        <div>
                            <h1 className={S.heading}>Articles Dashboard</h1>
                            <p className={S.subheading}>Manage and monitor your content</p>
                        </div>
                    </div>
                    <ArticleRefreshButton />
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <ArticleStatsGrid stats={stats} isLoading={loading.isLoadingStats} />
                </motion.div>

                {/* Main card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={S.card}
                >
                    <div className={S.cardHeader}>
                        <span className={S.cardAccent} />
                        <h2 className={S.cardTitle}>Manage Articles</h2>
                    </div>

                    <div className="px-6 py-5 border-b border-[#1E2938]/10">
                        <ArticleToolbar />
                    </div>

                    <div className={S.cardBody}>
                        <ArticleTable items={listItems} isLoading={loading.isLoadingList} />
                        <ArticlePagination totalPages={totalPages ?? 1} totalCount={totalCount} />
                    </div>
                </motion.div>

                <ArticleErrorState error={error} items={listItems} isLoading={loading.isLoadingList} />
            </div>
        </div>
    );
}