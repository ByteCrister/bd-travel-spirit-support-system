'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/store/company/company.store';

/**
 * Props for CompanyPagination.
 * @property page - Current page (1-based).
 * @property pages - Total pages.
 */
export interface CompanyPaginationProps {
    page: number;
    pages: number;
}

export const CompanyPagination = memo(function CompanyPagination({
    page,
    pages,
}: CompanyPaginationProps) {
    const { setPage, fetchCompanies, loading } = useCompanyStore();

    const canPrev = page > 1;
    const canNext = page < pages;

    const goPrev = async () => {
        if (!canPrev || loading) return;
        setPage(page - 1);
        await fetchCompanies();
    };

    const goNext = async () => {
        if (!canNext || loading) return;
        setPage(page + 1);
        await fetchCompanies();
    };

    const goFirst = async () => {
        if (page === 1 || loading) return;
        setPage(1);
        await fetchCompanies();
    };

    const goLast = async () => {
        if (page === pages || loading) return;
        setPage(pages);
        await fetchCompanies();
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const delta = 1; // Pages to show on each side of current page

        if (pages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= pages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);

            // Calculate range around current page
            const start = Math.max(2, page - delta);
            const end = Math.min(pages - 1, page + delta);

            // Add ellipsis after first page if needed
            if (start > 2) {
                pageNumbers.push('...');
            }

            // Add pages around current page
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            // Add ellipsis before last page if needed
            if (end < pages - 1) {
                pageNumbers.push('...');
            }

            // Always show last page
            pageNumbers.push(pages);
        }

        return pageNumbers;
    };

    const goToPage = async (targetPage: number) => {
        if (targetPage === page || loading) return;
        setPage(targetPage);
        await fetchCompanies();
    };

    return (
        <nav
            role="navigation"
            aria-label="Pagination"
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
        >
            {/* Left side - Previous navigation */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goFirst}
                    disabled={page === 1 || loading}
                    className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-500 disabled:opacity-50 transition-all"
                    aria-label="Go to first page"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={goPrev}
                    disabled={!canPrev || loading}
                    className="h-9 px-4 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-500 disabled:opacity-50 transition-all group"
                    aria-label="Go to previous page"
                >
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                </Button>
            </div>

            {/* Center - Page numbers */}
            <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, index) => {
                    if (pageNum === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 text-slate-400 dark:text-slate-600"
                            >
                                ...
                            </span>
                        );
                    }

                    const isActive = pageNum === page;
                    return (
                        <motion.button
                            key={pageNum}
                            type="button"
                            onClick={() => goToPage(pageNum as number)}
                            disabled={loading}
                            className={`
                                h-9 min-w-[2.25rem] px-3 rounded-lg font-medium text-sm transition-all
                                ${isActive
                                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            whileHover={!isActive ? { scale: 1.05 } : {}}
                            whileTap={!isActive ? { scale: 0.95 } : {}}
                            aria-label={`Go to page ${pageNum}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={`page-${pageNum}-${isActive}`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {pageNum}
                                </motion.span>
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>

            {/* Right side - Next navigation */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={goNext}
                    disabled={!canNext || loading}
                    className="h-9 px-4 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-500 disabled:opacity-50 transition-all group"
                    aria-label="Go to next page"
                >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goLast}
                    disabled={page === pages || loading}
                    className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-500 disabled:opacity-50 transition-all"
                    aria-label="Go to last page"
                >
                    <ChevronsRight className="w-4 h-4" />
                </Button>
            </div>
        </nav>
    );
});