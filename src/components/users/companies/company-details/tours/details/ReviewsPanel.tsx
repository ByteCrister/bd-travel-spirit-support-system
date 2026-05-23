"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdStar,
  MdVerified,
  MdThumbUp,
  MdCalendarToday,
  MdCardTravel,
  MdSearch,
  MdStarHalf,
} from "react-icons/md";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCompanyDetailStore } from "@/store/company/company-detail.store";
import type {
  ReviewListItemDTO,
  ReviewSummaryDTO,
} from "@/types/tour/tour-detail-review.type";
import { TourReviewsSkeleton } from "./skeletons/TourReviewsSkeleton";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
  "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";
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

const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 px-3 py-2";
const NEU_SELECT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 px-2 py-1.5";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_BADGE_SUCCESS =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";
// ─────────────────────────────────────────────────────────────────────────────

const StarRow: React.FC<{ rating: number; size?: number }> = memo(
  ({ rating, size = 16 }) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    const stars = useMemo(() => {
      const nodes: React.ReactNode[] = [];
      for (let i = 0; i < full; i++) {
        nodes.push(
          <MdStar
            key={`f-${i}`}
            style={{ width: size, height: size }}
            className="text-amber-500"
          />,
        );
      }
      if (half) {
        nodes.push(
          <MdStarHalf
            key="half"
            style={{ width: size, height: size }}
            className="text-amber-500"
          />,
        );
      }
      for (let i = nodes.length; i < 5; i++) {
        nodes.push(
          <MdStar
            key={`e-${i}`}
            style={{ width: size, height: size }}
            className="text-[#1E2938]/20"
          />,
        );
      }
      return nodes;
    }, [full, half, size]);

    return <div className="flex items-center gap-0.5">{stars}</div>;
  },
);
StarRow.displayName = "StarRow";

type ReviewItemProps = {
  review: ReviewListItemDTO;
  onOpenImage: (url: string) => void;
};

const ReviewItem: React.FC<ReviewItemProps> = React.memo(
  ({ review, onOpenImage }) => {
    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        className={`${NEU_CARD_SM} ${NEU_CARD_HOVER} p-5`}
        aria-labelledby={`review-title-${review.id}`}
      >
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <div
              className={`${NEU_SURFACE_INSET_SM} h-12 w-12 rounded-full flex items-center justify-center text-[#1E2938] font-bold text-lg overflow-hidden`}
            >
              {review.user.avatar ? (
                <Image
                  src={review.user.avatar}
                  alt={review.user.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="font-[family-name:var(--font-space-mono)] text-[#006666]">
                  {review.user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`${NEU_HEADING} text-sm truncate`}>
                    {review.user.name}
                  </h4>
                  {review.isApproved ? (
                    <span className={NEU_BADGE_SUCCESS}>
                      <MdVerified className="h-3 w-3" /> Approved
                    </span>
                  ) : (
                    <span className={NEU_BADGE_WARNING}>Pending</span>
                  )}
                </div>

                <div
                  className={`flex items-center gap-3 ${NEU_MUTED} text-xs mt-1 flex-wrap`}
                >
                  <div className="flex items-center gap-1">
                    <MdCalendarToday className="h-3 w-3" />
                    <span>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.travelDate && (
                    <div className="flex items-center gap-1">
                      <span aria-hidden>·</span>
                      <MdCardTravel className="h-3 w-3" />
                      <span>
                        Traveled{" "}
                        {new Date(review.travelDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating badge */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div
                  className={`${NEU_SURFACE_INSET_SM} rounded-xl flex items-center gap-1.5 px-3 py-1.5`}
                >
                  <MdStar className="h-4 w-4 text-amber-500" />
                  <span className={`${NEU_HEADING} text-sm text-amber-700`}>
                    {review.rating.toFixed(1)}
                  </span>
                </div>
                {review.helpfulCount ? (
                  <div
                    className={`flex items-center gap-1.5 ${NEU_MUTED} text-xs`}
                  >
                    <MdThumbUp className="h-3.5 w-3.5" />
                    <span>{review.helpfulCount} helpful</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Review content */}
            {review.title && (
              <h5
                id={`review-title-${review.id}`}
                className={`${NEU_HEADING} text-sm mt-3`}
              >
                {review.title}
              </h5>
            )}
            {review.comment && (
              <p
                className={`${NEU_MONO} text-sm mt-2 leading-relaxed text-[#1E2938]/70`}
              >
                {review.comment}
              </p>
            )}

            {/* Images */}
            {Array.isArray(review.images) && review.images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {review.images.slice(0, 8).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => onOpenImage(img)}
                    className={`${NEU_SURFACE_INSET_SM} relative h-20 w-full rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#006666]/50`}
                    aria-label="Open photo"
                  >
                    <Image
                      src={img}
                      alt={`photo-${i}`}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Replies */}
            {review.replies && review.replies.length > 0 && (
              <div className="mt-4 space-y-2">
                {review.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`${NEU_SURFACE_INSET} rounded-xl p-3`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {reply.employee.avatar && (
                        <Image
                          src={reply.employee.avatar}
                          alt={reply.employee.name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      )}
                      <span
                        className={`${NEU_LABEL} normal-case text-xs text-[#006666]`}
                      >
                        {reply.employee.name} replied
                      </span>
                    </div>
                    <p className={`${NEU_MONO} text-sm text-[#1E2938]/80`}>
                      {reply.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Trip type */}
            {review.tripType && (
              <div className="mt-3">
                <span className={NEU_BADGE}>{review.tripType}</span>
              </div>
            )}
          </div>
        </div>
      </motion.article>
    );
  },
);
ReviewItem.displayName = "ReviewItem";

interface ReviewsPanelProps {
  companyId: string;
  tourId: string;
}

export default function ReviewsPanel({ companyId, tourId }: ReviewsPanelProps) {
  const { params, loading, error, fetchReviews } = useCompanyDetailStore();
  const storeParams = params.tourReviews?.[tourId] ?? { page: 1, limit: 10 };
  const isStoreLoading = loading[`reviewsList:${tourId}`];
  const storeError = error[`reviewsListError:${tourId}`];

  const [reviews, setReviews] = useState<ReviewListItemDTO[]>([]);
  const [summary, setSummary] = useState<ReviewSummaryDTO | null>(null);
  const [pagination, setPagination] = useState({
    page: storeParams.page,
    pages: 1,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lightbox, setLightbox] = useState<{ url: string } | null>(null);

  const currentPage = storeParams.page ?? 1;
  const currentLimit = storeParams.limit ?? 10;

  const debouncedSearch = useDebouncedCallback((searchValue: string) => {
    load({
      page: 1,
      limit: currentLimit,
      search: searchValue.trim(),
      rating: minRating as 1 | 2 | 3 | 4 | 5 | undefined,
      approvedOnly,
    });
  }, 300);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (value.trim() === "") {
        load({
          page: 1,
          limit: currentLimit,
          search: undefined,
          rating: minRating as 1 | 2 | 3 | 4 | 5 | undefined,
          approvedOnly,
        });
      } else {
        debouncedSearch(value);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLimit, minRating, approvedOnly, debouncedSearch],
  );

  const load = useCallback(
    async (opts?: {
      page?: number;
      limit?: number;
      force?: boolean;
      search?: string;
      rating?: 1 | 2 | 3 | 4 | 5;
      approvedOnly?: boolean;
    }) => {
      const page = opts?.page ?? currentPage;
      const limit = opts?.limit ?? currentLimit;
      setIsLoading(true);
      try {
        const res = await fetchReviews(
          companyId,
          tourId,
          {
            page,
            limit,
            search: opts?.search,
            rating: opts?.rating,
            approvedOnly: opts?.approvedOnly ?? false,
          },
          opts?.force,
        );
        if (!res) throw new Error("Invalid response");
        const items = res.items ?? [];
        const total = res.total ?? items.length;
        const pages =
          res.pages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)));
        setReviews(items);
        setPagination({ page, pages, total });
        const avgRating =
          res?.meta?.summary?.averageRating ??
          (items.length > 0
            ? Number(
                (
                  items.reduce((s, r) => s + (r.rating ?? 0), 0) / items.length
                ).toFixed(1),
              )
            : 0);
        const isApprovedCount =
          res?.meta?.summary?.isApproved ??
          items.filter((r) => r.isApproved).length;
        const ratingBreakdown =
          res?.meta?.summary?.ratingBreakdown ??
          items.reduce(
            (acc, r) => {
              const key = Math.max(
                1,
                Math.min(5, Math.floor(r.rating ?? 0)),
              ) as 1 | 2 | 3 | 4 | 5;
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            },
            { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          );
        setSummary({
          totalReviews: total,
          averageRating: avgRating,
          isApproved: isApprovedCount,
          ratingBreakdown,
        });
      } catch {
        setReviews([]);
        setSummary(null);
        setPagination({ page: 1, pages: 1, total: 0 });
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, currentLimit, fetchReviews, companyId, tourId],
  );

  useEffect(() => {
    void load({ page: currentPage, limit: currentLimit });
  }, [load, currentPage, currentLimit]);

  useEffect(() => {
    if (currentPage !== 1) return;
    load({
      page: 1,
      limit: currentLimit,
      search: searchQuery.trim() || undefined,
      rating: minRating as 1 | 2 | 3 | 4 | 5 | undefined,
      approvedOnly,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minRating, approvedOnly, currentLimit]);

  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1 || page > pagination.pages || page === pagination.page)
        return;
      await load({
        page,
        limit: currentLimit,
        search: searchQuery.trim() || undefined,
        rating: minRating as 1 | 2 | 3 | 4 | 5 | undefined,
        approvedOnly,
      });
    },
    [
      pagination.pages,
      pagination.page,
      load,
      currentLimit,
      searchQuery,
      minRating,
      approvedOnly,
    ],
  );

  const openImage = useCallback((url: string) => setLightbox({ url }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  return (
    <div className={`${NEU_CARD} overflow-hidden`}>
      {/* Header */}
      <div className={`px-6 py-5 border-b ${NEU_DIVIDER}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={NEU_ICON_WELL_PRIMARY}>
              <MdStar className="w-5 h-5 text-[#006666]" />
            </div>
            <div>
              <h3 className={`${NEU_HEADING} text-lg`}>Reviews</h3>
              <p className={`${NEU_MUTED} mt-0.5`}>
                Feedback submitted by travelers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Rating summary */}
            {summary && (
              <div
                className={`${NEU_SURFACE_INSET_SM} rounded-xl px-4 py-2.5 flex items-center gap-3`}
              >
                <div>
                  <div className="text-2xl font-bold font-[family-name:var(--font-space-mono)] text-amber-600">
                    {summary.averageRating.toFixed(1)}
                  </div>
                  <div className={`${NEU_MUTED} text-xs`}>
                    {summary.totalReviews} reviews
                  </div>
                </div>
                <StarRow rating={summary.averageRating} size={16} />
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <input
                placeholder="Search reviews…"
                value={searchQuery}
                onChange={handleSearchChange}
                className={`${NEU_INPUT} pl-9 w-52`}
                aria-label="Search reviews"
              />
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 pointer-events-none" />
            </div>

            <button
              className={NEU_BTN_GHOST}
              onClick={() => void load({ force: true })}
            >
              Reload
            </button>
          </div>
        </div>

        {/* Rating bars + filters */}
        {summary && (
          <div
            className={`mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t ${NEU_DIVIDER}`}
          >
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const ratingBreakdown = Array.isArray(summary.ratingBreakdown)
                  ? (summary.ratingBreakdown[0] ?? {
                      1: 0,
                      2: 0,
                      3: 0,
                      4: 0,
                      5: 0,
                    })
                  : summary.ratingBreakdown;
                const count = ratingBreakdown[star] ?? 0;
                const pct = Math.round(
                  (count / Math.max(1, summary.totalReviews)) * 100,
                );
                return (
                  <div
                    key={star}
                    className="flex items-center gap-2 min-w-[130px]"
                  >
                    <span className={`${NEU_MONO} text-xs w-3`}>{star}</span>
                    <div
                      className={`${NEU_SURFACE_INSET} rounded-full w-24 h-2 overflow-hidden`}
                    >
                      <div
                        className="h-2 bg-amber-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`${NEU_MUTED} text-xs w-5 text-right`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <select
                aria-label="Minimum rating"
                value={minRating ?? ""}
                onChange={(e) =>
                  setMinRating(e.target.value ? Number(e.target.value) : null)
                }
                className={NEU_SELECT}
              >
                <option value="">All ratings</option>
                <option value={5}>5 stars</option>
                <option value={4}>4+ stars</option>
                <option value={3}>3+ stars</option>
                <option value={2}>2+ stars</option>
                <option value={1}>1+ star</option>
              </select>

              <label
                className={`${NEU_MONO} text-sm flex items-center gap-2 cursor-pointer`}
              >
                <input
                  type="checkbox"
                  checked={approvedOnly}
                  onChange={(e) => setApprovedOnly(e.target.checked)}
                  className="accent-[#006666] rounded"
                />
                Approved only
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Review list */}
      <ScrollArea className="h-[560px]">
        <div className="p-6 space-y-4">
          {isLoading || isStoreLoading ? (
            <TourReviewsSkeleton rows={4} />
          ) : reviews.length === 0 ? (
            <div
              className={`${NEU_SURFACE_INSET} rounded-2xl flex flex-col items-center justify-center py-16 gap-3`}
            >
              <div className={NEU_ICON_WELL}>
                <MdStar className="h-8 w-8 text-[#1E2938]/30" />
              </div>
              <p className={`${NEU_HEADING} text-base text-[#1E2938]/50`}>
                No reviews found
              </p>
              <p className={NEU_MUTED}>Try removing filters or searching</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {reviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  onOpenImage={openImage}
                />
              ))}
            </AnimatePresence>
          )}

          {storeError && (
            <div className={`${NEU_SURFACE_INSET} rounded-xl p-3`}>
              <span className={`${NEU_MONO} text-sm text-[#FF2157]`}>
                {typeof storeError === "string"
                  ? storeError
                  : JSON.stringify(storeError)}
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {!isLoading && reviews.length > 0 && (
        <div
          className={`px-6 py-4 border-t ${NEU_DIVIDER} flex flex-col sm:flex-row items-center justify-between gap-3`}
        >
          <div className={`${NEU_MONO} text-sm`}>
            Showing{" "}
            <span className="font-semibold text-[#006666]">
              {(pagination.page - 1) * currentLimit + 1}–
              {Math.min(pagination.page * currentLimit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#006666]">
              {pagination.total}
            </span>{" "}
            reviews
          </div>

          <div className="flex items-center gap-2">
            <button
              className={NEU_BTN_GHOST}
              disabled={pagination.page === 1}
              onClick={() => goToPage(pagination.page - 1)}
            >
              Prev
            </button>
            <span
              className={`${NEU_SURFACE_INSET_SM} rounded-xl px-4 py-1.5 ${NEU_MONO} text-sm`}
            >
              {pagination.page} / {pagination.pages}
            </span>
            <button
              className={NEU_BTN_GHOST}
              disabled={pagination.page === pagination.pages}
              onClick={() => goToPage(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-8"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-[90%] max-h-[90%] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.url}
                alt="Lightbox"
                width={1400}
                height={900}
                className="max-h-[90vh] rounded-2xl object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
