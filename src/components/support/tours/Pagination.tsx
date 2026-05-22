// components/support/tours/Pagination.tsx
"use client";

import { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTourApproval } from "@/store/tour-approval.store";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_BTN_ICON =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_ICON_ACTIVE =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#006666] text-white " +
  "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_MONO =
  "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

export default function Pagination() {
  const { pagination, fetchTours, prefetchNextPage, filters, isLoading } =
    useTourApproval();

  const goTo = (page: number) => {
    fetchTours(filters || {}, page, pagination.limit);
    prefetchNextPage(filters || {}, page, pagination.limit);
  };

  const pageNumbers = useMemo(() => {
    const current = pagination.page;
    const total = pagination.totalPages || 1;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }

    return pages;
  }, [pagination.page, pagination.totalPages]);

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(NEU_CARD, "px-5 py-4")}
      aria-label="Pagination"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results info */}
        <div className="flex items-center gap-3">
          <div className={cn(NEU_SURFACE_INSET_SM, "px-3 py-1.5 rounded-xl")}>
            <span className={NEU_MUTED}>
              <span className={cn(NEU_MONO, "text-sm font-bold text-[#1E2938]")}>
                {pagination.total > 0 ? startItem : 0}
              </span>
              {" – "}
              <span className={cn(NEU_MONO, "text-sm font-bold text-[#1E2938]")}>
                {endItem}
              </span>
              {" of "}
              <span className={cn(NEU_MONO, "text-sm font-bold text-[#1E2938]")}>
                {pagination.total}
              </span>
            </span>
          </div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Loader2 className="w-4 h-4 animate-spin text-[#006666]" />
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* First */}
          <button
            className={NEU_BTN_ICON}
            onClick={() => goTo(1)}
            disabled={pagination.page <= 1 || isLoading}
            title="First page"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Prev */}
          <button
            className={cn(NEU_BTN_GHOST, "h-9 px-3 flex items-center gap-1 text-sm")}
            onClick={() => goTo(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1 || isLoading}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-[family-name:var(--font-space-mono)]">Prev</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, idx) => {
              if (pageNum === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className={cn(NEU_MUTED, "w-9 h-9 flex items-center justify-center")}
                  >
                    ···
                  </span>
                );
              }

              const isActive = pageNum === pagination.page;

              return (
                <motion.button
                  key={pageNum}
                  whileHover={!isActive ? { scale: 1.05 } : undefined}
                  whileTap={!isActive ? { scale: 0.95 } : undefined}
                  className={cn(
                    isActive ? NEU_BTN_ICON_ACTIVE : NEU_BTN_ICON,
                    "font-[family-name:var(--font-space-mono)] text-xs font-bold"
                  )}
                  onClick={() => !isActive && goTo(pageNum as number)}
                  disabled={isLoading || isActive}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Page ${pageNum}`}
                >
                  {pageNum}
                </motion.button>
              );
            })}
          </div>

          {/* Next */}
          <button
            className={cn(NEU_BTN_GHOST, "h-9 px-3 flex items-center gap-1 text-sm")}
            onClick={() =>
              goTo(
                Math.min(
                  pagination.totalPages || 1,
                  pagination.page + 1
                )
              )
            }
            disabled={
              pagination.page >= (pagination.totalPages || 1) || isLoading
            }
            aria-label="Next page"
          >
            <span className="hidden sm:inline text-xs font-[family-name:var(--font-space-mono)]">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last */}
          <button
            className={NEU_BTN_ICON}
            onClick={() => goTo(pagination.totalPages || 1)}
            disabled={
              pagination.page >= (pagination.totalPages || 1) || isLoading
            }
            title="Last page"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile page indicator */}
      <div className="sm:hidden mt-3 pt-3 border-t border-[#1E2938]/10 text-center">
        <span className={NEU_MUTED}>
          Page{" "}
          <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]">
            {pagination.page}
          </span>{" "}
          of{" "}
          <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]">
            {pagination.totalPages || 1}
          </span>
        </span>
      </div>
    </motion.section>
  );
}