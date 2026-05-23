"use client";

// components/travelers/TravelerDetailsPagination.tsx

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_BTN_NAV = [
  "h-8 inline-flex items-center gap-1.5 px-3 rounded-xl",
  "font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-wide",
  "bg-[#E7E5E4] text-[#1E2938]",
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]",
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff]",
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40",
].join(" ");

const NEU_PAGE_INDICATOR = [
  "px-4 py-1.5 rounded-xl",
  "font-[family-name:var(--font-jetbrains-mono)] text-xs font-semibold text-[#1E2938] tabular-nums",
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
].join(" ");

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TravelerDetailsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={NEU_BTN_NAV}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Previous
      </button>

      <span className={NEU_PAGE_INDICATOR}>
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(NEU_BTN_NAV)}
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
