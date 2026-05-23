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
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
// ─────────────────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={clsx(NEU_SKELETON, className)} />;
}

export default function AllDetailsSkeleton() {
  return (
    <div className={`${NEU_CARD} overflow-hidden`}>
      <div className="p-6 space-y-6">
        {/* Hero image skeleton */}
        <Skeleton className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl" />

        {/* Gallery strip */}
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="shrink-0 w-24 h-16 rounded-xl" />
          ))}
        </div>

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="flex items-center gap-4">
            <div className={`${NEU_SURFACE_INSET} rounded-xl p-3 space-y-1`}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </header>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        {/* Body layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview card */}
            <div className={`${NEU_CARD_SM} p-6 space-y-4`}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-28" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${NEU_SURFACE_INSET} rounded-xl p-4 space-y-2`}
                  >
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary preview */}
            <div className={`${NEU_CARD_SM} p-6 space-y-4`}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-32" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`${NEU_SURFACE_INSET} rounded-xl p-4 space-y-2`}
                >
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Booking card */}
            <div className={`${NEU_CARD_SM} p-6 space-y-4`}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-3 w-20" />
              <div className={`${NEU_SURFACE_INSET} rounded-xl h-2 w-full`} />
              <Skeleton className="h-3 w-32" />
            </div>

            {/* Host card */}
            <div className={`${NEU_CARD_SM} p-5 space-y-4`}>
              <Skeleton className="h-4 w-16" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className={`${NEU_CARD_SM} p-5 space-y-3`}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>

            {/* Timestamps */}
            <div className={`${NEU_CARD_SM} p-5 space-y-3`}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
