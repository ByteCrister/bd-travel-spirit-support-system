"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  TOUR_STATUS,
  MODERATION_STATUS,
  ModerationStatus,
  DifficultyLevel,
  DIFFICULTY_LEVEL,
  TourStatus,
  TOUR_DISCOUNT_TYPE,
} from "@/constants/tour.const";
import { TourListItemDTO } from "@/types/tour/tour.types";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import Image from "next/image";
import Link from "next/link";

// ─── Neumorphism Design Tokens ───────────────────────────────────────
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

const NEU_BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#006666] text-white " +
  "font-[family-name:var(--font-space-mono)] font-bold tracking-wide text-sm px-4 py-2.5 " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_ICON =
  "inline-flex items-center justify-center rounded-xl w-10 h-10 bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_ACTIVE_PAGE =
  "inline-flex items-center justify-center rounded-xl w-10 h-10 bg-[#006666] text-white " +
  "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080] " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm";

const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_BADGE_PRIMARY =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_BADGE_SUCCESS =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_BADGE_WARNING =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_BADGE_DANGER =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

const NEU_ICON_WELL_PRIMARY =
  "flex items-center justify-center p-2.5 rounded-xl bg-[#006666]/10 " +
  "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const NEU_SKELETON = "rounded-xl bg-[#d0cecd] animate-pulse";

// ─── Badge helpers ───────────────────────────────────────────────────
const statusBadge = (status: TourStatus) => {
  switch (status) {
    case TOUR_STATUS.ACTIVE:
      return <span className={NEU_BADGE_SUCCESS}>Active</span>;
    case TOUR_STATUS.DRAFT:
      return <span className={NEU_BADGE_WARNING}>Draft</span>;
    case TOUR_STATUS.SUBMITTED:
      return <span className={NEU_BADGE_PRIMARY}>Submitted</span>;
    case TOUR_STATUS.COMPLETED:
      return <span className={NEU_BADGE}>Completed</span>;
    case TOUR_STATUS.TERMINATED:
      return <span className={NEU_BADGE_DANGER}>Terminated</span>;
    case TOUR_STATUS.ARCHIVED:
    default:
      return <span className={NEU_BADGE}>Archived</span>;
  }
};

const moderationStatusBadge = (status: ModerationStatus) => {
  switch (status) {
    case MODERATION_STATUS.APPROVED:
      return <span className={NEU_BADGE_SUCCESS}>Approved</span>;
    case MODERATION_STATUS.PENDING:
      return <span className={NEU_BADGE_WARNING}>Pending</span>;
    case MODERATION_STATUS.DENIED:
      return <span className={NEU_BADGE_DANGER}>Denied</span>;
    case MODERATION_STATUS.SUSPENDED:
      return <span className={`${NEU_BADGE_DANGER}`}>Suspended</span>;
    default:
      return <span className={NEU_BADGE}>{status}</span>;
  }
};

const difficultyBadge = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case DIFFICULTY_LEVEL.EASY:
      return (
        <span className={`${NEU_BADGE_SUCCESS} flex items-center gap-1`}>
          <MdTerrain className="w-3 h-3" /> Easy
        </span>
      );
    case DIFFICULTY_LEVEL.MODERATE:
      return (
        <span className={`${NEU_BADGE_WARNING} flex items-center gap-1`}>
          <MdTerrain className="w-3 h-3" /> Moderate
        </span>
      );
    case DIFFICULTY_LEVEL.CHALLENGING:
      return (
        <span className={`${NEU_BADGE_DANGER} flex items-center gap-1`}>
          <MdTerrain className="w-3 h-3" /> Challenging
        </span>
      );
    default:
      return <span className={NEU_BADGE}>{difficulty}</span>;
  }
};

// ─── Engagement stat tile ────────────────────────────────────────────
function EngagementTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div
      className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex items-center gap-2.5`}
    >
      <span className={`text-lg ${accent}`}>{icon}</span>
      <div>
        <div className={NEU_LABEL}>{label}</div>
        <div className={`${NEU_HEADING} text-base`}>{value}</div>
      </div>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────
function SectionLabel({
  accent,
  children,
}: {
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`h-1.5 w-1.5 rounded-full ${accent ?? "bg-[#006666]"}`} />
      <span className={NEU_LABEL}>{children}</span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────
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
    [],
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

  return (
    <div className="space-y-6">
      {/* ── Error Banner ──────────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${NEU_CARD_SM} flex items-center gap-3 p-4 border border-[#FF2157]/20`}
        >
          <div
            className={`${NEU_ICON_WELL_PRIMARY} bg-[#FF2157]/10 text-[#FF2157]`}
          >
            <MdFlag className="h-5 w-5" />
          </div>
          <div>
            <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157] text-sm">
              Error:&nbsp;
            </span>
            <span className={`${NEU_MUTED}`}>{error}</span>
          </div>
        </motion.div>
      )}

      {/* ── Tours List ────────────────────────────────────────── */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {items.map((tour, index) => {
            const updated = dateFormatter.format(new Date(tour.updatedAt));
            const created = dateFormatter.format(new Date(tour.createdAt));
            const published = tour.publishedAt
              ? dateFormatter.format(new Date(tour.publishedAt))
              : "—";
            const nextDeparture = tour.nextDeparture
              ? dateFormatter.format(new Date(tour.nextDeparture))
              : "—";
            const basePrice = currencyFormatter(
              tour.basePrice.currency,
              tour.basePrice.amount,
            );

            const isFlat = tour.activeDiscountType
              ? tour.activeDiscountType === TOUR_DISCOUNT_TYPE.FLAT_AMOUNT
              : (tour.activeDiscountValue ?? 0) > 100;

            const discountedPrice =
              tour.hasActiveDiscount && tour.activeDiscountValue
                ? currencyFormatter(
                    tour.basePrice.currency,
                    isFlat
                      ? Math.max(
                          0,
                          tour.basePrice.amount - tour.activeDiscountValue,
                        )
                      : tour.basePrice.amount *
                          (1 - tour.activeDiscountValue / 100),
                  )
                : null;

            const occupancyAccent =
              (tour.occupancyPercentage ?? 0) >= 80
                ? NEU_BADGE_SUCCESS
                : (tour.occupancyPercentage ?? 0) >= 50
                  ? NEU_BADGE_WARNING
                  : NEU_BADGE_PRIMARY;

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
                    className={`${NEU_CARD} ${NEU_CARD_HOVER} overflow-hidden border-0`}
                  >
                    {/* ── Always-visible header ──────────────────── */}
                    <div className="relative">
                      {/* Featured ribbon */}
                      {tour.featured && (
                        <div className="absolute top-0 right-0 z-10">
                          <div
                            className={`${NEU_BADGE_WARNING} rounded-none rounded-bl-xl rounded-tr-2xl px-3 py-1.5 text-[11px]`}
                          >
                            ⭐ Featured
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between px-5 py-4 gap-3">
                        {/* AccordionTrigger: left content */}
                        <AccordionTrigger className="flex-1 min-w-0 hover:no-underline group">
                          <div className="flex items-start gap-4 flex-1 min-w-0 text-left">
                            {/* Thumbnail */}
                            <div
                              className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden ${NEU_SURFACE_INSET_SM} flex items-center justify-center`}
                            >
                              {tour.heroImage ? (
                                <Image
                                  src={tour.heroImage}
                                  alt={tour.title}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                  priority={index < 3}
                                />
                              ) : (
                                <MdTrendingUp className="h-7 w-7 text-[#006666]" />
                              )}
                            </div>

                            {/* Main info */}
                            <div className="flex-1 min-w-0 space-y-2.5">
                              {/* Title + status badges */}
                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className={`${NEU_HEADING} text-base line-clamp-1 group-hover:text-[#006666] transition-colors`}
                                >
                                  {tour.title}
                                </h3>
                                {statusBadge(tour.status)}
                                {moderationStatusBadge(tour.moderationStatus)}
                              </div>

                              {/* Metric chips */}
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Location */}
                                <span
                                  className={`${NEU_BADGE} flex items-center gap-1`}
                                >
                                  <MdPlace className="w-3 h-3 text-[#006666]" />
                                  {tour.district}, {tour.division}
                                </span>

                                {/* Tour type */}
                                <span
                                  className={`${NEU_BADGE_PRIMARY} flex items-center gap-1`}
                                >
                                  <MdCategory className="w-3 h-3" />
                                  {tour.tourType}
                                </span>

                                {/* Difficulty */}
                                {difficultyBadge(tour.difficulty)}

                                {/* Duration */}
                                {tour.duration && (
                                  <span
                                    className={`${NEU_BADGE} flex items-center gap-1`}
                                  >
                                    <MdSchedule className="w-3 h-3 text-[#006666]" />
                                    {tour.duration.days}d
                                    {tour.duration.nights
                                      ? ` / ${tour.duration.nights}n`
                                      : ""}
                                  </span>
                                )}

                                {/* Next departure */}
                                {tour.nextDeparture && (
                                  <span
                                    className={`${NEU_BADGE_SUCCESS} flex items-center gap-1`}
                                  >
                                    <MdCalendarToday className="w-3 h-3" />
                                    Next: {nextDeparture}
                                  </span>
                                )}

                                {/* Occupancy */}
                                {tour.occupancyPercentage !== undefined && (
                                  <span
                                    className={`${NEU_BADGE_PRIMARY} flex items-center gap-1`}
                                  >
                                    <MdPeople className="w-3 h-3" />
                                    {tour.occupancyPercentage}% full
                                  </span>
                                )}

                                {/* Discount chip */}
                                {tour.hasActiveDiscount &&
                                  tour.activeDiscountValue && (
                                    <span
                                      className={`${NEU_BADGE_WARNING} flex items-center gap-1`}
                                    >
                                      <MdLocalOffer className="w-3 h-3" />
                                      {isFlat
                                        ? `-৳${tour.activeDiscountValue}`
                                        : `-${tour.activeDiscountValue}%`}
                                    </span>
                                  )}
                              </div>

                              {/* Summary */}
                              {tour.summary && (
                                <p
                                  className={`${NEU_MUTED} text-xs line-clamp-2`}
                                >
                                  {tour.summary}
                                </p>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>

                        {/* View button */}
                        <Link
                          href={`/users/companies/${encodeId(
                            encodeURIComponent(companyId),
                          )}/${encodeId(encodeURIComponent(tour.id))}`}
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 ml-2"
                        >
                          <span className={NEU_BTN_PRIMARY}>
                            <MdOpenInNew className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* ── Expandable detail panel ─────────────────── */}
                    <AccordionContent>
                      <div
                        className={`${NEU_SURFACE_INSET} rounded-b-2xl px-5 pb-6 pt-4`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Pricing */}
                          <div>
                            <SectionLabel accent="bg-[#00A63D]">
                              Pricing
                            </SectionLabel>
                            <div className={`${NEU_CARD_SM} p-4 space-y-3`}>
                              <div className="flex items-center justify-between">
                                <span className={NEU_LABEL}>Base Price</span>
                                <div className="text-right">
                                  <span className="font-[family-name:var(--font-space-mono)] font-bold text-lg text-[#00A63D]">
                                    {basePrice}
                                  </span>
                                  {discountedPrice && (
                                    <span
                                      className={`${NEU_MUTED} text-xs line-through ml-2`}
                                    >
                                      {discountedPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {tour.hasActiveDiscount && (
                                <div
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex items-center gap-2`}
                                >
                                  <MdLocalOffer className="text-[#00A63D] flex-shrink-0" />
                                  <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#00A63D]">
                                    {isFlat
                                      ? `৳${tour.activeDiscountValue} off`
                                      : `${tour.activeDiscountValue}% off`}{" "}
                                    applied
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status Info */}
                          <div>
                            <SectionLabel accent="bg-[#006666]">
                              Status Information
                            </SectionLabel>
                            <div className={`${NEU_CARD_SM} p-4`}>
                              <div className="grid grid-cols-2 gap-3">
                                <div
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
                                >
                                  <div className={`${NEU_LABEL} mb-1.5`}>
                                    Status
                                  </div>
                                  {statusBadge(tour.status)}
                                </div>
                                <div
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
                                >
                                  <div className={`${NEU_LABEL} mb-1.5`}>
                                    Moderation
                                  </div>
                                  {moderationStatusBadge(tour.moderationStatus)}
                                </div>
                              </div>
                              {/* Status indicators */}
                              <div className="flex flex-wrap gap-2 mt-3">
                                {tour.isUpcoming && (
                                  <span className={NEU_BADGE_PRIMARY}>
                                    Upcoming
                                  </span>
                                )}
                                {tour.isExpired && (
                                  <span className={NEU_BADGE_DANGER}>
                                    Expired
                                  </span>
                                )}
                                {tour.occupancyPercentage !== undefined && (
                                  <span className={occupancyAccent}>
                                    {tour.occupancyPercentage}% Occupied
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          <div>
                            <SectionLabel accent="bg-[#006666]">
                              Location
                            </SectionLabel>
                            <div className={`${NEU_CARD_SM} p-4 space-y-3`}>
                              <div
                                className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex items-center gap-2`}
                              >
                                <MdPlace className="text-[#006666] flex-shrink-0" />
                                <div>
                                  <div
                                    className={`${NEU_MONO} text-sm font-semibold`}
                                  >
                                    {tour.district}
                                  </div>
                                  <div className={`${NEU_MUTED} text-xs`}>
                                    {tour.division} Division
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex items-center gap-2`}
                              >
                                <MdTerrain className="text-[#FE9900] flex-shrink-0" />
                                <div
                                  className={`${NEU_MONO} text-sm font-semibold`}
                                >
                                  Difficulty: {tour.difficulty}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Ratings */}
                          <div>
                            <SectionLabel accent="bg-[#FE9900]">
                              Ratings
                            </SectionLabel>
                            <div className={`${NEU_CARD_SM} p-4`}>
                              {tour.ratings ? (
                                <div
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex items-center gap-3`}
                                >
                                  <div className="flex items-center gap-1">
                                    <MdStar className="text-[#FE9900] text-xl" />
                                    <span className="font-[family-name:var(--font-space-mono)] font-bold text-xl text-[#1E2938]">
                                      {tour.ratings.average.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="h-8 w-px bg-[#1E2938]/10" />
                                  <div className={`${NEU_MUTED} text-sm`}>
                                    {tour.ratings.count} reviews
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
                                >
                                  <span className={NEU_MUTED}>
                                    No ratings yet
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Schedule */}
                          <div>
                            <SectionLabel accent="bg-[#006666]">
                              Schedule
                            </SectionLabel>
                            <div className={`${NEU_CARD_SM} p-4 space-y-3`}>
                              {tour.nextDeparture && (
                                <div
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
                                >
                                  <div
                                    className={`${NEU_LABEL} text-[#006666] mb-1`}
                                  >
                                    Next Departure
                                  </div>
                                  <div
                                    className={`${NEU_MONO} text-sm font-semibold`}
                                  >
                                    {nextDeparture}
                                  </div>
                                </div>
                              )}
                              {tour.duration && (
                                <div
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
                                >
                                  <div className={`${NEU_LABEL} mb-1`}>
                                    Duration
                                  </div>
                                  <div
                                    className={`${NEU_MONO} text-sm font-semibold`}
                                  >
                                    {tour.duration.days} days
                                    {tour.duration.nights
                                      ? `, ${tour.duration.nights} nights`
                                      : ""}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Engagement Metrics – spans full width on lg */}
                          <div className="md:col-span-2 lg:col-span-3">
                            <SectionLabel accent="bg-[#FF2157]">
                              Engagement Metrics
                            </SectionLabel>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                              <EngagementTile
                                icon={<MdRemoveRedEye />}
                                label="Views"
                                value={tour.viewCount ?? 0}
                                accent="text-[#006666]"
                              />
                              <EngagementTile
                                icon={<MdThumbUp />}
                                label="Likes"
                                value={tour.likeCount ?? 0}
                                accent="text-[#FF2157]"
                              />
                              <EngagementTile
                                icon={<MdShare />}
                                label="Shares"
                                value={tour.shareCount ?? 0}
                                accent="text-[#00A63D]"
                              />
                              <EngagementTile
                                icon={<MdFavorite />}
                                label="Wishlist"
                                value={tour.wishlistCount ?? 0}
                                accent="text-[#FF2157]"
                              />
                              <EngagementTile
                                icon={<MdRateReview />}
                                label="Reviews"
                                value={tour.ratings?.count ?? 0}
                                accent="text-[#FE9900]"
                              />
                              <EngagementTile
                                icon={<MdGroup />}
                                label="Occupancy"
                                value={`${tour.occupancyPercentage ?? 0}%`}
                                accent="text-[#006666]"
                              />
                            </div>
                          </div>

                          {/* Lifecycle Information – spans full width on lg */}
                          <div className="md:col-span-2 lg:col-span-3">
                            <SectionLabel accent="bg-[#1E2938]/40">
                              Lifecycle Information
                            </SectionLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { label: "Created", value: created },
                                { label: "Last Updated", value: updated },
                                { label: "Published", value: published },
                              ].map((item) => (
                                <div
                                  key={item.label}
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
                                >
                                  <div className={`${NEU_LABEL} mb-1`}>
                                    {item.label}
                                  </div>
                                  <div
                                    className={`${NEU_MONO} text-sm font-semibold`}
                                  >
                                    {item.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Empty State ───────────────────────────────────── */}
        {items.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${NEU_CARD} flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-[#1E2938]/15`}
          >
            <div
              className={`${NEU_SURFACE_INSET} w-20 h-20 rounded-full flex items-center justify-center mb-6`}
            >
              <MdTrendingUp className="h-10 w-10 text-[#006666]" />
            </div>
            <h3 className={`${NEU_HEADING} text-xl mb-2`}>No tours found</h3>
            <p className={`${NEU_MUTED} text-center max-w-md`}>
              Try adjusting your filters or search criteria to find tours.
            </p>
          </motion.div>
        )}

        {/* ── Loading Skeletons ─────────────────────────────── */}
        {loading && items.length === 0 && (
          <div className="space-y-4">
            {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
              <div key={`skeleton-${i}`} className={`${NEU_CARD} p-5`}>
                <div className="flex items-start gap-4">
                  <div className={`${NEU_SKELETON} w-14 h-14 flex-shrink-0`} />
                  <div className="flex-1 space-y-3">
                    <div className={`${NEU_SKELETON} h-5 w-3/4`} />
                    <div className="flex gap-2">
                      <div className={`${NEU_SKELETON} h-6 w-20`} />
                      <div className={`${NEU_SKELETON} h-6 w-28`} />
                      <div className={`${NEU_SKELETON} h-6 w-16`} />
                    </div>
                    <div className={`${NEU_SKELETON} h-4 w-full`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────── */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Results summary */}
          <div className={`${NEU_CARD_SM} flex items-center gap-2 px-5 py-3`}>
            <span className={NEU_MUTED}>Showing</span>
            <span className={`${NEU_HEADING} text-base`}>
              {Math.min((page - 1) * limit + 1, total)}
            </span>
            <span className={NEU_MUTED}>–</span>
            <span className={`${NEU_HEADING} text-base`}>
              {Math.min(page * limit, total)}
            </span>
            <span className={NEU_MUTED}>of</span>
            <span className="font-[family-name:var(--font-space-mono)] font-bold text-base text-[#006666]">
              {total}
            </span>
            <span className={NEU_MUTED}>tours</span>
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className={NEU_BTN_ICON}
              aria-label="Previous page"
            >
              <MdArrowBack className="h-4 w-4" />
            </button>

            {/* Page numbers */}
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
                        className={`w-10 h-10 inline-flex items-center justify-center ${NEU_MUTED} font-bold`}
                      >
                        {p}
                      </span>
                    );
                  }

                  const isActive = page === p;
                  return (
                    <button
                      key={p}
                      onClick={() => onPageChange(p)}
                      disabled={loading}
                      className={isActive ? NEU_BTN_ACTIVE_PAGE : NEU_BTN_ICON}
                      aria-label={`Page ${p}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {p}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Next */}
            <button
              onClick={() => onPageChange(Math.min(pages, page + 1))}
              disabled={page >= pages || loading}
              className={NEU_BTN_ICON}
              aria-label="Next page"
            >
              <MdArrowForward className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
