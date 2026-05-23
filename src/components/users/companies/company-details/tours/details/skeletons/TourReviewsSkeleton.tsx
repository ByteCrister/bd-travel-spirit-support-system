"use client";

import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
// ─────────────────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={clsx(NEU_SKELETON, className)} />;
}

type Props = {
  rows?: number;
};

export function TourReviewsSkeleton({ rows = 4 }: Props) {
  return (
    <div className={`${NEU_CARD} overflow-hidden`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1E2938]/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-44" />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Rating summary */}
            <div
              className={`${NEU_SURFACE_INSET_SM} rounded-xl px-4 py-3 flex items-center gap-3`}
            >
              <div className="space-y-1">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Search & reload */}
            <Skeleton className="h-9 w-48 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>

        {/* Rating bars */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-2 w-28 rounded-full" />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="h-[560px] overflow-y-auto p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.07 }}
            className={`${NEU_CARD_SM} p-5 space-y-4`}
          >
            {/* User section */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <div className={`${NEU_SURFACE_INSET_SM} rounded-xl px-3 py-1.5`}>
                <Skeleton className="h-5 w-10" />
              </div>
            </div>

            {/* Title */}
            <Skeleton className="h-4 w-2/3" />

            {/* Comment lines */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-3/4" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1E2938]/10">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination footer */}
      <div className="px-6 py-4 border-t border-[#1E2938]/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-xl" />
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
