'use client';

import React, { JSX } from 'react';

export const AdsSkeletons = {

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

    ActionButtonSkeleton: function ActionButtonSkeleton(): JSX.Element {
        return <div className="h-9 w-24 animate-pulse rounded bg-gray-100" />;
    },
};
