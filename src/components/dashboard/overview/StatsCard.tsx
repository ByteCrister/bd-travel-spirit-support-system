"use client";

import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

// ── Color accent map ──────────────────────────────────────────────────────────
const colorAccentMap = {
  blue: { accent: "#3B82F6", iconBg: "bg-[#3B82F6]/10", iconText: "text-[#3B82F6]", bar: "bg-[#3B82F6]" },
  green: { accent: "#00A63D", iconBg: "bg-[#00A63D]/10", iconText: "text-[#00A63D]", bar: "bg-[#00A63D]" },
  orange: { accent: "#FE9900", iconBg: "bg-[#FE9900]/10", iconText: "text-[#FE9900]", bar: "bg-[#FE9900]" },
  red: { accent: "#FF2157", iconBg: "bg-[#FF2157]/10", iconText: "text-[#FF2157]", bar: "bg-[#FF2157]" },
  purple: { accent: "#8B5CF6", iconBg: "bg-[#8B5CF6]/10", iconText: "text-[#8B5CF6]", bar: "bg-[#8B5CF6]" },
  indigo: { accent: "#6366F1", iconBg: "bg-[#6366F1]/10", iconText: "text-[#6366F1]", bar: "bg-[#6366F1]" },
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: { value: number; type: "increase" | "decrease" | "neutral" };
  description?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple" | "indigo";
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  description,
  color = "blue",
  loading = false,
  className,
}: StatsCardProps) {
  const colors = colorAccentMap[color];

  if (loading) {
    return (
      <div className={cn(NEU_CARD, "p-5 relative overflow-hidden", className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className={cn(NEU_SKELETON, "h-3 w-20")} />
            <div className={cn(NEU_SKELETON, "h-7 w-28")} />
            <div className={cn(NEU_SKELETON, "h-3 w-16")} />
          </div>
          <div className={cn(NEU_SKELETON, "h-11 w-11 rounded-xl")} />
        </div>
        <div className={cn(NEU_SKELETON, "h-0.5 w-full mt-4 rounded-full")} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className={cn("h-full", className)}
    >
      <div className={cn(
        NEU_CARD,
        "p-5 relative overflow-hidden h-full transition-shadow duration-300",
        "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff]"
      )}>
        {/* Colored accent bar */}
        <div
          className="absolute top-0 left-0 w-1 rounded-r-full h-full opacity-80"
          style={{ backgroundColor: colors.accent }}
        />

        <div className="pl-3 flex items-start justify-between gap-3">
          {/* Text */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className={cn(NEU_LABEL, "truncate")}>{title}</p>
            <p className={cn(NEU_HEADING, "text-2xl leading-none tabular-nums")}>
              {typeof value === "number" ? (
                <CountUp end={value} duration={0.8} separator="," />
              ) : value}
            </p>
            {description && (
              <p className={cn(NEU_MUTED, "text-xs truncate")}>{description}</p>
            )}
          </div>

          {/* Icon well */}
          <div className={cn(NEU_ICON_WELL, colors.iconBg, "flex items-center justify-center h-11 w-11")}>
            <div className={cn("h-5 w-5", colors.iconText)}>{icon}</div>
          </div>
        </div>

        {/* Change badge */}
        {change && (
          <div className="pl-3 mt-3 flex items-center gap-1.5">
            <div className={cn(
              NEU_SURFACE_INSET_SM,
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs",
              "font-[family-name:var(--font-space-mono)] font-bold",
              change.type === "increase" ? "text-[#00A63D]" :
                change.type === "decrease" ? "text-[#FF2157]" : "text-[#1E2938]/60"
            )}>
              {change.type === "increase" ? "▲" : change.type === "decrease" ? "▼" : "—"}
              {Math.abs(change.value)}%
            </div>
          </div>
        )}

        {/* Bottom accent line */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 opacity-60" style={{ backgroundColor: colors.accent }} />
      </div>
    </motion.div>
  );
}