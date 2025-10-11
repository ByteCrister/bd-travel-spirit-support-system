// components/article-comments/Pagination.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useArticleCommentsStore } from '@/store/useArticleCommentsStore';
import {
    HiChevronLeft,
    HiChevronRight,
    HiArrowLongLeft,
    HiArrowLongRight,
} from 'react-icons/hi2';

export function Pagination({ totalPages }: { totalPages: number }) {
    const store = useArticleCommentsStore();
    const page = store.tableQuery.page;
    const [inputValue, setInputValue] = useState(String(page));

    const setPage = (p: number) => {
        const safe = Math.max(1, Math.min(totalPages, p));
        store.setTableQuery({ page: safe });
        store.fetchTable();
        setInputValue(String(safe));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const value = Number(inputValue);
        if (!isNaN(value)) {
            setPage(value);
        } else {
            setInputValue(String(page));
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
        if (e.key === 'Escape') {
            setInputValue(String(page));
        }
    };

    useEffect(() => {
        setInputValue(String(page));
    }, [page]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                setPage(page - 1);
            }
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                setPage(page + 1);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, totalPages]);

    const isFirstPage = page === 1;
    const isLastPage = page >= totalPages;
    const pageRange = `${Math.min(page, totalPages)} / ${totalPages}`;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 px-2">
            {/* Info section */}
            <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-white">
                    Page {pageRange}
                </span>
                <span className="mx-2">•</span>
                <span>{totalPages === 1 ? '1 page total' : `${totalPages} pages total`}</span>
            </div>

            {/* Controls section */}
            <div className="flex flex-wrap items-center justify-end gap-2">
                {/* First button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={isFirstPage}
                    title="Go to first page (Alt+Left)"
                    className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed gap-1"
                >
                    <HiArrowLongLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">First</span>
                </Button>

                {/* Previous button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={isFirstPage}
                    title="Previous page"
                    className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed gap-1"
                >
                    <HiChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Prev</span>
                </Button>

                {/* Page input */}
                <div className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg">
                    <Input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        aria-label="Jump to page"
                        className="w-12 text-center border-0 bg-transparent p-0 text-sm font-medium text-slate-900 dark:text-white focus:ring-0 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        / {totalPages}
                    </span>
                </div>

                {/* Next button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={isLastPage}
                    title="Next page (Alt+Right)"
                    className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed gap-1"
                >
                    <span className="hidden sm:inline">Next</span>
                    <HiChevronRight className="h-4 w-4" />
                </Button>

                {/* Last button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    disabled={isLastPage}
                    title="Go to last page (Alt+Right)"
                    className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed gap-1"
                >
                    <span className="hidden sm:inline">Last</span>
                    <HiArrowLongRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Keyboard hints */}
            <div className="text-xs text-slate-500 dark:text-slate-400 hidden lg:block whitespace-nowrap">
                <kbd className="px-2 py-0.5 mx-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                    Alt
                </kbd>
                <span>+</span>
                <kbd className="px-2 py-0.5 mx-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                    ←/→
                </kbd>
            </div>
        </div>
    );
}