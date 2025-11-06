import { Skeleton } from "@/components/ui/skeleton";

const SecuritySkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-1">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default SecuritySkeleton;