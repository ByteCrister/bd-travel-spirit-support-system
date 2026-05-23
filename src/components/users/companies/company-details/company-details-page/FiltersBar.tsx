"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  MdSearch,
  MdSort,
  MdViewList,
  MdArrowUpward,
  MdArrowDownward,
  MdClose,
  MdFilterList,
} from "react-icons/md";
import { SortableTourKeys } from "@/types/tour/tour.types";
import { motion, AnimatePresence } from "framer-motion";

// ── Neumorphic style tokens ───────────────────────────────────
const NEU_LABEL =
  "block text-xs font-bold font-[family-name:var(--font-space-mono)] uppercase tracking-widest text-[#1E2938]/55 mb-2";

const NEU_INPUT =
  "pl-11 pr-10 h-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm border-none " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_SELECT_TRIGGER =
  "h-11 pl-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] border-none " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_SELECT_TRIGGER_SM =
  "h-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] border-none " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_ICON_WELL =
  "absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none " +
  "flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7E5E4] " +
  "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const NEU_CLEAR_BTN =
  "absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg " +
  "bg-[#E7E5E4] text-[#1E2938]/50 " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-1px_-1px_3px_#ffffff] " +
  "hover:text-[#FF2157] transition-all duration-200 focus-visible:outline-none";

const NEU_FILTER_BAR =
  "rounded-xl bg-[#E7E5E4] border border-white/60 px-4 py-3.5 " +
  "shadow-[inset_2px_2px_6px_#c8c6c5,inset_-2px_-2px_6px_#ffffff]";

const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-[family-name:var(--font-space-mono)] " +
  "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_CLEAR_ALL =
  "ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-[family-name:var(--font-space-mono)] " +
  "text-[#FF2157] bg-[#E7E5E4] " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-1px_-1px_3px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/30";

const NEU_DIVIDER = "w-px h-5 bg-[#1E2938]/15 mx-1";

// ─────────────────────────────────────────────────────────────

type TabKey = "tours" | "employees";

interface Props {
  activeTab: TabKey;
  search: string;
  onSearch: (v: string) => void;
  limit: number;
  onLimitChange: (v: number) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (v: "asc" | "desc") => void;
  sortKey: SortableTourKeys;
  onSortKeyChange: (v: SortableTourKeys) => void;
  employeeSortKey: string;
  onEmployeeSortKeyChange: (v: string) => void;
}

export function FiltersBar({
  activeTab,
  search,
  onSearch,
  limit,
  onLimitChange,
  sortOrder,
  onSortOrderChange,
  sortKey,
  onSortKeyChange,
  employeeSortKey,
  onEmployeeSortKeyChange,
}: Props) {
  const hasActiveFilters = search.length > 0;

  const getSortLabel = (key: string) => {
    const labels: Record<string, string> = {
      title: "Title",
      status: "Status",
      startDate: "Start Date",
      endDate: "End Date",
      durationDays: "Duration",
      averageRating: "Rating",
      bookingCount: "Bookings",
      fullName: "Name",
      employmentType: "Employment Type",
      dateOfJoining: "Joined",
      dateOfLeaving: "Left",
      createdAt: "Created",
      updatedAt: "Updated",
    };
    return labels[key] || key;
  };

  return (
    <div className="space-y-4">
      {/* Main Filters Grid */}
      <div className="grid grid-cols-12 gap-5 items-end">
        {/* Search */}
        <motion.div
          className="col-span-12 md:col-span-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <label htmlFor="search" className={NEU_LABEL}>
            Search
          </label>
          <div className="relative">
            <div className={NEU_ICON_WELL}>
              <MdSearch className="h-4 w-4 text-[#006666]" />
            </div>
            <Input
              id="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={
                activeTab === "tours" ? "Search tours…" : "Search employees…"
              }
              className={NEU_INPUT}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.14 }}
                  onClick={() => onSearch("")}
                  className={NEU_CLEAR_BTN}
                  aria-label="Clear search"
                >
                  <MdClose className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sort by */}
        <motion.div
          className="col-span-12 md:col-span-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05 }}
        >
          <label className={NEU_LABEL}>Sort by</label>
          <div className="relative">
            <div className={NEU_ICON_WELL}>
              <MdSort className="h-4 w-4 text-[#006666]" />
            </div>
            {activeTab === "tours" ? (
              <Select
                value={sortKey}
                onValueChange={(v) => onSortKeyChange(v as SortableTourKeys)}
              >
                <SelectTrigger id="sort-by" className={NEU_SELECT_TRIGGER}>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="endDate">End Date</SelectItem>
                  <SelectItem value="durationDays">Duration</SelectItem>
                  <SelectItem value="averageRating">Rating</SelectItem>
                  <SelectItem value="bookingCount">Bookings</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={employeeSortKey}
                onValueChange={onEmployeeSortKeyChange}
              >
                <SelectTrigger id="sort-by" className={NEU_SELECT_TRIGGER}>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullName">Name</SelectItem>
                  <SelectItem value="employmentType">
                    Employment Type
                  </SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="dateOfJoining">Joined</SelectItem>
                  <SelectItem value="dateOfLeaving">Left</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </motion.div>

        {/* Order + Show */}
        <motion.div
          className="col-span-12 md:col-span-3 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1 }}
        >
          {/* Order */}
          <div>
            <label className={NEU_LABEL}>Order</label>
            <Select
              value={sortOrder}
              onValueChange={(v) => onSortOrderChange(v as "asc" | "desc")}
            >
              <SelectTrigger id="sort-order" className={NEU_SELECT_TRIGGER_SM}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  <span className="flex items-center gap-1.5">
                    <MdArrowUpward className="h-4 w-4 text-[#006666]" />
                    Asc
                  </span>
                </SelectItem>
                <SelectItem value="desc">
                  <span className="flex items-center gap-1.5">
                    <MdArrowDownward className="h-4 w-4 text-[#006666]" />
                    Desc
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show */}
          <div>
            <label className={NEU_LABEL}>Show</label>
            <Select
              value={String(limit)}
              onValueChange={(v) => onLimitChange(Number(v))}
            >
              <SelectTrigger id="limit" className={NEU_SELECT_TRIGGER_SM}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className={NEU_FILTER_BAR}>
              <div className="flex flex-wrap items-center gap-3">
                {/* Heading */}
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                    <MdFilterList className="h-4 w-4 text-[#006666]" />
                  </div>
                  <span className="text-xs font-bold font-[family-name:var(--font-space-mono)] uppercase tracking-widest text-[#1E2938]/60">
                    Active Filters
                  </span>
                </div>

                <div className={NEU_DIVIDER} />

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`${NEU_BADGE} text-[#006666]`}>
                    <MdSearch className="h-3.5 w-3.5" />
                    <span className="max-w-[160px] truncate">{search}</span>
                  </span>

                  <span className={`${NEU_BADGE} text-[#1E2938]`}>
                    <MdSort className="h-3.5 w-3.5" />
                    {getSortLabel(
                      activeTab === "tours" ? sortKey : employeeSortKey,
                    )}
                  </span>

                  <span className={`${NEU_BADGE} text-[#1E2938]`}>
                    {sortOrder === "asc" ? (
                      <MdArrowUpward className="h-3.5 w-3.5" />
                    ) : (
                      <MdArrowDownward className="h-3.5 w-3.5" />
                    )}
                    {sortOrder === "asc" ? "Asc" : "Desc"}
                  </span>

                  <span className={`${NEU_BADGE} text-[#1E2938]`}>
                    <MdViewList className="h-3.5 w-3.5" />
                    {limit} rows
                  </span>
                </div>

                <button
                  onClick={() => onSearch("")}
                  className={NEU_CLEAR_ALL}
                  aria-label="Clear all filters"
                >
                  <MdClose className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
