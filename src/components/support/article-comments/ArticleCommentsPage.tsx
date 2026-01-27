'use client';

import { useEffect } from 'react';
import { Stats } from '@/components/support/article-comments/Stats';
import { Toolbar } from '@/components/support/article-comments/Toolbar';
import { Table } from '@/components/support/article-comments/Table';
import { Pagination } from '@/components/support/article-comments/Pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import { HiExclamationTriangle, HiArrowPath } from 'react-icons/hi2';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Articles Comments", href: "/support/article-comments" },
];

export default function ArticleCommentsPage() {
    const store = useArticleCommentsStore();

    useEffect(() => {
        store.restoreTableQueryFromLS();
        store.fetchStats();
        store.fetchTable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const groupKey = store.groupKeyOf(store.tableQuery.sort, store.tableQuery.filters);
    const totalPages = store.tableGroupCache[groupKey]?.meta.pagination.totalPages ?? 1;

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="mx-auto max-w-7xl px-1 py-2">
                {/* Header */}
                <div className="mb-8 space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Article Comments
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Manage and moderate comments across your articles
                    </p>
                </div>

                {/* Stats Section */}
                <section aria-label="Comment statistics" className="mb-8">
                    <Stats />
                </section>

                {/* Toolbar Section */}
                <section className="sticky top-0 z-20 mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-gradient-to-b from-white/80 via-white/60 to-transparent dark:from-slate-900/80 dark:via-slate-900/60 dark:to-transparent backdrop-blur-xl supports-[backdrop-filter]:from-white/70 supports-[backdrop-filter]:via-white/50 supports-[backdrop-filter]:dark:from-slate-900/70 supports-[backdrop-filter]:dark:via-slate-900/50">
                    <Toolbar />
                </section>

                {/* Error Alert */}
                {store.tableError && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <Alert
                            variant="destructive"
                            className="border-red-300/50 dark:border-red-900/50 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 shadow-sm"
                        >
                            <div className="flex items-start gap-4">
                                <HiExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <AlertTitle className="text-red-900 dark:text-red-200 font-semibold">
                                        Failed to load comments
                                    </AlertTitle>
                                    <AlertDescription className="text-red-800/80 dark:text-red-300/80 text-sm mt-1">
                                        {store.tableError.message}
                                        {store.tableError.requestId && (
                                            <div className="mt-2 text-xs opacity-70">
                                                Request ID: {store.tableError.requestId}
                                            </div>
                                        )}
                                    </AlertDescription>
                                    <Button
                                        size="sm"
                                        onClick={() => store.fetchTable(true)}
                                        className="mt-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white gap-2"
                                    >
                                        <HiArrowPath className="h-4 w-4" />
                                        Try again
                                    </Button>
                                </div>
                            </div>
                        </Alert>
                    </div>
                )}

                {/* Table Section */}
                <section className="mb-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <Table />
                </section>

                {/* Pagination Section */}
                <section className="flex justify-center">
                    <Pagination totalPages={totalPages} />
                </section>
            </div>
        </main>
    );
}