// src/components/enums/ValuesTableSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import React, { JSX } from "react";

export default function ValuesTableSkeleton(): JSX.Element {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-6 w-1/3 rounded" />
          <Skeleton className="h-6 w-1/4 rounded" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
