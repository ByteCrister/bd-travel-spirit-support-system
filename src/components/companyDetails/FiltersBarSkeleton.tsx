// components/company/FiltersBarSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FiltersBarSkeleton() {
    return (
        <div className="grid gap-3 md:grid-cols-3 items-end">
            <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-9 w-full" />
                </div>
            </div>
        </div>
    );
}
