"use client";

// components/travelers/TravelerFilters.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TravelerFilter } from "@/types/user/traveler.types";
import { ACCOUNT_STATUS, AccountStatus } from "@/constants/user.const";
import {
  RefreshCw,
  SlidersHorizontal,
  Search,
  ShieldCheck,
  ArrowUpDown,
  LayoutList,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  "relative rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-4";

const NEU_INPUT =
  "pl-9 pr-4 h-9 w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_BTN_GHOST =
  "h-9 inline-flex items-center gap-2 rounded-xl px-3 " +
  "bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-xs font-bold " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_GHOST_ACTIVE =
  "h-9 inline-flex items-center gap-2 rounded-xl px-3 " +
  "bg-[#006666]/10 text-[#006666] font-[family-name:var(--font-space-mono)] text-xs font-bold " +
  "shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200";

const NEU_BTN_ICON_REFRESH =
  "h-9 w-9 inline-flex items-center justify-center rounded-xl " +
  "bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BADGE_COUNT =
  "inline-flex items-center justify-center h-4 px-1.5 rounded-full text-[10px] " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#006666] text-white";

const NEU_SELECT_TRIGGER =
  "h-9 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-bold gap-1.5 " +
  "bg-[#E7E5E4] text-[#1E2938] border-none " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_SELECT_TRIGGER_ACTIVE =
  "h-9 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-bold gap-1.5 " +
  "bg-[#006666]/10 text-[#006666] border-none " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_DIVIDER = "h-5 w-px bg-[#1E2938]/10 hidden sm:block";

const NEU_ACTIVE_INDICATOR = "flex items-center gap-1.5 ml-auto";

// ── Props & component ─────────────────────────────────────────
interface TravelerFiltersProps {
  filters: TravelerFilter;
  onFilterChange: <K extends keyof TravelerFilter>(
    key: K,
    value: TravelerFilter[K],
  ) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export function TravelerFilters({
  filters,
  onFilterChange,
  onSearchChange,
  onRefresh,
}: TravelerFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statusOptions: AccountStatus[] = Object.values(ACCOUNT_STATUS);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    onSearchChange(value);
  };

  const handleVerifiedChange = (value: string) => {
    onFilterChange(
      "isVerified",
      value === "all" ? undefined : value === "true",
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const activeStatusCount = filters.accountStatus?.length || 0;
  const hasActiveFilters =
    activeStatusCount > 0 ||
    filters.isVerified !== undefined ||
    (filters.search && filters.search.length > 0);

  const statusDotColors: Record<string, string> = {
    active: "text-[#00A63D]",
    suspended: "text-[#FF2157]",
    locked: "text-[#FE9900]",
    inactive: "text-[#1E2938]/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={NEU_CARD}
    >
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
          <input
            placeholder="Search travelers..."
            value={searchInput}
            onChange={handleSearch}
            className={NEU_INPUT}
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Status multi-select */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={
                  activeStatusCount > 0 ? NEU_BTN_GHOST_ACTIVE : NEU_BTN_GHOST
                }
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Status
                {activeStatusCount > 0 && (
                  <span className={NEU_BADGE_COUNT}>{activeStatusCount}</span>
                )}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 rounded-xl border-white/60 bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]"
            >
              <DropdownMenuLabel className="text-xs text-[#1E2938]/50 font-[family-name:var(--font-space-mono)] font-bold uppercase tracking-widest px-3 py-2">
                Filter by Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1E2938]/10" />
              {statusOptions.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  className="text-sm gap-2 rounded-lg mx-1 cursor-pointer text-[#1E2938] font-[family-name:var(--font-jetbrains-mono)]"
                  checked={filters.accountStatus?.includes(status)}
                  onCheckedChange={(checked) => {
                    const current = filters.accountStatus || [];
                    const newStatus = checked
                      ? [...current, status]
                      : current.filter((s) => s !== status);
                    onFilterChange("accountStatus", newStatus);
                  }}
                >
                  <span
                    className={statusDotColors[status] || "text-[#1E2938]/40"}
                  >
                    ●
                  </span>
                  <span className="capitalize">{status}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Verified filter */}
          <Select
            value={
              filters.isVerified === undefined
                ? "all"
                : filters.isVerified
                  ? "true"
                  : "false"
            }
            onValueChange={handleVerifiedChange}
          >
            <SelectTrigger
              className={cn(
                filters.isVerified !== undefined
                  ? NEU_SELECT_TRIGGER_ACTIVE
                  : NEU_SELECT_TRIGGER,
                "w-[130px]",
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
              <SelectValue placeholder="Verified" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/60 bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
              <SelectItem
                value="all"
                className="text-sm rounded-lg text-[#1E2938] font-[family-name:var(--font-jetbrains-mono)]"
              >
                All Users
              </SelectItem>
              <SelectItem
                value="true"
                className="text-sm rounded-lg text-[#00A63D] font-[family-name:var(--font-jetbrains-mono)]"
              >
                ✓ Verified
              </SelectItem>
              <SelectItem
                value="false"
                className="text-sm rounded-lg text-[#1E2938]/50 font-[family-name:var(--font-jetbrains-mono)]"
              >
                ✗ Unverified
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split(":") as [
                string,
                "asc" | "desc",
              ];
              onFilterChange("sortBy", sortBy);
              onFilterChange("sortOrder", sortOrder);
            }}
          >
            <SelectTrigger className={cn(NEU_SELECT_TRIGGER, "w-[155px]")}>
              <ArrowUpDown className="h-3.5 w-3.5 flex-shrink-0" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/60 bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
              {[
                { value: "createdAt:desc", label: "Newest first" },
                { value: "createdAt:asc", label: "Oldest first" },
                { value: "name:asc", label: "Name A–Z" },
                { value: "name:desc", label: "Name Z–A" },
                { value: "email:asc", label: "Email A–Z" },
                { value: "email:desc", label: "Email Z–A" },
              ].map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-sm rounded-lg font-[family-name:var(--font-jetbrains-mono)]"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Page size */}
          <Select
            value={String(filters.limit)}
            onValueChange={(value) => onFilterChange("limit", Number(value))}
          >
            <SelectTrigger className={cn(NEU_SELECT_TRIGGER, "w-[105px]")}>
              <LayoutList className="h-3.5 w-3.5 flex-shrink-0" />
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/60 bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className="text-sm rounded-lg font-[family-name:var(--font-jetbrains-mono)]"
                >
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Divider */}
          <div className={NEU_DIVIDER} />

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className={NEU_BTN_ICON_REFRESH}
            aria-label="Refresh"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </motion.div>
          </button>
        </div>

        {/* Active filter indicator */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={NEU_ACTIVE_INDICATOR}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-[#006666] animate-pulse" />
            <span className="text-xs text-[#1E2938]/50 font-[family-name:var(--font-space-mono)] font-bold">
              Filters active
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
