'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OffsetPageRequest } from '@/types/article.types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiFileText,
} from 'react-icons/fi';
import { useArticleStore } from '@/store/useArticleStore';

type Props = {
  totalPages: number;
  totalCount?: number;
};

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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount || 0);

  return (
    <div
      className="
        relative flex flex-col sm:flex-row items-center justify-between gap-4
        pt-6 pb-4 px-5
        bg-gradient-to-br from-slate-50/60 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-900/40
        border border-slate-200/60 dark:border-slate-700/50
        rounded-2xl shadow-[0_0_25px_-10px_rgba(30,41,59,0.3)]
        backdrop-blur-md transition-all duration-300
      "
    >
      {/* Left side - Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <FiFileText className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {typeof totalCount === 'number' && totalCount > 0 ? (
              <>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {startItem}-{endItem}
                </span>
                <span className="text-slate-500 dark:text-slate-400"> of </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {totalCount.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-slate-400">No results</span>
            )}
          </span>
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Show:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="
              h-8 w-[75px] text-xs rounded-md
              border border-slate-300/70 dark:border-slate-700
              bg-white/60 dark:bg-slate-800/50
              hover:border-blue-400 focus:ring-1 focus:ring-blue-400
              transition-all
            ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center gap-2">
        {/* Buttons */}
        {[
          { icon: FiChevronsLeft, label: 'First', action: () => go(1), hide: true },
          { icon: FiChevronLeft, label: 'Prev', action: () => go(page - 1) },
        ].map(({ icon: Icon, label, action, hide }, i) => (
          <motion.div key={i} whileTap={{ scale: 0.92 }}>
            <Button
              variant="outline"
              size="icon"
              className={`
                h-9 w-9 rounded-lg 
                border border-slate-300/70 dark:border-slate-700 
                bg-white/60 dark:bg-slate-800/50
                hover:bg-blue-50 dark:hover:bg-slate-700/70 
                hover:text-blue-600 dark:hover:text-blue-400 
                transition-all
                ${hide ? 'hidden sm:flex' : ''}
              `}
              disabled={!canPrev || isLoading}
              onClick={action}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}

        {/* Page numbers */}
        <div className="hidden md:flex items-center gap-1">
          <AnimatePresence mode="wait">
            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={idx} className="px-2 text-slate-400 dark:text-slate-500">...</span>
              ) : (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="icon"
                    variant={page === p ? 'default' : 'ghost'}
                    className={`
                      h-9 w-9 rounded-lg font-medium 
                      transition-all duration-200
                      ${
                        page === p
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700/70 hover:text-blue-600 dark:hover:text-blue-400'
                      }
                    `}
                    disabled={isLoading}
                    onClick={() => go(p as number)}
                  >
                    {p}
                  </Button>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Mobile indicator */}
        <div className="md:hidden px-3 py-1.5 bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/60 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
          {page} / {totalPages || 1}
        </div>

        {/* Next Buttons */}
        {[
          { icon: FiChevronRight, label: 'Next', action: () => go(page + 1) },
          { icon: FiChevronsRight, label: 'Last', action: () => go(totalPages), hide: true },
        ].map(({ icon: Icon, label, action, hide }, i) => (
          <motion.div key={i} whileTap={{ scale: 0.92 }}>
            <Button
              variant="outline"
              size="icon"
              className={`
                h-9 w-9 rounded-lg
                border border-slate-300/70 dark:border-slate-700
                bg-white/60 dark:bg-slate-800/50
                hover:bg-blue-50 dark:hover:bg-slate-700/70
                hover:text-blue-600 dark:hover:text-blue-400
                transition-all
                ${hide ? 'hidden sm:flex' : ''}
              `}
              disabled={!canNext || isLoading}
              onClick={action}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-100/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-5 py-2 rounded-full border border-slate-300/70 dark:border-slate-700/70 shadow-md"
            >
              <div className="w-4 h-4 border-[2.5px] border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Loading...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
