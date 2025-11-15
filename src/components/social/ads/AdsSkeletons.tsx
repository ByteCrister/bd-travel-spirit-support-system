'use client';

import React, { JSX } from 'react';

export const AdsSkeletons = {
    OverviewSkeleton: function OverviewSkeleton(): JSX.Element {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-md bg-gray-100" />
                ))}
            </div>
        );
    },

    TableSkeleton: function TableSkeleton({ rows = 5 }: { rows?: number }): JSX.Element {
        return (
            <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 border-b bg-muted px-4 py-2 text-sm font-medium">
                    <div className="col-span-1">Sel</div>
                    <div className="col-span-4">Title</div>
                    <div className="col-span-2">Placements</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Impr.</div>
                    <div className="col-span-1">Clicks</div>
                    <div className="col-span-2">Created</div>
                </div>

                <div className="divide-y">
                    {Array.from({ length: rows }).map((_, idx) => (
                        <div key={idx} className="grid grid-cols-12 items-center gap-4 px-4 py-4">
                            <div className="col-span-1 h-4 w-4 rounded bg-gray-200" />
                            <div className="col-span-4 h-4 w-full rounded bg-gray-200" />
                            <div className="col-span-2 h-4 rounded bg-gray-200" />
                            <div className="col-span-1 h-4 rounded bg-gray-200" />
                            <div className="col-span-1 h-4 rounded bg-gray-200" />
                            <div className="col-span-1 h-4 rounded bg-gray-200" />
                            <div className="col-span-2 h-4 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
            </div>
        );
    },

    RowSummarySkeleton: function RowSummarySkeleton(): JSX.Element {
        return <div className="h-12 w-full animate-pulse rounded bg-gray-100" />;
    },

    RowDetailsSkeleton: function RowDetailsSkeleton(): JSX.Element {
        return (
            <div className="space-y-3">
                <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-16 w-full animate-pulse rounded bg-gray-100" />
            </div>
        );
    },

    ActionButtonSkeleton: function ActionButtonSkeleton(): JSX.Element {
        return <div className="h-9 w-24 animate-pulse rounded bg-gray-100" />;
    },
};
