'use client';

import { memo, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Row from './Row';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi2';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import { Thread } from './Thread';
import { Checkbox } from '../../ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { HiArrowUp } from 'react-icons/hi';

/** CONSTANTS **/
const PAGE_SIZE = 10;
const TTL = 60_000

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
    const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
    const [openAccordions, setOpenAccordions] = useState<string[]>([]); // track open accordions
    const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({}); // refs
    const vm = tableVM;

    const onToggleSelect = (id: string, checked: boolean) => {
        setSelectedIds((s) => ({ ...s, [id]: checked }));
    };

    const selectedList = useMemo(() => Object.keys(selectedIds).filter((id) => selectedIds[id]), [selectedIds]);

    const bulkBarVisible = selectedList.length > 0;

    const handleAccordionToggle = (rowId: string, open: boolean) => {
        toggleAccordion(rowId, open);
        setOpenAccordions((prev) => {
            if (open) {
                return [...prev.filter((id) => id !== rowId), rowId]; // add to end
            } else {
                return prev.filter((id) => id !== rowId); // remove when closed
            }
        });
        if (open) {
            const threadKey = threadKeyOf(rowId, null);
            const cache = threadCache[threadKey];
            const now = Date.now();
            const stale =
                !cache ||
                now - (cache?.fetchedAt ?? 0) >= TTL;
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
        if (ref) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-4">
            {/* Bulk action bar */}
            {bulkBarVisible && (
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-violet-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-violet-950/40 border border-blue-200/60 dark:border-blue-900/40 rounded-xl shadow-[0_2px_8px_0_rgba(59,130,246,0.15)] dark:shadow-[0_2px_8px_0_rgba(59,130,246,0.25)] animate-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg shadow-sm">
                                <HiCheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                    {selectedList.length} item{selectedList.length !== 1 ? 's' : ''} selected
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Ready for bulk actions
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                            onClick={() => {
                                // Approve all pending
                            }}
                        >
                            <HiCheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Approve</span>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                            onClick={() => {
                                // Reject selected
                            }}
                        >
                            <HiXCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Reject</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 hidden sm:flex"
                            onClick={() => {
                                // Export selected rows to CSV
                            }}
                        >
                            Export
                        </Button>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {vm.length === 0 && !tableLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                            No articles found
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Try resetting your filters to see more articles
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            // Reset filters
                        }}
                        className="mt-2"
                    >
                        Reset filters
                    </Button>
                </div>
            )}

            {/* Loading state */}
            {tableLoading && vm.length === 0 && (
                <div className="space-y-3">
                    {Array.from({ length: tableQuery.pageSize }).map((_, i) => (
                        <div key={`sk-${i}`} className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3)]">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
                                <div className="flex-1 space-y-2 min-w-0">
                                    <Skeleton className="h-4 w-full max-w-xs rounded" />
                                    <Skeleton className="h-3 w-32 rounded" />
                                </div>
                                <Skeleton className="h-10 w-20 rounded flex-shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Accordions */}
            {vm.length > 0 && (
                <Accordion type="single" collapsible className="space-y-3 w-full">
                    {vm.map((row) => (
                        <AccordionItem
                            key={row.id}
                            value={row.id}
                            ref={(el) => { accordionRefs.current[row.id] = el; }}
                            className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 bg-white dark:bg-slate-900 shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3)] dark:hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.4)]"
                        >
                            {/* Header row with checkbox and trigger */}
                            <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200 group">
                                {/* Left side: checkbox + article info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-shrink-0"
                                    >
                                        <Checkbox
                                            aria-label={`Select ${row.title}`}
                                            checked={!!selectedIds[row.id]}
                                            onCheckedChange={(checked) => onToggleSelect(row.id, !!checked)}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Row row={row} />
                                    </div>
                                </div>

                                {/* Right side: accordion toggle + metrics summary */}
                                <div className="flex items-center gap-3 flex-shrink-0">

                                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Comments
                                            </span>
                                            <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-sm min-w-[2.5rem] text-center shadow-sm">
                                                {row.totalComments}
                                            </span>
                                        </div>

                                        {row.pendingComments > 0 && (
                                            <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 shadow-sm font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mr-1.5 animate-pulse" />
                                                {row.pendingComments} pending
                                            </Badge>
                                        )}
                                    </div>
                                    <AccordionTrigger
                                        onClick={() => handleAccordionToggle(row.id, !row.accordion.isOpen)}
                                        className="flex-shrink-0 px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded focus-visible:outline-none"
                                    >
                                    </AccordionTrigger>
                                </div>
                            </div>

                            {/* Accordion content */}
                            <AccordionContent className="px-4 sm:px-6 py-5 border-t border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-50/50 to-slate-50 dark:from-slate-800/20 dark:to-slate-800/30">
                                {/* Full metrics on mobile */}
                                <div className="sm:hidden mb-4 space-y-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">Total comments</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{row.totalComments}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">Approved</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{row.approvedComments}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">Rejected</span>
                                        <span className="font-semibold text-red-600 dark:text-red-400">{row.rejectedComments}</span>
                                    </div>
                                </div>

                                {/* Desktop metrics grid */}
                                <div className="hidden sm:grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-200/80 dark:border-slate-800">
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 hover:shadow-md transition-shadow duration-200">
                                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                                            Approved
                                        </p>
                                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {row.approvedComments}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 p-4 rounded-lg border border-red-200/50 dark:border-red-800/30 hover:shadow-md transition-shadow duration-200">
                                        <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
                                            Rejected
                                        </p>
                                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                            {row.rejectedComments}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 p-4 rounded-lg border border-amber-200/50 dark:border-amber-800/30 hover:shadow-md transition-shadow duration-200">
                                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                                            Pending
                                        </p>
                                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                            {row.totalComments - row.approvedComments - row.rejectedComments}
                                        </p>
                                    </div>
                                </div>

                                {/* Thread comments */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
                                        Comments Thread
                                    </h4>
                                    <Thread articleId={row.id} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            {/* Scroll to Top button */}
            {openAccordions.length > 0 && (
                <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="relative">
                        {/* Main button */}
                        <Button
                            size="sm"
                            variant="default"
                            className="relative h-10 w-10 rounded-full p-0 
                   bg-blue-600 hover:bg-blue-700 
                   dark:bg-blue-500 dark:hover:bg-blue-600
                   shadow-md hover:shadow-lg 
                   transition-all duration-200 ease-out 
                   flex items-center justify-center"
                            onClick={scrollToTop}
                            aria-label="Scroll to top"
                        >
                            <HiArrowUp className="h-4 w-4 text-white transition-transform duration-200 group-hover:-translate-y-0.5" />
                        </Button>

                        {/* Tooltip */}
                        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium px-2 py-1 rounded-md shadow whitespace-nowrap">
                                Back to top
                                <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});