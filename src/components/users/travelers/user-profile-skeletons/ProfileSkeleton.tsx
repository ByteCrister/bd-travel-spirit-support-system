import { Skeleton } from "@/components/ui/skeleton";

// Skeleton components for each segment
const ProfileSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-lg">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-1">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default ProfileSkeleton;