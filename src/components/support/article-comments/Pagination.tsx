'use client';

import { useEffect, useState } from 'react';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import {
    HiChevronLeft,
    HiChevronRight,
    HiArrowLongLeft,
    HiArrowLongRight,
} from 'react-icons/hi2';

// ── Style constants ────────────────────────────────────────────
const S = {
    root: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 px-4',

    info:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60',
    infoStrong:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]',
    dot: 'mx-2 text-[#1E2938]/30',

    controls: 'flex flex-wrap items-center justify-end gap-2',

    // raised button
    btn:
        'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] text-[#1E2938] ' +
        'bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
        'active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40',

    // inset page-input chip
    pageChip:
        'flex items-center gap-1.5 px-3 py-2 rounded-xl ' +
        'bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]',
    pageInput:
        'w-10 text-center bg-transparent border-none p-0 text-sm ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] ' +
        'focus:outline-none focus:ring-0',
    pageSep:
        'text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40',

    // keyboard hint
    hint: 'hidden lg:flex items-center gap-1 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40',
    kbd:
        'px-1.5 py-0.5 text-xs font-bold rounded-lg ' +
        'bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] ' +
        'text-[#1E2938]/60',
};

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

    const handleInputBlur = () => {
        const value = Number(inputValue);
        if (!isNaN(value)) setPage(value);
        else setInputValue(String(page));
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleInputBlur();
        if (e.key === 'Escape') setInputValue(String(page));
    };

    useEffect(() => { setInputValue(String(page)); }, [page]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); setPage(page - 1); }
            if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); setPage(page + 1); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, totalPages]);

    const isFirstPage = page === 1;
    const isLastPage = page >= totalPages;

    return (
        <div className={S.root}>
            {/* Info */}
            <p className={S.info}>
                <span className={S.infoStrong}>Page {Math.min(page, totalPages)}</span>
                <span className={S.dot}>•</span>
                {totalPages === 1 ? '1 page total' : `${totalPages} pages total`}
            </p>

            {/* Controls */}
            <div className={S.controls}>
                <button onClick={() => setPage(1)} disabled={isFirstPage} title="First page (Alt+Left)" className={S.btn}>
                    <HiArrowLongLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">First</span>
                </button>

                <button onClick={() => setPage(page - 1)} disabled={isFirstPage} title="Previous page" className={S.btn}>
                    <HiChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Prev</span>
                </button>

                <div className={S.pageChip}>
                    <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        aria-label="Jump to page"
                        className={S.pageInput}
                    />
                    <span className={S.pageSep}>/ {totalPages}</span>
                </div>

                <button onClick={() => setPage(page + 1)} disabled={isLastPage} title="Next page (Alt+Right)" className={S.btn}>
                    <span className="hidden sm:inline">Next</span>
                    <HiChevronRight className="h-4 w-4" />
                </button>

                <button onClick={() => setPage(totalPages)} disabled={isLastPage} title="Last page" className={S.btn}>
                    <span className="hidden sm:inline">Last</span>
                    <HiArrowLongRight className="h-4 w-4" />
                </button>
            </div>

            {/* Keyboard hint */}
            <div className={S.hint}>
                <kbd className={S.kbd}>Alt</kbd>
                <span>+</span>
                <kbd className={S.kbd}>←/→</kbd>
            </div>
        </div>
    );
}