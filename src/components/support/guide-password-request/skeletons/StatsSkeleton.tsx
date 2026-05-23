// components/guide-password-request/skeletons/StatsSkeleton.tsx
"use client";

import { NEU_CARD, NEU_SKELETON } from "@/styles/neu.styles";

const STAT_COUNT = 5;

function StatsSkeleton() {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-5`}>
      {Array.from({ length: STAT_COUNT }).map((_, i) => (
        <div key={i} className={`${NEU_CARD} p-5 flex flex-col gap-3`}>
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className={`${NEU_SKELETON} h-3 w-20`} />
            <div className={`${NEU_SKELETON} h-9 w-9 rounded-xl`} />
          </div>
          {/* Value */}
          <div className={`${NEU_SKELETON} h-8 w-12`} />
          {/* Sub-label */}
          <div className={`${NEU_SKELETON} h-2.5 w-24`} />
          {/* Progress bar */}
          <div className="h-1 w-full rounded-full bg-[#c8c6c5]/50" />
        </div>
      ))}
    </div>
  );
}

export default StatsSkeleton;