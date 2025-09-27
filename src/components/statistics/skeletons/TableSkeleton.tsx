import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
    rows?: number
    columns?: number
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
    return (
        <div className="space-y-6">
            {/* Title placeholder */}
            <Skeleton className="h-6 w-32 rounded-md bg-muted-foreground/30 dark:bg-muted/40" />

            <div className="overflow-hidden rounded-lg border border-border">
                {/* Header */}
                <div className="bg-muted/40 dark:bg-muted/20 px-6 py-3 border-b border-border">
                    <div className="flex gap-6">
                        {Array.from({ length: columns }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-4 flex-1 rounded-md bg-muted-foreground/30 dark:bg-muted/40"
                            />
                        ))}
                    </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="px-6 py-4">
                            <div className="flex gap-6">
                                {Array.from({ length: columns }).map((_, j) => (
                                    <Skeleton
                                        key={j}
                                        className="h-4 rounded-md bg-muted-foreground/30 dark:bg-muted/40"
                                        style={{
                                            width:
                                                j === 0
                                                    ? "30%"
                                                    : j === columns - 1
                                                        ? "20%"
                                                        : "25%",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
