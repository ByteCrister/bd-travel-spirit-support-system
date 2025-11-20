import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestsListSkeleton() {
    return (
        <div className="space-y-3">
            <div className="flex gap-3">
                <Skeleton className="w-1/3 h-10" />
                <Skeleton className="w-1/6 h-10" />
                <Skeleton className="w-1/6 h-10" />
            </div>

            <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-12 h-8" />
                        <Skeleton className="w-1/3 h-6" />
                        <Skeleton className="w-1/4 h-6" />
                        <Skeleton className="w-1/6 h-6" />
                        <Skeleton className="w-1/5 h-6" />
                    </div>
                ))}
            </div>
        </div>
    );
}
