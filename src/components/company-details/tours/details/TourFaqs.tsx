'use client';

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiSearch, FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { BsChevronDown } from "react-icons/bs";
import clsx from "clsx";

import { useCompanyDetailStore } from "@/store/useCompanyDetailStore";
import type { TourFAQDTO } from "@/types/faqs.types";

type Props = {
    companyId: string;
    tourId: string;
    active?: boolean;
};

const PAGE_SIZES = [5, 10, 20];
const DEFAULT_SORT = "";
const DEFAULT_ORDER = "";
const DEFAULT_TOUR_PARAMS = { page: 1, limit: 10, sort: DEFAULT_SORT, order: DEFAULT_ORDER };

const makeCacheKey = (params: { page: number; limit: number; sort?: string; order?: string }) =>
    `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;

const EMPTY_OBJ = {};

export default function TourFaqs({ companyId, tourId, active = true }: Props) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [forceReloadToken, setForceReloadToken] = useState(0);
    const [filterQuery, setFilterQuery] = useState("");

    const { fetchFaqs, error: errorState, loading: loadingState, listCache, params } = useCompanyDetailStore();

    // ===== Compute derived values =====
    const tourParams = params.tourFaqs?.[tourId] ?? DEFAULT_TOUR_PARAMS;
    const tourCache = listCache.tourFaqs?.[tourId] ?? EMPTY_OBJ;

    const cacheKey = useMemo(
        () => makeCacheKey({ page, limit, sort: tourParams.sort, order: tourParams.order }),
        [page, limit, tourParams.sort, tourParams.order]
    );

    const cachedList = tourCache[cacheKey] ?? null;
    const loading = Boolean(loadingState[`faqsList:${tourId}`]);
    const error = errorState[`faqsListError:${tourId}`] ?? null;

    const total = cachedList?.total ?? 0;
    const pages = cachedList?.pages ?? Math.max(1, Math.ceil(total / limit));

    const load = useCallback(
        async (opts?: { force?: boolean }) => {
            if (!active) return;
            try {
                await fetchFaqs(companyId, tourId, { page, limit, sort: tourParams.sort, order: tourParams.order }, opts?.force ?? false);
            } catch {
                // errors handled in store
            }
        },
        [active, fetchFaqs, companyId, tourId, page, limit, tourParams.sort, tourParams.order]
    );

    useEffect(() => {
        if (!active) return;
        void load({ force: forceReloadToken > 0 });
    }, [active, page, limit, forceReloadToken, load]);

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
        if (!filterQuery.trim()) return items;
        const q = filterQuery.trim().toLowerCase();
        return items.filter((f) => f.question.toLowerCase().includes(q) || (f.answer ?? "").toLowerCase().includes(q));
    }, [cachedList, filterQuery]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">Frequently Asked Questions</h3>
                    <p className="text-sm text-slate-500">All user-submitted questions for this tour</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-sm">
                        <FiSearch className="text-slate-400" />
                        <input
                            aria-label="Filter FAQs"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            placeholder="Search questions or answers"
                            className="w-44 text-sm placeholder:text-slate-400 outline-none"
                        />
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
                            <BsChevronDown className="text-slate-500" />
                        </div>
                    </div>

                    <button
                        onClick={onRetry}
                        title="Reload FAQs"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-sm text-sm hover:bg-slate-50"
                    >
                        <FiRefreshCw />
                        <span className="hidden sm:inline">Reload</span>
                    </button>
                </div>
            </div>

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
                        <p className="text-sm">No FAQs found for this tour yet.</p>
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
