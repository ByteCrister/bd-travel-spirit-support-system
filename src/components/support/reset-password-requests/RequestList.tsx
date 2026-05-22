"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Loader2, X, List } from "lucide-react";
import RequestRow from "./RequestRow";
import PaginationControls from "./PaginationControls";
import { REQUEST_STATUS, RequestStatus } from "@/constants/reset-password-request.const";
import { useResetRequestsStore } from "@/store/employee/reset-requests.store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResetRequestListQuery } from "@/types/employee/password-reset.types";
import RequestSkeletonRow from "./skeletons/RequestSkeletonRow";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

// ─── Neumorphism Style Tokens ────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_SURFACE_RAISED =
    "bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";
const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_SELECT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm font-[family-name:var(--font-jetbrains-mono)] " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 px-3 py-2 cursor-pointer appearance-none";
const NEU_BADGE_WARNING =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
// ────────────────────────────────────────────────────────────

const PAGE_LIMIT_OPTIONS = [10, 20, 50, 100] as const;

const STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: REQUEST_STATUS.PENDING, label: "Pending" },
    { value: REQUEST_STATUS.DENIED, label: "Denied" },
    { value: REQUEST_STATUS.FULFILLED, label: "Fulfilled" },
];

export default function RequestList() {
    const {
        currentQuery,
        setQuery,
        fetchList,
        currentPageIds,
        entities,
        isFetching,
        revalidating,
    } = useResetRequestsStore();

    const [searchTerm, setSearchTerm] = useState(currentQuery.search ?? "");
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearch = useDebouncedCallback(async (term: string) => {
        setIsSearching(true);
        const newQuery = { ...currentQuery, search: term.trim() || undefined, page: 1 };
        setQuery(newQuery);
        await fetchList(newQuery);
        setIsSearching(false);
    }, 300);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value);
            debouncedSearch(value);
        },
        [debouncedSearch]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                if (debouncedSearch.cancel) debouncedSearch.cancel();
                setIsSearching(true);
                const newQuery = { ...currentQuery, search: searchTerm.trim() || undefined, page: 1 };
                setQuery(newQuery);
                fetchList(newQuery).finally(() => setIsSearching(false));
            }
        },
        [debouncedSearch, searchTerm, currentQuery, setQuery, fetchList]
    );

    const handleSearchClick = useCallback(() => {
        if (debouncedSearch.cancel) debouncedSearch.cancel();
        setIsSearching(true);
        const newQuery = { ...currentQuery, search: searchTerm.trim() || undefined, page: 1 };
        setQuery(newQuery);
        fetchList(newQuery).finally(() => setIsSearching(false));
    }, [debouncedSearch, searchTerm, currentQuery, setQuery, fetchList]);

    const clearSearch = useCallback(async () => {
        setSearchTerm("");
        if (debouncedSearch.cancel) debouncedSearch.cancel();
        setIsSearching(true);
        const newQuery = { ...currentQuery, search: undefined, page: 1 };
        setQuery(newQuery);
        await fetchList(newQuery);
        setIsSearching(false);
    }, [debouncedSearch, currentQuery, setQuery, fetchList]);

    useEffect(() => {
        return () => { if (debouncedSearch.cancel) debouncedSearch.cancel(); };
    }, [debouncedSearch]);

    const rows = useMemo(
        () => currentPageIds.map((id) => entities[id]).filter(Boolean),
        [currentPageIds, entities]
    );

    const onStatusChange = useCallback(
        async (val?: ResetRequestListQuery["status"]) => {
            setQuery({ status: val, page: 1 });
            await fetchList({ ...currentQuery, status: val, page: 1 });
        },
        [currentQuery, setQuery, fetchList]
    );

    const onLimitChange = useCallback(
        async (limit: number) => {
            setQuery({ limit, page: 1 });
            await fetchList({ ...currentQuery, limit, page: 1 });
        },
        [currentQuery, setQuery, fetchList]
    );

    const handleSelectValueChange = useCallback(
        (value: string): void => {
            const mapped: ResetRequestListQuery["status"] =
                value === "all" ? "all" : (value as RequestStatus);
            void onStatusChange(mapped);
        },
        [onStatusChange]
    );

    const handleLimitChange = useCallback(
        (value: string): void => {
            void onLimitChange(parseInt(value, 10));
        },
        [onLimitChange]
    );

    return (
        <section className={`${NEU_SURFACE} p-4 lg:p-6 space-y-6`}>

            {/* ── Filters Bar ───────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-3 items-end"
            >
                {/* Search */}
                <div className="flex-1 min-w-[240px] space-y-1.5">
                    <label className={NEU_LABEL}>Search</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#1E2938]/40 pointer-events-none">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            placeholder="Email, name or mobile…"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            aria-label="Search requests"
                            className={`${NEU_INPUT} w-full pl-10 pr-10 py-2.5`}
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                aria-label="Clear search"
                                className="absolute right-3 text-[#1E2938]/40 hover:text-[#1E2938] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search button */}
                <button
                    onClick={handleSearchClick}
                    disabled={isSearching || isFetching}
                    aria-label="Execute search"
                    className={`${NEU_BTN_PRIMARY} flex items-center gap-2 px-4 py-2.5 text-sm`}
                >
                    {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                    Search
                </button>

                {/* Status filter */}
                <div className="space-y-1.5">
                    <label className={`${NEU_LABEL} flex items-center gap-1`}>
                        <Filter className="w-3 h-3" /> Status
                    </label>
                    <select
                        value={currentQuery.status ?? "all"}
                        onChange={(e) => handleSelectValueChange(e.target.value)}
                        className={`${NEU_SELECT} w-[160px]`}
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Page limit */}
                <div className="space-y-1.5">
                    <label className={`${NEU_LABEL} flex items-center gap-1`}>
                        <List className="w-3 h-3" /> Per page
                    </label>
                    <select
                        value={String(currentQuery.limit ?? 20)}
                        onChange={(e) => handleLimitChange(e.target.value)}
                        className={`${NEU_SELECT} w-[130px]`}
                    >
                        {PAGE_LIMIT_OPTIONS.map((o) => (
                            <option key={o} value={String(o)}>
                                {o} / page
                            </option>
                        ))}
                    </select>
                </div>

                {/* Revalidating badge */}
                {revalidating && (
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={NEU_BADGE_WARNING}
                    >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Refreshing
                    </motion.span>
                )}
            </motion.div>

            {/* ── Table ─────────────────────────────────────────────── */}
            <div className={`${NEU_SURFACE_INSET} rounded-2xl overflow-hidden`}>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className={`${NEU_SURFACE_RAISED} border-b border-[#1E2938]/10 hover:bg-transparent`}>
                                {["Email", "Name", "Status", "Requested At", "Actions"].map((h, i) => (
                                    <TableHead
                                        key={h}
                                        className={`py-3 px-4 font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-widest text-[#1E2938]/60 ${i === 4 ? "text-right" : ""}`}
                                    >
                                        {h}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isFetching && !revalidating ? (
                                Array.from({ length: currentQuery.limit ?? 20 }).map((_, i) => (
                                    <RequestSkeletonRow key={i} />
                                ))
                            ) : rows.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={5} className="h-64">
                                        <div className="flex flex-col items-center justify-center gap-3 py-8">
                                            <div
                                                className={`w-16 h-16 rounded-2xl ${NEU_SURFACE_RAISED} flex items-center justify-center`}
                                            >
                                                <Search className="w-7 h-7 text-[#1E2938]/30" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-sm">
                                                    No requests found
                                                </p>
                                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-1">
                                                    Try adjusting your search or filters
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((r) => <RequestRow key={r.id} entity={r} />)
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            {rows.length > 0 && <PaginationControls />}
        </section>
    );
}