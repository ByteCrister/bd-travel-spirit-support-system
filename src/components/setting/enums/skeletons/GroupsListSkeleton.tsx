// src/components/enums/GroupsListSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import React, { JSX } from "react";

export default function GroupsListSkeleton(): JSX.Element {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-9"><Skeleton className="h-9 w-full rounded" /></div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
            <Skeleton className="h-8 w-10 rounded" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 rounded mb-1" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
