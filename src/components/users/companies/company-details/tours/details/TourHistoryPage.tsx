"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Eye,
  Heart,
  Share2,
  TicketCheck,
  Banknote,
  Star,
  CalendarRange,
  MapPin,
  TrendingUp,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import {
  useCompanyDetailStore,
  tourHistoryLoadingKey,
  tourHistoryErrorKey,
} from "@/store/company/company-detail.store";
import { TourAnalyticsRunDTO } from "@/types/tour/tour-history.types";
import { format } from "date-fns";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] rounded-xl";
const NEU_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] rounded-lg";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest text-[#1E2938]/40";
const NEU_BTN =
  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold " +
  "font-[family-name:var(--font-space-mono)] bg-[#E7E5E4] text-[#1E2938] " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";
const NEU_BTN_PRIMARY =
  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold " +
  "font-[family-name:var(--font-space-mono)] bg-[#006666] text-white " +
  "shadow-[3px_3px_8px_rgba(0,102,102,0.3)] " +
  "hover:bg-[#005555] hover:shadow-[3px_3px_12px_rgba(0,102,102,0.4)] " +
  "transition-all duration-200";
const NEU_SKELETON = "bg-[#d0cecd] animate-pulse rounded-xl";
// ─────────────────────────────────────────────────────────────────────────────

type KpiCardProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  accent?: string;
  delay?: number;
};

function KpiCard({ icon: Icon, label, value, subtext, accent = "#006666", delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${NEU_CARD_SM} p-5 flex items-start gap-4`}
    >
      <div
        className="p-2.5 rounded-xl flex-shrink-0"
        style={{
          background: `${accent}15`,
          boxShadow: "2px 2px 5px #c8c6c5,-2px -2px 5px #ffffff",
        }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={NEU_LABEL}>{label}</p>
        <p className={`${NEU_HEADING} text-xl mt-1`}>{value}</p>
        {subtext && <p className={`${NEU_MUTED} text-xs mt-0.5`}>{subtext}</p>}
      </div>
    </motion.div>
  );
}

type OccupancyGaugeProps = { booked: number; total: number };
function OccupancyGauge({ booked, total }: OccupancyGaugeProps) {
  const pct = total > 0 ? Math.min(100, Math.round((booked / total) * 100)) : 0;
  const color = pct >= 80 ? "#00A63D" : pct >= 50 ? "#FE9900" : "#006666";
  return (
    <div className="space-y-2">
      <div className={`${NEU_INSET} w-full h-2.5 overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <div className="flex justify-between">
        <span className={`${NEU_MUTED} text-xs`}>{booked} booked</span>
        <span className={`font-[family-name:var(--font-space-mono)] text-xs font-bold`} style={{ color }}>{pct}%</span>
        <span className={`${NEU_MUTED} text-xs`}>{total} seats</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={`${NEU_CARD_SM} p-5 space-y-3`}>
      <div className="flex items-center gap-3">
        <div className={`${NEU_SKELETON} w-10 h-10 rounded-xl`} />
        <div className="flex-1 space-y-2">
          <div className={`${NEU_SKELETON} h-3 w-24`} />
          <div className={`${NEU_SKELETON} h-5 w-32`} />
        </div>
      </div>
    </div>
  );
}

// ─── Individual Run Card ───────────────────────────────────────────────────────
type RunCardProps = { run: TourAnalyticsRunDTO; index: number; total: number };
function RunCard({ run, index, total }: RunCardProps) {
  const [expanded, setExpanded] = useState(false);
  const runNumber = total - index; // newest = highest run number

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={NEU_CARD_SM}
    >
      {/* Run header – always visible */}
      <button
        className="w-full flex items-center gap-4 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Run badge */}
        <div className="p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] flex-shrink-0">
          <History className="w-4 h-4 text-[#006666]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`${NEU_HEADING} text-sm`}>Run #{runNumber}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#006666]/10 font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-bold text-[#006666]">
              {run.uniqueTourCode}
            </span>
          </div>
          <p className={`${NEU_MUTED} text-xs mt-0.5`}>
            Created {format(new Date(run.createdAt), "MMM dd, yyyy")}
            {run.operatingWindow && (
              <> · {format(new Date(run.operatingWindow.startDate), "MMM dd")} – {format(new Date(run.operatingWindow.endDate), "MMM dd, yyyy")}</>
            )}
          </p>
        </div>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <p className={`${NEU_HEADING} text-sm`}>{run.bookingStats.totalBookings}</p>
            <p className={NEU_LABEL}>Bookings</p>
          </div>
          <div className="text-center">
            <p className={`${NEU_HEADING} text-sm`}>৳{run.bookingStats.totalRevenue.toLocaleString()}</p>
            <p className={NEU_LABEL}>Revenue</p>
          </div>
          <div className="text-center">
            <p className={`${NEU_HEADING} text-sm`}>{run.reviewSummary.averageRating > 0 ? run.reviewSummary.averageRating.toFixed(1) : "—"}</p>
            <p className={NEU_LABEL}>Rating</p>
          </div>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-[#1E2938]/40 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#1E2938]/40 flex-shrink-0" />}
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[#1E2938]/08"
          >
            <div className="p-4 space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Total Bookings", value: run.bookingStats.totalBookings.toLocaleString(), color: "#006666" },
                  { label: "Total Revenue", value: `৳${run.bookingStats.totalRevenue.toLocaleString()}`, color: "#00A63D" },
                  { label: "Total Reviews", value: run.reviewSummary.totalReviews.toLocaleString(), color: "#FE9900" },
                  { label: "Views", value: run.engagement.viewCount.toLocaleString(), color: "#7C3AED" },
                  { label: "Likes", value: run.engagement.likeCount.toLocaleString(), color: "#FF2157" },
                  { label: "Shares", value: run.engagement.shareCount.toLocaleString(), color: "#006666" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`${NEU_INSET_SM} p-3 text-center space-y-0.5`}>
                    <p className={`${NEU_HEADING} text-base`} style={{ color }}>{value}</p>
                    <p className={NEU_LABEL}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Occupancy */}
              <div className={`${NEU_INSET} p-4 space-y-2`}>
                <p className={NEU_LABEL}>Seat Occupancy</p>
                <OccupancyGauge
                  booked={run.bookingStats.seatsBooked}
                  total={run.bookingStats.seatsTotal}
                />
              </div>

              {/* Pricing & Departure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`${NEU_INSET} p-4 space-y-2`}>
                  <p className={NEU_LABEL}>Pricing</p>
                  <p className={`${NEU_HEADING} text-sm`}>৳{run.pricing.baseAmount.toLocaleString()} <span className="font-normal text-[#1E2938]/40 text-xs">{run.pricing.currency}</span></p>
                  {run.pricing.hasActiveDiscounts && (
                    <p className={`${NEU_MUTED} text-xs`}>{run.pricing.discountCount} active discount{run.pricing.discountCount > 1 ? "s" : ""}</p>
                  )}
                </div>
                <div className={`${NEU_INSET} p-4 space-y-2`}>
                  <p className={NEU_LABEL}>Departure</p>
                  {run.departure.date ? (
                    <div className="flex items-center gap-1.5">
                      <CalendarRange className="w-3.5 h-3.5 text-[#006666]" />
                      <span className={`${NEU_HEADING} text-xs`}>{format(new Date(run.departure.date), "MMM dd, yyyy")}</span>
                    </div>
                  ) : (
                    <p className={`${NEU_MUTED} text-xs`}>No departure date</p>
                  )}
                  {run.departure.meetingPoint && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF2157] flex-shrink-0 mt-0.5" />
                      <span className={`${NEU_MUTED} text-xs`}>{run.departure.meetingPoint}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className={`${NEU_MUTED} text-xs`}>Last updated: {format(new Date(run.lastUpdated), "MMM dd, yyyy · hh:mm a")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

type Props = { companyId: string; tourId: string };

export default function TourHistoryPage({ companyId, tourId }: Props) {
  const router = useRouter();

  const { tourHistories, loading, error, fetchTourHistory } = useCompanyDetailStore();

  const loadingKey = tourHistoryLoadingKey(tourId);
  const errorKey   = tourHistoryErrorKey(tourId);

  const history  = tourHistories?.[tourId];
  const isLoading = !!loading[loadingKey];
  const errorMsg  = error[errorKey];

  const load = useCallback(
    (force = false) => { fetchTourHistory(companyId, tourId, force).catch(() => {}); },
    [companyId, tourId, fetchTourHistory]
  );

  useEffect(() => { load(); }, [load]);

  const breadcrumbItems = [
    { label: "Companies", href: "/users/companies" },
    { label: "Company Detail", href: `/users/companies/${companyId}` },
    { label: "Tour Detail",    href: `/users/companies/${companyId}/${tourId}` },
    { label: "History",        href: "#" },
  ];

  return (
    <div className={`${NEU_PAGE_BG} px-4 py-6 lg:px-8 lg:py-10`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="pb-2" />

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`${NEU_CARD} p-6 sm:p-8`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                <TrendingUp className="w-6 h-6 text-[#006666]" />
              </div>
              <div>
                <h1 className={`${NEU_HEADING} text-2xl sm:text-3xl`}>Tour History</h1>
                <p className={`${NEU_MUTED} mt-1`}>
                  All analytics runs for this tour — aggregated totals + per-run breakdown.
                </p>
                {history && (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-[#006666]/10 shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff]">
                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-bold text-[#006666]">
                      {history.aggregate.totalRuns} run{history.aggregate.totalRuns !== 1 ? "s" : ""} total
                    </span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => load(true)} disabled={isLoading} className={NEU_BTN} aria-label="Refresh">
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button onClick={() => router.push(`/users/companies/${encodeURIComponent(encodeId(companyId))}/${encodeURIComponent(encodeId(tourId))}`)} className={NEU_BTN_PRIMARY}>
                <ArrowLeft className="w-4 h-4" />
                Tour Detail
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {errorMsg && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={`${NEU_CARD} p-6 flex items-start gap-4`}
            >
              <div className="p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                <AlertCircle className="w-5 h-5 text-[#FF2157]" />
              </div>
              <div className="flex-1">
                <p className={`${NEU_HEADING} text-sm`}>Failed to load history</p>
                <p className={`${NEU_MUTED} mt-1`}>{errorMsg}</p>
              </div>
              <button onClick={() => load(true)} className={NEU_BTN}><RefreshCw className="w-4 h-4" />Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeletons */}
        {isLoading && !history && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {history && (
          <>
            {/* ── Aggregate KPI Row ── */}
            <div>
              <p className={`${NEU_LABEL} mb-3`}>All-Time Aggregate ({history.aggregate.totalRuns} run{history.aggregate.totalRuns !== 1 ? "s" : ""})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard icon={TicketCheck} label="Total Bookings" value={history.aggregate.totalBookingsAllRuns.toLocaleString()} subtext="across all runs" accent="#006666" delay={0} />
                <KpiCard icon={Banknote}   label="Total Revenue"  value={`৳ ${history.aggregate.totalRevenueAllRuns.toLocaleString()}`} subtext="across all runs" accent="#00A63D" delay={0.05} />
                <KpiCard icon={Star}       label="Avg. Rating"    value={history.aggregate.overallAverageRating > 0 ? `${history.aggregate.overallAverageRating.toFixed(1)} / 5` : "No reviews"} subtext={`${history.aggregate.totalReviewsAllRuns} total reviews`} accent="#FE9900" delay={0.1} />
                <KpiCard icon={Users}      label="Avg. Occupancy" value={`${history.aggregate.averageOccupancyRate}%`} subtext="average across runs" accent="#7C3AED" delay={0.15} />
              </div>
            </div>

            {/* ── Engagement aggregate ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={`${NEU_CARD} p-6`}
            >
              <h2 className={`${NEU_HEADING} text-base flex items-center gap-2 mb-4`}>
                <TrendingUp className="w-4 h-4 text-[#006666]" />
                Total Engagement (All Runs)
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Eye,    label: "Total Views",  value: history.aggregate.totalViewsAllRuns,  color: "#7C3AED" },
                  { icon: Heart,  label: "Total Likes",  value: history.aggregate.totalLikesAllRuns,  color: "#FF2157" },
                  { icon: Share2, label: "Total Shares", value: history.aggregate.totalSharesAllRuns, color: "#006666" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className={`${NEU_INSET} p-4 text-center space-y-1`}>
                    <Icon className="w-5 h-5 mx-auto" style={{ color }} />
                    <p className={`${NEU_HEADING} text-2xl`}>{value.toLocaleString()}</p>
                    <p className={NEU_LABEL}>{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Individual Runs ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-[#006666]" />
                <p className={`${NEU_HEADING} text-sm`}>Individual Runs</p>
                <span className="px-2 py-0.5 rounded-full bg-[#006666]/10 font-[family-name:var(--font-jetbrains-mono)] text-xs font-bold text-[#006666]">
                  {history.runs.length}
                </span>
                <span className={`${NEU_MUTED} text-xs`}>(newest first)</span>
              </div>

              <div className="space-y-3">
                {history.runs.map((run, index) => (
                  <RunCard key={run.analyticsId} run={run} index={index} total={history.runs.length} />
                ))}
              </div>
            </div>

            {/* Last updated */}
            {history.runs[0] && (
              <div className="flex items-center gap-1.5 pb-2">
                <Clock className="w-3.5 h-3.5 text-[#1E2938]/30" />
                <span className={`${NEU_MUTED} text-xs`}>
                  Latest run updated: {format(new Date(history.runs[0].lastUpdated), "MMM dd, yyyy · hh:mm a")}
                </span>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!isLoading && !errorMsg && !history && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${NEU_CARD} p-12 flex flex-col items-center gap-4 text-center`}
          >
            <div className="p-4 rounded-2xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
              <TrendingUp className="w-8 h-8 text-[#006666]/40" />
            </div>
            <div>
              <p className={`${NEU_HEADING} text-lg`}>No analytics yet</p>
              <p className={`${NEU_MUTED} mt-1 max-w-sm`}>
                Analytics data for this tour hasn&apos;t been generated yet. It will appear here once the tour starts receiving activity.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
