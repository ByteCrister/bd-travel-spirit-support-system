"use client";

import { motion } from 'framer-motion';
import clsx from 'clsx';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_PAGE_BG = "bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

function Skeleton({ className }: { className?: string }) {
    return <div className={clsx(NEU_SKELETON, className)} />;
}

export default function TourDetailPageSkeleton() {
    return (
        <div className={`${NEU_PAGE_BG} rounded-2xl overflow-hidden`}>
            <div className="p-5 sm:p-6 space-y-6">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-32" />
                </div>

                {/* Hero image */}
                <div className={`relative w-full h-[280px] sm:h-[400px] rounded-2xl overflow-hidden ${NEU_SURFACE_INSET}`}>
                    <Skeleton className="absolute inset-0 rounded-2xl" />
                    {/* Status badges shimmer */}
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                        <Skeleton className="h-7 w-20 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                    </div>
                    {/* Price card shimmer */}
                    <div className={`absolute right-4 top-4 rounded-2xl p-3 w-36 space-y-1.5 ${NEU_CARD_SM}`}>
                        <Skeleton className="h-2.5 w-20" />
                        <Skeleton className="h-6 w-28" />
                    </div>
                </div>

                {/* Gallery strip */}
                <div className="flex gap-3 overflow-x-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="shrink-0 w-28 h-20 rounded-xl" />
                    ))}
                </div>

                {/* Title + actions header */}
                <div className={`${NEU_CARD} p-5`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-7 w-3/4" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Skeleton className="h-9 w-24 rounded-xl" />
                            <Skeleton className="h-9 w-24 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Main body: 3-col grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Left / main content — spans 2 cols */}
                    <div className="space-y-5 md:col-span-2">

                        {/* Overview card */}
                        <div className={`${NEU_CARD} p-5 space-y-3`}>
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                            <Skeleton className="h-3 w-4/5" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className={`${NEU_CARD_SM} p-4`}>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                                        <div className="space-y-1.5 flex-1">
                                            <Skeleton className="h-2.5 w-14" />
                                            <Skeleton className="h-3.5 w-20" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Itinerary card */}
                        <div className={`${NEU_CARD} p-5 space-y-3`}>
                            <Skeleton className="h-4 w-36" />
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.08 }}
                                        className={`${NEU_SURFACE_INSET} rounded-xl p-4 space-y-2`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-6 w-6 rounded-lg shrink-0" />
                                            <Skeleton className="h-3.5 w-1/2" />
                                        </div>
                                        <Skeleton className="h-2.5 w-4/5 ml-9" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <aside className="space-y-5 md:col-span-1">

                        {/* Host card */}
                        <div className={`${NEU_CARD} p-5 space-y-4`}>
                            <Skeleton className="h-4 w-16" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-3.5 w-28" />
                                    <Skeleton className="h-2.5 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-full rounded-xl" />
                        </div>

                        {/* Quick actions */}
                        <div className={`${NEU_CARD} p-5 space-y-3`}>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-9 w-full rounded-xl" />
                            <Skeleton className="h-9 w-full rounded-xl" />
                            <Skeleton className="h-9 w-full rounded-xl" />
                        </div>

                        {/* Timestamps */}
                        <div className={`${NEU_CARD} p-5 space-y-3`}>
                            <Skeleton className="h-2.5 w-16" />
                            <Skeleton className="h-3.5 w-24" />
                            <div className="pt-2 space-y-1.5">
                                <Skeleton className="h-2.5 w-16" />
                                <Skeleton className="h-3.5 w-24" />
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    );
}