"use client";

// src/components/users/travelers/TravelersPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TravelerFilter,
  TravelerListItem,
  TravelerListStats,
} from "@/types/user/traveler.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useTravelerStore } from "@/store/traveler/travelers.store";
import { TravelerStats } from "./TravelerStats";
import { TravelerFilters } from "./TravelerFilters";
import TravelerTableSkeleton from "./skeletons/TravelerTableSkeleton";
import { TravelerTable } from "./TravelerTable";
import { TravelerPagination } from "./TravelerPagination";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { Users } from "lucide-react";

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_HEADER =
  "px-5 py-3.5 border-b border-[#1E2938]/10 flex items-center justify-between bg-[#E7E5E4]/80";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

export default function TravelersPage() {
  const router = useRouter();
  const { fetchTravelers, clearTravelerListCache, loading, errors } =
    useTravelerStore();

  const [filters, setFilters] = useState<TravelerFilter>({
    page: 1,
    limit: 10,
    search: "",
    accountStatus: [],
    isVerified: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [data, setData] = useState<{
    travelers: TravelerListItem[];
    total: number;
    totalPages: number;
    stats: TravelerListStats | null;
  }>({
    travelers: [],
    total: 0,
    totalPages: 0,
    stats: null,
  });

  const loadTravelers = useCallback(
    async (forceRefresh = false) => {
      try {
        const response = await fetchTravelers(filters, forceRefresh);
        setData({
          travelers: response.data,
          total: response.total,
          totalPages: response.totalPages,
          stats: response.stats,
        });
      } catch (error) {
        console.error("Failed to fetch travelers:", error);
      }
    },
    [fetchTravelers, filters],
  );

  useEffect(() => {
    loadTravelers();
  }, [loadTravelers]);

  const debouncedSearch = useDebouncedCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, 500);

  const handleFilterChange = <K extends keyof TravelerFilter>(
    key: K,
    value: TravelerFilter[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleRefresh = () => {
    clearTravelerListCache();
    loadTravelers(true);
  };

  const handleRowClick = (travelerId: string) => {
    router.push(`/users/travelers/${encodeURIComponent(encodeId(travelerId))}`);
  };

  return (
    <div className={NEU_PAGE_BG}>
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-[1400px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className={NEU_ICON_WELL_PRIMARY}>
              <Users className="h-6 w-6 text-[#006666]" />
            </div>
            <div>
              <h1 className={`text-2xl ${NEU_HEADING}`}>Traveler Management</h1>
              {data.total > 0 && (
                <p className={`mt-0.5 ${NEU_MUTED}`}>
                  {data.total.toLocaleString()} travelers total
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {data.stats ? (
          <TravelerStats stats={data.stats} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-[88px] ${NEU_SKELETON}`} />
            ))}
          </div>
        )}

        {/* Filters */}
        <TravelerFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchChange={debouncedSearch}
          onRefresh={handleRefresh}
        />

        {/* Table card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className={NEU_CARD}
        >
          {/* Table header strip */}
          <div className={NEU_CARD_HEADER}>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A63D] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A63D]" />
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-widest font-[family-name:var(--font-space-mono)] text-[#1E2938]/60`}
              >
                {loading.list ? "Loading…" : `${data.travelers.length} results`}
              </span>
            </div>
            {data.total > 0 && !loading.list && (
              <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40 tabular-nums">
                Showing {(filters.page! - 1) * filters.limit! + 1}–
                {Math.min(filters.page! * filters.limit!, data.total)} of{" "}
                {data.total}
              </span>
            )}
          </div>

          {/* Table */}
          <div className="p-2">
            {loading.list ? (
              <TravelerTableSkeleton />
            ) : (
              <TravelerTable
                travelers={data.travelers}
                onRowClick={handleRowClick}
                emptyMessage={errors.list || "No travelers found"}
              />
            )}
          </div>
        </motion.div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <TravelerPagination
            currentPage={filters.page!}
            totalPages={data.totalPages}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        )}
      </div>
    </div>
  );
}
