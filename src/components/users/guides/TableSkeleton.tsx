"use client";

import { Skeleton } from "@/components/ui/skeleton";

type TableSkeletonProps = {
    rows?: number;
    cols?: number;
};

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
    return (
        <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Table Header */}
            <div
                className="bg-gray-100 border-b border-gray-200 px-4 py-3 grid gap-4"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="flex items-center">
                        <Skeleton className="h-4 w-24 bg-gray-400/70 rounded" />
                    </div>
                ))}
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
                {Array.from({ length: rows }).map((_, rowIdx) => (
                    <div
                        key={rowIdx}
                        className="px-4 py-4 grid gap-4 items-center"
                        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                    >
                        {Array.from({ length: cols }).map((_, colIdx) => (
                            <div key={colIdx} className="flex items-center">
                                <Skeleton className="h-4 w-20 bg-gray-300 rounded" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
