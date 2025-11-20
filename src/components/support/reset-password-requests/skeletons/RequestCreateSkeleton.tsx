import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestCreateSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-16" />
      <Skeleton className="w-1/3 h-10" />
    </div>
  );
}
