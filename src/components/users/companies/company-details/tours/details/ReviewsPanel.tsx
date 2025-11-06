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
    MdPhotoLibrary,
    MdStarHalf,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCompanyDetailStore } from "@/store/company-detail.store";
import type { ReviewListItemDTO, ReviewSummaryDTO } from "@/types/review.tour.response.type";
import { TourReviewsSkeleton } from "./skeletons/TourReviewsSkeleton";

function resolveImageUrl(id?: string) {
    return id ? `/api/media/${id}` : "/placeholders/placeholder-400.jpg";
}

/* ---------------------
   Small utility components (memoized)
   --------------------- */

const StarRow: React.FC<{ rating: number; size?: number }> = memo(({ rating, size = 16 }) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    const stars = useMemo(() => {
        const nodes: React.ReactNode[] = [];

        // Full stars
        for (let i = 0; i < full; i++) {
            nodes.push(<MdStar key={`f-${i}`} style={{ width: size, height: size }} className="text-amber-500" />);
        }

        // Half star
        if (half) {
            nodes.push(<MdStarHalf key="half" style={{ width: size, height: size }} className="text-amber-500" />);
        }

        // Empty stars
        for (let i = nodes.length; i < 5; i++) {
            nodes.push(<MdStar key={`e-${i}`} style={{ width: size, height: size }} className="text-slate-300 dark:text-slate-600" />);
        }

        return nodes;
    }, [full, half, size]);

    return <div className="flex items-center gap-1">{stars}</div>;
});

StarRow.displayName = "StarRow";

type ReviewItemProps = {
    review: ReviewListItemDTO;
    onOpenImage: (url: string) => void;
};
const ReviewItem: React.FC<ReviewItemProps> = React.memo(({ review, onOpenImage }) => {
    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg"
            aria-labelledby={`review-title-${review.id}`}
        >
            <div className="flex gap-4">
                <div className="w-14 flex-shrink-0">
                    <div className="h-14 w-14 rounded-full overflow-hidden bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold text-lg">
                        {review.user.avatar ? (
                            <Image src={review.user.avatar} alt={review.user.name} width={56} height={56} className="rounded-full object-cover" />
                        ) : (
                            review.user.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{review.user.name}</h4>
                                {review.isVerified && (
                                    <Badge className="bg-emerald-500 text-white inline-flex items-center gap-1 text-xs rounded-full px-2">
                                        <MdVerified className="h-3 w-3" /> Verified
                                    </Badge>
                                )}
                                {!review.isApproved && (
                                    <Badge variant="outline" className="text-amber-700 text-xs rounded-full px-2 border-amber-100">
                                        Pending
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 truncate">
                                <div className="flex items-center gap-1">
                                    <MdCalendarToday className="h-3 w-3" />
                                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>

                                {review.travelDate && (
                                    <div className="flex items-center gap-1">
                                        <span aria-hidden>•</span>
                                        <MdCardTravel className="h-3 w-3" />
                                        <span>Traveled {new Date(review.travelDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 border border-amber-100">
                                    <MdStar className="h-4 w-4 text-amber-600" />
                                    <span className="font-bold text-sm text-amber-700">{review.rating.toFixed(1)}</span>
                                </div>
                            </div>

                            {review.helpfulCount ? (
                                <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                                    <MdThumbUp className="h-4 w-4 text-slate-500" />
                                    <span>{review.helpfulCount} helpful</span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {review.title && <h5 id={`review-title-${review.id}`} className="font-semibold text-slate-900 dark:text-slate-100 mt-3">{review.title}</h5>}
                    {review.comment && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{review.comment}</p>}

                    {Array.isArray(review.images) && review.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-2">
                            {review.images.slice(0, 8).map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => onOpenImage(resolveImageUrl(img))}
                                    className="relative h-20 w-full rounded-md overflow-hidden bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    aria-label="Open photo"
                                >
                                    <Image src={resolveImageUrl(img)} alt={`photo-${i}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {review.replies && review.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {review.replies.map((reply) => (
                                <div key={reply.id} className="p-3 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center text-xs text-slate-500 mb-1">
                                        {reply.employee.avatar && (
                                            <Image src={reply.employee.avatar} alt={reply.employee.name} width={16} height={16} className="rounded-full mr-1" />
                                        )}
                                        <span>{reply.employee.name} replied</span>
                                    </div>
                                    <div className="text-sm text-slate-700 dark:text-slate-200">{reply.message}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {review.tripType && (
                        <div className="mt-4 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 rounded-full px-2">
                                {review.tripType}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    );
});
ReviewItem.displayName = "ReviewItem";

/* ---------------------
   Main Panel
   --------------------- */

interface ReviewsPanelProps {
    companyId: string;
    tourId: string;
}

export default function ReviewsPanel({ companyId, tourId }: ReviewsPanelProps) {
    const fetchReviews = useCompanyDetailStore((s) => s.fetchReviews);
    const storeParams = useCompanyDetailStore((s) => s.params.tourReviews?.[tourId]) ?? { page: 1, limit: 10 };
    const isStoreLoading = useCompanyDetailStore((s) => Boolean(s.loading[`reviewsList:${tourId}`]));
    const storeError = useCompanyDetailStore((s) => s.error[`reviewsListError:${tourId}`]);

    const [reviews, setReviews] = useState<ReviewListItemDTO[]>([]);
    const [summary, setSummary] = useState<ReviewSummaryDTO | null>(null);
    const [pagination, setPagination] = useState({ page: storeParams.page, pages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const [minRating, setMinRating] = useState<number | null>(null);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [withPhotosOnly, setWithPhotosOnly] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [lightbox, setLightbox] = useState<{ url: string } | null>(null);

    const currentPage = storeParams.page ?? 1;
    const currentLimit = storeParams.limit ?? 10;

    // debounce search (200ms)
    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(query.trim()), 200);
        return () => clearTimeout(id);
    }, [query]);

    const load = useCallback(
        async (opts?: { page?: number; limit?: number; force?: boolean }) => {
            const page = opts?.page ?? currentPage;
            const limit = opts?.limit ?? currentLimit;
            setIsLoading(true);

            try {
                const res = await fetchReviews(companyId, tourId, { page, limit }, opts?.force);
                if (!res) throw new Error("Invalid response");
                const items = res.items ?? [];
                const total = res.total ?? items.length;
                const pages = res.pages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)));
                setReviews(items);
                setPagination({ page, pages, total });

                const avgRating =
                    res?.meta?.summary?.averageRating ??
                    (items.length > 0
                        ? Number((items.reduce((s, r) => s + (r.rating ?? 0), 0) / items.length).toFixed(1))
                        : 0);

                const verifiedCount = res?.meta?.summary?.verifiedCount ?? items.filter((r) => r.isVerified).length;

                const ratingBreakdown =
                    res?.meta?.summary?.ratingBreakdown ??
                    items.reduce(
                        (acc, r) => {
                            const key = Math.max(1, Math.min(5, Math.floor(r.rating ?? 0))) as 1 | 2 | 3 | 4 | 5;
                            acc[key] = (acc[key] || 0) + 1;
                            return acc;
                        },
                        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                    );

                setSummary({ totalReviews: total, averageRating: avgRating, verifiedCount, ratingBreakdown });
            } catch (err) {
                console.error("Failed to load reviews:", err);
                setReviews([]);
                setSummary(null);
                setPagination({ page: 1, pages: 1, total: 0 });
            } finally {
                setIsLoading(false);
            }
        },
        [fetchReviews, companyId, tourId, currentPage, currentLimit]
    );

    useEffect(() => {
        void load({ page: currentPage, limit: currentLimit });
        // keep dependency conservative: load handles currentPage/currentLimit via closure
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, tourId]);

    // Client-side filters
    const filteredReviews = useMemo(() => {
        const q = debouncedQuery.toLowerCase();
        return reviews.filter((r) => {
            if (minRating && (r.rating ?? 0) < minRating) return false;
            if (verifiedOnly && !r.isVerified) return false;
            if (withPhotosOnly && !(Array.isArray((r).images) && r.images.length > 0)) return false;
            if (q) {
                const matches =
                    r.title?.toLowerCase().includes(q) ||
                    r.comment?.toLowerCase().includes(q) ||
                    r.user?.name?.toLowerCase().includes(q);
                if (!matches) return false;
            }
            return true;
        });
    }, [reviews, minRating, verifiedOnly, withPhotosOnly, debouncedQuery]);

    const goToPage = useCallback(
        async (page: number) => {
            if (page < 1 || page > pagination.pages || page === pagination.page) return;
            setPagination((p) => ({ ...p, page }));
            await load({ page, limit: currentLimit });
        },
        [pagination.pages, pagination.page, load, currentLimit]
    );

    const openImage = useCallback((url: string) => setLightbox({ url }), []);
    const closeLightbox = useCallback(() => setLightbox(null), []);

    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold">Reviews</h3>
                        <p className="text-sm text-slate-500">Feedback submitted by travelers</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {summary && (
                            <div className="flex items-center gap-4 pr-4 border-r border-slate-100">
                                <div className="flex flex-col items-end">
                                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
                                        {summary.averageRating.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-slate-500">{summary.totalReviews} reviews</div>
                                </div>
                                <div>
                                    <StarRow rating={summary.averageRating} size={4} />
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <input
                                placeholder="Search reviews"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-9 pr-3 py-2 rounded-md border border-slate-100 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                aria-label="Search reviews"
                            />
                            <MdSearch className="absolute left-2 top-2.5 text-slate-400" />
                        </div>

                        <Button size="sm" variant="outline" onClick={() => void load({ force: true })}>
                            Reload
                        </Button>
                    </div>
                </div>

                {summary && (
                    <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-x-auto">
                            {([5, 4, 3, 2, 1] as const).map((star) => {
                                const count = summary.ratingBreakdown[star] ?? 0;
                                const pct = Math.round((count / Math.max(1, summary.totalReviews)) * 100);
                                return (
                                    <div key={star} className="flex items-center gap-2 min-w-[140px]">
                                        <div className="text-xs text-slate-600 w-4">{star}</div>
                                        <div className="w-28 h-2 bg-slate-100 rounded overflow-hidden">
                                            <div className="h-2 bg-amber-500" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="text-xs text-slate-400 w-8 text-right">{count}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                aria-label="Minimum rating"
                                value={minRating ?? ""}
                                onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
                                className="text-sm px-2 py-1 border rounded-md"
                            >
                                <option value="">All ratings</option>
                                <option value={4}>4+ stars</option>
                                <option value={3}>3+ stars</option>
                                <option value={2}>2+ stars</option>
                                <option value={1}>1+ star</option>
                            </select>

                            <label className="inline-flex items-center text-sm gap-2">
                                <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                                Verified only
                            </label>

                            <label className="inline-flex items-center text-sm gap-2">
                                <input type="checkbox" checked={withPhotosOnly} onChange={(e) => setWithPhotosOnly(e.target.checked)} />
                                <span className="inline-flex items-center gap-1">
                                    <MdPhotoLibrary /> With photos
                                </span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <ScrollArea className="h-[560px]">
                <div className="p-6 space-y-4">
                    {isLoading || isStoreLoading ? (
                        <TourReviewsSkeleton rows={4} />
                    ) : filteredReviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
                            <MdStar className="h-8 w-8 text-slate-400" />
                            <p className="text-sm font-medium text-slate-700">No reviews found</p>
                            <p className="text-xs text-slate-500 mt-1">Try removing filters or searching</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredReviews.map((review) => (
                                <ReviewItem key={review.id} review={review} onOpenImage={openImage} />
                            ))}
                        </AnimatePresence>
                    )}

                    {storeError && (
                        <div className="text-sm text-rose-600 px-2 py-2 rounded-md bg-rose-50 border border-rose-100">
                            {storeError}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {!isLoading && reviews.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        Showing <strong>{(pagination.page - 1) * currentLimit + 1}–{Math.min(pagination.page * currentLimit, pagination.total)}</strong> of{" "}
                        <strong>{pagination.total}</strong> reviews
                    </div>

                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" disabled={pagination.page === 1} onClick={() => goToPage(pagination.page - 1)}>
                            Prev
                        </Button>

                        <span className="text-sm">Page {pagination.page} / {pagination.pages}</span>

                        <Button size="sm" variant="outline" disabled={pagination.page === pagination.pages} onClick={() => goToPage(pagination.page + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {lightbox && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-8" onClick={closeLightbox}>
                        <div className="max-w-[90%] max-h-[90%]">
                            <Image src={lightbox.url} alt="Lightbox" width={1400} height={900} className="max-h-[90vh] rounded-lg object-contain" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
