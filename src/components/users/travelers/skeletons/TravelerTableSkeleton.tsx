import { Skeleton } from "@/components/ui/skeleton";

// Skeleton component for table
export default function TravelerTableSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
    );
}