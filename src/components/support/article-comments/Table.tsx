'use client';

import { memo, useRef, useState } from 'react';
import Row from './Row';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import { Thread } from './Thread';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { HiArrowUp } from 'react-icons/hi';

/** CONSTANTS **/
const PAGE_SIZE = 10;
const TTL = 60_000;

// ── Style constants ────────────────────────────────────────────
const S = {
    root: 'space-y-3',

    // empty state
    emptyWrap:
        'flex flex-col items-center justify-center gap-5 py-20 px-6 text-center',
    emptyIconWell:
        'p-5 rounded-2xl bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]',
    emptyTitle:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-base',
    emptyBody:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50 mt-1',
    emptyBtn:
        'mt-2 px-5 py-2.5 rounded-xl text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] ' +
        'bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
        'transition-all duration-200',

    // skeleton rows
    skeletonRow:
        'rounded-2xl p-4 bg-[#E7E5E4] ' +
        'shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] border border-white/60',
    skeletonLine: 'rounded-lg bg-[#d0cecd] animate-pulse',

    // accordion item
    accordionItem:
        'rounded-2xl overflow-hidden bg-[#E7E5E4] border border-white/60 ' +
        'shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] ' +
        'hover:shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] ' +
        'hover:-translate-y-0.5 transition-all duration-200',

    // accordion header row
    accordionHeader:
        'flex items-center justify-between w-full px-4 sm:px-6 py-4 ' +
        'hover:bg-white/30 transition-colors duration-150 group',

    // metrics badges (raised chips)
    metricChip:
        'inline-flex items-center gap-1.5 font-[family-name:var(--font-space-mono)] text-xs font-bold ' +
        'px-2.5 py-1 rounded-lg bg-[#E7E5E4] text-[#1E2938] ' +
        'shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]',
    metricLabel:
        'text-xs font-[family-name:var(--font-space-mono)] text-[#1E2938]/50 uppercase tracking-widest',

    pendingBadge:
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ' +
        'font-[family-name:var(--font-space-mono)] font-bold ' +
        'bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]',

    // accordion content area
    accordionContent:
        'px-4 sm:px-6 py-5 border-t border-[#1E2938]/10 bg-[#E7E5E4]/60',

    // metrics grid inside accordion
    metricsGrid: 'hidden sm:grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-[#1E2938]/10',
    metricCard:
        'rounded-xl p-4 bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]',
    metricCardLabel:
        'text-xs font-bold font-[family-name:var(--font-space-mono)] uppercase tracking-widest mb-2',
    metricCardValue:
        'text-3xl font-bold font-[family-name:var(--font-space-mono)]',

    // mobile metrics
    metricsListMobile: 'sm:hidden mb-4 space-y-2 pb-4 border-b border-[#1E2938]/10',
    metricsListRow: 'flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-white/30 transition-colors',
    metricsListKey: 'font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60',
    metricsListVal: 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]',

    threadTitle:
        'text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] mb-4 flex items-center gap-2',
    threadAccent: 'w-1 h-4 bg-[#006666] rounded-full',

    // FAB
    fab:
        'fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 ' +
        'animate-in fade-in slide-in-from-bottom-4 duration-300',
    fabBtn:
        'h-11 w-11 rounded-2xl flex items-center justify-center ' +
        'bg-[#006666] text-white ' +
        'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
        'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] ' +
        'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
        'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50',
};

export const Table = memo(function Table() {
    const {
        fetchRootComments,
        toggleAccordion,
        threadKeyOf,
        threadCache,
        tableVM,
        tableQuery,
        tableLoading,
    } = useArticleCommentsStore();

    const [openAccordions, setOpenAccordions] = useState<string[]>([]);
    const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const vm = tableVM;

    const handleAccordionToggle = (rowId: string, open: boolean) => {
        toggleAccordion(rowId, open);
        setOpenAccordions((prev) =>
            open ? [...prev.filter((id) => id !== rowId), rowId] : prev.filter((id) => id !== rowId)
        );
        if (open) {
            const threadKey = threadKeyOf(rowId, null);
            const cache = threadCache[threadKey];
            const now = Date.now();
            const stale = !cache || now - (cache?.fetchedAt ?? 0) >= TTL;
            if (stale) {
                fetchRootComments({
                    articleId: rowId,
                    pageSize: PAGE_SIZE,
                    sort: { key: 'createdAt', direction: 'desc' },
                });
            }
        }
    };

    const scrollToTop = () => {
        const lastOpenId = openAccordions[openAccordions.length - 1];
        const ref = lastOpenId ? accordionRefs.current[lastOpenId] : null;
        if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={S.root}>
            {/* ── Empty state ── */}
            {vm.length === 0 && !tableLoading && (
                <div className={S.emptyWrap}>
                    <div className={S.emptyIconWell}>
                        <svg className="w-8 h-8 text-[#1E2938]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className={S.emptyTitle}>No articles found</p>
                        <p className={S.emptyBody}>Try resetting your filters to see more articles</p>
                    </div>
                    <button className={S.emptyBtn} onClick={() => { }}>Reset filters</button>
                </div>
            )}

            {/* ── Loading skeletons ── */}
            {tableLoading && vm.length === 0 && (
                <div className="space-y-3">
                    {Array.from({ length: tableQuery.pageSize }).map((_, i) => (
                        <div key={`sk-${i}`} className={S.skeletonRow}>
                            <div className="flex items-center gap-4">
                                <div className={`${S.skeletonLine} h-5 w-5 flex-shrink-0`} />
                                <div className="flex-1 space-y-2 min-w-0">
                                    <div className={`${S.skeletonLine} h-4 w-full max-w-xs`} />
                                    <div className={`${S.skeletonLine} h-3 w-32`} />
                                </div>
                                <div className={`${S.skeletonLine} h-8 w-20 flex-shrink-0`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Accordions ── */}
            {vm.length > 0 && (
                <Accordion type="single" collapsible className="space-y-3 w-full">
                    {vm.map((row) => (
                        <AccordionItem
                            key={row.id}
                            value={row.id}
                            ref={(el) => { accordionRefs.current[row.id] = el; }}
                            className={S.accordionItem}
                        >
                            {/* Header */}
                            <div className={S.accordionHeader}>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <Row row={row} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="hidden sm:flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className={S.metricLabel}>Comments</span>
                                            <span className={S.metricChip}>{row.totalComments}</span>
                                        </div>
                                        {row.pendingComments > 0 && (
                                            <span className={S.pendingBadge}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#FE9900] animate-pulse" />
                                                {row.pendingComments} pending
                                            </span>
                                        )}
                                    </div>

                                    <AccordionTrigger
                                        onClick={() => handleAccordionToggle(row.id, !row.accordion.isOpen)}
                                        className="flex-shrink-0 px-2 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <AccordionContent className={S.accordionContent}>
                                {/* Mobile metrics */}
                                <div className={S.metricsListMobile}>
                                    {[
                                        { label: 'Total comments', value: row.totalComments, color: 'text-[#1E2938]' },
                                        { label: 'Approved', value: row.approvedComments, color: 'text-[#00A63D]' },
                                        { label: 'Rejected', value: row.rejectedComments, color: 'text-[#FF2157]' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className={S.metricsListRow}>
                                            <span className={S.metricsListKey}>{label}</span>
                                            <span className={`${S.metricsListVal} ${color}`}>{value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop metrics grid */}
                                <div className={S.metricsGrid}>
                                    <div className={S.metricCard}>
                                        <p className={`${S.metricCardLabel} text-[#00A63D]`}>Approved</p>
                                        <p className={`${S.metricCardValue} text-[#00A63D]`}>{row.approvedComments}</p>
                                    </div>
                                    <div className={S.metricCard}>
                                        <p className={`${S.metricCardLabel} text-[#FF2157]`}>Rejected</p>
                                        <p className={`${S.metricCardValue} text-[#FF2157]`}>{row.rejectedComments}</p>
                                    </div>
                                    <div className={S.metricCard}>
                                        <p className={`${S.metricCardLabel} text-[#FE9900]`}>Pending</p>
                                        <p className={`${S.metricCardValue} text-[#FE9900]`}>
                                            {row.totalComments - row.approvedComments - row.rejectedComments}
                                        </p>
                                    </div>
                                </div>

                                {/* Thread */}
                                <div>
                                    <h4 className={S.threadTitle}>
                                        <span className={S.threadAccent} />
                                        Comments Thread
                                    </h4>
                                    <Thread articleId={row.id} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            {/* ── FAB scroll-to-top ── */}
            {openAccordions.length > 0 && (
                <div className={S.fab}>
                    <button onClick={scrollToTop} className={S.fabBtn} aria-label="Scroll to top">
                        <HiArrowUp className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
});