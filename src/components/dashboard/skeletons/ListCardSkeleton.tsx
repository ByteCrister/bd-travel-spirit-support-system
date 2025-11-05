"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListCardSkeletonProps {
  title?: string;
  rows?: number;
  className?: string;
}

export function ListCardSkeleton({
  title = "Loading",
  rows = 5,
  className,
}: ListCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "bg-white border-2 border-gray-200 shadow-sm",
        "dark:bg-slate-900 dark:border-slate-700",
        className
      )}
    >
      <CardHeader className="border-b-2 border-gray-100 dark:border-slate-800">
        <CardTitle className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-6 w-6 rounded-full bg-gray-300 dark:bg-slate-700" />
          <span className="sr-only">{title}</span>
          <Skeleton className="h-5 w-36 bg-gray-300 dark:bg-slate-700" />
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-3">
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-300 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-56 bg-gray-300 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-72 bg-gray-200 dark:bg-slate-700/90" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-md bg-gray-300 dark:bg-slate-700" />
                    <Skeleton className="h-6 w-28 rounded-md bg-gray-300 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
