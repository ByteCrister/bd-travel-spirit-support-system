"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
    MdStar,
    MdVerified,
    MdThumbUp,
    MdCalendarToday,
    MdArrowBack,
    MdArrowForward,
    MdStarHalf,
    MdStarBorder,
    MdCardTravel
} from "react-icons/md";
import { ReviewListItemDTO, ReviewSummaryDTO } from "@/types/review.tour.response.type";
import { useCompanyDetailStore } from "@/store/useCompanyDetailStore";
import Image from "next/image";
import { TourReviewsDialogSkeleton } from "./TourReviewsDialogSkeleton";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: string;
    tourTitle: string;
    companyId: string;
}

export function TourReviewsDialog({ open, onOpenChange, tourId, tourTitle, companyId }: Props) {
    const { fetchReviews, params } = useCompanyDetailStore();

    const [reviews, setReviews] = useState<ReviewListItemDTO[]>([]);
    const [summary, setSummary] = useState<ReviewSummaryDTO | null>(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // Safe, memoized current params derived from store; avoid direct deep reads that may throw
    const currentParams = useMemo(
        () => ({
            page: params?.tourReviews?.[tourId]?.page ?? 1,
            limit: params?.tourReviews?.[tourId]?.limit ?? 10,
        }),
        [params, tourId]
    );

    // Centralized loader that accepts explicit page/limit (prevents stale closures)
    const loadReviews = useCallback(
        async (opts?: { page?: number; limit?: number; force?: boolean }) => {
            const page = opts?.page ?? currentParams.page;
            const limit = opts?.limit ?? currentParams.limit;

            setIsLoading(true);
            try {
                // fetchReviews will cache and update store; await it to ensure we have the latest list
                const result = await fetchReviews(companyId, tourId, { page, limit }, opts?.force);
                const items = result?.items ?? [];

                setReviews(items);

                const pageVal = result?.page ?? page;
                const pagesVal = result?.pages ?? Math.max(1, Math.ceil((result?.total ?? items.length) / Math.max(1, limit)));
                const totalVal = result?.total ?? items.length;

                setPagination({ page: pageVal, pages: pagesVal, total: totalVal });

                // Prefer server-provided summary if available on response shape (store currently stores only docs/total/page/pages)
                // Fallback: compute from current page items and totals (best-effort)
                const avgRating = items.length > 0 ? Number((items.reduce((s, r) => s + (r.rating ?? 0), 0) / items.length).toFixed(1)) : 0;
                const verifiedCount = items.filter((r) => r.isVerified).length;
                const ratingBreakdown = items.reduce((acc, r) => {
                    const k = r.rating as 1 | 2 | 3 | 4 | 5;
                    acc[k] = (acc[k] || 0) + 1;
                    return acc;
                }, {} as Record<1 | 2 | 3 | 4 | 5, number>);

                setSummary({
                    totalReviews: totalVal,
                    averageRating: avgRating,
                    verifiedCount,
                    ratingBreakdown,
                });
            } catch (err) {
                console.error("Failed to load reviews:", err);
                setReviews([]);
                setSummary(null);
                setPagination({ page: 1, pages: 1, total: 0 });
            } finally {
                setIsLoading(false);
            }
        },
        [fetchReviews, companyId, tourId, currentParams.page, currentParams.limit]
    );

    // Load when dialog opens or tourId changes or page in store changes
    useEffect(() => {
        if (open && tourId) loadReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, tourId, currentParams.page]);

    // When user clicks pagination, explicitly request that page and update UI immediately
    const handlePageChange = async (page: number) => {
        if (page < 1 || page === pagination.page || (pagination.pages && page > pagination.pages)) return;
        // Update UI optimistically
        setPagination((p) => ({ ...p, page }));
        // Request page from API/store and wait for result so component state updates reliably
        await loadReviews({ page, limit: currentParams.limit });
        // scroll-to-top behavior could be added here if desired
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 0; i < fullStars; i++) stars.push(<MdStar key={`full-${i}`} className="h-4 w-4 text-amber-500" />);
        if (hasHalfStar) stars.push(<MdStarHalf key="half" className="h-4 w-4 text-amber-500" />);
        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) stars.push(<MdStarBorder key={`empty-${i}`} className="h-4 w-4 text-slate-300 dark:text-slate-600" />);
        return stars;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
                <DialogHeader className="relative px-6 pt-8 pb-6 border-b border-border/40 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)]" />
                    <div className="relative space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <DialogTitle className="text-2xl font-bold text-foreground mb-2">Reviews for {tourTitle}</DialogTitle>

                                {summary && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">{renderStars(summary.averageRating)}</div>
                                            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                                {Number.isFinite(summary.averageRating) ? summary.averageRating.toFixed(1) : "0.0"}
                                            </span>
                                        </div>

                                        <Separator orientation="vertical" className="h-6" />

                                        <Badge variant="outline" className="border-blue-200 text-blue-700 dark:text-blue-300">
                                            {summary.totalReviews} Reviews
                                        </Badge>

                                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:text-emerald-300">
                                            <MdVerified className="h-3 w-3 mr-1" />
                                            {summary.verifiedCount} Verified
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        {summary && (
                            <div className="grid grid-cols-5 gap-2 mt-4">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const count = summary.ratingBreakdown[rating as 1 | 2 | 3 | 4 | 5] || 0;
                                    const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                                    return (
                                        <div key={rating} className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                <MdStar className="h-3 w-3 text-amber-500" />
                                                <span>{rating}</span>
                                            </div>

                                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300" style={{ width: `${percentage}%` }} />
                                            </div>

                                            <p className="text-xs text-slate-500 dark:text-slate-400">{count}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 h-[calc(90vh-280px)]">
                    <div className="p-6 space-y-4">
                        {isLoading ? (
                            <TourReviewsDialogSkeleton rows={4} />
                        ) : reviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/25 flex-shrink-0">
                                    <MdStar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                </div>

                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No reviews yet</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Be the first to review this tour</p>
                                </div>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {reviews.map((review, index) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-900 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/25 flex-shrink-0 overflow-hidden">
                                                    {review.user.avatar ? (
                                                        <Image src={review.user.avatar} alt={review.user.name} width={48} height={48} className="rounded-full object-cover" />
                                                    ) : (
                                                        review.user.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{review.user.name}</h4>

                                                        {review.isVerified && (
                                                            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm">
                                                                <MdVerified className="h-3 w-3 mr-1" />
                                                                Verified
                                                            </Badge>
                                                        )}

                                                        {!review.isApproved && (
                                                            <Badge variant="outline" className="border-amber-200 text-amber-700 dark:text-amber-300">
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                        <div className="flex items-center gap-1">
                                                            <MdCalendarToday className="h-3 w-3" />
                                                            {formatDate(review.createdAt)}
                                                        </div>

                                                        {review.travelDate && (
                                                            <>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <MdCardTravel className="h-3 w-3" />
                                                                    Traveled {formatDate(review.travelDate)}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                                                <MdStar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                <span className="font-bold text-sm text-amber-700 dark:text-amber-300">{Number.isFinite(review.rating) ? review.rating.toFixed(1) : "0.0"}</span>
                                            </div>
                                        </div>

                                        {review.title && <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{review.title}</h5>}

                                        {review.comment && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{review.comment}</p>}

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                {review.tripType && <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700">{review.tripType}</Badge>}
                                            </div>

                                            {review.helpfulCount > 0 && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                                                    <MdThumbUp className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{review.helpfulCount} helpful</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </ScrollArea>

                {!isLoading && reviews.length > 0 && (
                    <div className="px-6 py-4 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{((pagination.page - 1) * (currentParams.limit ?? 10)) + 1}</span> -{" "}
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.min(pagination.page * (currentParams.limit ?? 10), pagination.total)}</span> of{" "}
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{pagination.total}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="gap-2 rounded-lg">
                                    <MdArrowBack className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, Math.max(1, pagination.pages)) }, (_, i) => {
                                        const page = i + 1;
                                        const isActive = pagination.page === page;
                                        return (
                                            <Button
                                                key={page}
                                                variant={isActive ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className={[
                                                    "h-9 w-9 rounded-lg transition-all duration-300",
                                                    isActive
                                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/25"
                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                                                ].join(" ")}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="gap-2 rounded-lg">
                                    Next
                                    <MdArrowForward className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
