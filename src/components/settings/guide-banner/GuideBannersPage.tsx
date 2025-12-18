"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Search,
    Plus,
    AlertCircle,
    RefreshCw,
    Filter,
    ChevronLeft,
    ChevronRight,
    Layers,
    Clock,
    Database,
    Loader2,
    Sparkles,
    RotateCcw,
} from "lucide-react";
import GuideBannerList from "./GuideBannerList";
import GuideBannerForm from "./GuideBannerForm";
import GuideBannerEmptyState from "./GuideBannerEmptyState";
import type {
    GuideBannerQueryParams,
    GuideBannerSortKey,
} from "@/types/guide-banner-settings.types";
import { GUIDE_BANNER_CONSTRAINTS, GUIDE_BANNER_SORT_KEYS } from "@/types/guide-banner-settings.types";
import { formatISODate } from "@/utils/helpers/guide-banner-settings";
import { useGuideBannersStore } from "@/store/guide-bannerSetting.store";
import GuideBannerSkeleton from "./skeletons/GuideBannerSkeleton";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";

export default function GuideBannersPage() {
    const {
        fetchList,
        clearErrors,
        normalized,
        total,
        lastFetchedAt,
        listRequest,
        operations,
        optimisticRegistry
    } = useGuideBannersStore();
    const normalizedIds = normalized.allIds;

    const [createOpen, setCreateOpen] = useState(false);
    const [sortBy, setSortBy] = useState<GuideBannerSortKey>("order");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [active, setActive] = useState<boolean | undefined>(undefined);
    const [rawSearch, setRawSearch] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [limit, setLimit] = useState<number>(GUIDE_BANNER_CONSTRAINTS.defaultLimit);
    const [offset, setOffset] = useState<number>(0);

    // Fetch whenever any query param changes (limit, offset, sortBy, sortDir, active, search)
    useEffect(() => {
        // build the query matching store types
        const q: GuideBannerQueryParams = {
            limit,
            offset,
            sortBy,
            sortDir,
            active,
            search: search || undefined,
        };

        void fetchList(q).catch(() => {
            // fetchList already shows toast and sets state; swallow here to avoid unhandled rejection logs
        });
    }, [fetchList, limit, offset, sortBy, sortDir, active, search]);


    // debounce the actual query setter to avoid spamming the API while typing
    const debouncedSetSearch = useMemo(
        () =>
            debounce((value: string) => {
                // trim and set canonical search used in queries
                setSearch(value.trim());
            }, 500),
        []
    );

    // cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            debouncedSetSearch.cancel();
        };
    }, [debouncedSetSearch]);


    const pending = listRequest.status === "pending";
    const failed = listRequest.status === "failed";

    const currentQuery: GuideBannerQueryParams = useMemo(() => ({
        limit,
        offset,
        sortBy,
        sortDir,
        active,
        search: search || undefined,
    }), [limit, offset, sortBy, sortDir, active, search]);

    const handleApplyFilters = async () => {
        await fetchList(currentQuery);
    };

    const totalPages = total && limit ? Math.max(1, Math.ceil(total / limit)) : 1;
    const currentPage = Math.floor(offset / limit) + 1;

    const reorderPending = operations["reorder"]?.global?.status === "pending";
    const optimisticTempKeys = Object.keys(optimisticRegistry).filter((k) => k.startsWith("temp:"));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 space-y-6">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden"
            >
                <Card className="border-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-2xl">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '32px 32px'
                        }} />
                    </div>

                    <div className="relative p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="space-y-3">
                                <motion.div
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <Layers className="w-8 h-8 text-white" />
                                    </div>
                                    <h1 className="text-4xl font-bold text-white">Guide Banners</h1>
                                </motion.div>
                                <p className="text-emerald-50 text-lg">Manage and organize your guide banners with ease</p>
                            </div>

                            <motion.div
                                className="flex flex-wrap items-center gap-3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Button
                                    size="lg"
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl group transition-all duration-300"
                                    onClick={() => setCreateOpen(true)}
                                >
                                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                    New Banner
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                                    onClick={() => clearErrors()}
                                >
                                    Clear Errors
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-emerald-100 rounded-xl">
                            <Database className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Banners</p>
                            <p className="text-3xl font-bold text-gray-900">{total ?? 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-purple-100 rounded-xl">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 font-medium">Last Updated</p>
                            <p className="text-lg font-semibold text-gray-900 truncate">
                                {formatISODate(lastFetchedAt) || "Never"}
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Filters Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                            <Filter className="w-5 h-5" />
                            <h2 className="font-semibold text-lg">Filters & Search</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    placeholder="Search banners..."
                                    onChange={(e) => {
                                        const v = String(e.target.value);
                                        setRawSearch(v);
                                        debouncedSetSearch(v);
                                    }}
                                    value={rawSearch}
                                    className="pl-10 border-gray-200 focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as GuideBannerSortKey)}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    {GUIDE_BANNER_SORT_KEYS.map((key) => (
                                        <SelectItem key={key} value={key}>
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortDir} onValueChange={(v) => setSortDir(v as "asc" | "desc")}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="Direction" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">Ascending</SelectItem>
                                    <SelectItem value="desc">Descending</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={String(active)}
                                onValueChange={(v) => setActive(v === "undefined" ? undefined : v === "true")}
                            >
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="undefined">All Status</SelectItem>
                                    <SelectItem value="true">Active Only</SelectItem>
                                    <SelectItem value="false">Inactive Only</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="Per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map((n) => (
                                        <SelectItem key={n} value={String(n)}>{n} per page</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                                onClick={() => void handleApplyFilters()}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Apply Filters
                            </Button>
                        </motion.div>
                    </div>
                </Card>
            </motion.div>

            {/* Error Alert */}
            <AnimatePresence>
                {failed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Alert variant="destructive" className="border-red-200 bg-red-50">
                            <AlertCircle className="h-5 w-5" />
                            <AlertTitle className="text-lg font-semibold">Failed to load guide banners</AlertTitle>
                            <AlertDescription>
                                <div className="mt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-300 hover:bg-red-100"
                                        onClick={() => void fetchList({ limit })}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Retry
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reorder indicator */}
            <AnimatePresence>
                {reorderPending && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="border-0 bg-blue-50 p-4 shadow-md">
                            <div className="flex items-center gap-3 text-blue-700">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="font-medium">Reordering banners...</span>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Optimistic create indicator */}
            <AnimatePresence>
                {optimisticTempKeys.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="border-0 bg-amber-50 shadow-md">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-amber-800">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="font-medium">Creating new banner...</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-amber-300 hover:bg-amber-100"
                                    onClick={() => void fetchList({ limit })}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                {pending ? (
                    <GuideBannerSkeleton />
                ) : normalizedIds.length === 0 ? (
                    <GuideBannerEmptyState />
                ) : (
                    <GuideBannerList query={currentQuery} />
                )}
            </motion.div>

            {/* Pagination */}
            {normalizedIds.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                        <div className="p-6 flex items-center justify-between">
                            <div className="text-sm text-gray-600 font-medium">
                                Page <span className="text-emerald-600 font-bold text-lg mx-1">{currentPage}</span>
                                of <span className="text-emerald-600 font-bold text-lg mx-1">{totalPages}</span>
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setOffset(Math.max(0, offset - limit))}
                                            disabled={currentPage === 1}
                                            className="gap-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </Button>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setOffset(Math.min((totalPages - 1) * limit, offset + limit))}
                                            disabled={currentPage === totalPages}
                                            className="gap-2"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </Card>
                </motion.div>
            )}

            {createOpen && (
                <GuideBannerForm mode="create" onClose={() => setCreateOpen(false)} />
            )}
        </div>
    );
}