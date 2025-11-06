import { Skeleton } from "@/components/ui/skeleton";

const AuditSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-32" />
        </div>

        <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-3 w-64" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default AuditSkeleton;