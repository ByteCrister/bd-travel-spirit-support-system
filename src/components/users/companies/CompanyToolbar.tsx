"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Rows3,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanySortBy, SortDir } from "@/types/company/company.types";
import { useCompanyStore } from "@/store/company/company.store";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_DIVIDER = "border-[#1E2938]/10";

const NEU_BADGE_PRIMARY =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
// ─────────────────────────────────────────────────────────────

export function CompanyToolbar() {
  const { params, setSearch, setSort, setLimit } = useCompanyStore();

  const [searchLocal, setSearchLocal] = useState<string>(params.search ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchLocal !== params.search) setSearch(searchLocal);
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchLocal]);

  const sortOptions: CompanySortBy[] = useMemo(
    () => [
      "name",
      "employeesCount",
      "toursCount",
      "reviewsCount",
      "averageRating",
      "createdAt",
    ],
    [],
  );

  const toggleDir = () => {
    const next: SortDir = params.sortDir === "asc" ? "desc" : "asc";
    setSort(params.sortBy, next);
  };

  return (
    <motion.div
      className={`${NEU_CARD} p-6 space-y-6`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-lg">
          Filter &amp; Search
        </h2>

        <button
          type="button"
          onClick={() => useCompanyStore.getState().refresh()}
          className={`${NEU_BTN_GHOST} flex items-center gap-2 px-4 py-2 text-sm`}
          aria-label="Refresh companies"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E2938]/40 pointer-events-none" />
        <input
          id="company-search"
          value={searchLocal}
          onChange={(e) => setSearchLocal(e.target.value)}
          placeholder="Search companies, emails, or tags…"
          className={`${NEU_INPUT} w-full pl-12 pr-10 h-12 text-base`}
        />
        {searchLocal && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setSearchLocal("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[#006666]/10 transition-colors"
          >
            <svg
              className="w-4 h-4 text-[#1E2938]/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sort By */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#1E2938]/50" />
            <label htmlFor="sort-by-trigger" className={NEU_LABEL}>
              Sort By
            </label>
          </div>
          <Select
            value={params.sortBy}
            onValueChange={(v) => setSort(v as CompanySortBy, params.sortDir)}
          >
            <SelectTrigger
              id="sort-by-trigger"
              className={`${NEU_BTN_GHOST} w-full h-11 px-4 flex items-center justify-between text-sm`}
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60">
              {sortOptions.map((opt) => (
                <SelectItem
                  key={opt}
                  value={opt}
                  className="cursor-pointer rounded-lg font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] hover:bg-[#006666]/10 focus:bg-[#006666]/10"
                >
                  {labelForSort(opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Direction */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {params.sortDir === "asc" ? (
              <SortAsc className="w-3.5 h-3.5 text-[#1E2938]/50" />
            ) : (
              <SortDesc className="w-3.5 h-3.5 text-[#1E2938]/50" />
            )}
            <span className={NEU_LABEL}>Order</span>
          </div>
          <button
            type="button"
            onClick={toggleDir}
            aria-label={`Toggle sort direction (${params.sortDir})`}
            className={`${NEU_BTN_GHOST} w-full h-11 px-4 flex items-center justify-center gap-2 text-sm`}
          >
            {params.sortDir === "asc" ? (
              <>
                <SortAsc className="w-4 h-4 text-[#006666]" />
                <span>Ascending</span>
              </>
            ) : (
              <>
                <SortDesc className="w-4 h-4 text-[#FE9900]" />
                <span>Descending</span>
              </>
            )}
          </button>
        </div>

        {/* Per Page */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Rows3 className="w-3.5 h-3.5 text-[#1E2938]/50" />
            <span className={NEU_LABEL}>Show</span>
          </div>
          <Select
            value={String(params.limit)}
            onValueChange={(v) => setLimit(Number(v))}
          >
            <SelectTrigger
              className={`${NEU_BTN_GHOST} w-full h-11 px-4 flex items-center justify-between text-sm`}
            >
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60">
              {[10, 20, 50, 100].map((n) => (
                <SelectItem
                  key={n}
                  value={String(n)}
                  className="cursor-pointer rounded-lg font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] hover:bg-[#006666]/10 focus:bg-[#006666]/10"
                >
                  {n} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter info */}
      <div
        className={`flex flex-wrap items-center gap-3 pt-2 border-t ${NEU_DIVIDER} text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00A63D]" />
          <span>Showing {params.limit} results</span>
        </div>
        {searchLocal && (
          <span className={NEU_BADGE_PRIMARY}>Filtered by search</span>
        )}
      </div>
    </motion.div>
  );
}

function labelForSort(key: CompanySortBy): string {
  switch (key) {
    case "name":
      return "Company Name";
    case "employeesCount":
      return "Employees Count";
    case "toursCount":
      return "Tours Count";
    case "reviewsCount":
      return "Reviews Count";
    case "averageRating":
      return "Average Rating";
    case "createdAt":
      return "Date Created";
    default:
      return key;
  }
}
