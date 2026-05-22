import * as React from 'react';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-5';
const NEU_SKELETON =
    'rounded-lg bg-[#d0cecd] animate-pulse';
const NEU_SKELETON_INSET =
    'rounded-lg bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]';

interface ChartSkeletonProps {
    height?: number;
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
    return (
        <div className={`w-full space-y-5 ${NEU_CARD}`} role="status" aria-busy="true" aria-label="Loading chart">
            {/* Title placeholder */}
            <div className={`h-5 w-28 ${NEU_SKELETON}`} />

            {/* Chart area */}
            <div
                className={`relative overflow-hidden ${NEU_SKELETON_INSET}`}
                style={{ height }}
            >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                {/* Mock bars */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-1.5 px-4 pb-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-t-md ${NEU_SKELETON}`}
                            style={{ height: `${22 + ((i * 37 + 13) % 58)}%` }}
                        />
                    ))}
                </div>

                {/* Y-axis ticks hint */}
                <div className="absolute left-3 top-3 flex flex-col justify-between h-[calc(100%-3.5rem)] gap-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={`h-2.5 w-7 ${NEU_SKELETON}`} />
                    ))}
                </div>
            </div>

            {/* X-axis labels hint */}
            <div className="flex justify-between gap-1.5 px-1">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`h-2.5 flex-1 ${NEU_SKELETON}`} />
                ))}
            </div>

            <span className="sr-only">Loading chart data…</span>
        </div>
    );
}