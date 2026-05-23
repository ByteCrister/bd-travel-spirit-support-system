// components/support/tours/ToursTable.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { MODERATION_STATUS, DIFFICULTY_LEVEL, TRAVEL_TYPE } from "@/constants/tour.const";
import { cn } from "@/lib/utils";
import { useTourApproval } from "@/store/tour-approval.store";
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

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
    "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
const NEU_BTN_DANGER =
    "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:bg-[#FF2157]/10 hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
const NEU_BADGE =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_SUCCESS =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_ICON_WELL =
    "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO =
    "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Animation variants ────────────────────────────────────────
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ── Badge helpers ─────────────────────────────────────────────
const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
        case DIFFICULTY_LEVEL.EASY: return NEU_BADGE_SUCCESS;
        case DIFFICULTY_LEVEL.MODERATE: return NEU_BADGE_WARNING;
        case DIFFICULTY_LEVEL.CHALLENGING: return NEU_BADGE_DANGER;
        default: return NEU_BADGE;
    }
};

const getTravelTypeBadge = (type: string) => {
    const map: Record<string, string> = {
        [TRAVEL_TYPE.COUPLES]: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-pink-500/10 text-pink-600 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
        [TRAVEL_TYPE.FAMILIES]: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-sky-500/10 text-sky-600 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
        [TRAVEL_TYPE.SOLO]: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-indigo-500/10 text-indigo-600 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
        [TRAVEL_TYPE.ADVENTURE_SEEKERS]: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
        [TRAVEL_TYPE.GROUP_OF_FRIENDS]: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-violet-500/10 text-violet-600 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
    };
    return map[type] || NEU_BADGE;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case MODERATION_STATUS.APPROVED: return NEU_BADGE_SUCCESS;
        case MODERATION_STATUS.DENIED: return NEU_BADGE_DANGER;
        case MODERATION_STATUS.SUSPENDED: return NEU_BADGE;
        case MODERATION_STATUS.PENDING: return NEU_BADGE_WARNING;
        default: return NEU_BADGE;
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case MODERATION_STATUS.APPROVED: return <CheckCircle2 className="w-3.5 h-3.5" />;
        case MODERATION_STATUS.DENIED: return <XCircle className="w-3.5 h-3.5" />;
        case MODERATION_STATUS.SUSPENDED: return <Ban className="w-3.5 h-3.5" />;
        case MODERATION_STATUS.PENDING: return <Clock className="w-3.5 h-3.5" />;
        default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
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
        try { return format(new Date(dateString), "MMM dd, yyyy"); }
        catch { return "Invalid date"; }
    };

    if (tours.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className={cn(NEU_CARD_SM, "w-20 h-20 flex items-center justify-center")}>
                    <AlertCircle className="w-9 h-9 text-[#1E2938]/30" />
                </div>
                <h3 className={cn(NEU_HEADING, "text-base")}>No tours found</h3>
                <p className={NEU_MUTED}>Try adjusting your filters or check back later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Results count */}
            <div className={cn(NEU_SURFACE_INSET_SM, "inline-flex items-center px-3 py-1.5 rounded-xl")}>
                <span className={NEU_MUTED}>
                    Showing{" "}
                    <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]">
                        {tours.length}
                    </span>{" "}
                    tours on page{" "}
                    <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]">
                        {pagination.page}
                    </span>
                </span>
            </div>

            {/* Tours list */}
            <div className="grid grid-cols-1 gap-5">
                <AnimatePresence mode="popLayout">
                    {tours.map((t) => {
                        const isExpanded = expandedTours.has(t.id);

                        return (
                            <motion.article
                                key={t.id}
                                layout
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                className={cn(NEU_CARD, NEU_CARD_HOVER, "overflow-hidden")}
                            >
                                <div className="p-5 md:p-6 space-y-5">
                                    {/* ── Header ────────────────────────────────────── */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-start gap-2">
                                                {t.featured && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                                        className="flex-shrink-0 mt-1"
                                                    >
                                                        <Sparkles className="w-4 h-4 text-[#FE9900]" />
                                                    </motion.div>
                                                )}
                                                <h3 className={cn(NEU_HEADING, "text-lg md:text-xl leading-snug")}>
                                                    {t.title}
                                                </h3>
                                            </div>
                                            <p className={cn(NEU_MUTED, "line-clamp-2")}>{t.summary}</p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <span className={getTravelTypeBadge(t.tourType)}>
                                                    {t.tourType.replace(/_/g, " ")}
                                                </span>
                                                {t.duration && (
                                                    <span className={cn(NEU_BADGE, "gap-1")}>
                                                        <Clock className="w-3 h-3" />
                                                        {t.duration.days}D{t.duration.nights ? `/${t.duration.nights}N` : ""}
                                                    </span>
                                                )}
                                                <span className={getDifficultyBadge(t.difficulty)}>
                                                    {t.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status badge */}
                                        <span className={cn(getStatusBadge(t.moderationStatus), "flex-shrink-0 flex items-center gap-1.5")}>
                                            {getStatusIcon(t.moderationStatus)}
                                            <span className="hidden sm:inline">{t.moderationStatus}</span>
                                        </span>
                                    </div>

                                    {/* ── Quick info grid ───────────────────────────── */}
                                    <div className={cn(NEU_SURFACE_INSET_SM, "rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4")}>
                                        {/* Location */}
                                        <div className="flex items-center gap-3">
                                            <div className={cn(NEU_ICON_WELL, "flex-shrink-0 w-9 h-9 flex items-center justify-center")}>
                                                <MapPin className="w-4 h-4 text-[#006666]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={NEU_LABEL}>Location</p>
                                                <p className={cn(NEU_MONO, "text-sm font-semibold truncate")}>{t.division}</p>
                                                <p className={cn(NEU_MUTED, "text-xs truncate")}>{t.district}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center gap-3">
                                            <div className={cn(NEU_ICON_WELL, "flex-shrink-0 w-9 h-9 flex items-center justify-center")}>
                                                <span className="text-[#00A63D] font-bold text-sm">৳</span>
                                            </div>
                                            <div>
                                                <p className={NEU_LABEL}>Price</p>
                                                <p className={cn(NEU_MONO, "text-sm font-semibold")}>
                                                    {t.basePrice?.amount} {t.basePrice?.currency}
                                                </p>
                                                {t.hasActiveDiscount && (
                                                    <p className="text-xs font-bold text-[#00A63D] font-[family-name:var(--font-space-mono)]">
                                                        -{t.activeDiscountValue}%
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        {t.ratings && (
                                            <div className="flex items-center gap-3">
                                                <div className={cn(NEU_ICON_WELL, "flex-shrink-0 w-9 h-9 flex items-center justify-center")}>
                                                    <Star className="w-4 h-4 text-[#FE9900] fill-[#FE9900]" />
                                                </div>
                                                <div>
                                                    <p className={NEU_LABEL}>Rating</p>
                                                    <p className={cn(NEU_MONO, "text-sm font-semibold")}>
                                                        {t.ratings.average.toFixed(1)}{" "}
                                                        <span className={cn(NEU_MUTED, "text-xs")}>
                                                            ({t.ratings.count})
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Views */}
                                        <div className="flex items-center gap-3">
                                            <div className={cn(NEU_ICON_WELL, "flex-shrink-0 w-9 h-9 flex items-center justify-center")}>
                                                <Eye className="w-4 h-4 text-[#006666]" />
                                            </div>
                                            <div>
                                                <p className={NEU_LABEL}>Views</p>
                                                <p className={cn(NEU_MONO, "text-sm font-semibold")}>{t.viewCount}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Action buttons ─────────────────────────────── */}
                                    <div className="flex flex-wrap gap-3">
                                        {t.moderationStatus === MODERATION_STATUS.PENDING && (
                                            <button
                                                onClick={() => setApproveOpenFor(t.id)}
                                                disabled={isProcessing}
                                                className={cn(NEU_BTN_PRIMARY, "flex-1 min-w-[130px] h-10 flex items-center justify-center gap-2 text-sm")}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setRejectOpenFor(t.id)}
                                            disabled={isProcessing}
                                            className={cn(NEU_BTN_DANGER, "flex-1 min-w-[130px] h-10 flex items-center justify-center gap-2 text-sm")}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() =>
                                                router.push(`/support/tours/${encodeURIComponent(encodeId(t.id))}`)
                                            }
                                            className={cn(NEU_BTN_GHOST, "flex-1 min-w-[130px] h-10 flex items-center justify-center gap-2 text-sm")}
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </button>
                                    </div>

                                    {/* ── Expand/collapse ───────────────────────────── */}
                                    <button
                                        onClick={() => toggleExpanded(t.id)}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm",
                                            NEU_BTN_GHOST
                                        )}
                                        aria-expanded={isExpanded}
                                    >
                                        <span className={cn(NEU_LABEL)}>
                                            {isExpanded ? "Show Less" : "Show More Details"}
                                        </span>
                                        <motion.span
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="inline-flex"
                                        >
                                            <ChevronDown className="w-4 h-4 text-[#1E2938]/50" />
                                        </motion.span>
                                    </button>

                                    {/* ── Expandable details ────────────────────────── */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className={cn("pt-5 border-t space-y-5", NEU_DIVIDER)}>
                                                    {/* Engagement stats */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div className={cn(NEU_CARD_SM, "flex items-center gap-3 p-4")}>
                                                            <Heart className="w-5 h-5 text-[#FF2157] flex-shrink-0" />
                                                            <div>
                                                                <p className={NEU_LABEL}>Wishlist</p>
                                                                <p className={cn(NEU_HEADING, "text-lg")}>{t.wishlistCount}</p>
                                                            </div>
                                                        </div>
                                                        <div className={cn(NEU_CARD_SM, "flex items-center gap-3 p-4")}>
                                                            <TrendingUp className="w-5 h-5 text-[#00A63D] flex-shrink-0" />
                                                            <div>
                                                                <p className={NEU_LABEL}>Likes</p>
                                                                <p className={cn(NEU_HEADING, "text-lg")}>{t.likeCount}</p>
                                                            </div>
                                                        </div>
                                                        <div className={cn(NEU_CARD_SM, "flex items-center gap-3 p-4")}>
                                                            <Share2 className="w-5 h-5 text-[#006666] flex-shrink-0" />
                                                            <div>
                                                                <p className={NEU_LABEL}>Shares</p>
                                                                <p className={cn(NEU_HEADING, "text-lg")}>{t.shareCount}</p>
                                                            </div>
                                                        </div>
                                                        {t.occupancyPercentage !== undefined && (
                                                            <div className={cn(NEU_CARD_SM, "p-4 space-y-2")}>
                                                                <p className={NEU_LABEL}>Occupancy</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn(NEU_SURFACE_INSET_SM, "flex-1 h-2 rounded-full overflow-hidden")}>
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${Math.min(t.occupancyPercentage, 100)}%` }}
                                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                                            className={cn(
                                                                                "h-full rounded-full",
                                                                                t.occupancyPercentage >= 80
                                                                                    ? "bg-[#00A63D]"
                                                                                    : t.occupancyPercentage >= 50
                                                                                        ? "bg-[#FE9900]"
                                                                                        : "bg-[#006666]"
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <span className={cn(NEU_HEADING, "text-sm min-w-[3ch]")}>
                                                                        {t.occupancyPercentage}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Dates */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {t.nextDeparture && (
                                                            <div className={cn(NEU_CARD_SM, "flex items-center gap-3 p-4")}>
                                                                <Calendar className="w-4 h-4 text-[#006666] flex-shrink-0" />
                                                                <div>
                                                                    <p className={NEU_LABEL}>Next Departure</p>
                                                                    <p className={cn(NEU_MONO, "text-sm font-semibold")}>{formatDate(t.nextDeparture)}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className={cn(NEU_CARD_SM, "flex items-center gap-3 p-4")}>
                                                            <Clock className="w-4 h-4 text-[#1E2938]/50 flex-shrink-0" />
                                                            <div>
                                                                <p className={NEU_LABEL}>Published</p>
                                                                <p className={cn(NEU_MONO, "text-sm font-semibold")}>{formatDate(t.publishedAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Metadata */}
                                                    <div className={cn(NEU_SURFACE_INSET_SM, "rounded-xl p-4 space-y-3")}>
                                                        {[
                                                            { label: "Slug", value: <code className={cn(NEU_MONO, "text-xs bg-[#E7E5E4] shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff] px-2 py-0.5 rounded-lg")}>{t.slug}</code> },
                                                            { label: "Created", value: <span className={cn(NEU_MONO, "text-sm")}>{formatDate(t.createdAt)}</span> },
                                                            { label: "Last Updated", value: <span className={cn(NEU_MONO, "text-sm")}>{formatDate(t.updatedAt)}</span> },
                                                        ].map(({ label, value }) => (
                                                            <div key={label} className={cn("flex justify-between items-center pb-3 last:pb-0 last:border-0 border-b", NEU_DIVIDER)}>
                                                                <span className={NEU_LABEL}>{label}</span>
                                                                {value}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.article>
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