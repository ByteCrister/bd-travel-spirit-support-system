// components/article/ArticlePagination.tsx
'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OffsetPageRequest } from '@/types/article/article.types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiFileText,
} from 'react-icons/fi';
import { useArticleStore } from '@/store/article/article.store';

// ── Style tokens ──────────────────────────────────────────────
const S = {
  container:
    'relative flex flex-col sm:flex-row items-center justify-between gap-4 p-5 ' +
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60',
  iconBtn:
    'w-9 h-9 rounded-xl flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 ' +
    'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
    'hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40',
  pageBtn:
    'w-9 h-9 rounded-xl flex items-center justify-center text-sm ' +
    'font-[family-name:var(--font-jetbrains-mono)] font-bold text-[#1E2938]/70 ' +
    'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
    'hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed ' +
    'transition-all duration-200',
  pageBtnActive:
    'w-9 h-9 rounded-xl flex items-center justify-center text-sm ' +
    'font-[family-name:var(--font-jetbrains-mono)] font-bold text-white ' +
    'bg-[#006666] shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]',
  infoText:
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/70',
  accent: 'text-[#006666] font-bold',
  label:
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/50 uppercase tracking-widest hidden sm:inline',
  selectTrigger:
    'h-8 w-[72px] text-xs rounded-lg border-none ' +
    'bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'font-[family-name:var(--font-jetbrains-mono)] ' +
    'focus:ring-2 focus:ring-[#006666]/40 transition-all',
  mobilePill:
    'md:hidden px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-jetbrains-mono)] font-bold text-[#1E2938]/70 ' +
    'bg-[#E7E5E4] shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]',
  loadingOverlay:
    'absolute inset-0 bg-[#E7E5E4]/70 backdrop-blur-sm rounded-2xl flex items-center justify-center',
  loadingPill:
    'flex items-center gap-2 px-5 py-2.5 rounded-full ' +
    'bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/60',
  spinner: 'w-4 h-4 border-2 border-[#006666] border-t-transparent rounded-full animate-spin',
  spinnerLabel:
    'text-sm font-[family-name:var(--font-jetbrains-mono)] font-bold text-[#1E2938]/70',
} as const;

type Props = { totalPages: number; totalCount?: number };

export default function ArticlePagination({ totalPages, totalCount }: Props) {
  const { currentPagination, setPagination, fetchArticleList } = useArticleStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const page = currentPagination.page ?? 1;
  const pageSize = currentPagination.pageSize ?? 20;

  const go = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setIsLoading(true);
    const pg: OffsetPageRequest = { page: nextPage, pageSize };
    setPagination(pg);
    await fetchArticleList({ pagination: pg });
    setIsLoading(false);
  };

  const handlePageSizeChange = async (newSize: string) => {
    setIsLoading(true);
    const pg: OffsetPageRequest = { page: 1, pageSize: parseInt(newSize) };
    setPagination(pg);
    await fetchArticleList({ pagination: pg });
    setIsLoading(false);
  };

  const canPrev = page > 1;
  const canNext = totalPages ? page < totalPages : true;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('…');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount || 0);

  return (
    <div className={S.container}>
      {/* Left – info + page size */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-[#006666]" />
          <span className={S.infoText}>
            {typeof totalCount === 'number' && totalCount > 0 ? (
              <>
                <span className={S.accent}>{startItem}–{endItem}</span>
                {' of '}
                <span className="font-bold text-[#1E2938]">{totalCount.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-[#1E2938]/40">No results</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={S.label}>Show:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange} disabled={isLoading}>
            <SelectTrigger className={S.selectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right – navigation */}
      <div className="flex items-center gap-1.5">
        {/* First */}
        <motion.button
          className={`${S.iconBtn} hidden sm:flex`}
          disabled={!canPrev || isLoading}
          onClick={() => go(1)}
          aria-label="First page"
          whileTap={{ scale: 0.93 }}
        >
          <FiChevronsLeft className="h-4 w-4" />
        </motion.button>

        {/* Prev */}
        <motion.button
          className={S.iconBtn}
          disabled={!canPrev || isLoading}
          onClick={() => go(page - 1)}
          aria-label="Previous page"
          whileTap={{ scale: 0.93 }}
        >
          <FiChevronLeft className="h-4 w-4" />
        </motion.button>

        {/* Page numbers – desktop */}
        <div className="hidden md:flex items-center gap-1">
          <AnimatePresence mode="wait">
            {getPageNumbers().map((p, idx) =>
              p === '…' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40 text-sm"
                >
                  …
                </span>
              ) : (
                <motion.button
                  key={p}
                  className={page === p ? S.pageBtnActive : S.pageBtn}
                  disabled={isLoading}
                  onClick={() => go(p as number)}
                  aria-label={`Page ${p}`}
                  aria-current={page === p ? 'page' : undefined}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  whileTap={{ scale: 0.93 }}
                >
                  {p}
                </motion.button>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Page indicator – mobile */}
        <div className={S.mobilePill}>{page} / {totalPages || 1}</div>

        {/* Next */}
        <motion.button
          className={S.iconBtn}
          disabled={!canNext || isLoading}
          onClick={() => go(page + 1)}
          aria-label="Next page"
          whileTap={{ scale: 0.93 }}
        >
          <FiChevronRight className="h-4 w-4" />
        </motion.button>

        {/* Last */}
        <motion.button
          className={`${S.iconBtn} hidden sm:flex`}
          disabled={!canNext || isLoading}
          onClick={() => go(totalPages)}
          aria-label="Last page"
          whileTap={{ scale: 0.93 }}
        >
          <FiChevronsRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className={S.loadingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={S.loadingPill}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className={S.spinner} />
              <span className={S.spinnerLabel}>Loading…</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}