'use client';

import { useEffect } from 'react';
import { Stats } from '@/components/support/article-comments/Stats';
import { Toolbar } from '@/components/support/article-comments/Toolbar';
import { Table } from '@/components/support/article-comments/Table';
import { Pagination } from '@/components/support/article-comments/Pagination';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import { HiExclamationTriangle, HiArrowPath } from 'react-icons/hi2';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';

// ── Style constants (neumorphism) ──────────────────────────────
const S = {
    page: 'min-h-screen bg-[#E7E5E4] p-4 lg:p-6 xl:p-8',
    inner: 'mx-auto max-w-7xl px-1 py-2',
    heading: 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight text-4xl',
    subheading: 'font-[family-name:var(--font-jetbrains-mono)] text-base text-[#1E2938]/60 mt-1',
    headerBlock: 'mb-8 space-y-2',

    // sticky toolbar strip
    toolbarStrip:
        'sticky top-0 z-20 mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 ' +
        'bg-[#E7E5E4]/80 backdrop-blur-xl',

    // error alert
    alertWrap:
        'mb-6 rounded-2xl bg-[#E7E5E4] ' +
        'shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] ' +
        'border border-white/60 p-5',
    alertInner: 'flex items-start gap-4',
    alertIconWrap: 'p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]',
    alertTitle:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157] text-sm',
    alertBody:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/70 mt-1',
    alertReqId: 'mt-2 text-xs text-[#1E2938]/40',
    retryBtn:
        'mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-[family-name:var(--font-space-mono)] font-700 ' +
        'bg-[#FF2157]/10 text-[#FF2157] ' +
        'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200',

    // table section card
    tableCard:
        'mb-8 rounded-2xl bg-[#E7E5E4] ' +
        'shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] ' +
        'border border-white/60 overflow-hidden',

    paginationWrap: 'flex justify-center',
};

const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Article Comments', href: '/support/article-comments' },
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
        <main className={S.page}>
            <Breadcrumbs items={breadcrumbItems} />

            <div className={S.inner}>
                {/* Header */}
                <div className={S.headerBlock}>
                    <h1 className={S.heading}>Article Comments</h1>
                    <p className={S.subheading}>
                        Manage and moderate comments across your articles
                    </p>
                </div>

                {/* Stats */}
                <section aria-label="Comment statistics" className="mb-8">
                    <Stats />
                </section>

                {/* Toolbar sticky strip */}
                <section className={S.toolbarStrip}>
                    <Toolbar />
                </section>

                {/* Error alert */}
                {store.tableError && (
                    <div className={`${S.alertWrap} animate-in fade-in slide-in-from-top-4 duration-300`}>
                        <div className={S.alertInner}>
                            <div className={S.alertIconWrap}>
                                <HiExclamationTriangle className="h-5 w-5 text-[#FF2157]" />
                            </div>
                            <div className="flex-1">
                                <p className={S.alertTitle}>Failed to load comments</p>
                                <p className={S.alertBody}>
                                    {store.tableError.message}
                                </p>
                                {store.tableError.requestId && (
                                    <p className={S.alertReqId}>
                                        Request ID: {store.tableError.requestId}
                                    </p>
                                )}
                                <button
                                    onClick={() => store.fetchTable(true)}
                                    className={S.retryBtn}
                                >
                                    <HiArrowPath className="h-4 w-4" />
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table card */}
                <section className={S.tableCard}>
                    <Table />
                </section>

                {/* Pagination */}
                <section className={S.paginationWrap}>
                    <Pagination totalPages={totalPages} />
                </section>
            </div>
        </main>
    );
}