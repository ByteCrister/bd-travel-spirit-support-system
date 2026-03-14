"use client";

import { JSX, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserCheck, User, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleDistribution } from "@/types/dashboard/dashboard.types";
import { Pie, type PieProps } from "recharts";

import {
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
  type SectorProps,
} from "recharts";
import { ActiveShape } from "recharts/types/util/types";
import { PieSectorDataItem } from "recharts/types/polar/Pie";


type ExtendedPieProps = PieProps & {
  activeIndex?: number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: {
    payload: ChartDatum;
  }[];
};

interface RolePieChartProps {
  data: RoleDistribution | null;
  loading?: boolean;
  className?: string;
}

type MyActiveShapeProps = SectorProps & {
  percent?: number;
  value?: number;
};

const renderActiveShape: ActiveShape<PieSectorDataItem> = (
  props: MyActiveShapeProps
): JSX.Element => {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "#000",
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.95}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 14}
        outerRadius={outerRadius + 17}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

const roleConfig = {
  travelers: {
    label: "Travelers",
    icon: Users,
    fillColor: "#6366f1",
    trackColor: "bg-indigo-500",
    glowColor: "shadow-indigo-500/30",
    badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    badgeText: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    borderAccent: "border-l-indigo-500",
  },
  organizers: {
    label: "Organizers",
    icon: UserCheck,
    fillColor: "#10b981",
    trackColor: "bg-emerald-500",
    glowColor: "shadow-emerald-500/30",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    borderAccent: "border-l-emerald-500",
  },
  support: {
    label: "Support",
    icon: User,
    fillColor: "#f59e0b",
    trackColor: "bg-amber-500",
    glowColor: "shadow-amber-500/30",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    badgeText: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderAccent: "border-l-amber-500",
  },
  banned: {
    label: "Banned",
    icon: UserX,
    fillColor: "#f43f5e",
    trackColor: "bg-rose-500",
    glowColor: "shadow-rose-500/30",
    badgeBg: "bg-rose-500/10 dark:bg-rose-500/20",
    badgeText: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
    borderAccent: "border-l-rose-500",
  },
} as const;

type RoleKey = keyof typeof roleConfig;

type ChartDatum = {
  name: string;
  key: RoleKey;
  value: number;
  fill: string;
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-3 w-52 rounded-full bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        </div>
        <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>

      <div className="flex gap-6 items-center">
        {/* Donut placeholder */}
        <div className="relative flex-shrink-0">
          <div className="h-44 w-44 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="absolute inset-8 rounded-full bg-white dark:bg-slate-900" />
        </div>
        {/* Legend placeholders */}
        <div className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="h-5 w-14 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Users className="h-6 w-6 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No distribution data</p>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Role breakdown will appear here</p>
      </div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  const entry = payload[0].payload;
  const cfg = roleConfig[entry.key];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl shadow-black/10"
    >
      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", cfg.iconBg)}>
        <Icon className={cn("h-3.5 w-3.5", cfg.iconColor)} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{entry.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{entry.value.toLocaleString()} users</p>
      </div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export function RolePieChart({ data, loading = false, className }: RolePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) return <LoadingSkeleton className={className} />;
  if (!data) return <EmptyState className={className} />;

  const roleKeys: RoleKey[] = ["travelers", "organizers", "support", "banned"];
  const total = roleKeys.reduce((sum, k) => sum + data[k], 0);

  const chartData: ChartDatum[] = roleKeys
    .map((key) => ({
      name: roleConfig[key].label,
      key,
      value: data[key],
      fill: roleConfig[key].fillColor,
    }))
    .filter((d) => d.value > 0);

  const activeEntry = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Role Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            User breakdown across all roles
          </p>
        </div>

        {/* Total badge */}
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
            {total.toLocaleString()}
          </span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
            Total Users
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5">
        <div className="flex flex-col gap-5">

          {/* Donut chart */}
          <div className="relative h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  {...({
                    data: chartData,
                    dataKey: "value",
                    nameKey: "name",
                    cx: "50%",
                    cy: "50%",
                    innerRadius: "56%",
                    outerRadius: "76%",
                    paddingAngle: 3,
                    cornerRadius: 5,
                    activeIndex: activeIndex ?? undefined,
                    activeShape: renderActiveShape,
                    onMouseEnter: (_, index) => setActiveIndex(index),
                    onMouseLeave: () => setActiveIndex(null),
                    isAnimationActive: true,
                    animationBegin: 100,
                    animationDuration: 800,
                    animationEasing: "ease-out",
                  } satisfies ExtendedPieProps)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={entry.fill}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                      stroke="transparent"
                      style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {activeEntry ? (
                  <motion.div
                    key={activeEntry.key}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.18 }}
                    className="text-center"
                  >
                    <div
                      className="text-xl font-bold tabular-nums leading-none"
                      style={{ color: activeEntry.fill }}
                    >
                      {activeEntry.value.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {activeEntry.name}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
                      {total > 0 ? ((activeEntry.value / total) * 100).toFixed(1) : 0}%
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="total"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.18 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
                      {total.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                      All Users
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Role rows ── */}
          <div className="space-y-2">
            {roleKeys.map((key, index) => {
              const cfg = roleConfig[key];
              const Icon = cfg.icon;
              const value = data[key];
              const pct = total > 0 ? (value / total) * 100 : 0;
              const isActive = activeEntry?.key === key;
              const isDimmed = activeEntry !== null && !isActive;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.07 + 0.2, duration: 0.3 }}
                  onMouseEnter={() => {
                    const idx = chartData.findIndex((d) => d.key === key);
                    if (idx !== -1) setActiveIndex(idx);
                  }}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={cn(
                    "group relative flex items-center gap-3 px-3.5 py-3 rounded-xl border cursor-default transition-all duration-200",
                    isActive
                      ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 shadow-sm"
                      : "border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40",
                    isDimmed ? "opacity-40" : "opacity-100"
                  )}
                >
                  {/* Color accent bar */}
                  <div
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? cfg.fillColor : "transparent",
                    }}
                  />

                  {/* Icon */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      cfg.iconBg
                    )}
                  >
                    <Icon className={cn("h-4 w-4", cfg.iconColor)} strokeWidth={1.8} />
                  </div>

                  {/* Label + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
                        {cfg.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                            cfg.badgeBg,
                            cfg.badgeText
                          )}
                        >
                          {pct.toFixed(1)}%
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                          {value.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: index * 0.07 + 0.35, duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cfg.fillColor }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}