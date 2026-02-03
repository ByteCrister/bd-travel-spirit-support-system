"use client";

import { useMemo } from "react";
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
    MdOpenInNew,
    MdRemoveRedEye,
    MdThumbUp,
    MdShare,
    MdFavorite,
    MdRateReview,
    MdFlag,
    MdSchedule,
    MdLocalOffer,
    MdPlace,
    MdTerrain,
    MdCategory,
    MdGroup,
} from "react-icons/md";

import { TOUR_STATUS, MODERATION_STATUS, ModerationStatus, DifficultyLevel, DIFFICULTY_LEVEL, TourStatus } from "@/constants/tour.const";
import { TourListItemDTO } from "@/types/tour.types";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import Image from "next/image";
import Link from "next/link";

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

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            }),
        []
    );

    const currencyFormatter = (currency: string, amount: number) => {
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

    const statusBadge = (status: TourStatus) => {
        switch (status) {
            case TOUR_STATUS.ACTIVE:
                return (
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm">
                        Active
                    </Badge>
                );
            case TOUR_STATUS.DRAFT:
                return (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                        Draft
                    </Badge>
                );
            case TOUR_STATUS.SUBMITTED:
                return (
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-sm">
                        Submitted
                    </Badge>
                );
            case TOUR_STATUS.COMPLETED:
                return (
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Completed
                    </Badge>
                );
            case TOUR_STATUS.TERMINATED:
                return (
                    <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white border-0 shadow-sm">
                        Terminated
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

    const moderationStatusBadge = (status: ModerationStatus) => {
        switch (status) {
            case MODERATION_STATUS.APPROVED:
                return (
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm">
                        Approved
                    </Badge>
                );
            case MODERATION_STATUS.PENDING:
                return (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                        Pending
                    </Badge>
                );
            case MODERATION_STATUS.DENIED:
                return (
                    <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white border-0 shadow-sm">
                        Denied
                    </Badge>
                );
            case MODERATION_STATUS.SUSPENDED:
                return (
                    <Badge variant="outline" className="border-rose-600 text-rose-600 dark:text-rose-400">
                        Suspended
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                        {status}
                    </Badge>
                );
        }
    };

    const difficultyBadge = (difficulty: DifficultyLevel) => {
        switch (difficulty) {
            case DIFFICULTY_LEVEL.EASY:
                return (
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm">
                        Easy
                    </Badge>
                );
            case DIFFICULTY_LEVEL.MODERATE:
                return (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                        Moderate
                    </Badge>
                );
            case DIFFICULTY_LEVEL.CHALLENGING:
                return (
                    <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white border-0 shadow-sm">
                        Challenging
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                        {difficulty}
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
                        const updated = dateFormatter.format(new Date(tour.updatedAt));
                        const created = dateFormatter.format(new Date(tour.createdAt));
                        const published = tour.publishedAt ? dateFormatter.format(new Date(tour.publishedAt)) : "—";
                        const nextDeparture = tour.nextDeparture ? dateFormatter.format(new Date(tour.nextDeparture)) : "—";
                        const basePrice = currencyFormatter(tour.basePrice.currency, tour.basePrice.amount);
                        const discountedPrice = tour.hasActiveDiscount && tour.activeDiscountValue
                            ? currencyFormatter(tour.basePrice.currency, tour.basePrice.amount * (1 - tour.activeDiscountValue / 100))
                            : null;

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
                                            {tour.featured && (
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
                                                            {tour.heroImage ? (
                                                                <Image
                                                                    src={tour.heroImage}
                                                                    alt={tour.title}
                                                                    width={48}
                                                                    height={48}
                                                                    className="rounded-xl object-cover"
                                                                    priority={index < 3}
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center">
                                                                    <MdTrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0 space-y-3">
                                                            {/* Title Row */}
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                                                                    {tour.title}
                                                                </h3>
                                                                {statusBadge(tour.status)}
                                                                {moderationStatusBadge(tour.moderationStatus)}
                                                            </div>

                                                            {/* Key Metrics Row */}
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                {/* Location */}
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                                    <MdPlace className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                        {tour.district}, {tour.division}
                                                                    </span>
                                                                </div>

                                                                {/* Tour Type */}
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                                                >
                                                                    <MdCategory className="h-3.5 w-3.5 mr-1" />
                                                                    {tour.tourType}
                                                                </Badge>

                                                                {/* Difficulty */}
                                                                {difficultyBadge(tour.difficulty)}

                                                                {/* Duration */}
                                                                {tour.duration && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                                                                    >
                                                                        <MdSchedule className="h-3.5 w-3.5 mr-1" />
                                                                        {tour.duration.days} days
                                                                        {tour.duration.nights && ` / ${tour.duration.nights} nights`}
                                                                    </Badge>
                                                                )}

                                                                {/* Next Departure */}
                                                                {tour.nextDeparture && (
                                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                                                        <MdCalendarToday className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                                                            Next: {nextDeparture}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {/* Occupancy */}
                                                                {tour.occupancyPercentage !== undefined && (
                                                                    <Badge className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20">
                                                                        <MdPeople className="h-3.5 w-3.5 mr-1" />
                                                                        {tour.occupancyPercentage}% full
                                                                    </Badge>
                                                                )}

                                                                {/* Discount */}
                                                                {tour.hasActiveDiscount && tour.activeDiscountValue && (
                                                                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm animate-pulse">
                                                                        <MdLocalOffer className="h-3.5 w-3.5 mr-1" />
                                                                        -{tour.activeDiscountValue}% off
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {/* Summary */}
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                                {tour.summary}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>

                                                {/* Right Section - View Button */}
                                                <Link
                                                    href={`/users/companies/${encodeId(
                                                        encodeURIComponent(companyId)
                                                    )}/${encodeId(encodeURIComponent(tour.id))}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button size="sm" className="h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all ml-4"
                                                    >
                                                        <MdOpenInNew className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>

                                            {/* Expandable Content */}
                                            <AccordionContent className="px-6 pb-6 pt-2">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                                    {/* Pricing */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-emerald-600" />
                                                            Pricing
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-slate-600 dark:text-slate-400">Base Price:</span>
                                                                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                                    {basePrice}
                                                                    {discountedPrice && (
                                                                        <span className="ml-2 text-sm line-through text-slate-400 dark:text-slate-500">
                                                                            {discountedPrice}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {tour.hasActiveDiscount && (
                                                                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800">
                                                                    <div className="flex items-center gap-2">
                                                                        <MdLocalOffer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                                                            Active discount applied: {tour.activeDiscountValue}% off
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status Info */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-blue-600" />
                                                            Status Information
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                    Status
                                                                </div>
                                                                <div className="text-sm font-medium">
                                                                    {statusBadge(tour.status)}
                                                                </div>
                                                            </div>
                                                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                    Moderation
                                                                </div>
                                                                <div className="text-sm font-medium">
                                                                    {moderationStatusBadge(tour.moderationStatus)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Location Details */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-indigo-600" />
                                                            Location
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                                                                <MdPlace className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                                                        {tour.district}
                                                                    </div>
                                                                    <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                                                                        {tour.division} Division
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                                                <MdTerrain className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                                        Difficulty: {tour.difficulty}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Ratings */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-amber-600" />
                                                            Ratings
                                                        </div>
                                                        {tour.ratings ? (
                                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                                                <div className="flex items-center gap-1">
                                                                    <MdStar className="h-5 w-5 text-amber-600 dark:text-amber-400 fill-current" />
                                                                    <span className="text-xl font-bold text-amber-700 dark:text-amber-300">
                                                                        {tour.ratings.average.toFixed(1)}
                                                                    </span>
                                                                </div>
                                                                <div className="h-8 w-px bg-amber-200 dark:bg-amber-800" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                                        {tour.ratings.count} reviews
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                                <span className="text-sm text-slate-400 dark:text-slate-500">
                                                                    No ratings yet
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Schedule */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-violet-600" />
                                                            Schedule
                                                        </div>
                                                        <div className="space-y-2">
                                                            {tour.nextDeparture && (
                                                                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                                                                    <div className="text-xs text-violet-600 dark:text-violet-400 mb-1">
                                                                        Next Departure
                                                                    </div>
                                                                    <div className="text-sm font-medium text-violet-700 dark:text-violet-300">
                                                                        {nextDeparture}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {tour.duration && (
                                                                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                        Duration
                                                                    </div>
                                                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                        {tour.duration.days} days
                                                                        {tour.duration.nights && `, ${tour.duration.nights} nights`}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status Indicators */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            <div className="h-1 w-1 rounded-full bg-slate-600" />
                                                            Status Indicators
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {tour.isUpcoming && (
                                                                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-sm">
                                                                    Upcoming
                                                                </Badge>
                                                            )}
                                                            {tour.isExpired && (
                                                                <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white border-0 shadow-sm">
                                                                    Expired
                                                                </Badge>
                                                            )}
                                                            {tour.occupancyPercentage !== undefined && (
                                                                <Badge className={`${tour.occupancyPercentage >= 80
                                                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                                                                    : tour.occupancyPercentage >= 50
                                                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                                                    } text-white border-0 shadow-sm`}>
                                                                    {tour.occupancyPercentage}% Occupied
                                                                </Badge>
                                                            )}
                                                        </div>
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
                                                                        {tour.ratings?.count ?? 0}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-900 border border-slate-200 dark:border-slate-700">
                                                                <MdGroup className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                                                <div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        Occupancy
                                                                    </div>
                                                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                                                        {tour.occupancyPercentage ?? 0}%
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
                                                                    Published
                                                                </div>
                                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                    {published}
                                                                </div>
                                                            </div>
                                                        </div>
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