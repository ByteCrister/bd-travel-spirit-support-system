"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    MdSearch,
    MdSort,
    MdViewList,
    MdArrowUpward,
    MdArrowDownward,
    MdClose,
    MdFilterList
} from "react-icons/md";

import { SortableTourKeys } from "@/types/tour.types";
import { motion, AnimatePresence } from "framer-motion";

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
            updatedAt: "Updated"
        };
        return labels[key] || key;
    };

    const handleClearSearch = () => {
        onSearch("");
    };

    return (
        <div className="space-y-4">
            {/* Main Filters Grid */}
            <div className="grid grid-cols-12 gap-5 items-end">
                {/* Search Input */}
                <motion.div
                    className="col-span-12 md:col-span-5 space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                        Search
                    </Label>

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 blur transition-all duration-300" />
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md bg-blue-600/10">
                                <MdSearch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>

                            <Input
                                id="search"
                                value={search}
                                onChange={(e) => onSearch(e.target.value)}
                                placeholder={activeTab === "tours" ? "Search tours..." : "Search employees..."}
                                className="pl-11 pr-10 h-11 transition-all duration-200"
                            />

                            <AnimatePresence>
                                {search && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearSearch}
                                            className="h-7 w-7 p-0 rounded-md"
                                        >
                                            <MdClose className="h-4 w-4" />
                                            <span className="sr-only">Clear search</span>
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* Sort By */}
                <motion.div
                    className="col-span-12 md:col-span-4 space-y-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                >
                    <Label htmlFor="sort-by" className="text-sm font-medium flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-violet-500" />
                        Sort by
                    </Label>

                    <div className="relative group">
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/10">
                                <MdSort className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>

                            {activeTab === "tours" ? (
                                <Select value={sortKey} onValueChange={(v) => onSortKeyChange(v as SortableTourKeys)}>
                                    <SelectTrigger id="sort-by" className="pl-11 h-11 transition-all duration-200">
                                        <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        <SelectItem value="title">Title</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="startDate">Start Date</SelectItem>
                                        <SelectItem value="endDate">End Date</SelectItem>
                                        <SelectItem value="durationDays">Duration</SelectItem>
                                        <SelectItem value="averageRating">Rating</SelectItem>
                                        <SelectItem value="bookingCount">Bookings</SelectItem>
                                        <Separator className="my-1.5" />
                                        <SelectItem value="createdAt">Created</SelectItem>
                                        <SelectItem value="updatedAt">Updated</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Select value={employeeSortKey} onValueChange={(v) => onEmployeeSortKeyChange(v)}>
                                    <SelectTrigger id="sort-by" className="pl-11 h-11 transition-all duration-200">
                                        <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        <SelectItem value="fullName">Name</SelectItem>
                                        <SelectItem value="employmentType">Employment Type</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="dateOfJoining">Joined</SelectItem>
                                        <SelectItem value="dateOfLeaving">Left</SelectItem>
                                        <Separator className="my-1.5" />
                                        <SelectItem value="createdAt">Created</SelectItem>
                                        <SelectItem value="updatedAt">Updated</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Order & Limit */}
                <motion.div
                    className="col-span-12 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-14"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    {/* Order */}
                    <div className="space-y-2">
                        <Label htmlFor="sort-order" className="text-sm font-medium flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            Order
                        </Label>

                        <Select value={sortOrder} onValueChange={(v) => onSortOrderChange(v as "asc" | "desc")}>
                            <SelectTrigger id="sort-order" className="h-11 transition-all duration-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">
                                    <div className="flex items-center gap-2">
                                        <MdArrowUpward className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Ascending</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="desc">
                                    <div className="flex items-center gap-2">
                                        <MdArrowDownward className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Descending</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Limit */}
                    <div className="space-y-2">
                        <Label htmlFor="limit" className="text-sm font-medium flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-amber-500" />
                            Show
                        </Label>

                        <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
                            <SelectTrigger id="limit" className="h-11 transition-all duration-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 items</SelectItem>
                                <SelectItem value="20">20 items</SelectItem>
                                <SelectItem value="50">50 items</SelectItem>
                                <SelectItem value="100">100 items</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>
            </div>

            {/* Active Filters Summary */}
            <AnimatePresence>
                {hasActiveFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="relative rounded-lg border border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/50 via-background to-background dark:from-blue-950/20 px-4 py-3.5 shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-50 rounded-lg" />
                            <div className="relative flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600/10">
                                        <MdFilterList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-medium">
                                        Active Filters
                                    </span>
                                </div>

                                <Separator orientation="vertical" className="h-5" />

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="gap-1.5 rounded-md border-blue-200 dark:border-blue-800/50 bg-blue-100/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <MdSearch className="h-3.5 w-3.5" />
                                        <span className="max-w-[180px] truncate">{search}</span>
                                    </Badge>

                                    <Badge
                                        variant="secondary"
                                        className="gap-1.5 rounded-md border-violet-200 dark:border-violet-800/50 bg-violet-100/50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-medium shadow-sm"
                                    >
                                        <MdSort className="h-3.5 w-3.5" />
                                        {getSortLabel(activeTab === "tours" ? sortKey : employeeSortKey)}
                                    </Badge>

                                    <Badge
                                        variant="secondary"
                                        className="gap-1.5 rounded-md border-emerald-200 dark:border-emerald-800/50 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm"
                                    >
                                        {sortOrder === "asc" ? (
                                            <MdArrowUpward className="h-3.5 w-3.5" />
                                        ) : (
                                            <MdArrowDownward className="h-3.5 w-3.5" />
                                        )}
                                        {sortOrder === "asc" ? "Ascending" : "Descending"}
                                    </Badge>

                                    <Badge
                                        variant="secondary"
                                        className="gap-1.5 rounded-md border-amber-200 dark:border-amber-800/50 bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-medium shadow-sm"
                                    >
                                        <MdViewList className="h-3.5 w-3.5" />
                                        {limit} items
                                    </Badge>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearSearch}
                                    className="ml-auto h-8 gap-1.5 px-3 text-xs font-medium hover:bg-blue-100/50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    <MdClose className="h-3.5 w-3.5" />
                                    Clear all
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
