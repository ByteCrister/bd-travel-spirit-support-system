import { Skeleton } from "@/components/ui/skeleton";

const ActivitySkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-lg space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-8" />
                    </div>
                ))}
            </div>
        </div>

        <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default ActivitySkeleton;