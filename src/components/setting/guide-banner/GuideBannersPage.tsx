"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search, Plus, AlertCircle, RefreshCw, Filter, ChevronLeft, ChevronRight,
    Layers, Clock, Database, Loader2, Sparkles, RotateCcw,
} from "lucide-react";
import GuideBannerList from "./GuideBannerList";
import GuideBannerForm from "./GuideBannerForm";
import GuideBannerEmptyState from "./GuideBannerEmptyState";
import type { GuideBannerQueryParams, GuideBannerSortKey } from "@/types/site-settings/guide-banner-settings.types";
import { GUIDE_BANNER_CONSTRAINTS, GUIDE_BANNER_SORT_KEYS } from "@/types/site-settings/guide-banner-settings.types";
import { formatISODate } from "@/utils/helpers/guide-banner-settings";
import { useGuideBannersStore } from "@/store/guide/guide-bannerSetting.store";
import GuideBannerSkeleton from "./skeletons/GuideBannerSkeleton";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide text-sm " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
const NEU_INPUT =
    "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/35 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_BADGE =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938]/60 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_PRIMARY =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Guide Banners", href: "/setting/guide-banners" },
];

export default function GuideBannersPage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fetchList, clearErrors, normalized, total, lastFetchedAt, listRequest, operations, optimisticRegistry } =
        useGuideBannersStore();
    const normalizedIds = normalized.allIds;

    const [createOpen, setCreateOpen] = useState(false);
    const [sortBy, setSortBy] = useState<GuideBannerSortKey>("order");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [active, setActive] = useState<boolean | undefined>(undefined);
    const [rawSearch, setRawSearch] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [limit, setLimit] = useState<number>(GUIDE_BANNER_CONSTRAINTS.defaultLimit);
    const [offset, setOffset] = useState<number>(0);

    useEffect(() => {
        const q: GuideBannerQueryParams = { limit, offset, sortBy, sortDir, active, search: search || undefined };
        void fetchList(q);
    }, [fetchList, limit, offset, sortBy, sortDir, active, search]);

    const debouncedSetSearch = useMemo(
        () => debounce((value: string) => { setSearch(value.trim()); }, 500),
        []
    );
    useEffect(() => () => { debouncedSetSearch.cancel(); }, [debouncedSetSearch]);

    const pending = listRequest.status === "pending";
    const failed = listRequest.status === "failed";

    const currentQuery: GuideBannerQueryParams = useMemo(
        () => ({ limit, offset, sortBy, sortDir, active, search: search || undefined }),
        [limit, offset, sortBy, sortDir, active, search]
    );

    const handleApplyFilters = async () => { await fetchList(currentQuery); };
    const totalPages = total && limit ? Math.max(1, Math.ceil(total / limit)) : 1;
    const currentPage = Math.floor(offset / limit) + 1;
    const reorderPending = operations["reorder"]?.global?.status === "pending";
    const optimisticTempKeys = Object.keys(optimisticRegistry).filter((k) => k.startsWith("temp:"));

    return (
        <div className={`${NEU_PAGE_BG} p-4 lg:p-6 xl:p-8 space-y-6`}>
            <Breadcrumbs items={breadcrumbItems} />

            {/* ── Page header ─────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className={NEU_CARD}>
                    <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        {/* Title */}
                        <div className="flex items-center gap-4">
                            <div className={`${NEU_ICON_WELL} flex-shrink-0`}>
                                <Layers className="w-6 h-6 text-[#006666]" />
                            </div>
                            <div>
                                <h1 className={`${NEU_HEADING} text-2xl`}>Guide Banners</h1>
                                <p className={`${NEU_MUTED} mt-0.5`}>Manage and organize your guide banners</p>
                            </div>
                        </div>

                        {/* Header actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            {lastFetchedAt && (
                                <div className={`${NEU_SURFACE_INSET} flex items-center gap-2 px-3 py-2 rounded-xl`}>
                                    <Clock className="w-3.5 h-3.5 text-[#1E2938]/40" />
                                    <span className={`${NEU_LABEL} normal-case font-normal text-[11px]`}>
                                        {formatISODate(lastFetchedAt)}
                                    </span>
                                </div>
                            )}

                            <div className={`${NEU_SURFACE_INSET} flex items-center gap-2 px-3 py-2 rounded-xl`}>
                                <Database className="w-3.5 h-3.5 text-[#1E2938]/40" />
                                <span className={`${NEU_LABEL} normal-case font-normal text-[11px]`}>
                                    {total ?? normalizedIds.length} records
                                </span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setCreateOpen(true)}
                                className={`${NEU_BTN_PRIMARY} flex items-center gap-2 px-4 py-2.5`}
                            >
                                <Plus className="w-4 h-4" />
                                New Banner
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => void fetchList({ limit })}
                                disabled={pending}
                                className={`${NEU_BTN_GHOST} flex items-center gap-2 px-4 py-2.5`}
                            >
                                {pending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                Refresh
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Filter bar ──────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
            >
                <div className={NEU_CARD_SM}>
                    <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Filter className="w-3.5 h-3.5 text-[#006666]" />
                            <span className={NEU_LABEL}>Filters</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Search */}
                            <div className="relative sm:col-span-2 lg:col-span-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E2938]/35 pointer-events-none" />
                                <input
                                    type="text"
                                    value={rawSearch}
                                    onChange={(e) => { setRawSearch(e.target.value); debouncedSetSearch(e.target.value); }}
                                    placeholder="Search banners…"
                                    className={`${NEU_INPUT} pl-9`}
                                />
                            </div>

                            {/* Sort key */}
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as GuideBannerSortKey)}>
                                <SelectTrigger className={`${NEU_INPUT} flex items-center gap-2 cursor-pointer`}>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#E7E5E4] border-0 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
                                    {GUIDE_BANNER_SORT_KEYS.map((k) => (
                                        <SelectItem key={k} value={k} className="font-[family-name:var(--font-space-mono)] text-xs">
                                            {k}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Sort direction */}
                            <Select value={sortDir} onValueChange={(v) => setSortDir(v as "asc" | "desc")}>
                                <SelectTrigger className={`${NEU_INPUT} flex items-center gap-2 cursor-pointer`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#E7E5E4] border-0 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
                                    <SelectItem value="asc" className="font-[family-name:var(--font-space-mono)] text-xs">Ascending</SelectItem>
                                    <SelectItem value="desc" className="font-[family-name:var(--font-space-mono)] text-xs">Descending</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Active filter */}
                            <Select
                                value={active === undefined ? "all" : String(active)}
                                onValueChange={(v) => setActive(v === "all" ? undefined : v === "true")}
                            >
                                <SelectTrigger className={`${NEU_INPUT} flex items-center gap-2 cursor-pointer`}>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#E7E5E4] border-0 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
                                    <SelectItem value="all" className="font-[family-name:var(--font-space-mono)] text-xs">All statuses</SelectItem>
                                    <SelectItem value="true" className="font-[family-name:var(--font-space-mono)] text-xs">Active only</SelectItem>
                                    <SelectItem value="false" className="font-[family-name:var(--font-space-mono)] text-xs">Inactive only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                            {/* Per page */}
                            <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                                <SelectTrigger className={`${NEU_INPUT} w-full sm:w-40 flex items-center gap-2 cursor-pointer`}>
                                    <SelectValue placeholder="Per page" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#E7E5E4] border-0 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
                                    {[10, 25, 50, 100].map((n) => (
                                        <SelectItem key={n} value={String(n)} className="font-[family-name:var(--font-space-mono)] text-xs">
                                            {n} per page
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => void handleApplyFilters()}
                                className={`${NEU_BTN_PRIMARY} flex items-center justify-center gap-2 px-5 py-2.5 flex-1 sm:flex-none`}
                            >
                                <Filter className="w-3.5 h-3.5" />
                                Apply Filters
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Error alert ─────────────────────────────────────── */}
            <AnimatePresence>
                {failed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className={`${NEU_CARD_SM} p-4 flex items-start gap-3`}>
                            <AlertCircle className="h-5 w-5 text-[#FF2157] flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className={`${NEU_HEADING} text-sm text-[#FF2157]`}>Failed to load guide banners</p>
                                <p className={`${NEU_MUTED} mt-0.5`}>Something went wrong. Please try again.</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => void fetchList({ limit })}
                                className={`${NEU_BTN_GHOST} flex items-center gap-2 px-3 py-2 text-xs flex-shrink-0`}
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Retry
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Reorder indicator ───────────────────────────────── */}
            <AnimatePresence>
                {reorderPending && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <div className={`${NEU_CARD_SM} p-3.5 flex items-center gap-3`}>
                            <Loader2 className="w-4 h-4 animate-spin text-[#006666]" />
                            <span className={`${NEU_BADGE_PRIMARY}`}>Reordering banners…</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Optimistic create indicator ─────────────────────── */}
            <AnimatePresence>
                {optimisticTempKeys.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <div className={`${NEU_CARD_SM} p-3.5 flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-[#FE9900]" />
                                <span className={NEU_BADGE_WARNING}>Creating new banner…</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => void fetchList({ limit })}
                                className={`${NEU_BTN_GHOST} flex items-center gap-2 px-3 py-2 text-xs`}
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Refresh
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main content ────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
            >
                {pending ? (
                    <GuideBannerSkeleton />
                ) : normalizedIds.length === 0 ? (
                    <GuideBannerEmptyState />
                ) : (
                    <GuideBannerList query={currentQuery} />
                )}
            </motion.div>

            {/* ── Pagination ──────────────────────────────────────── */}
            {normalizedIds.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className={`${NEU_CARD_SM} p-4 flex flex-wrap items-center justify-between gap-4`}>
                        <div className={`flex items-center gap-2 ${NEU_MUTED}`}>
                            <span>Page</span>
                            <span className={`${NEU_BADGE_PRIMARY} text-base px-3 py-1`}>{currentPage}</span>
                            <span>of</span>
                            <span className={`${NEU_BADGE} text-base px-3 py-1`}>{totalPages}</span>
                        </div>

                        <Pagination>
                            <PaginationContent className="gap-2">
                                <PaginationItem>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setOffset(Math.max(0, offset - limit))}
                                        disabled={currentPage === 1}
                                        className={`${NEU_BTN_GHOST} flex items-center gap-1.5 px-4 py-2`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </motion.button>
                                </PaginationItem>
                                <PaginationItem>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setOffset(Math.min((totalPages - 1) * limit, offset + limit))}
                                        disabled={currentPage === totalPages}
                                        className={`${NEU_BTN_PRIMARY} flex items-center gap-1.5 px-4 py-2`}
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </motion.button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </motion.div>
            )}

            {createOpen && <GuideBannerForm mode="create" onClose={() => setCreateOpen(false)} />}
        </div>
    );
}