import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function KpiSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-lg border border-border bg-card p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            {/* Label placeholder */}
                            <Skeleton className="h-4 w-24 rounded-md bg-muted-foreground/30 dark:bg-muted/40" />
                            {/* Value placeholder */}
                            <Skeleton className="h-8 w-20 rounded-md bg-muted-foreground/30 dark:bg-muted/40" />
                        </div>
                        {/* Icon placeholder */}
                        <Skeleton className="h-12 w-12 rounded-lg bg-muted-foreground/30 dark:bg-muted/40" />
                    </div>
                </div>
            ))}
        </div>
    )
}
