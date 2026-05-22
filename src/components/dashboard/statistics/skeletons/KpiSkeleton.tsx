import * as React from 'react';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD_SM =
    'rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60 p-5';
const NEU_SKELETON =
    'rounded-lg bg-[#d0cecd] animate-pulse';
const NEU_SKELETON_ICON =
    'rounded-xl bg-[#d0cecd] animate-pulse';

export function KpiSkeleton() {
    return (
        <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            role="status"
            aria-busy="true"
            aria-label="Loading KPI cards"
        >
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={NEU_CARD_SM}>
                    <div className="flex items-start justify-between gap-3">
                        {/* Left: label + value */}
                        <div className="flex flex-col gap-3 flex-1 min-w-0">
                            {/* Label */}
                            <div className={`h-3 w-20 ${NEU_SKELETON}`} />
                            {/* Value */}
                            <div className={`h-7 w-24 ${NEU_SKELETON}`} />
                            {/* Trend hint */}
                            <div className={`h-2.5 w-14 ${NEU_SKELETON}`} />
                        </div>
                        {/* Right: icon well */}
                        <div className={`h-11 w-11 shrink-0 ${NEU_SKELETON_ICON}`} />
                    </div>
                </div>
            ))}
            <span className="sr-only">Loading KPI data…</span>
        </div>
    );
}