// components/support/tours/ToursTable.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { MODERATION_STATUS, DIFFICULTY_LEVEL, TRAVEL_TYPE } from "@/constants/tour.const";
import { cn } from "@/lib/utils";
import { useTourApproval } from "@/store/tour-approval.store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    MapPin,
    Star,
    Eye,
    Heart,
    Share2,
    Clock,
    TrendingUp,
    ChevronDown,
    Sparkles,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Ban,
} from "lucide-react";
import { format } from "date-fns";
import { ConfirmApproveDialog } from "./details/ConfirmApproveDialog";
import { RejectDialog } from "./details/RejectDialog";
import { useRouter } from "next/navigation";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
    hover: {
        y: -4,
        transition: { duration: 0.2 },
    },
};

export default function ToursTable() {
    const router = useRouter();
    const { tours, pagination, isProcessing } = useTourApproval();
    const [approveOpenFor, setApproveOpenFor] = useState<string | null>(null);
    const [rejectOpenFor, setRejectOpenFor] = useState<string | null>(null);
    const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set());

    const toggleExpanded = (id: string) => {
        setExpandedTours((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        try {
            return format(new Date(dateString), "MMM dd, yyyy");
        } catch {
            return "Invalid date";
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case DIFFICULTY_LEVEL.EASY:
                return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200";
            case DIFFICULTY_LEVEL.MODERATE:
                return "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200";
            case DIFFICULTY_LEVEL.CHALLENGING:
                return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const getTravelTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            [TRAVEL_TYPE.COUPLES]: "from-pink-50 to-rose-50 text-pink-700 border-pink-200",
            [TRAVEL_TYPE.FAMILIES]: "from-sky-50 to-blue-50 text-sky-700 border-sky-200",
            [TRAVEL_TYPE.SOLO]: "from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200",
            [TRAVEL_TYPE.BUSINESS]: "from-slate-50 to-gray-50 text-slate-700 border-slate-200",
            [TRAVEL_TYPE.ADVENTURE_SEEKERS]: "from-orange-50 to-amber-50 text-orange-700 border-orange-200",
            [TRAVEL_TYPE.GROUP_OF_FRIENDS]: "from-violet-50 to-purple-50 text-violet-700 border-violet-200",
        };
        return colors[type] || "from-slate-50 to-gray-50 text-slate-700 border-slate-200";
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case MODERATION_STATUS.APPROVED:
                return <CheckCircle2 className="w-4 h-4" />;
            case MODERATION_STATUS.DENIED:
                return <XCircle className="w-4 h-4" />;
            case MODERATION_STATUS.SUSPENDED:
                return <Ban className="w-4 h-4" />;
            case MODERATION_STATUS.PENDING:
                return <Clock className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case MODERATION_STATUS.PENDING:
                return "from-amber-50 to-orange-50 text-amber-700 border-amber-200";
            case MODERATION_STATUS.APPROVED:
                return "from-green-50 to-emerald-50 text-green-700 border-green-200";
            case MODERATION_STATUS.DENIED:
                return "from-red-50 to-rose-50 text-red-700 border-red-200";
            case MODERATION_STATUS.SUSPENDED:
                return "from-slate-50 to-gray-50 text-slate-700 border-slate-200";
            default:
                return "from-slate-50 to-gray-50 text-slate-700 border-slate-200";
        }
    };

    if (tours.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                    <AlertCircle className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No tours found</h3>
                <p className="text-sm text-slate-600">Try adjusting your filters or check back later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Results Count */}
            <div className="flex items-center justify-between px-1">
                <p className="text-sm font-medium text-slate-600">
                    Showing <span className="text-slate-900 font-semibold">{tours.length}</span> tours on page{" "}
                    <span className="text-slate-900 font-semibold">{pagination.page}</span>
                </p>
            </div>

            {/* Tours Grid */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {tours.map((t) => {
                        const isExpanded = expandedTours.has(t.id);

                        return (
                            <motion.div
                                key={t.id}
                                layout
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all"
                            >
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-indigo-50/0 to-purple-50/0 group-hover:from-blue-50/40 group-hover:via-indigo-50/30 group-hover:to-purple-50/40 transition-all duration-500 pointer-events-none" />

                                <div className="relative p-6 space-y-6">
                                    {/* Header Section */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0 space-y-3">
                                            {/* Title with Featured Badge */}
                                            <div className="flex items-start gap-2">
                                                {t.featured && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                                    >
                                                        <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                    </motion.div>
                                                )}
                                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                    {t.title}
                                                </h3>
                                            </div>

                                            {/* Summary */}
                                            <p className="text-sm md:text-base text-slate-600 line-clamp-2">{t.summary}</p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                <Badge className={cn("bg-gradient-to-r border", getTravelTypeColor(t.tourType))}>
                                                    {t.tourType.replace(/_/g, " ")}
                                                </Badge>
                                                {t.duration && (
                                                    <Badge variant="outline" className="flex items-center gap-1.5 border-slate-300">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {t.duration.days}D{t.duration.nights ? `/${t.duration.nights}N` : ""}
                                                    </Badge>
                                                )}
                                                <Badge className={cn("border", getDifficultyColor(t.difficulty))}>
                                                    {t.difficulty}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <Badge className={cn("flex items-center gap-1.5 px-3 py-1.5 border bg-gradient-to-r shrink-0", getStatusColor(t.moderationStatus))}>
                                            {getStatusIcon(t.moderationStatus)}
                                            <span className="hidden sm:inline">{t.moderationStatus}</span>
                                        </Badge>
                                    </div>

                                    {/* Quick Info Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-blue-100">
                                                <MapPin className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 font-medium">Location</p>
                                                <p className="text-sm font-semibold text-slate-900 truncate">{t.division}</p>
                                                <p className="text-xs text-slate-600 truncate">{t.district}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-green-100">
                                                <div className="w-4 h-4 text-green-600 font-bold flex items-center justify-center">৳</div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Price</p>
                                                <div className="flex items-baseline gap-1">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {t.basePrice?.amount} {t.basePrice?.currency}
                                                    </p>
                                                    {t.hasActiveDiscount && (
                                                        <span className="text-xs font-bold text-green-600">-{t.activeDiscountValue}%</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {t.ratings && (
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-yellow-100">
                                                    <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Rating</p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {t.ratings.average.toFixed(1)}{" "}
                                                        <span className="text-xs text-slate-500">({t.ratings.count})</span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-purple-100">
                                                <Eye className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Views</p>
                                                <p className="text-sm font-semibold text-slate-900">{t.viewCount}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        {
                                            t.moderationStatus === MODERATION_STATUS.PENDING && (
                                                <Button
                                                    onClick={() => setApproveOpenFor(t.id)}
                                                    disabled={isProcessing}
                                                    className="flex-1 min-w-[140px] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Approve
                                                </Button>
                                            )
                                        }
                                        <Button
                                            onClick={() => setRejectOpenFor(t.id)}
                                            disabled={isProcessing}
                                            className="flex-1 min-w-[140px] bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-md hover:shadow-lg transition-all"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button
                                            onClick={() => router.push(`/support/tours/${encodeURIComponent(encodeId(t.id))}`)}
                                            variant="outline"
                                            className="flex-1 min-w-[140px] border-2 hover:bg-slate-50 hover:border-slate-300 transition-all"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </div>

                                    {/* Expand/Collapse Button */}
                                    <motion.button
                                        onClick={() => toggleExpanded(t.id)}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                                    >
                                        <span>{isExpanded ? "Show Less" : "Show More Details"}</span>
                                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                            <ChevronDown className="w-4 h-4" />
                                        </motion.div>
                                    </motion.button>

                                    {/* Expandable Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-6 border-t space-y-6">
                                                    {/* Engagement Stats */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                                                            <Heart className="w-5 h-5 text-red-500" />
                                                            <div>
                                                                <p className="text-xs text-slate-600 font-medium">Wishlist</p>
                                                                <p className="text-lg font-bold text-slate-900">{t.wishlistCount}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                                            <TrendingUp className="w-5 h-5 text-green-500" />
                                                            <div>
                                                                <p className="text-xs text-slate-600 font-medium">Likes</p>
                                                                <p className="text-lg font-bold text-slate-900">{t.likeCount}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                                                            <Share2 className="w-5 h-5 text-purple-500" />
                                                            <div>
                                                                <p className="text-xs text-slate-600 font-medium">Shares</p>
                                                                <p className="text-lg font-bold text-slate-900">{t.shareCount}</p>
                                                            </div>
                                                        </div>
                                                        {t.occupancyPercentage !== undefined && (
                                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                                                <p className="text-xs text-slate-600 font-medium mb-2">Occupancy</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${Math.min(t.occupancyPercentage, 100)}%` }}
                                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                                            className={cn(
                                                                                "h-full rounded-full",
                                                                                t.occupancyPercentage >= 80
                                                                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                                                    : t.occupancyPercentage >= 50
                                                                                        ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                                                                                        : "bg-gradient-to-r from-blue-500 to-cyan-500"
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-900 min-w-[3ch]">
                                                                        {t.occupancyPercentage}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Date Information */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {t.nextDeparture && (
                                                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                                <Calendar className="w-5 h-5 text-blue-600" />
                                                                <div>
                                                                    <p className="text-xs text-slate-600 font-medium">Next Departure</p>
                                                                    <p className="text-sm font-semibold text-slate-900">{formatDate(t.nextDeparture)}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                            <Clock className="w-5 h-5 text-slate-600" />
                                                            <div>
                                                                <p className="text-xs text-slate-600 font-medium">Published</p>
                                                                <p className="text-sm font-semibold text-slate-900">{formatDate(t.publishedAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Additional Metadata */}
                                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600 font-medium">Slug:</span>
                                                            <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                                                                {t.slug}
                                                            </code>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600 font-medium">Created:</span>
                                                            <span className="text-slate-900">{formatDate(t.createdAt)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600 font-medium">Last Updated:</span>
                                                            <span className="text-slate-900">{formatDate(t.updatedAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Dialogs */}
            {tours.map((t) => (
                <React.Fragment key={t.id}>
                    <ConfirmApproveDialog
                        open={approveOpenFor === t.id}
                        onOpenChange={(open: boolean) => !open && setApproveOpenFor(null)}
                        tourId={t.id}
                        tourTitle={t.title}
                    />
                    <RejectDialog
                        open={rejectOpenFor === t.id}
                        onOpenChange={(open: boolean) => !open && setRejectOpenFor(null)}
                        tourId={t.id}
                        tourTitle={t.title}
                    />
                </React.Fragment>
            ))}
        </div>
    );
}