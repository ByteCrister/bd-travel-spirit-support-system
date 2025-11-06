import { Skeleton } from "@/components/ui/skeleton";

const RolesSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
            </div>
        </div>

        <div className="space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="p-4 border rounded-lg space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default RolesSkeleton;