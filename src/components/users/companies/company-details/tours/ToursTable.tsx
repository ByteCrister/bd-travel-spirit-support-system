"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import {
    MdArrowBack,
    MdArrowForward,
    MdCalendarToday,
    MdStar,
    MdPeople,
    MdTrendingUp,
    MdVisibility,
    MdShield,
    MdOpenInNew,
    MdRemoveRedEye,
    MdThumbUp,
    MdShare,
    MdFavorite,
    MdRateReview,
    MdFlag,
    MdSchedule,
} from "react-icons/md";

import { TOUR_STATUS } from "@/constants/tour.const";
import { TourListItemDTO } from "@/types/tour.types";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

interface Props {
    companyId: string;
    items: TourListItemDTO[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    loading: boolean;
    error?: string;
    onPageChange: (page: number) => void;
}

export function ToursTable({
    companyId,
    items,
    total,
    page,
    pages,
    limit,
    loading,
    error,
    onPageChange,
}: Props) {
    const router = useRouter();

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            }),
        []
    );

    const currencyFormatter = (currency?: string, amount?: number) => {
        if (!currency || typeof amount !== "number") return undefined;
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency,
                maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return `${amount} ${currency}`;
        }
    };

    const handleRouteClick = async (tourId: string) => {
        // ? companyId already encoded
        router.push(`/users/companies/${companyId}/${encodeId(encodeURIComponent(tourId))}`);
    };

    const statusBadge = (status: TOUR_STATUS) => {
        switch (status) {
            case TOUR_STATUS.PUBLISHED:
                return (
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm">
                        Published
                    </Badge>
                );
            case TOUR_STATUS.DRAFT:
                return (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                        Draft
                    </Badge>
                );
            case TOUR_STATUS.ARCHIVED:
            default:
                return (
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                        Archived
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800 shadow-sm"
                >
                    <MdFlag className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                        <span className="font-semibold text-red-900 dark:text-red-100">Error:</span>
                        <span className="ml-2 text-sm text-red-700 dark:text-red-300">{error}</span>
                    </div>
                </motion.div>
            )}

            {/* Tours List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((tour, index) => {
                        const start = dateFormatter.format(new Date(tour.startDate));
                        const end = dateFormatter.format(new Date(tour.endDate));
                        const updated = dateFormatter.format(new Date(tour.updatedAt));
                        const created = dateFormatter.format(new Date(tour.createdAt));
                        const lastBooking = tour.lastBookingDate
                            ? dateFormatter.format(new Date(tour.lastBookingDate))
                            : "—";
                        const priceMin = currencyFormatter(
                            tour.priceSummary?.currency,
                            tour.priceSummary?.minAmount
                        );
                        const priceMax = currencyFormatter(
                            tour.priceSummary?.currency,
                            tour.priceSummary?.maxAmount
                        );

                        return (
                            <motion.div
                                key={tour.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem
                                        value={tour.id}
                                        className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-300"
                                    >
                                        {/* Always Visible Header */}
                                        <div className="relative">
                                            {tour.isFeatured && (
                                                <div className="absolute -top-0 -right-0 z-10">
                                                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-bl-xl rounded-tr-xl text-xs font-semibold shadow-lg">
                                                        ⭐ Featured
                                                    </div>
                                                </div>
                                            )}

                                            {/* Header row with trigger on the left and button on the right */}
                                            <div className="px-6 py-5 hover:no-underline hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-indigo-50/30 dark:hover:from-slate-800/40 dark:hover:to-indigo-950/20 transition-all flex items-center justify-between w-full pr-4">
                                                {/* AccordionTrigger wraps exactly one child (left section) */}
                                                <AccordionTrigger>
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 flex items-center justify-center">
                                                            <MdTrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                        </div>

                                                        <div className="flex-1 min-w-0 space-y-3">
                                                            {/* Title Row */}
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                                                                    {tour.title}
                                                                </h3>
                                                            </div>

                                                            {/* Key Metrics Row */}
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                {statusBadge(tour.status)}

                                                                {/* Date Range */}
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                                    <MdCalendarToday className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                        {start}
                                                                    </span>
                                                                    <span className="text-slate-400">→</span>
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                        {end}
                                                                    </span>
                                                                </div>

                                                                {/* Duration */}
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                                                >
                                                                    <MdSchedule className="h-3.5 w-3.5 mr-1" />
                                                                    {tour.durationDays} days
                                                                </Badge>

                                                                {/* Rating */}
                                                                {typeof tour.averageRating === "number" &&
                                                                    !Number.isNaN(tour.averageRating) && (
                                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                                            <MdStar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                                                                {tour.averageRating.toFixed(1)}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {/* Bookings */}
                                                                <div className="flex items-center gap-2">
                                                                    <Badge className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20">
                                                                        <MdPeople className="h-3.5 w-3.5 mr-1" />
                                                                        {tour.bookingCount}/{tour.maxGroupSize}
                                                                    </Badge>

                                                                    {tour.isFull && (
                                                                        <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-sm">
                                                                            Full
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                {/* Discount */}
                                                                {tour.activeDiscountPercentage && (
                                                                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm animate-pulse">
                                                                        🎉 -{tour.activeDiscountPercentage}% off
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {/* Tags Row */}
                                                            {tour.tags && tour.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {tour.tags.slice(0, 5).map((tag) => (
                                                                        <span
                                                                            key={tag}
                                                                            className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md"
                                                                        >
                                                                            {tag}
                                                                        </span>
                                                                    ))}

                                                                    {tour.tags.length > 5 && (
                                                                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                                                                            +{tour.tags.length - 5} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>

                                                {/* Right Section - View Button (sibling, aligned center with row) */}
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRouteClick(tour.id);
                                                    }}
                                                    size="sm"
                                                    className="h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all ml-4"
                                                >
                                                    <MdOpenInNew className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            </div>

                                            {/* Expandable Content */}
                                            <AccordionContent className="px-6 pb-6 pt-2">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                                    {/* Categories */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-indigo-600" />
                                                            Categories
                                                        </div>

                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(
                                                                tour.categories ??
                                                                (tour.category ? [tour.category] : [])
                                                            )?.map((c) => (
                                                                <span
                                                                    key={c}
                                                                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 text-indigo-700 dark:text-indigo-300 text-sm border border-indigo-200 dark:border-indigo-800"
                                                                >
                                                                    {c}
                                                                </span>
                                                            ))}

                                                            {tour.subCategory && (
                                                                <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 text-purple-700 dark:text-purple-300 text-sm border border-purple-200 dark:border-purple-800">
                                                                    {tour.subCategory}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Audience */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-violet-600" />
                                                            Audience
                                                        </div>

                                                        <div className="flex flex-wrap gap-1.5">
                                                            {tour.audience && tour.audience.length > 0 ? (
                                                                tour.audience.map((a) => (
                                                                    <span
                                                                        key={a}
                                                                        className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 text-sm border border-violet-200 dark:border-violet-800"
                                                                    >
                                                                        {a}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-sm text-slate-400 dark:text-slate-500">
                                                                    Not specified
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Travel Types */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-blue-600" />
                                                            Travel Types
                                                        </div>

                                                        <div className="flex flex-wrap gap-1.5">
                                                            {tour.travelTypes && tour.travelTypes.length > 0 ? (
                                                                tour.travelTypes.map((tt) => (
                                                                    <span
                                                                        key={tt}
                                                                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-sm border border-blue-200 dark:border-blue-800"
                                                                    >
                                                                        {tt}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-sm text-slate-400 dark:text-slate-500">
                                                                    Not specified
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Price Summary */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-emerald-600" />
                                                            Price Range
                                                        </div>

                                                        {priceMin || priceMax ? (
                                                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                                {priceMin && priceMax
                                                                    ? `${priceMin} – ${priceMax}`
                                                                    : priceMin || priceMax}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-400 dark:text-slate-500">
                                                                Not available
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Visibility & Trend */}
                                                    <div className="space-y-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                                                <div className="h-1 w-1 rounded-full bg-slate-600" />
                                                                Visibility
                                                            </div>

                                                            {tour.visibility ? (
                                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                                    <MdVisibility className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                                                                        {tour.visibility}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-slate-400 dark:text-slate-500">
                                                                    Not specified
                                                                </span>
                                                            )}
                                                        </div>

                                                        {tour.bookingTrend && (
                                                            <div>
                                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                                                    <div className="h-1 w-1 rounded-full bg-slate-600" />
                                                                    Booking Trend
                                                                </div>

                                                                <div
                                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${tour.bookingTrend === "increasing"
                                                                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                                                        : tour.bookingTrend === "stable"
                                                                            ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                                            : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                                                                        }`}
                                                                >
                                                                    <MdShield className="h-4 w-4" />
                                                                    <span className="text-sm font-medium capitalize">
                                                                        {tour.bookingTrend}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Engagement Stats */}
                                                    <div className="space-y-2 lg:col-span-3">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-pink-600" />
                                                            Engagement Metrics
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                                                                <MdRemoveRedEye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                <div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        Views
                                                                    </div>
                                                                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                                                        {tour.viewCount ?? 0}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200 dark:border-pink-800">
                                                                <MdThumbUp className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                                                <div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        Likes
                                                                    </div>
                                                                    <div className="text-lg font-bold text-pink-700 dark:text-pink-300">
                                                                        {tour.likeCount ?? 0}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800">
                                                                <MdShare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                                <div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        Shares
                                                                    </div>
                                                                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                                                        {tour.shareCount ?? 0}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800">
                                                                <MdFavorite className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                                <div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        Wishlist
                                                                    </div>
                                                                    <div className="text-lg font-bold text-red-700 dark:text-red-300">
                                                                        {tour.wishlistCount ?? 0}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800">
                                                                <MdRateReview className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                                <div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        Reviews
                                                                    </div>
                                                                    <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                                                                        {tour.reviewCount ?? 0}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-900 border border-slate-200 dark:border-slate-700">
                                                                <MdFlag className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                                                <div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        Reports
                                                                    </div>
                                                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                                                        {tour.reportCount ?? 0}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Lifecycle Info */}
                                                    <div className="space-y-2 lg:col-span-3">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-slate-600" />
                                                            Lifecycle Information
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                    Created
                                                                </div>
                                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                    {created}
                                                                </div>
                                                            </div>

                                                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                    Last Updated
                                                                </div>
                                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                    {updated}
                                                                </div>
                                                            </div>

                                                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                    Last Booking
                                                                </div>
                                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                    {lastBooking}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {tour.trendingUntil && (
                                                            <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                                                                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                                                        Trending until:{" "}
                                                                        {dateFormatter.format(new Date(tour.trendingUntil))}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </div>
                                    </AccordionItem>
                                </Accordion>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Empty State */}
                {items.length === 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700"
                    >
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 mb-6">
                            <MdTrendingUp className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            No tours found
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
                            Try adjusting your filters or search criteria to find tours.
                        </p>
                    </motion.div>
                )}

                {/* Loading Skeleton */}
                {loading && items.length === 0 && (
                    <div className="space-y-3">
                        {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
                            <div
                                key={`skeleton-${i}`}
                                className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 animate-pulse"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                        <div className="flex gap-2">
                                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2 pt-4">
                    {/* Results Info */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 shadow-sm">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Showing</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {Math.min((page - 1) * limit + 1, total)}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">-</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {Math.min(page * limit, total)}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">of</span>
                            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {total}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">tours</span>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page <= 1 || loading}
                            className="gap-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 border-slate-200 dark:border-slate-800 px-4 py-5 transition-all hover:shadow-md"
                        >
                            <MdArrowBack className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">Previous</span>
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {(() => {
                                const visible: (number | string)[] = [];
                                const maxShown = 7;

                                if (pages <= maxShown) {
                                    for (let i = 1; i <= pages; i++) visible.push(i);
                                } else {
                                    const start = Math.max(2, page - 2);
                                    const end = Math.min(pages - 1, page + 2);
                                    visible.push(1);
                                    if (start > 2) visible.push("…");
                                    for (let i = start; i <= end; i++) visible.push(i);
                                    if (end < pages - 1) visible.push("…");
                                    visible.push(pages);
                                }

                                return visible.map((p, idx) => {
                                    if (typeof p === "string") {
                                        return (
                                            <span
                                                key={`ellipsis-${idx}`}
                                                className="h-10 w-10 inline-flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium"
                                            >
                                                {p}
                                            </span>
                                        );
                                    }

                                    const isActive = page === p;
                                    return (
                                        <Button
                                            key={p}
                                            variant={isActive ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onPageChange(p)}
                                            disabled={loading}
                                            className={[
                                                "h-10 w-10 rounded-xl transition-all duration-300 font-semibold",
                                                isActive
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 scale-105"
                                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 hover:scale-105 hover:shadow-md",
                                            ].join(" ")}
                                        >
                                            {p}
                                        </Button>
                                    );
                                });
                            })()}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(pages, page + 1))}
                            disabled={page >= pages || loading}
                            className="gap-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 border-slate-200 dark:border-slate-800 px-4 py-5 transition-all hover:shadow-md"
                        >
                            <span className="hidden sm:inline font-medium">Next</span>
                            <MdArrowForward className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
