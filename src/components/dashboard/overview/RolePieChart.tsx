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

// ── Neumorphism style tokens ──────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Types ─────────────────────────────────────────────────────────────────────
type ExtendedPieProps = PieProps & { activeIndex?: number };

type CustomTooltipProps = {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
};

interface RolePieChartProps {
  data: RoleDistribution | null;
  loading?: boolean;
  className?: string;
}

type MyActiveShapeProps = SectorProps & { percent?: number; value?: number };

// ── Role config (fill colors updated to brand-adjacent palette) ────────────────
const roleConfig = {
  travelers: {
    label: "Travelers",
    icon: Users,
    fillColor: "#006666",
    badgeBg: "bg-[#006666]/10",
    badgeText: "text-[#006666]",
    iconColor: "text-[#006666]",
  },
  organizers: {
    label: "Organizers",
    icon: UserCheck,
    fillColor: "#00A63D",
    badgeBg: "bg-[#00A63D]/10",
    badgeText: "text-[#00A63D]",
    iconColor: "text-[#00A63D]",
  },
  support: {
    label: "Support",
    icon: User,
    fillColor: "#FE9900",
    badgeBg: "bg-[#FE9900]/10",
    badgeText: "text-[#FE9900]",
    iconColor: "text-[#FE9900]",
  },
  banned: {
    label: "Banned",
    icon: UserX,
    fillColor: "#FF2157",
    badgeBg: "bg-[#FF2157]/10",
    badgeText: "text-[#FF2157]",
    iconColor: "text-[#FF2157]",
  },
} as const;

type RoleKey = keyof typeof roleConfig;
type ChartDatum = { name: string; key: RoleKey; value: number; fill: string };

// ── Active shape renderer ─────────────────────────────────────────────────────
const renderActiveShape: ActiveShape<PieSectorDataItem> = (
  props: MyActiveShapeProps
): JSX.Element => {
  const {
    cx = 0, cy = 0,
    innerRadius = 0, outerRadius = 0,
    startAngle = 0, endAngle = 0,
    fill = "#000",
  } = props;

  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 2} outerRadius={outerRadius + 10}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill} opacity={0.95}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 14} outerRadius={outerRadius + 17}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill} opacity={0.3}
      />
    </g>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(NEU_CARD, "p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className={cn(NEU_SKELETON, "h-4 w-36")} />
          <div className={cn(NEU_SKELETON, "h-3 w-52")} />
        </div>
        <div className={cn(NEU_SKELETON, "h-9 w-20 rounded-xl")} />
      </div>
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <div className="relative flex-shrink-0">
          <div className={cn(NEU_SKELETON, "h-44 w-44 rounded-full")} />
          <div className="absolute inset-8 rounded-full bg-[#E7E5E4]" />
        </div>
        <div className="flex-1 space-y-3 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(NEU_CARD_SM, "flex items-center gap-3 p-3")}>
              <div className={cn(NEU_SKELETON, "h-9 w-9 rounded-xl")} />
              <div className="flex-1 space-y-2">
                <div className={cn(NEU_SKELETON, "h-3 w-20")} />
                <div className={cn(NEU_SKELETON, "h-1.5 w-full")} />
              </div>
              <div className={cn(NEU_SKELETON, "h-5 w-14 rounded-lg")} />
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
    <div className={cn(NEU_CARD, "p-6", className)}>
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className={cn(NEU_ICON_WELL, "mb-4")}>
          <Users className="h-6 w-6 text-[#1E2938]/40" strokeWidth={1.5} />
        </div>
        <p className={cn(NEU_MONO, "text-sm font-semibold")}>No distribution data</p>
        <p className={cn(NEU_MUTED, "mt-1")}>Role breakdown will appear here</p>
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
      className={cn(
        NEU_CARD_SM,
        "px-3.5 py-3 flex items-center gap-3 min-w-[140px]"
      )}
    >
      <div
        className={cn("p-2 rounded-lg", cfg.badgeBg)}
        style={{ color: cfg.fillColor }}
      >
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div>
        <p className={cn(NEU_LABEL, "text-[10px]")}>{cfg.label}</p>
        <p
          className="font-[family-name:var(--font-space-mono)] font-bold text-base tabular-nums"
          style={{ color: cfg.fillColor }}
        >
          {entry.value.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const roleKeys = Object.keys(roleConfig) as RoleKey[];

export function RolePieChart({ data, loading, className }: RolePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) return <LoadingSkeleton className={className} />;
  if (!data) return <EmptyState className={className} />;

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
      className={cn(NEU_CARD, "overflow-hidden", className)}
    >
      {/* ── Header ── */}
      <div className={cn("flex items-start justify-between px-5 sm:px-6 pt-5 pb-4 border-b", NEU_DIVIDER)}>
        <div>
          <h3 className={cn(NEU_HEADING, "text-sm")}>Role Distribution</h3>
          <p className={cn(NEU_MUTED, "text-xs mt-0.5")}>User breakdown across all roles</p>
        </div>
        {/* Total badge */}
        <div className={cn(NEU_BADGE, "flex-col items-end gap-0 px-3 py-1.5")}>
          <span className="font-[family-name:var(--font-space-mono)] font-bold text-lg tabular-nums text-[#1E2938] leading-none">
            {total.toLocaleString()}
          </span>
          <span className={cn(NEU_LABEL, "text-[9px] mt-0.5")}>Total Users</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 sm:px-6 py-5">
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
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
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
                      className="font-[family-name:var(--font-space-mono)] font-bold text-xl tabular-nums leading-none"
                      style={{ color: activeEntry.fill }}
                    >
                      {activeEntry.value.toLocaleString()}
                    </div>
                    <div className={cn(NEU_MUTED, "text-[11px] mt-1")}>{activeEntry.name}</div>
                    <div className={cn(NEU_LABEL, "text-[10px] mt-0.5")}>
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
                    <div className={cn(NEU_HEADING, "text-2xl tabular-nums leading-none")}>
                      {total.toLocaleString()}
                    </div>
                    <div className={cn(NEU_MUTED, "text-[11px] mt-1")}>All Users</div>
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
                    "group relative flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-default",
                    "transition-all duration-200",
                    isActive
                      ? "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] bg-[#E7E5E4]"
                      : "shadow-[3px_3px_7px_#c8c6c5,-3px_-3px_7px_#ffffff] bg-[#E7E5E4] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                    isDimmed ? "opacity-40" : "opacity-100"
                  )}
                >
                  {/* Color accent bar */}
                  <div
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-200"
                    style={{ backgroundColor: isActive ? cfg.fillColor : "transparent" }}
                  />

                  {/* Icon well */}
                  <div
                    className={cn("h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0", cfg.badgeBg)}
                  >
                    <Icon className={cn("h-4 w-4", cfg.iconColor)} strokeWidth={1.8} />
                  </div>

                  {/* Label + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938] tracking-tight">
                        {cfg.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-bold font-[family-name:var(--font-space-mono)] px-1.5 py-0.5 rounded-md",
                            cfg.badgeBg, cfg.badgeText
                          )}
                        >
                          {pct.toFixed(1)}%
                        </span>
                        <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-bold text-[#1E2938] tabular-nums">
                          {value.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar — inset track */}
                    <div className={cn(NEU_SURFACE_INSET_SM, "h-1.5 w-full rounded-full overflow-hidden")}>
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