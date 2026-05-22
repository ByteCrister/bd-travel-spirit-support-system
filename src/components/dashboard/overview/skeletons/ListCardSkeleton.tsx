"use client";

import { cn } from "@/lib/utils";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_DIVIDER = "border-[#1E2938]/10";

interface ListCardSkeletonProps {
  title?: string;
  rows?: number;
  className?: string;
}

export function ListCardSkeleton({
  title = "Loading",
  rows = 5,
  className,
}: ListCardSkeletonProps) {
  return (
    <div className={cn(NEU_CARD, "p-5", className)}>
      {/* Header */}
      <div className={cn("flex items-center gap-3 pb-4 mb-4 border-b", NEU_DIVIDER)}>
        <div className={cn(NEU_SKELETON, "h-8 w-8 rounded-xl flex-shrink-0")} />
        <span className="sr-only">{title}</span>
        <div className={cn(NEU_SKELETON, "h-4 w-36")} />
      </div>

      {/* Row skeletons */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={cn(NEU_CARD_SM, "p-3.5")}>
            <div className="flex items-start gap-3">
              {/* Avatar / icon well */}
              <div className={cn(NEU_SKELETON, "h-9 w-9 rounded-xl flex-shrink-0")} />

              {/* Text lines */}
              <div className="flex-1 space-y-2">
                <div className={cn(NEU_SKELETON, "h-3.5 w-3/4")} />
                <div className={cn(NEU_SKELETON, "h-3 w-full")} />

                {/* Badge row */}
                <div className="flex gap-2 pt-0.5">
                  <div className={cn(NEU_SKELETON, "h-5 w-16 rounded-lg")} />
                  <div className={cn(NEU_SKELETON, "h-5 w-24 rounded-lg")} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}