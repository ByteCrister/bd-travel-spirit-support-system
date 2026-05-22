"use client";

import { cn } from "@/lib/utils";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_DIVIDER = "border-[#1E2938]/10";

interface ChartsSkeletonProps {
  title?: string;
  className?: string;
}

export function ChartsSkeleton({ title = "Loading Chart", className }: ChartsSkeletonProps) {
  return (
    <div className={cn(NEU_CARD, "p-5 h-full", className)}>
      {/* Header */}
      <div className={cn("flex items-center gap-3 pb-4 mb-5 border-b", NEU_DIVIDER)}>
        <div className={cn(NEU_SKELETON, "h-8 w-8 rounded-xl flex-shrink-0")} />
        <span className="sr-only">{title}</span>
        <div className={cn(NEU_SKELETON, "h-4 w-44")} />
      </div>

      {/* Chart area — inset well */}
      <div className={cn(NEU_SURFACE_INSET, "rounded-xl p-4 mb-4")}>
        {/* Y-axis stubs */}
        <div className="flex gap-3">
          <div className="flex flex-col justify-between h-40 w-8 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn(NEU_SKELETON, "h-2.5 w-full")} />
            ))}
          </div>

          {/* Bar column stubs */}
          <div className="flex-1 flex items-end gap-2 h-40">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className={cn(NEU_SKELETON, "flex-1 rounded-t-lg")}
                style={{ height: `${30 + ((i * 37 + 17) % 70)}%` }}
              />
            ))}
          </div>
        </div>

        {/* X-axis stubs */}
        <div className="flex gap-2 mt-3 ml-11">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={cn(NEU_SKELETON, "flex-1 h-2.5")} />
          ))}
        </div>
      </div>

      {/* Legend / summary row */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn(NEU_SKELETON, "h-4 w-full")} />
        ))}
      </div>
    </div>
  );
}