'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={clsx(
                'animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:400%_100%]',
                'rounded-md',
                className
            )}
        />
    );
}

type Props = {
    rows?: number;
};

/**
 * Skeleton version of the Tour Reviews panel.
 * Mirrors the actual page structure for a smooth loading experience.
 */
export function TourReviewsSkeleton({ rows = 4 }: Props) {
    return (
        <div className="bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-5 w-28 mb-1" />
                    <Skeleton className="h-3 w-40" />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <Skeleton className="h-7 w-14 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            </div>

            {/* Scrollable review list */}
            <div className="h-[520px] overflow-y-auto p-6 space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 space-y-3"
                    >
                        {/* User section */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-14" />
                                    </div>
                                    <Skeleton className="h-3 w-36" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-14 rounded-md" />
                        </div>

                        {/* Title */}
                        <Skeleton className="h-4 w-3/4" />

                        {/* Comment */}
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                            <Skeleton className="h-5 w-16 rounded-md" />
                            <Skeleton className="h-5 w-20 rounded-md" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pagination footer skeleton */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-9 w-9 rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            </div>
        </div>
    );
}
