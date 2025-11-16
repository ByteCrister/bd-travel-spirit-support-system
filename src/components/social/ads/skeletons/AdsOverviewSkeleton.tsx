'use client';

import React, { JSX } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export function AdsOverviewSkeleton(): JSX.Element {
    const statPlaceholders = new Array(5).fill(null);
    const smallPlaceholders = new Array(4).fill(null);

    return (
        <div className="space-y-4">
            {/* Header skeleton */}
            <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2"
            >
                <div className="w-5 h-5 rounded-md bg-amber-400/60 animate-pulse" />
                <div className="h-6 w-44 bg-slate-200/70 dark:bg-slate-700/60 rounded-md animate-pulse" />
            </motion.div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {statPlaceholders.map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 120, damping: 16 }}
                    >
                        <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 group">
                            {/* Contrast gradient overlay (visible on hover in real card) */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-slate-100/20 to-slate-200/10 dark:from-slate-700/20 dark:to-slate-800/10 pointer-events-none" />

                            <div className="relative p-5">
                                <div className="flex items-start justify-between mb-3">
                                    {/* icon circle */}
                                    <div className="p-3 rounded-xl bg-slate-300 dark:bg-slate-700/60 shadow-sm w-10 h-10 animate-pulse" />

                                    {/* trend pill */}
                                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700/40 text-slate-400 animate-pulse w-8 h-6" />
                                </div>

                                <div className="space-y-1">
                                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700/60 rounded-md animate-pulse" />

                                    <div className="flex items-baseline gap-2 mt-2">
                                        <div className="h-8 w-32 bg-slate-300 dark:bg-slate-600 rounded-md animate-pulse" />
                                        <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700/50 rounded-md animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* bottom accent line (hidden scale effect) */}
                            <div className="h-1 bg-gradient-to-r from-slate-300 to-slate-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Additional stats row skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.35 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                {smallPlaceholders.map((_, i) => (
                    <div
                        key={i}
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                        <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700/60 rounded-md animate-pulse mb-2" />
                        <div className="h-7 w-20 bg-slate-300 dark:bg-slate-600 rounded-md animate-pulse" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

export default AdsOverviewSkeleton;
