import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartSkeletonProps {
    height?: number
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
    return (
        <div className="space-y-6">
            {/* Title placeholder */}
            <Skeleton className="h-6 w-32 rounded-md bg-muted-foreground/30 dark:bg-muted/40" />

            <div
                className="relative overflow-hidden rounded-lg border border-border bg-muted/40 dark:bg-muted/20"
                style={{ height }}
            >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

                {/* Mock chart bars */}
                <div className="flex h-full items-end justify-between p-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="w-6 rounded-t-md bg-muted-foreground/30 dark:bg-muted/40"
                            style={{ height: `${20 + Math.random() * 60}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
