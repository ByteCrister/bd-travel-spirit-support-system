// components/guide/GuideFilters.tsx
"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { QueryParams } from "@/store/guide/guide.store";
import { Search, X } from "lucide-react";
import { HiFilter } from "react-icons/hi";
import { BiSortAlt2 } from "react-icons/bi";
import {
  AiOutlineSortAscending,
  AiOutlineSortDescending,
} from "react-icons/ai";
import { MdClear } from "react-icons/md";
import { FiClock, FiCheckCircle, FiXCircle, FiList } from "react-icons/fi";
import { BsCircleFill } from "react-icons/bs";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { cn } from "@/lib/utils";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 " +
  "uppercase tracking-widest mb-1.5 flex items-center gap-1.5";

const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm h-11 pl-10 pr-10 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_SELECT_TRIGGER =
  "h-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] border-none " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] " +
  "focus:ring-2 focus:ring-[#006666]/50 focus:outline-none transition-all duration-200";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";

const NEU_BTN_GHOST =
  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs " +
  "font-[family-name:var(--font-space-mono)] text-[#1E2938]/60 " +
  "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#FF2157] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_ACTIVE_PILL =
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_ICON_WELL_SM =
  "p-2 rounded-lg bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const NEU_DIVIDER = "border-[#1E2938]/10";

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  query: QueryParams;
  onChange: (partial: Partial<QueryParams>) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
};

export function GuideFilters({
  query,
  onChange,
  onPageSizeChange,
  loading,
}: Props) {
  const [search, setSearch] = useState(query.search ?? "");

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onChange({ search: value || undefined, page: 1 });
  }, 1000);

  const hasActiveFilters = query.status || query.search;

  const clearFilters = () => {
    setSearch("");
    onChange({ search: undefined, status: undefined, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSearch(value);
  };

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div
        className={cn(
          "flex items-center justify-between pb-4 border-b",
          NEU_DIVIDER,
        )}
      >
        <div className="flex items-center gap-3">
          <div className={NEU_ICON_WELL_SM}>
            <HiFilter className="h-4 w-4 text-[#006666]" aria-hidden="true" />
          </div>
          <div>
            <h3
              className={cn("text-sm", NEU_HEADING, "flex items-center gap-2")}
            >
              Filters
              {hasActiveFilters && (
                <span className={NEU_ACTIVE_PILL}>
                  <BsCircleFill className="h-1.5 w-1.5" aria-hidden="true" />
                  Active
                </span>
              )}
            </h3>
            <p className={NEU_MUTED}>Refine your guide search</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            disabled={loading}
            aria-label="Clear all filters"
            className={NEU_BTN_GHOST}
          >
            <MdClear className="h-4 w-4" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-12 items-end">
        {/* Search */}
        <div className="sm:col-span-2 md:col-span-4">
          <label htmlFor="guide-search" className={NEU_LABEL}>
            <Search className="h-3.5 w-3.5 text-[#006666]" aria-hidden="true" />
            Search
          </label>
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="guide-search"
              type="search"
              placeholder="Name, email, company…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={loading}
              aria-label="Search guides"
              className={NEU_INPUT}
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#1E2938]/40 hover:text-[#FF2157] transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <label className={NEU_LABEL}>
            <FiClock
              className="h-3.5 w-3.5 text-[#FE9900]"
              aria-hidden="true"
            />
            Status
          </label>
          <Select
            value={query.status ?? "all"}
            onValueChange={(val) =>
              onChange({
                status: val === "all" ? undefined : (val as GUIDE_STATUS),
                page: 1,
              })
            }
            disabled={loading}
          >
            <SelectTrigger
              className={NEU_SELECT_TRIGGER}
              aria-label="Filter by status"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#1E2938]/10 bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={GUIDE_STATUS.PENDING}>
                <span className="flex items-center gap-2">
                  <FiClock className="h-3.5 w-3.5 text-[#FE9900]" />
                  Pending
                </span>
              </SelectItem>
              <SelectItem value={GUIDE_STATUS.APPROVED}>
                <span className="flex items-center gap-2">
                  <FiCheckCircle className="h-3.5 w-3.5 text-[#00A63D]" />
                  Approved
                </span>
              </SelectItem>
              <SelectItem value={GUIDE_STATUS.REJECTED}>
                <span className="flex items-center gap-2">
                  <FiXCircle className="h-3.5 w-3.5 text-[#FF2157]" />
                  Rejected
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="md:col-span-2">
          <label className={NEU_LABEL}>
            <BiSortAlt2 className="h-4 w-4 text-[#006666]" aria-hidden="true" />
            Sort By
          </label>
          <Select
            value={query.sortBy}
            onValueChange={(val) =>
              onChange({ sortBy: val as QueryParams["sortBy"], page: 1 })
            }
            disabled={loading}
          >
            <SelectTrigger
              className={NEU_SELECT_TRIGGER}
              aria-label="Sort by field"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#1E2938]/10 bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="companyName">Company</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="appliedAt">Applied Date</SelectItem>
              <SelectItem value="reviewedAt">Reviewed Date</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="updatedAt">Updated Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order */}
        <div className="md:col-span-2">
          <label className={NEU_LABEL}>
            {query.sortDir === "asc" ? (
              <AiOutlineSortAscending
                className="h-4 w-4 text-[#006666]"
                aria-hidden="true"
              />
            ) : (
              <AiOutlineSortDescending
                className="h-4 w-4 text-[#006666]"
                aria-hidden="true"
              />
            )}
            Order
          </label>
          <Select
            value={query.sortDir}
            onValueChange={(val) =>
              onChange({ sortDir: val as "asc" | "desc", page: 1 })
            }
            disabled={loading}
          >
            <SelectTrigger
              className={NEU_SELECT_TRIGGER}
              aria-label="Sort direction"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#1E2938]/10 bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
              <SelectItem value="asc">
                <span className="flex items-center gap-2">
                  <AiOutlineSortAscending className="h-4 w-4 text-[#006666]" />
                  Ascending
                </span>
              </SelectItem>
              <SelectItem value="desc">
                <span className="flex items-center gap-2">
                  <AiOutlineSortDescending className="h-4 w-4 text-[#006666]" />
                  Descending
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Per Page */}
        <div className="md:col-span-2">
          <label className={NEU_LABEL}>
            <FiList className="h-3.5 w-3.5 text-[#006666]" aria-hidden="true" />
            Per Page
          </label>
          <Select
            value={query.pageSize.toString()}
            onValueChange={(val) => onPageSizeChange(Number(val))}
            disabled={loading}
          >
            <SelectTrigger
              className={NEU_SELECT_TRIGGER}
              aria-label="Items per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#1E2938]/10 bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} items
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
