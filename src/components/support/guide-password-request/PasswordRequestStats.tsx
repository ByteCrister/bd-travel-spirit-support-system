// components/guide-password-request/PasswordRequestStats.tsx
"use client";

import { motion, Variants } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StatsSkeleton from "./skeletons/StatsSkeleton";
import { usePasswordRequestStore } from "@/store/guide/guide-password-request.store";
import {
  NEU_CARD,
  NEU_CARD_HOVER,
  NEU_BTN_GHOST,
  NEU_HEADING,
  NEU_LABEL,
  NEU_ICON_WELL,
  NEU_ICON_WELL_PRIMARY,
  NEU_SURFACE_INSET,
} from "@/styles/neu.styles";

// ── Local style constants ───────────────────────────────────────────────────
const STATS_GRID = "grid gap-4 md:grid-cols-2 lg:grid-cols-5";
const STAT_VALUE = "text-3xl font-bold tabular-nums text-[#1E2938] font-[family-name:var(--font-space-mono)]";
const STAT_SUBLABEL = "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50";
const PROGRESS_TRACK = "h-1.5 w-full rounded-full bg-[#c8c6c5]/40 overflow-hidden mt-1";

const STAT_CARDS = [
  {
    key: "total",
    label: "Total Requests",
    icon: BarChart3,
    iconColor: "text-[#006666]",
    iconWell: NEU_ICON_WELL_PRIMARY,
    dotColor: "bg-[#006666]",
    barColor: "bg-[#006666]",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    iconColor: "text-[#FE9900]",
    iconWell: "p-2.5 rounded-xl bg-[#FE9900]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]",
    dotColor: "bg-[#FE9900]",
    barColor: "bg-[#FE9900]",
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle,
    iconColor: "text-[#00A63D]",
    iconWell: "p-2.5 rounded-xl bg-[#00A63D]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]",
    dotColor: "bg-[#00A63D]",
    barColor: "bg-[#00A63D]",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    iconColor: "text-[#FF2157]",
    iconWell: "p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]",
    dotColor: "bg-[#FF2157]",
    barColor: "bg-[#FF2157]",
  },
  {
    key: "expired",
    label: "Expired",
    icon: AlertCircle,
    iconColor: "text-[#1E2938]/50",
    iconWell: NEU_ICON_WELL,
    dotColor: "bg-[#1E2938]/30",
    barColor: "bg-[#1E2938]/30",
  },
] as const;

// ── Animation variants ──────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export function PasswordRequestStats() {
  const { stats, isFetching, fetchStats } = usePasswordRequestStore();

  if (isFetching && !stats) return <StatsSkeleton />;

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          NEU_SURFACE_INSET,
          "flex flex-col items-center justify-center py-14 px-4 rounded-2xl"
        )}
      >
        <div className={cn(NEU_ICON_WELL, "mb-4")}>
          <BarChart3 className="h-7 w-7 text-[#1E2938]/40" />
        </div>
        <p className={cn(NEU_HEADING, "text-base mb-1")}>No statistics available</p>
        <p className={cn(STAT_SUBLABEL, "mb-5")}>Try refreshing to load data</p>
        <button
          onClick={() => fetchStats(true)}
          className={cn(NEU_BTN_GHOST, "px-4 py-2 text-sm flex items-center gap-2")}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Stats
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={STATS_GRID}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {STAT_CARDS.map((stat, index) => {
        const value = stats[stat.key as keyof typeof stats];
        const isPending = stat.key === "pending";
        const isApproved = stat.key === "approved";
        const hasBar = isPending || isApproved;
        const barWidth = isPending
          ? `${stats.pendingPercentage}%`
          : isApproved
            ? `${stats.approvalRate}%`
            : "0%";

        return (
          <motion.div
            key={stat.key}
            variants={cardVariants}
            className={cn(NEU_CARD, NEU_CARD_HOVER, "p-5 flex flex-col gap-3 h-full")}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className={cn(NEU_LABEL, "text-[10px]")}>{stat.label}</span>
              <div className={stat.iconWell}>
                <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
              </div>
            </div>

            {/* Value */}
            <motion.span
              className={STAT_VALUE}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              {value}
            </motion.span>

            {/* Sub-label (fixed height) */}
            <div className="min-h-[1rem] flex items-center gap-1.5">
              {hasBar ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-1.5"
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", stat.dotColor)} />
                  <span className={STAT_SUBLABEL}>
                    {isPending
                      ? `${stats.pendingPercentage}% of total`
                      : `${stats.approvalRate}% approval rate`}
                  </span>
                </motion.div>
              ) : (
                <span aria-hidden className="text-xs opacity-0">—</span>
              )}
            </div>

            {/* Progress bar */}
            <div className={PROGRESS_TRACK}>
              <motion.div
                className={cn("h-full rounded-full", hasBar ? stat.barColor : "")}
                initial={{ width: 0 }}
                animate={{ width: hasBar ? barWidth : "0%" }}
                transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}