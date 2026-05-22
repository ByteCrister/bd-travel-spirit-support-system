'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_PAGE_BG = "bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_DIVIDER = "border-[#1E2938]/10";

function Skeleton({ className }: { className?: string }) {
    return <div className={clsx(NEU_SKELETON, className)} />;
}

type Props = {
    rows?: number;
};

export function TourReviewsSkeleton({ rows = 4 }: Props) {
    return (
        <div className={`${NEU_PAGE_BG} ${NEU_CARD} overflow-hidden`}>

            {/* Header */}
            <div className={`px-5 sm:px-6 py-4 border-b ${NEU_DIVIDER} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="space-y-1.5">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-3 w-44" />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Rating */}
                    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                        <div className="flex flex-col items-end gap-1">
                            <Skeleton className="h-7 w-12" />
                            <Skeleton className="h-2.5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
            </div>

            {/* Review list */}
            <div className="h-[520px] overflow-y-auto p-5 sm:p-6 space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.06 }}
                        className={`${NEU_CARD_SM} p-5 space-y-4`}
                    >
                        {/* User row */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-3.5 w-24" />
                                        <Skeleton className="h-3.5 w-14" />
                                    </div>
                                    <Skeleton className="h-2.5 w-36" />
                                </div>
                            </div>
                            {/* Rating badge */}
                            <Skeleton className="h-7 w-14 rounded-xl shrink-0" />
                        </div>

                        {/* Review title */}
                        <Skeleton className="h-4 w-3/4" />

                        {/* Comment lines */}
                        <div className="space-y-1.5">
                            <Skeleton className="h-2.5 w-full" />
                            <Skeleton className="h-2.5 w-11/12" />
                            <Skeleton className="h-2.5 w-4/5" />
                        </div>

                        {/* Footer row */}
                        <div className={`flex items-center justify-between pt-3 border-t ${NEU_DIVIDER}`}>
                            <Skeleton className="h-6 w-16 rounded-lg" />
                            <Skeleton className="h-6 w-20 rounded-lg" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pagination footer */}
            <div className={`px-5 sm:px-6 py-4 border-t ${NEU_DIVIDER} flex flex-col sm:flex-row items-center justify-between gap-3 ${NEU_SURFACE_INSET_SM}`}>
                <Skeleton className="h-3.5 w-48" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-20 rounded-xl" />
                    <div className="flex gap-1.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-9 w-9 rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="h-9 w-20 rounded-xl" />
                </div>
            </div>
        </div>
    );
}