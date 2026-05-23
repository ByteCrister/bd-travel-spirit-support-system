// components/guide-password-request/PasswordRequestFilters.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  CalendarIcon,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Rows3,
} from "lucide-react";
import { format } from "date-fns";
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  usePasswordRequestStore,
} from "@/store/guide/guide-password-request.store";
import {
  NEU_CARD,
  NEU_BTN_GHOST,
  NEU_BTN_ICON,
  NEU_INPUT,
  NEU_LABEL,
  NEU_HEADING,
  NEU_SURFACE_INSET_SM,
  NEU_DIVIDER,
  NEU_BADGE_PRIMARY,
} from "@/styles/neu.styles";

// ── Local style constants ───────────────────────────────────────────────────
const FILTER_GRID = "grid gap-4 md:grid-cols-2 lg:grid-cols-4";
const FILTER_FIELD_LABEL = cn(NEU_LABEL, "mb-1.5 block");
const PAGE_LIMIT_OPTIONS = [
  { value: "10", label: "10 / page" },
  { value: "20", label: "20 / page" },
  { value: "50", label: "50 / page" },
  { value: "100", label: "100 / page" },
];

export function PasswordRequestFilters() {
  const { filters, setFilters, resetFilters, pagination, setLimit } =
    usePasswordRequestStore();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const activeCount = [
    filters.search,
    filters.status !== "ALL",
    filters.dateRange.start,
    filters.dateRange.end,
  ].filter(Boolean).length;

  const hasActiveFilters = activeCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(NEU_CARD, "p-6 space-y-5")}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
            <Filter className="h-4 w-4 text-[#006666]" />
          </div>
          <h3 className={cn(NEU_HEADING, "text-lg")}>Filters &amp; Sorting</h3>
          {hasActiveFilters && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                NEU_BADGE_PRIMARY,
                "h-5 w-5 p-0 justify-center text-[10px]"
              )}
            >
              {activeCount}
            </motion.span>
          )}
        </div>

        <button
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className={cn(
            NEU_BTN_GHOST,
            "px-3 py-1.5 text-xs flex items-center gap-1.5",
            !hasActiveFilters && "opacity-40 cursor-not-allowed shadow-none"
          )}
        >
          <X className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* ── Filter Grid ────────────────────────────────────── */}
      <div className={FILTER_GRID}>
        {/* Search */}
        <div>
          <label className={FILTER_FIELD_LABEL}>Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
            <Input
              placeholder="Name or email…"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className={cn(NEU_INPUT, "pl-9 h-10 w-full")}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={FILTER_FIELD_LABEL}>Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters({ status: value as typeof filters.status })
            }
          >
            <SelectTrigger className={cn(NEU_INPUT, "h-10 w-full")}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-[#E7E5E4] border-white/60 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] rounded-xl">
              {STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] focus:bg-[#006666]/10 focus:text-[#006666]"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div>
          <label className={FILTER_FIELD_LABEL}>Date Range</label>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  NEU_BTN_GHOST,
                  "h-10 w-full px-3 text-sm flex items-center gap-2 justify-start",
                  !filters.dateRange.start &&
                  !filters.dateRange.end &&
                  "text-[#1E2938]/40"
                )}
              >
                <CalendarIcon className="h-4 w-4 shrink-0 text-[#006666]" />
                <span className="truncate font-[family-name:var(--font-jetbrains-mono)]">
                  {filters.dateRange.start && filters.dateRange.end
                    ? `${format(filters.dateRange.start, "MMM d")} – ${format(
                      filters.dateRange.end,
                      "MMM d, yyyy"
                    )}`
                    : "Pick a date range"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-[#E7E5E4] border-white/60 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] rounded-2xl"
              align="start"
            >
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.start || undefined,
                  to: filters.dateRange.end || undefined,
                }}
                onSelect={(range) =>
                  setFilters({
                    dateRange: {
                      start: range?.from || null,
                      end: range?.to || null,
                    },
                  })
                }
                initialFocus
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Sort */}
        <div>
          <label className={FILTER_FIELD_LABEL}>Sort By</label>
          <div className="flex gap-2">
            <Select
              value={filters.sortBy.field}
              onValueChange={(value) =>
                setFilters({
                  sortBy: {
                    ...filters.sortBy,
                    field: value as typeof filters.sortBy.field,
                  },
                })
              }
            >
              <SelectTrigger className={cn(NEU_INPUT, "h-10 flex-1")}>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#E7E5E4] border-white/60 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] rounded-xl">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] focus:bg-[#006666]/10 focus:text-[#006666]"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() =>
                setFilters({
                  sortBy: {
                    ...filters.sortBy,
                    order: filters.sortBy.order === "asc" ? "desc" : "asc",
                  },
                })
              }
              className={NEU_BTN_ICON}
              aria-label="Toggle sort order"
            >
              <motion.span
                animate={{ rotate: filters.sortBy.order === "asc" ? 0 : 180 }}
                transition={{ duration: 0.3 }}
                className="inline-flex"
              >
                <ArrowUpDown className="h-4 w-4" />
              </motion.span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────── */}
      <div className={cn("border-t", NEU_DIVIDER)} />

      {/* ── Pagination Controls ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <Rows3 className="h-4 w-4 text-[#006666] shrink-0" />
            <label className={cn(NEU_LABEL, "whitespace-nowrap")}>Per page</label>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger className={cn(NEU_INPUT, "h-8 w-[110px] text-xs")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#E7E5E4] border-white/60 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] rounded-xl">
                {PAGE_LIMIT_OPTIONS.map((o) => (
                  <SelectItem
                    key={o.value}
                    value={o.value}
                    className="font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] text-xs focus:bg-[#006666]/10 focus:text-[#006666]"
                  >
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div
            className={cn(
              NEU_SURFACE_INSET_SM,
              "px-3 py-1.5 rounded-xl text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70"
            )}
          >
            Showing{" "}
            <span className="font-bold text-[#1E2938]">
              {Math.min(
                (pagination.page - 1) * pagination.limit + 1,
                pagination.total
              )}
            </span>{" "}
            –{" "}
            <span className="font-bold text-[#1E2938]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[#1E2938]">{pagination.total}</span>{" "}
            requests
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (pagination.page > 1) {
                usePasswordRequestStore.getState().setPage(pagination.page - 1);
              }
            }}
            disabled={pagination.page === 1}
            className={cn(
              NEU_BTN_GHOST,
              "px-3 py-1.5 text-xs flex items-center gap-1",
              pagination.page === 1 && "opacity-40 cursor-not-allowed shadow-none"
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>

          <div
            className={cn(
              NEU_SURFACE_INSET_SM,
              "px-3 py-1.5 rounded-xl min-w-[80px] text-center text-xs font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]"
            )}
          >
            {pagination.page} / {pagination.totalPages}
          </div>

          <button
            onClick={() => {
              if (pagination.page < pagination.totalPages) {
                usePasswordRequestStore.getState().setPage(pagination.page + 1);
              }
            }}
            disabled={pagination.page === pagination.totalPages}
            className={cn(
              NEU_BTN_GHOST,
              "px-3 py-1.5 text-xs flex items-center gap-1",
              pagination.page === pagination.totalPages &&
              "opacity-40 cursor-not-allowed shadow-none"
            )}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}