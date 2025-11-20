import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestsByIdSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-3/4 h-8" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-1/3 h-4" />
    </div>
  );
}
