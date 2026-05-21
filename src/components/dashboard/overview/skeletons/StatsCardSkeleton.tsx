"use client";

import { cn } from "@/lib/utils";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

interface StatsCardSkeletonProps {
  className?: string;
}

export function StatsCardSkeleton({ className }: StatsCardSkeletonProps) {
  return (
    <div className={cn(NEU_CARD, "relative overflow-hidden h-full p-5", className)}>
      {/* Left accent bar placeholder */}
      <div className={cn(NEU_SKELETON, "absolute left-0 top-0 bottom-0 w-1 rounded-r-full")} />

      <div className="pl-3 flex items-start justify-between gap-3">
        {/* Text block */}
        <div className="flex-1 space-y-2.5">
          <div className={cn(NEU_SKELETON, "h-3 w-20")} />
          <div className={cn(NEU_SKELETON, "h-7 w-28")} />
          <div className={cn(NEU_SKELETON, "h-3 w-16")} />
        </div>

        {/* Icon well */}
        <div
          className={cn(
            NEU_SKELETON,
            "h-11 w-11 rounded-xl flex-shrink-0"
          )}
        />
      </div>

      {/* Bottom accent line placeholder */}
      <div className={cn(NEU_SKELETON, "absolute inset-x-0 bottom-0 h-0.5")} />
    </div>
  );
}