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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

interface TourBookingsPanelProps {
    companyId: string;
    tourId: string;
}

type SortField = "bookingTime" | "totalParticipants" | "totalPaid";
type SortOrder = "asc" | "desc";

/** avatar | traveler | pax (sm+) | amount (md+) | booked */
const BOOKINGS_TABLE_GRID =
    "grid grid-cols-[36px_minmax(0,1fr)_7rem] sm:grid-cols-[36px_minmax(0,1fr)_4.5rem_7rem] md:grid-cols-[36px_minmax(0,1fr)_4.5rem_6rem_7.5rem] gap-x-3 items-center";

const TABLE_ROW_CLASS = cn(BOOKINGS_TABLE_GRID, "px-5");

const AVATAR_GRADIENTS = [
    "from-violet-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
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
            className={cn(TABLE_ROW_CLASS, "py-4 border-b border-border/50 last:border-0")}
        >
            <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
            <div className="min-w-0 space-y-2">
                <div className="h-3.5 bg-muted rounded-full animate-pulse w-32" />
                <div className="h-2.5 bg-muted/60 rounded-full animate-pulse w-48" />
            </div>
            <div className="hidden sm:block h-6 w-full max-w-[4.5rem] justify-self-center bg-muted rounded-full animate-pulse" />
            <div className="hidden md:block h-3.5 w-full max-w-[6rem] justify-self-end bg-muted rounded-full animate-pulse" />
            <div className="h-3 w-full max-w-[7.5rem] justify-self-end bg-muted/60 rounded-full animate-pulse" />
        </motion.div>
    );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
        >
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
                <Ticket size={26} className="text-muted-foreground/40" />
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground/70">
                    {hasSearch ? "No matching bookings" : "No bookings yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                    {hasSearch
                        ? "Try a different traveler name or email"
                        : "Bookings for this tour will appear here"}
                </p>
            </div>
        </motion.div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
        >
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <AlertCircle size={24} className="text-destructive/60" />
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground/80">Failed to load bookings</p>
                <p className="text-xs text-muted-foreground max-w-xs">{message}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 mt-1 h-8">
                <RefreshCw size={12} />
                Try again
            </Button>
        </motion.div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    colorClass,
    index = 0,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    colorClass: string;
    index?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border", colorClass)}
        >
            <div className="shrink-0 opacity-80">
                <Icon size={15} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-medium opacity-60 leading-none mb-0.5">
                    {label}
                </p>
                <p className="text-sm font-bold leading-none">{value}</p>
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
            className={cn(
                "inline-flex items-center gap-1 w-full text-[10.5px] font-semibold uppercase tracking-wider transition-colors select-none",
                align === "center" && "justify-center",
                align === "end" && "justify-end",
                active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/70"
            )}
        >
            {label}
            {active ? (
                order === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />
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
        <div
            className={cn(
                TABLE_ROW_CLASS,
                "py-2.5 bg-muted/10 border-b border-border/40"
            )}
        >
            <div aria-hidden className="w-9" />
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Traveler
            </span>
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

function BookingRow({ booking, index }: { booking: BookingListItemDTO; index: number }) {
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
            transition={{ duration: 0.22, delay: index * 0.028, ease: "easeOut" }}
            className={cn(
                TABLE_ROW_CLASS,
                "group py-3.5 border-b border-border/40 last:border-0 hover:bg-muted/25 transition-colors duration-100 cursor-default"
            )}
        >
            {/* Avatar */}
            <Avatar className="w-9 h-9 rounded-xl ring-1 ring-border/50">
                {booking.user.avatarUrl && (
                    <AvatarImage src={booking.user.avatarUrl} alt={booking.user.name} />
                )}
                <AvatarFallback
                    className={cn(
                        "rounded-xl text-white text-[11px] font-bold bg-gradient-to-br",
                        gradient
                    )}
                >
                    {initials}
                </AvatarFallback>
            </Avatar>

            {/* Name & email */}
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                    {booking.user.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                    {booking.user.email}
                </p>
            </div>

            {/* Participants (sm+) */}
            <TooltipProvider delayDuration={180}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="hidden sm:flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/50 text-muted-foreground justify-self-center w-fit mx-auto">
                            <Users size={11} />
                            <span className="text-xs font-semibold tabular-nums">
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

            {/* Amount (md+) */}
            <div className="hidden md:block justify-self-end text-right">
                <span className="text-sm font-bold text-foreground font-mono tabular-nums">
                    ৳{booking.totalPaid.toLocaleString()}
                </span>
            </div>

            {/* Booking time */}
            <TooltipProvider delayDuration={180}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center justify-end gap-1.5 text-muted-foreground justify-self-end w-full min-w-0">
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

export default function TourBookingsPanel({ companyId, tourId }: TourBookingsPanelProps) {
    const { fetchBookings, listCache, activeCacheKey, loading, error, params: storeParams } =
        useCompanyDetailStore();

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

    const [localSearch, setLocalSearch] = useState(tourBookingParams?.search ?? "");
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
            search?: string
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
                force
            );
        },
        [companyId, tourId, fetchBookings, limit, appliedSearch]
    );

    const debouncedSearch = useDebouncedCallback(
        useCallback(
            (searchValue: string) => {
                doFetch(1, sortField, sortOrder, true, searchValue);
            },
            [doFetch, sortField, sortOrder]
        ),
        400
    );

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setLocalSearch(value);

            if (value === "") {
                doFetch(1, sortField, sortOrder, true, "");
            } else {
                debouncedSearch(value);
            }
        },
        [doFetch, sortField, sortOrder, debouncedSearch]
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

    const stats = [
        {
            icon: Ticket,
            label: "Total Bookings",
            value: total.toLocaleString(),
            colorClass: "bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-300",
        },
        {
            icon: Users,
            label: "Participants",
            value: pagePax.toLocaleString(),
            colorClass: "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300",
        },
        {
            icon: Banknote,
            label: "Page Revenue",
            value: `৳${pageRevenue.toLocaleString()}`,
            colorClass: "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300",
        },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Ticket size={16} className="text-primary" />
                        Tour Bookings
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {total > 0
                            ? `${total.toLocaleString()} total booking${total !== 1 ? "s" : ""}`
                            : "Manage and review traveler bookings for this tour"}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="h-8 gap-1.5 shrink-0"
                >
                    <RefreshCw size={12} className={cn(isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            <AnimatePresence>
                {!isLoading && bookings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-wrap gap-2.5"
                    >
                        {stats.map((s, i) => (
                            <StatCard key={i} {...s} index={i} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.02)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/50 bg-muted/15">
                    <div className="relative max-w-xs w-full">
                        <Search
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <Input
                            value={localSearch}
                            onChange={handleSearchChange}
                            placeholder="Search traveler name or email…"
                            className="pl-8 h-8 text-xs bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary/40"
                        />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:block">Show</span>
                        <Select
                            value={String(limit)}
                            onValueChange={(v) => {
                                const n = Number(v);
                                setLimit(n);
                                fetchBookings(
                                    companyId,
                                    tourId,
                                    { page: 1, limit: n, search: appliedSearch },
                                    true
                                );
                            }}
                        >
                            <SelectTrigger className="h-8 w-[90px] text-xs border-border/60 bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[5, 10, 20, 50].map((n) => (
                                    <SelectItem key={n} value={String(n)} className="text-xs">
                                        {n} rows
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!isLoading && !errorMsg && bookings.length > 0 && (
                    <BookingsTableHeader
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                    />
                )}

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

                {!isLoading && !errorMsg && bookings.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-border/40 bg-muted/10">
                        <p className="text-xs text-muted-foreground">
                            Page{" "}
                            <span className="font-semibold text-foreground">{currentPage}</span>{" "}
                            of{" "}
                            <span className="font-semibold text-foreground">{totalPages}</span>
                            {total > 0 && (
                                <>
                                    {" "}· total{" "}
                                    <span className="font-semibold text-foreground">
                                        {total}
                                    </span>
                                </>
                            )}
                        </p>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-lg"
                                disabled={currentPage <= 1}
                                onClick={() => doFetch(currentPage - 1, sortField, sortOrder)}
                            >
                                <ChevronLeft size={13} />
                            </Button>

                            {pageWindow.map((pg) => (
                                <Button
                                    key={pg}
                                    variant={pg === currentPage ? "default" : "outline"}
                                    size="icon"
                                    className="h-7 w-7 rounded-lg text-xs"
                                    onClick={() => doFetch(pg, sortField, sortOrder)}
                                >
                                    {pg}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-lg"
                                disabled={currentPage >= totalPages}
                                onClick={() => doFetch(currentPage + 1, sortField, sortOrder)}
                            >
                                <ChevronRight size={13} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}