"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GuideBannerSkeleton() {
    return (
        <div className="space-y-3">
            <Card className="p-4 backdrop-blur-sm bg-white/60 shadow-sm rounded-lg">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                </div>
            </Card>
            <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-4 backdrop-blur-sm bg-white/60 shadow-sm rounded-lg">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-20 rounded-md" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}