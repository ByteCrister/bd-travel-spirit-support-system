'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiSearch, FiThumbsUp, FiThumbsDown, FiX } from "react-icons/fi";
import clsx from "clsx";

import { useCompanyDetailStore } from "@/store/company/company-detail.store";
import type { TourFAQDTO } from "@/types/tour-detail-faqs.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

type Props = {
    companyId: string;
    tourId: string;
    active?: boolean;
};

const PAGE_SIZES = [5, 10, 20];
const DEFAULT_SORT = "";
const DEFAULT_ORDER = "";
const DEFAULT_TOUR_PARAMS = {
    page: 1,
    limit: 10,
    sort: DEFAULT_SORT,
    order: DEFAULT_ORDER,
    search: ""
};
const makeCacheKey = (params: {
    page: number;
    limit: number;
    sort?: string;
    order?: string;
    search?: string
}) => {
    const paginationKey = `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;
    const filterKey = JSON.stringify({ search: params.search || "" });
    return `${paginationKey}-${filterKey}`;
};

const EMPTY_OBJ = {};

export default function TourFaqs({ companyId, tourId, active = true }: Props) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [forceReloadToken, setForceReloadToken] = useState(0);
    const [localSearch, setLocalSearch] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const {
        fetchFaqs,
        error: errorState,
        loading: loadingState,
        listCache,
        params,
        invalidateCache
    } = useCompanyDetailStore();

    // ===== Compute derived values =====
    const tourParams = params.tourFaqs?.[tourId] ?? DEFAULT_TOUR_PARAMS;
    const tourCache = listCache.tourFaqs?.[tourId] ?? EMPTY_OBJ;

    // Sync local search with store params on initial load
    useEffect(() => {
        if (tourParams.search !== undefined && localSearch === "") {
            setLocalSearch(tourParams.search || "");
        }
    }, [tourParams.search, localSearch]);

    const cacheKey = useMemo(
        () => makeCacheKey({
            page,
            limit,
            sort: tourParams.sort,
            order: tourParams.order,
            search: tourParams.search
        }),
        [page, limit, tourParams.sort, tourParams.order, tourParams.search]
    );

    const cachedList = tourCache[cacheKey] ?? null;
    const loading = Boolean(loadingState[`faqsList:${tourId}`]);
    const error = errorState[`faqsListError:${tourId}`] ?? null;

    const total = cachedList?.total ?? 0;
    const pages = cachedList?.pages ?? Math.max(1, Math.ceil(total / limit));

    // Debounced search function
    const debouncedSearch = useDebouncedCallback(
        useCallback((searchValue: string) => {
            if (!active) return;

            // Reset to page 1 when searching
            setPage(1);

            // Invalidate cache for current tour's FAQs to force fresh data
            invalidateCache?.("tourFaqs", tourId);

            // Fetch with new search parameter
            fetchFaqs(
                companyId,
                tourId,
                {
                    page: 1,
                    limit,
                    sort: tourParams.sort,
                    order: tourParams.order,
                    search: searchValue
                },
                true // force refresh
            );
        }, [active, invalidateCache, tourId, fetchFaqs, companyId, limit, tourParams.sort, tourParams.order]),
        500 // 500ms debounce delay
    );

    // Handle search input change
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearch(value);

        // If search is cleared, immediately trigger refresh
        if (value === "") {
            setPage(1);
            invalidateCache?.("tourFaqs", tourId);
            fetchFaqs(
                companyId,
                tourId,
                {
                    page: 1,
                    limit,
                    sort: tourParams.sort,
                    order: tourParams.order,
                    search: ""
                },
                true
            );
        } else {
            // Debounce the search API call
            debouncedSearch(value);
        }
    }, [invalidateCache, tourId, fetchFaqs, companyId, limit, tourParams.sort, tourParams.order, debouncedSearch]);

    // Clear search
    const handleClearSearch = useCallback(() => {
        setLocalSearch("");
        setPage(1);

        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }

        // Immediately trigger refresh with empty search
        invalidateCache?.("tourFaqs", tourId);
        fetchFaqs(
            companyId,
            tourId,
            {
                page: 1,
                limit,
                sort: tourParams.sort,
                order: tourParams.order,
                search: ""
            },
            true
        );
    }, [invalidateCache, tourId, fetchFaqs, companyId, limit, tourParams.sort, tourParams.order]);

    const load = useCallback(
        async (opts?: { force?: boolean }) => {
            if (!active) return;
            try {
                await fetchFaqs(
                    companyId,
                    tourId,
                    {
                        page,
                        limit,
                        sort: tourParams.sort,
                        order: tourParams.order,
                        search: tourParams.search
                    },
                    opts?.force ?? false
                );
            } catch {
                // errors handled in store
            }
        },
        [active, fetchFaqs, companyId, tourId, page, limit, tourParams.sort, tourParams.order, tourParams.search]
    );

    // Initial load and reload when pagination changes
    useEffect(() => {
        if (!active) return;
        void load({ force: forceReloadToken > 0 });
    }, [active, page, limit, forceReloadToken, load]);

    // Update local search when store params change from elsewhere
    useEffect(() => {
        if (tourParams.search !== undefined) {
            setLocalSearch(tourParams.search);
        }
    }, [tourParams.search]);

    const goPrevious = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(pages, p + 1));
    const onRetry = () => setForceReloadToken((t) => t + 1);

    const shortDate = (iso?: string) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const visibleItems = useMemo(() => {
        const items: TourFAQDTO[] = cachedList?.items ?? [];
        if (!localSearch.trim()) return items;

        // Client-side filtering for immediate UI feedback while API call is debounced
        const q = localSearch.trim().toLowerCase();
        return items.filter((f) =>
            f.question.toLowerCase().includes(q) ||
            (f.answer ?? "").toLowerCase().includes(q)
        );
    }, [cachedList, localSearch]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">Frequently Asked Questions</h3>
                    <p className="text-sm text-slate-500">All user-submitted questions for this tour</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                        <FiSearch className="text-slate-400" />
                        <input
                            ref={searchInputRef}
                            aria-label="Filter FAQs"
                            value={localSearch}
                            onChange={handleSearchChange}
                            placeholder="Search questions or answers"
                            className="w-44 text-sm placeholder:text-slate-400 outline-none bg-transparent"
                        />
                        {localSearch && (
                            <button
                                onClick={handleClearSearch}
                                aria-label="Clear search"
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <FiX />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Show</label>
                        <div className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-1">
                            <select
                                value={limit}
                                onChange={(e) => {
                                    const v = Number(e.target.value) || 10;
                                    setLimit(v);
                                    setPage(1);
                                }}
                                className="bg-transparent text-sm outline-none"
                            >
                                {PAGE_SIZES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={onRetry}
                        title="Reload FAQs"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-slate-200 shadow-sm text-sm hover:bg-slate-50 transition-colors"
                    >
                        <FiRefreshCw />
                        <span className="hidden sm:inline">Reload</span>
                    </button>
                </div>
            </div>

            {/* Search status indicator */}
            {tourParams.search && (
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                    <FiSearch className="text-blue-500" />
                    <span>Searching for: </span>
                    <span className="font-medium text-blue-700">&quot;{tourParams.search}&quot;</span>
                    <button
                        onClick={handleClearSearch}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden">
                {loading && !cachedList ? (
                    <div className="p-6">
                        <div className="space-y-4">
                            {Array.from({ length: Math.min(limit, 6) }).map((_, idx) => (
                                <div key={idx} className="animate-pulse flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                                    <div className="flex-1">
                                        <div className="h-4 w-3/4 rounded bg-slate-200 mb-2" />
                                        <div className="h-3 w-1/2 rounded bg-slate-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-6">
                        <div className="flex flex-col items-start gap-3">
                            <p className="text-sm text-red-600 font-medium">Unable to load FAQs</p>
                            <p className="text-sm text-slate-600">{String(error)}</p>
                            <div className="pt-2">
                                <button
                                    onClick={onRetry}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 text-red-700 border border-red-100 text-sm"
                                >
                                    <FiRefreshCw /> Retry
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (cachedList?.items?.length ?? 0) === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        {tourParams.search ? (
                            <>
                                <p className="text-sm">No FAQs found matching &quot;{tourParams.search}&quot;.</p>
                                <button
                                    onClick={handleClearSearch}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Clear search
                                </button>
                            </>
                        ) : (
                            <p className="text-sm">No FAQs found for this tour yet.</p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-slate-100">
                            <AnimatePresence initial={false}>
                                {visibleItems.map((faq) => (
                                    <motion.div
                                        key={faq.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        <div className="p-4 sm:p-5 flex gap-4">
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={faq.askedBy.avatarUrl ?? `/api/avatars/${faq.askedBy.id}`}
                                                    alt={`${faq.askedBy.name} avatar`}
                                                    width={40} height={40} unoptimized
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-medium truncate">{faq.question}</h4>
                                                            <span
                                                                className={clsx(
                                                                    "text-xs font-medium px-2 py-0.5 rounded-md",
                                                                    faq.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                                                )}
                                                            >
                                                                {faq.isActive ? "Active" : "Inactive"}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 text-xs text-slate-500">
                                                            Asked by <span className="text-slate-700 font-medium">{faq.askedBy.name}</span> • {shortDate(faq.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-100">
                                                            <FiThumbsUp className="text-slate-400" />
                                                            <span className="text-slate-700 text-xs">{faq.likes}</span>
                                                        </div>
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-100">
                                                            <FiThumbsDown className="text-slate-400" />
                                                            <span className="text-slate-700 text-xs">{faq.dislikes}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Answer */}
                                                <div className="mt-3 text-sm text-slate-700 prose max-w-none">
                                                    {faq.answer ? (
                                                        <>
                                                            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }} />
                                                            <div className="mt-2 text-xs text-slate-500">
                                                                Answered by <span className="text-slate-700 font-medium">{faq.answeredBy?.name ?? "—"}</span> • {shortDate(faq.answeredAt ?? faq.updatedAt)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-sm text-slate-500 italic">Not answered yet</div>
                                                    )}
                                                </div>

                                                {/* Reports preview */}
                                                {faq.reports?.length ? (
                                                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                                                        <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-md">
                                                            {faq.reports.length} report{faq.reports.length > 1 ? "s" : ""}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {faq.reports.slice(0, 3).map((r, idx) => (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <Image
                                                                        src={r.reportedBy.avatarUrl ?? `/api/avatars/${r.reportedBy.id}`}
                                                                        alt={r.reportedBy.name}
                                                                        width={24} height={24} unoptimized
                                                                        className="h-6 w-6 rounded-full object-cover"
                                                                    />
                                                                    <div className="text-slate-600">
                                                                        <span className="font-medium text-slate-800 mr-1">{r.reportedBy.name}</span>
                                                                        <span className="text-slate-500">• {shortDate(r.createdAt)}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Footer pagination */}
                        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                            <div className="text-sm text-slate-600">
                                Showing <span className="text-slate-800 font-medium">{total === 0 ? 0 : Math.min(total, (page - 1) * limit + 1)}</span>–
                                <span className="text-slate-800 font-medium">{Math.min(total, page * limit)}</span> of <span className="text-slate-800 font-medium">{total}</span>
                                {tourParams.search && (
                                    <span className="ml-2 text-blue-600">
                                        (filtered by &quot;{tourParams.search}&quot;)
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={goPrevious} disabled={page <= 1 || loading} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-sm disabled:opacity-50">
                                    <FiChevronLeft />
                                </button>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 border border-slate-100 text-sm">
                                    <span className="text-slate-600">Page</span>
                                    <input
                                        aria-label="Page"
                                        value={page}
                                        onChange={(e) => {
                                            const v = Number(e.target.value || 1);
                                            if (!Number.isFinite(v)) return;
                                            setPage(Math.min(Math.max(1, Math.floor(v)), pages));
                                        }}
                                        className="w-12 text-center bg-transparent outline-none text-slate-700 font-medium"
                                    />
                                    <span className="text-slate-500">/ {pages}</span>
                                </div>
                                <button onClick={goNext} disabled={page >= pages || loading} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-sm disabled:opacity-50">
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function sanitizeHtml(input: string) {
    return input
        .replaceAll("<script", "&lt;script")
        .replaceAll("</script", "&lt;/script")
        .replaceAll("onerror=", "data-onerror=")
        .replaceAll("onload=", "data-onload=");
}
