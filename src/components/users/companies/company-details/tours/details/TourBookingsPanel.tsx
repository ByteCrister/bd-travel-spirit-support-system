"use client";

import { useEffect, useCallback, useState } from "react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CalendarDays,
  Banknote,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Ticket,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { BookingListItemDTO } from "@/types/tour/tour-detail-booking.types";
import {
  useCompanyDetailStore,
  tourBookingListErrorKey,
  tourBookingListLoadingKey,
} from "@/store/company/company-detail.store";
import { format, formatDistanceToNow } from "date-fns";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";

const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-xs " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 px-3 py-1.5";

const NEU_BTN_ICON =
  "rounded-xl w-8 h-8 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200";
const NEU_BTN_ICON_ACTIVE =
  "rounded-xl w-8 h-8 flex items-center justify-center bg-[#006666] text-white text-xs font-bold " +
  "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]";
const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 pl-9 pr-3 py-2";
const NEU_SELECT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] text-xs font-[family-name:var(--font-space-mono)] " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 px-2 py-1.5";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

// Table grid layout
const TABLE_GRID =
  "grid grid-cols-[40px_minmax(0,1fr)_7rem] sm:grid-cols-[40px_minmax(0,1fr)_4.5rem_7rem] md:grid-cols-[40px_minmax(0,1fr)_4.5rem_6rem_7.5rem] gap-x-3 items-center px-5";
// ─────────────────────────────────────────────────────────────────────────────

interface TourBookingsPanelProps {
  companyId: string;
  tourId: string;
}

type SortField = "bookingTime" | "totalParticipants" | "totalPaid";
type SortOrder = "asc" | "desc";

const AVATAR_GRADIENTS = [
  "from-[#006666] to-teal-500",
  "from-emerald-500 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-sky-400 to-blue-500",
  "from-fuchsia-400 to-purple-500",
];

function SkeletonRow({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className={`${TABLE_GRID} py-4 border-b ${NEU_DIVIDER} last:border-0`}
    >
      <div className={`${NEU_SKELETON} w-9 h-9 rounded-xl`} />
      <div className="space-y-2">
        <div className={`${NEU_SKELETON} h-3.5 w-32`} />
        <div className={`${NEU_SKELETON} h-2.5 w-48`} />
      </div>
      <div
        className={`hidden sm:block ${NEU_SKELETON} h-6 w-14 justify-self-center rounded-full mx-auto`}
      />
      <div
        className={`hidden md:block ${NEU_SKELETON} h-3.5 w-20 justify-self-end`}
      />
      <div className={`${NEU_SKELETON} h-3 w-24 justify-self-end`} />
    </motion.div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${NEU_SURFACE_INSET} rounded-2xl flex flex-col items-center justify-center py-20 gap-4 m-4`}
    >
      <div className={NEU_ICON_WELL}>
        <Ticket size={26} className="text-[#1E2938]/30" />
      </div>
      <div className="text-center space-y-1">
        <p className={`${NEU_HEADING} text-base text-[#1E2938]/50`}>
          {hasSearch ? "No matching bookings" : "No bookings yet"}
        </p>
        <p className={NEU_MUTED}>
          {hasSearch
            ? "Try a different traveler name or email"
            : "Bookings for this tour will appear here"}
        </p>
      </div>
    </motion.div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${NEU_SURFACE_INSET} rounded-2xl flex flex-col items-center justify-center py-16 gap-4 m-4`}
    >
      <div className="p-3 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
        <AlertCircle size={24} className="text-[#FF2157]" />
      </div>
      <div className="text-center space-y-1">
        <p className={`${NEU_HEADING} text-base text-[#1E2938]/70`}>
          Failed to load bookings
        </p>
        <p className={`${NEU_MUTED} max-w-xs text-center`}>{message}</p>
      </div>
      <button className={NEU_BTN_GHOST} onClick={onRetry}>
        <RefreshCw size={12} className="inline mr-1.5" /> Try again
      </button>
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  index = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`${NEU_CARD_SM} flex items-center gap-3 px-4 py-3`}
    >
      <div className={`${NEU_ICON_WELL} shrink-0 ${accent}`}>
        <Icon size={15} />
      </div>
      <div>
        <p className={NEU_LABEL}>{label}</p>
        <p className={`${NEU_HEADING} text-base mt-0.5`}>{value}</p>
      </div>
    </motion.div>
  );
}

function SortBtn({
  label,
  active,
  order,
  onClick,
  align = "start",
}: {
  label: string;
  active: boolean;
  order: SortOrder;
  onClick: () => void;
  align?: "start" | "center" | "end";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 w-full text-[10px] font-[family-name:var(--font-space-mono)] font-bold uppercase tracking-wider transition-colors select-none
                ${align === "center" ? "justify-center" : align === "end" ? "justify-end" : "justify-start"}
                ${active ? "text-[#006666]" : "text-[#1E2938]/40 hover:text-[#1E2938]/70"}`}
    >
      {label}
      {active ? (
        order === "asc" ? (
          <ArrowUp size={10} />
        ) : (
          <ArrowDown size={10} />
        )
      ) : (
        <ArrowUpDown size={9} className="opacity-40" />
      )}
    </button>
  );
}

function BookingsTableHeader({
  sortField,
  sortOrder,
  onSort,
}: {
  sortField: SortField | null;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}) {
  return (
    <div className={`${TABLE_GRID} py-2.5 border-b ${NEU_DIVIDER}`}>
      <div aria-hidden className="w-10" />
      <span className={`${NEU_LABEL}`}>Traveler</span>
      <div className="hidden sm:block">
        <SortBtn
          label="Pax"
          active={sortField === "totalParticipants"}
          order={sortOrder}
          align="center"
          onClick={() => onSort("totalParticipants")}
        />
      </div>
      <div className="hidden md:block">
        <SortBtn
          label="Amount"
          active={sortField === "totalPaid"}
          order={sortOrder}
          align="end"
          onClick={() => onSort("totalPaid")}
        />
      </div>
      <div>
        <SortBtn
          label="Booked"
          active={sortField === "bookingTime"}
          order={sortOrder}
          align="end"
          onClick={() => onSort("bookingTime")}
        />
      </div>
    </div>
  );
}

function BookingRow({
  booking,
  index,
}: {
  booking: BookingListItemDTO;
  index: number;
}) {
  const initials = booking.user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();

  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03, ease: "easeOut" }}
      className={`${TABLE_GRID} group py-3.5 border-b ${NEU_DIVIDER} last:border-0 hover:bg-[#d8d6d5]/30 transition-colors duration-100 cursor-default`}
    >
      {/* Avatar */}
      <Avatar className="w-9 h-9 rounded-xl">
        {booking.user.avatarUrl && (
          <AvatarImage src={booking.user.avatarUrl} alt={booking.user.name} />
        )}
        <AvatarFallback
          className={`rounded-xl text-white text-[11px] font-bold bg-gradient-to-br ${gradient}`}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name & email */}
      <div className="min-w-0">
        <p className={`${NEU_HEADING} text-sm truncate leading-tight`}>
          {booking.user.name}
        </p>
        <p className={`${NEU_MUTED} text-xs truncate leading-tight mt-0.5`}>
          {booking.user.email}
        </p>
      </div>

      {/* Participants */}
      <TooltipProvider delayDuration={180}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`hidden sm:flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full ${NEU_SURFACE_INSET_SM} text-[#1E2938]/60 justify-self-center w-fit mx-auto`}
            >
              <Users size={11} />
              <span
                className={`${NEU_MONO} text-xs font-semibold tabular-nums`}
              >
                {booking.totalParticipants}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {booking.totalParticipants} participant
            {booking.totalParticipants !== 1 ? "s" : ""}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Amount */}
      <div className="hidden md:block justify-self-end text-right">
        <span
          className={`${NEU_MONO} text-sm font-bold tabular-nums text-[#006666]`}
        >
          ৳{booking.totalPaid.toLocaleString()}
        </span>
      </div>

      {/* Booking time */}
      <TooltipProvider delayDuration={180}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center justify-end gap-1.5 ${NEU_MUTED} justify-self-end w-full min-w-0`}
            >
              <CalendarDays size={11} className="shrink-0" />
              <span className="text-[11px] whitespace-nowrap tabular-nums">
                {formatDistanceToNow(new Date(booking.bookingTime), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {format(new Date(booking.bookingTime), "MMM dd, yyyy 'at' h:mm a")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}

export default function TourBookingsPanel({
  companyId,
  tourId,
}: TourBookingsPanelProps) {
  const {
    fetchBookings,
    listCache,
    activeCacheKey,
    loading,
    error,
    params: storeParams,
  } = useCompanyDetailStore();

  const isLoading = loading[tourBookingListLoadingKey(tourId)] ?? false;
  const errorMsg = error[tourBookingListErrorKey(tourId)];

  const cacheKey = activeCacheKey.tourBookings?.[tourId];
  const cached = cacheKey
    ? listCache.tourBookings?.[tourId]?.[cacheKey]
    : undefined;

  const bookings: BookingListItemDTO[] = cached?.items ?? [];
  const total = cached?.total ?? 0;
  const totalPages = cached?.pages ?? 1;
  const currentPage = cached?.page ?? 1;

  const tourBookingParams = storeParams.tourBookings?.[tourId];
  const [localSearch, setLocalSearch] = useState(
    tourBookingParams?.search ?? "",
  );
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [limit, setLimit] = useState(tourBookingParams?.limit ?? 10);

  const appliedSearch = tourBookingParams?.search?.trim() ?? "";

  useEffect(() => {
    fetchBookings(companyId, tourId, { page: 1, limit, search: appliedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, tourId, fetchBookings, limit]);

  const doFetch = useCallback(
    (
      page: number,
      field?: SortField | null,
      order?: SortOrder,
      force = false,
      search?: string,
    ) => {
      fetchBookings(
        companyId,
        tourId,
        {
          page,
          limit,
          search: search ?? appliedSearch,
          ...(field ? { sort: field, order: order ?? "desc" } : {}),
        },
        force,
      );
    },
    [companyId, tourId, fetchBookings, limit, appliedSearch],
  );

  const debouncedSearch = useDebouncedCallback(
    useCallback(
      (searchValue: string) => {
        doFetch(1, sortField, sortOrder, true, searchValue);
      },
      [doFetch, sortField, sortOrder],
    ),
    400,
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);
      if (value === "") doFetch(1, sortField, sortOrder, true, "");
      else debouncedSearch(value);
    },
    [doFetch, sortField, sortOrder, debouncedSearch],
  );

  const handleSort = (field: SortField) => {
    const newOrder =
      sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newOrder);
    doFetch(1, field, newOrder, true);
  };

  const handleRetry = () => doFetch(currentPage, sortField, sortOrder, true);

  const pageRevenue = bookings.reduce((s, b) => s + b.totalPaid, 0);
  const pagePax = bookings.reduce((s, b) => s + b.totalParticipants, 0);

  const pageWindow = (() => {
    const count = Math.min(totalPages, 5);
    let start = Math.max(1, currentPage - 2);
    if (start + count - 1 > totalPages) start = totalPages - count + 1;
    return Array.from({ length: count }, (_, i) => start + i);
  })();

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={NEU_ICON_WELL_PRIMARY}>
            <Ticket size={18} className="text-[#006666]" />
          </div>
          <div>
            <h2 className={`${NEU_HEADING} text-lg`}>Tour Bookings</h2>
            <p className={`${NEU_MUTED} mt-0.5`}>
              {total > 0
                ? `${total.toLocaleString()} total booking${total !== 1 ? "s" : ""}`
                : "Manage and review traveler bookings for this tour"}
            </p>
          </div>
        </div>
        <button
          className={`${NEU_BTN_GHOST} flex items-center gap-1.5`}
          onClick={handleRetry}
          disabled={isLoading}
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <AnimatePresence>
        {!isLoading && bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-3"
          >
            <StatCard
              icon={Ticket}
              label="Total Bookings"
              value={total.toLocaleString()}
              accent="text-[#006666]"
              index={0}
            />
            <StatCard
              icon={Users}
              label="Participants"
              value={pagePax.toLocaleString()}
              accent="text-[#00A63D]"
              index={1}
            />
            <StatCard
              icon={Banknote}
              label="Page Revenue"
              value={`৳${pageRevenue.toLocaleString()}`}
              accent="text-[#FE9900]"
              index={2}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table card */}
      <div className={NEU_CARD}>
        {/* Toolbar */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b ${NEU_DIVIDER}`}
        >
          <div className="relative max-w-xs w-full">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 pointer-events-none"
            />
            <input
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search traveler name or email…"
              className={NEU_INPUT}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`${NEU_LABEL} hidden sm:block normal-case`}>
              Show
            </span>
            <select
              value={String(limit)}
              onChange={(e) => {
                const n = Number(e.target.value);
                setLimit(n);
                fetchBookings(
                  companyId,
                  tourId,
                  { page: 1, limit: n, search: appliedSearch },
                  true,
                );
              }}
              className={NEU_SELECT}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={String(n)}>
                  {n} rows
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table header */}
        {!isLoading && !errorMsg && bookings.length > 0 && (
          <BookingsTableHeader
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}

        {/* Content */}
        {isLoading ? (
          <div>
            {[...Array(Math.min(limit, 6))].map((_, i) => (
              <SkeletonRow key={i} index={i} />
            ))}
          </div>
        ) : errorMsg ? (
          <ErrorState message={errorMsg} onRetry={handleRetry} />
        ) : bookings.length === 0 ? (
          <EmptyState hasSearch={!!appliedSearch} />
        ) : (
          <AnimatePresence>
            {bookings.map((b, i) => (
              <BookingRow key={b._id} booking={b} index={i} />
            ))}
          </AnimatePresence>
        )}

        {/* Pagination footer */}
        {!isLoading && !errorMsg && bookings.length > 0 && (
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t ${NEU_DIVIDER}`}
          >
            <p className={`${NEU_MONO} text-sm`}>
              Page{" "}
              <span className="font-semibold text-[#006666]">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#006666]">{totalPages}</span>
              {total > 0 && (
                <>
                  {" "}
                  · total{" "}
                  <span className="font-semibold text-[#006666]">{total}</span>
                </>
              )}
            </p>

            <div className="flex items-center gap-1">
              <button
                className={NEU_BTN_ICON}
                disabled={currentPage <= 1}
                onClick={() => doFetch(currentPage - 1, sortField, sortOrder)}
                aria-label="Previous page"
              >
                <ChevronLeft size={13} />
              </button>

              {pageWindow.map((pg) => (
                <button
                  key={pg}
                  onClick={() => doFetch(pg, sortField, sortOrder)}
                  className={
                    pg === currentPage ? NEU_BTN_ICON_ACTIVE : NEU_BTN_ICON
                  }
                >
                  {pg}
                </button>
              ))}

              <button
                className={NEU_BTN_ICON}
                disabled={currentPage >= totalPages}
                onClick={() => doFetch(currentPage + 1, sortField, sortOrder)}
                aria-label="Next page"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
