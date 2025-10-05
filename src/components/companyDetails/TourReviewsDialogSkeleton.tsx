// components/TourReviewsDialogSkeleton.tsx
import React from "react";

export function TourReviewsDialogSkeleton({ rows = 4 }: { rows?: number }) {
    const Row = ({ index }: { index: number }) => (
        <div
            aria-hidden="true"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-900 transition-all duration-300"
            key={index}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0" />

                    <div className="w-full">
                        {/* name / badges row */}
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-4 w-1/4 max-w-[140px] rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        </div>

                        {/* meta row */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* rating pill */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                    <div className="h-4 w-4 rounded bg-amber-200 dark:bg-amber-700 animate-pulse" />
                    <div className="h-4 w-8 rounded bg-amber-200 dark:bg-amber-700 animate-pulse" />
                </div>
            </div>

            {/* title */}
            <div className="mb-2">
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>

            {/* comment lines */}
            <div className="space-y-2 mb-3">
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-11/12 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-9/12 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>

            {/* footer row */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>

                <div className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className="space-y-4 p-0">
            {Array.from({ length: rows }).map((_, i) => (
                <Row index={i} key={i} />
            ))}
        </div>
    );
}
