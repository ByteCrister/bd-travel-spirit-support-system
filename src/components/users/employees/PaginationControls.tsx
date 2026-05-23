"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";

const NEU_BTN_PRIMARY =
  "inline-flex items-center gap-1.5 rounded-xl bg-[#006666] text-white text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold px-4 py-2 " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_GHOST =
  "inline-flex items-center gap-1.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-space-mono)] px-4 py-2 " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_INPUT_SM =
  "h-9 w-28 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 px-3";

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_PAGE_CHIP =
  "inline-flex min-w-[2rem] items-center justify-center rounded-lg px-2.5 py-1 " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#006666] " +
  "bg-[#006666]/10 shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]";
// ───────────────────────────────────────────────────────────────

const LIMITS = [10, 20, 50, 100];

export function PaginationControls({
  page,
  pages,
  limit,
  onPageChange,
  onLimitChange,
  loading,
}: {
  page: number;
  pages: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  loading: boolean;
}) {
  return (
    <div
      className={`${NEU_CARD_SM} flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between`}
    >
      {/* Left — rows per page */}
      <div className="flex items-center gap-3">
        <span className={NEU_LABEL}>Rows per page</span>
        <Select
          value={String(limit)}
          onValueChange={(v) => onLimitChange(Number(v))}
        >
          <SelectTrigger className={NEU_INPUT_SM}>
            <SelectValue placeholder={String(limit)} />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-[#E7E5E4] border border-white/60 shadow-[4px_4px_12px_#c8c6c5,-4px_-4px_12px_#ffffff]">
            {LIMITS.map((l) => (
              <SelectItem
                key={l}
                value={String(l)}
                className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] rounded-lg"
              >
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="hidden text-[#1E2938]/30 md:inline">•</span>

        <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60">
          Showing{" "}
          <strong className="text-[#1E2938]">
            {Math.min(limit, (pages - 1) * limit + limit)}
          </strong>{" "}
          of <strong className="text-[#1E2938]">{pages * limit}</strong>
        </span>
      </div>

      {/* Right — navigation */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={loading || page <= 1}
          className={NEU_BTN_GHOST}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden md:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
          <span>Page</span>
          <span className={NEU_PAGE_CHIP}>{page}</span>
          <span>of</span>
          <strong className="text-[#1E2938]">{pages}</strong>
        </div>

        <button
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={loading || page >= pages}
          className={NEU_BTN_PRIMARY}
          aria-label="Next page"
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
