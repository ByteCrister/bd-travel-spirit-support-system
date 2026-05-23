"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useCompanyStore } from "@/store/company/company.store";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_BTN_ICON =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_PAGE_ACTIVE =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#006666] text-white " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]";

const NEU_BTN_PAGE =
  "rounded-xl min-w-[2.25rem] h-9 px-2 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/70 " +
  "font-[family-name:var(--font-space-mono)] text-sm " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed " +
  "transition-all duration-200";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
// ─────────────────────────────────────────────────────────────

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
  const goToPage = async (p: number) => {
    if (p === page || loading) return;
    setPage(p);
    await fetchCompanies();
  };

  const getPageNumbers = (): (number | string)[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const nums: (number | string)[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);
    if (start > 2) nums.push("...");
    for (let i = start; i <= end; i++) nums.push(i);
    if (end < pages - 1) nums.push("...");
    nums.push(pages);
    return nums;
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`${NEU_CARD} flex flex-wrap items-center justify-between gap-4 p-4`}
    >
      {/* Left: First + Prev */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goFirst}
          disabled={page === 1 || loading}
          className={NEU_BTN_ICON}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev || loading}
          className={`${NEU_BTN_GHOST} flex items-center gap-1.5 px-4 h-9`}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>
      </div>

      {/* Centre: Page numbers */}
      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((num, i) => {
          if (num === "...") {
            return (
              <span key={`ellipsis-${i}`} className={NEU_MUTED}>
                …
              </span>
            );
          }
          const isActive = num === page;
          return (
            <motion.button
              key={num}
              type="button"
              onClick={() => goToPage(num as number)}
              disabled={loading}
              className={isActive ? NEU_BTN_PAGE_ACTIVE : NEU_BTN_PAGE}
              whileHover={!isActive ? { scale: 1.05 } : {}}
              whileTap={!isActive ? { scale: 0.95 } : {}}
              aria-label={`Go to page ${num}`}
              aria-current={isActive ? "page" : undefined}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${num}-${isActive}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.12 }}
                >
                  {num}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Right: Next + Last */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext || loading}
          className={`${NEU_BTN_GHOST} flex items-center gap-1.5 px-4 h-9`}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={goLast}
          disabled={page === pages || loading}
          className={NEU_BTN_ICON}
          aria-label="Go to last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
});
