// components/article/ArticleDashboard.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HiSparkles } from 'react-icons/hi2';
import ArticleStatsGrid from './ArticleStatsGrid';
import ArticleToolbar from './ArticleToolbar';
import ArticleTable from './ArticleTable';
import ArticlePagination from './ArticlePagination';
import ArticleRefreshButton from './ArticleRefreshButton';
import ArticleErrorState from './ArticleErrorState';
import { useArticleStore } from '@/store/article.store';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Articles", href: "/support/articles" },
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="max-w-7xl mx-auto space-y-8 p-1">
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <HiSparkles className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                Articles Dashboard
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Manage and monitor your content
                            </p>
                        </div>
                    </div>
                    <ArticleRefreshButton />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <ArticleStatsGrid
                        stats={stats}
                        isLoading={loading.isLoadingStats}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                        <CardHeader className="space-y-4 border-b bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                                Manage Articles
                            </CardTitle>
                            <ArticleToolbar />
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <ArticleTable
                                items={listItems}
                                isLoading={loading.isLoadingList}
                            />
                            <ArticlePagination totalPages={totalPages ?? 1} totalCount={totalCount} />
                        </CardContent>
                    </Card>
                </motion.div>

                <ArticleErrorState error={error} items={listItems} isLoading={loading.isLoadingList} />
            </div>
        </div>
    );
}