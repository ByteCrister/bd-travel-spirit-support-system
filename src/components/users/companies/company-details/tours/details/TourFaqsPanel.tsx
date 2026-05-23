"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiSearch,
  FiThumbsUp,
  FiThumbsDown,
  FiX,
} from "react-icons/fi";
import { HelpCircle, AlertCircle } from "lucide-react";

import {
  TourFaqFilterParams,
  useCompanyDetailStore,
} from "@/store/company/company-detail.store";
// import type { TourFAQDTO } from "@/types/tour/tour-detail-faqs.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

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

const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 pl-9 pr-8 py-2 w-52";
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
const NEU_BADGE_SUCCESS =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] text-[#1E2938]/50 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";
// ─────────────────────────────────────────────────────────────────────────────

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
  search: "",
};
const EMPTY_OBJ = {};

const makeFaqCacheKey = (params: TourFaqFilterParams) => {
  const paginationKey = `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;
  const filterKey = JSON.stringify({ search: params.search ?? "" });
  return `${paginationKey}-${filterKey}`;
};

function sanitizeHtml(input: string) {
  return input
    .replaceAll("<script", "&lt;script")
    .replaceAll("</script", "&lt;/script")
    .replaceAll("onerror=", "data-onerror=")
    .replaceAll("onload=", "data-onload=");
}

export default function TourFaqsPanel({
  companyId,
  tourId,
  active = true,
}: Props) {
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
    invalidateCache,
  } = useCompanyDetailStore();

  const tourParams = params.tourFaqs?.[tourId] ?? DEFAULT_TOUR_PARAMS;
  const tourCache = listCache.tourFaqs?.[tourId] ?? EMPTY_OBJ;

  useEffect(() => {
    if (tourParams.search !== undefined && localSearch === "")
      setLocalSearch(tourParams.search || "");
  }, [tourParams.search, localSearch]);

  const cacheKey = useMemo(
    () =>
      makeFaqCacheKey({
        page,
        limit,
        sort: tourParams.sort,
        order: tourParams.order,
        search: tourParams.search,
      }),
    [page, limit, tourParams.sort, tourParams.order, tourParams.search],
  );

  const cachedList = tourCache[cacheKey] ?? null;
  const loading = Boolean(loadingState[`faqsList:${tourId}`]);
  const error = errorState[`faqsListError:${tourId}`] ?? null;

  const total = cachedList?.total ?? 0;
  const pages = cachedList?.pages ?? Math.max(1, Math.ceil(total / limit));

  const debouncedSearch = useDebouncedCallback(
    useCallback(
      (searchValue: string) => {
        if (!active) return;
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
            search: searchValue,
          },
          true,
        );
      },
      [
        active,
        invalidateCache,
        tourId,
        fetchFaqs,
        companyId,
        limit,
        tourParams.sort,
        tourParams.order,
      ],
    ),
    500,
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);
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
            search: "",
          },
          true,
        );
      } else {
        debouncedSearch(value);
      }
    },
    [
      invalidateCache,
      tourId,
      fetchFaqs,
      companyId,
      limit,
      tourParams.sort,
      tourParams.order,
      debouncedSearch,
    ],
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearch("");
    setPage(1);
    if (searchInputRef.current) searchInputRef.current.focus();
    invalidateCache?.("tourFaqs", tourId);
    fetchFaqs(
      companyId,
      tourId,
      {
        page: 1,
        limit,
        sort: tourParams.sort,
        order: tourParams.order,
        search: "",
      },
      true,
    );
  }, [
    invalidateCache,
    tourId,
    fetchFaqs,
    companyId,
    limit,
    tourParams.sort,
    tourParams.order,
  ]);

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
            search: tourParams.search,
          },
          opts?.force ?? false,
        );
      } catch {
        /* store handles errors */
      }
    },
    [
      active,
      fetchFaqs,
      companyId,
      tourId,
      page,
      limit,
      tourParams.sort,
      tourParams.order,
      tourParams.search,
    ],
  );

  useEffect(() => {
    if (!active) return;
    void load({ force: forceReloadToken > 0 });
  }, [active, page, limit, forceReloadToken, load]);

  useEffect(() => {
    if (tourParams.search !== undefined) setLocalSearch(tourParams.search);
  }, [tourParams.search]);

  const goPrevious = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(pages, p + 1));
  const onRetry = () => setForceReloadToken((t) => t + 1);

  const shortDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const visibleItems = cachedList?.items ?? [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={NEU_ICON_WELL_PRIMARY}>
            <HelpCircle className="w-5 h-5 text-[#006666]" />
          </div>
          <div>
            <h3 className={`${NEU_HEADING} text-lg`}>
              Frequently Asked Questions
            </h3>
            <p className={`${NEU_MUTED} mt-0.5`}>
              All user-submitted questions for this tour
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 pointer-events-none" />
            <input
              ref={searchInputRef}
              aria-label="Filter FAQs"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search questions or answers"
              className={NEU_INPUT}
            />
            {localSearch && (
              <button
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1E2938]/40 hover:text-[#1E2938]/80 transition-colors"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Page size */}
          <div className="flex items-center gap-1.5">
            <span className={`${NEU_LABEL} normal-case`}>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                const v = Number(e.target.value) || 10;
                setLimit(v);
                setPage(1);
              }}
              className={NEU_SELECT}
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRetry}
            title="Reload FAQs"
            className={`${NEU_BTN_GHOST} flex items-center gap-1.5`}
          >
            <FiRefreshCw size={13} />
            <span className="hidden sm:inline">Reload</span>
          </button>
        </div>
      </div>

      {/* Search active badge */}
      {tourParams.search && (
        <div
          className={`${NEU_SURFACE_INSET_SM} rounded-xl px-4 py-2.5 flex items-center gap-2`}
        >
          <FiSearch className="text-[#006666] shrink-0" />
          <span className={`${NEU_MONO} text-sm`}>Searching for:</span>
          <span className={`${NEU_HEADING} text-sm text-[#006666]`}>
            &quot;{tourParams.search}&quot;
          </span>
          <button
            onClick={handleClearSearch}
            className={`ml-2 ${NEU_BADGE_WARNING} cursor-pointer`}
          >
            Clear
          </button>
        </div>
      )}

      {/* Main content card */}
      <div className={`${NEU_CARD} overflow-hidden`}>
        {loading && !cachedList ? (
          /* Skeleton */
          <div className="p-6 space-y-4">
            {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
              <div
                key={i}
                className={`${NEU_CARD_SM} p-5 flex items-start gap-4`}
              >
                <div
                  className={`${NEU_SKELETON} h-10 w-10 rounded-full shrink-0`}
                />
                <div className="flex-1 space-y-2">
                  <div className={`${NEU_SKELETON} h-4 w-3/4`} />
                  <div className={`${NEU_SKELETON} h-3 w-1/2`} />
                  <div className={`${NEU_SKELETON} h-3 w-full`} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div
            className={`${NEU_SURFACE_INSET} rounded-2xl m-6 p-8 flex flex-col items-center gap-4`}
          >
            <div className="p-3 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
              <AlertCircle className="h-6 w-6 text-[#FF2157]" />
            </div>
            <div className="text-center space-y-1">
              <p className={`${NEU_HEADING} text-base text-[#FF2157]`}>
                Unable to load FAQs
              </p>
              <p className={NEU_MUTED}>{String(error)}</p>
            </div>
            <button
              onClick={onRetry}
              className={`${NEU_BTN_GHOST} flex items-center gap-2`}
            >
              <FiRefreshCw size={13} /> Retry
            </button>
          </div>
        ) : (cachedList?.items?.length ?? 0) === 0 ? (
          /* Empty state */
          <div
            className={`${NEU_SURFACE_INSET} rounded-2xl m-6 p-12 flex flex-col items-center gap-3`}
          >
            <div className={NEU_ICON_WELL}>
              <HelpCircle className="h-8 w-8 text-[#1E2938]/30" />
            </div>
            {tourParams.search ? (
              <>
                <p className={`${NEU_HEADING} text-base text-[#1E2938]/50`}>
                  No FAQs matching &quot;{tourParams.search}&quot;
                </p>
                <button onClick={handleClearSearch} className={NEU_BTN_GHOST}>
                  Clear search
                </button>
              </>
            ) : (
              <p className={`${NEU_HEADING} text-base text-[#1E2938]/50`}>
                No FAQs found for this tour yet.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* FAQ list */}
            <div className="divide-y divide-[#1E2938]/10">
              <AnimatePresence initial={false}>
                {visibleItems.map((faq) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="p-5 hover:bg-[#d8d6d5]/20 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="shrink-0">
                        <div
                          className={`${NEU_SURFACE_INSET_SM} h-10 w-10 rounded-full overflow-hidden flex items-center justify-center`}
                        >
                          <Image
                            src={
                              faq.askedBy.avatarUrl ??
                              `/api/avatars/${faq.askedBy.id}`
                            }
                            alt={`${faq.askedBy.name} avatar`}
                            width={40}
                            height={40}
                            unoptimized
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`${NEU_HEADING} text-sm`}>
                                {faq.question}
                              </h4>
                              {faq.isActive ? (
                                <span className={NEU_BADGE_SUCCESS}>
                                  Active
                                </span>
                              ) : (
                                <span className={NEU_BADGE}>Inactive</span>
                              )}
                            </div>
                            <div className={`mt-1 ${NEU_MUTED} text-xs`}>
                              Asked by{" "}
                              <span className="text-[#1E2938] font-semibold">
                                {faq.askedBy.name}
                              </span>{" "}
                              · {shortDate(faq.createdAt)}
                            </div>
                          </div>

                          {/* Vote counts */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div
                              className={`${NEU_SURFACE_INSET_SM} inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl`}
                            >
                              <FiThumbsUp
                                className="text-[#00A63D]"
                                size={12}
                              />
                              <span className={`${NEU_MONO} text-xs`}>
                                {faq.likes}
                              </span>
                            </div>
                            <div
                              className={`${NEU_SURFACE_INSET_SM} inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl`}
                            >
                              <FiThumbsDown
                                className="text-[#FF2157]"
                                size={12}
                              />
                              <span className={`${NEU_MONO} text-xs`}>
                                {faq.dislikes}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Answer */}
                        <div className="mt-3">
                          {faq.answer ? (
                            <div
                              className={`${NEU_SURFACE_INSET_SM} rounded-xl p-4`}
                            >
                              <div
                                className={`${NEU_MONO} text-sm leading-relaxed text-[#1E2938]/80 prose max-w-none`}
                                dangerouslySetInnerHTML={{
                                  __html: sanitizeHtml(faq.answer),
                                }}
                              />
                              <div className={`mt-2 ${NEU_MUTED} text-xs`}>
                                Answered by{" "}
                                <span className="text-[#1E2938] font-semibold">
                                  {faq.answeredBy?.name ?? "—"}
                                </span>{" "}
                                · {shortDate(faq.answeredAt ?? faq.updatedAt)}
                              </div>
                            </div>
                          ) : (
                            <p className={`${NEU_MUTED} italic text-sm`}>
                              Not answered yet
                            </p>
                          )}
                        </div>

                        {/* Reports */}
                        {faq.reports?.length ? (
                          <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <span className={NEU_BADGE_WARNING}>
                              {faq.reports.length} report
                              {faq.reports.length > 1 ? "s" : ""}
                            </span>
                            <div className="flex items-center gap-2">
                              {faq.reports.slice(0, 3).map((r, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1.5"
                                >
                                  <div
                                    className={`${NEU_SURFACE_INSET_SM} h-6 w-6 rounded-full overflow-hidden`}
                                  >
                                    <Image
                                      src={
                                        r.reportedBy.avatarUrl ??
                                        `/api/avatars/${r.reportedBy.id}`
                                      }
                                      alt={r.reportedBy.name}
                                      width={24}
                                      height={24}
                                      unoptimized
                                      className="h-6 w-6 rounded-full object-cover"
                                    />
                                  </div>
                                  <span
                                    className={`${NEU_MONO} text-xs text-[#1E2938]/70`}
                                  >
                                    {r.reportedBy.name}
                                  </span>
                                  <span className={`${NEU_MUTED} text-xs`}>
                                    · {shortDate(r.createdAt)}
                                  </span>
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

            {/* Pagination footer */}
            <div
              className={`px-5 py-4 border-t ${NEU_DIVIDER} flex flex-col sm:flex-row items-center justify-between gap-3`}
            >
              <div className={`${NEU_MONO} text-sm`}>
                Showing{" "}
                <span className="text-[#006666] font-semibold">
                  {total === 0 ? 0 : Math.min(total, (page - 1) * limit + 1)}–
                  {Math.min(total, page * limit)}
                </span>{" "}
                of <span className="text-[#006666] font-semibold">{total}</span>
                {tourParams.search && (
                  <span className="ml-2 text-[#006666]">
                    (filtered by &quot;{tourParams.search}&quot;)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={goPrevious}
                  disabled={page <= 1 || loading}
                  className={NEU_BTN_ICON}
                  aria-label="Previous page"
                >
                  <FiChevronLeft size={14} />
                </button>

                {/* Page input */}
                <div
                  className={`${NEU_SURFACE_INSET_SM} rounded-xl flex items-center gap-2 px-3 py-1.5`}
                >
                  <span className={NEU_LABEL}>Page</span>
                  <input
                    aria-label="Page"
                    value={page}
                    onChange={(e) => {
                      const v = Number(e.target.value || 1);
                      if (!Number.isFinite(v)) return;
                      setPage(Math.min(Math.max(1, Math.floor(v)), pages));
                    }}
                    className={`${NEU_MONO} w-8 text-center bg-transparent outline-none text-sm font-bold`}
                  />
                  <span className={`${NEU_MUTED} text-xs`}>/ {pages}</span>
                </div>

                <button
                  onClick={goNext}
                  disabled={page >= pages || loading}
                  className={NEU_BTN_ICON}
                  aria-label="Next page"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
