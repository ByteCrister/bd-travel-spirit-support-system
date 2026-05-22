import * as React from 'react';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-5';
const NEU_SKELETON =
    'rounded-lg bg-[#d0cecd] animate-pulse';
const NEU_TABLE_INSET =
    'overflow-hidden rounded-xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]';
const NEU_TABLE_HEADER =
    'px-5 py-3 border-b border-[#c8c6c5]/60 bg-[#e0dedc]';
const NEU_TABLE_ROW =
    'px-5 py-4 border-b border-[#c8c6c5]/30 last:border-0';

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

const COL_WIDTHS = ['30%', '25%', '25%', '20%', '18%', '15%'];

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
    return (
        <div
            className={`w-full space-y-5 ${NEU_CARD}`}
            role="status"
            aria-busy="true"
            aria-label="Loading table"
        >
            {/* Title placeholder */}
            <div className={`h-5 w-28 ${NEU_SKELETON}`} />

            <div className={NEU_TABLE_INSET}>
                {/* Header */}
                <div className={NEU_TABLE_HEADER}>
                    <div className="flex items-center gap-4">
                        {Array.from({ length: columns }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-3 ${NEU_SKELETON}`}
                                style={{ width: COL_WIDTHS[i % COL_WIDTHS.length] }}
                            />
                        ))}
                    </div>
                </div>

                {/* Rows */}
                <div>
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className={NEU_TABLE_ROW}>
                            <div className="flex items-center gap-4">
                                {Array.from({ length: columns }).map((_, j) => (
                                    <div
                                        key={j}
                                        className={`h-3 ${NEU_SKELETON}`}
                                        style={{ width: COL_WIDTHS[j % COL_WIDTHS.length] }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <span className="sr-only">Loading table data…</span>
        </div>
    );
}