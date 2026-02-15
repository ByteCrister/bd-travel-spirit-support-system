// src/components/enums/GroupDetailSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import React, { JSX } from "react";

export default function GroupDetailSkeleton(): JSX.Element {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-1/3 rounded" />
      <Skeleton className="h-5 w-2/3 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="h-40 w-full rounded" />
      </div>
    </div>
  );
}
