"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2, X, List } from "lucide-react";
import RequestRow from "./RequestRow";
import PaginationControls from "./PaginationControls";
import { REQUEST_STATUS, RequestStatus } from "@/constants/reset-password-request.const";
import { useResetRequestsStore } from "@/store/employee/reset-requests.store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResetRequestListQuery } from "@/types/employee/password-reset.types";
import RequestSkeletonRow from "./skeletons/RequestSkeletonRow";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

// Available page limit options
const PAGE_LIMIT_OPTIONS = [10, 20, 50, 100] as const;

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

    // Create a debounced search callback
    const debouncedSearch = useDebouncedCallback(
        async (term: string) => {
            setIsSearching(true);
            
            const newQuery = {
                ...currentQuery,
                search: term.trim() || undefined,
                page: 1,
            };

            setQuery(newQuery);
            await fetchList(newQuery);
            
            setIsSearching(false);
        },
        300 // 300ms delay
    );

    // Update search term in UI immediately, trigger debounced search
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    // Handle Enter key press for immediate search
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // Cancel any pending debounced search
            if (debouncedSearch.cancel) {
                debouncedSearch.cancel();
            }
            
            // Execute search immediately
            setIsSearching(true);
            const newQuery = {
                ...currentQuery,
                search: searchTerm.trim() || undefined,
                page: 1,
            };
            
            setQuery(newQuery);
            fetchList(newQuery).finally(() => {
                setIsSearching(false);
            });
        }
    }, [debouncedSearch, searchTerm, currentQuery, setQuery, fetchList]);

    // Handle search button click
    const handleSearchClick = useCallback(() => {
        // Cancel any pending debounced search
        if (debouncedSearch.cancel) {
            debouncedSearch.cancel();
        }
        
        // Execute search immediately
        setIsSearching(true);
        const newQuery = {
            ...currentQuery,
            search: searchTerm.trim() || undefined,
            page: 1,
        };
        
        setQuery(newQuery);
        fetchList(newQuery).finally(() => {
            setIsSearching(false);
        });
    }, [debouncedSearch, searchTerm, currentQuery, setQuery, fetchList]);

    // Handle clear search
    const clearSearch = useCallback(async () => {
        setSearchTerm("");
        
        // Cancel any pending debounced search
        if (debouncedSearch.cancel) {
            debouncedSearch.cancel();
        }
        
        setIsSearching(true);
        const newQuery = {
            ...currentQuery,
            search: undefined,
            page: 1,
        };
        
        setQuery(newQuery);
        await fetchList(newQuery);
        setIsSearching(false);
    }, [debouncedSearch, currentQuery, setQuery, fetchList]);

    // Clean up debounced callbacks on unmount
    useEffect(() => {
        return () => {
            if (debouncedSearch.cancel) {
                debouncedSearch.cancel();
            }
        };
    }, [debouncedSearch]);

    const rows = useMemo(
        () => currentPageIds.map((id) => entities[id]).filter(Boolean),
        [currentPageIds, entities]
    );

    const onStatusChange = useCallback(async (val?: ResetRequestListQuery["status"]) => {
        setQuery({ status: val, page: 1 });
        await fetchList({ ...currentQuery, status: val, page: 1 });
    }, [currentQuery, setQuery, fetchList]);

    const onLimitChange = useCallback(async (limit: number) => {
        setQuery({ limit, page: 1 });
        await fetchList({ ...currentQuery, limit, page: 1 });
    }, [currentQuery, setQuery, fetchList]);

    // Synchronous wrapper required by Select's onValueChange signature
    const handleSelectValueChange = useCallback((value: string): void => {
        // Map the incoming string to your status union
        const mapped: ResetRequestListQuery["status"] =
            value === "all" ? "all" : (value as RequestStatus);

        // Call the async handler and intentionally ignore the Promise (void)
        void onStatusChange(mapped);
    }, [onStatusChange]);

    const handleLimitChange = useCallback((value: string): void => {
        const limit = parseInt(value, 10);
        void onLimitChange(limit);
    }, [onLimitChange]);

    return (
        <section className="space-y-6 p-6">
            {/* Filters & Actions Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-3 items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800"
            >
                {/* Search Input */}
                <div className="flex-1 min-w-[280px] relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>

                    <Input
                        placeholder="Search by email, name or mobile..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-label="Search requests"
                        className="pl-12 pr-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-full shadow-sm focus:shadow-md transition-shadow duration-150"
                    />

                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Search Button */}
                <Button
                    onClick={handleSearchClick}
                    disabled={isSearching || isFetching}
                    aria-label="Execute search"
                    className="ml-2 rounded-full px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                >
                    {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                    <span className="font-medium">Search</span>
                </Button>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <Select
                        onValueChange={handleSelectValueChange}
                        value={currentQuery.status ?? "all"}
                    >
                        <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value={REQUEST_STATUS.PENDING}>Pending</SelectItem>
                            <SelectItem value={REQUEST_STATUS.DENIED}>Denied</SelectItem>
                            <SelectItem value={REQUEST_STATUS.FULFILLED}>Fulfilled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Page Limit Selector */}
                <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-slate-500" />
                    <Select
                        onValueChange={handleLimitChange}
                        value={String(currentQuery.limit ?? 20)}
                    >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Per page" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_LIMIT_OPTIONS.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Revalidating Badge */}
                {revalidating && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <Badge variant="secondary" className="gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Refreshing
                        </Badge>
                    </motion.div>
                )}
            </motion.div>

            {/* Table */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Requested At</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    {/* Ensure TableBody only contains TRs (no nested tbody) */}
                    <TableBody>
                        {/* isFetching state (single table row spanning all columns) */}
                        {isFetching && !revalidating ? (
                            Array.from({ length: currentQuery.limit ?? 20 }).map((_, i) => (<RequestSkeletonRow key={i} />))
                        ) : rows.length === 0 ? (
                            <TableRow key="empty">
                                <TableCell colSpan={6} className="h-64">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Search className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-slate-700 dark:text-slate-300">No requests found</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Normal rows: render RequestRow components (they return <tr />)
                            rows.map((r) => <RequestRow key={r.id} entity={r} />)
                        )}
                    </TableBody>
                </Table>
            </div>


            {/* Pagination */}
            {rows.length > 0 && <PaginationControls />}
        </section>
    );
}