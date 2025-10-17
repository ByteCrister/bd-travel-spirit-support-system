'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Skeleton shimmer effect (reusable)
 */
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

/**
 * Main skeleton for the AllDetails page
 */
export default function AllDetailsSkeleton() {
    return (
        <div className="bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-10" />
                        </div>
                    </div>
                </header>

                {/* Body layout */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left column */}
                    <div className="col-span-2 space-y-6">
                        {/* Overview */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                            <Skeleton className="h-3 w-4/5" />
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-3 rounded-lg border border-slate-100 bg-white">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-lg" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-2.5 w-14" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Itinerary preview */}
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-40" />
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-3 rounded-lg border border-slate-100 bg-slate-50 space-y-2"
                                    >
                                        <Skeleton className="h-3 w-2/3" />
                                        <Skeleton className="h-2.5 w-4/5" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* FAQs */}
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-20" />
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-md border border-slate-100 bg-gradient-to-r from-white to-slate-50 space-y-2"
                                >
                                    <Skeleton className="h-3 w-3/4" />
                                    <Skeleton className="h-2.5 w-2/3" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <aside className="space-y-4">
                        {/* Host */}
                        <div className="p-4 rounded-lg border border-slate-100 bg-slate-50 space-y-3">
                            <Skeleton className="h-4 w-20" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-2.5 w-20" />
                                </div>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="p-4 rounded-lg border border-slate-100 bg-white space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-full rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                        </div>

                        {/* Timestamps */}
                        <div className="p-4 rounded-lg border border-slate-100 bg-white space-y-2">
                            <Skeleton className="h-2.5 w-16" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-2.5 w-16 mt-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    );
}
