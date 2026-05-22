// src/components/enums/skeletons/GroupsListSkeleton.tsx
"use client";

import { JSX } from "react";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  wrap: "space-y-2",
  searchSkel:
    "h-10 w-full rounded-xl bg-[#d0cecd] animate-pulse mb-4",
  cardSkel:
    "flex items-center gap-3 p-3.5 rounded-xl bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/60",
  iconSkel: "flex-none w-9 h-9 rounded-xl bg-[#d0cecd] animate-pulse",
  line1: "h-3.5 rounded-lg bg-[#d0cecd] animate-pulse",
  line2: "h-3 rounded-lg bg-[#d0cecd] animate-pulse mt-1.5",
};

export default function GroupsListSkeleton(): JSX.Element {
  return (
    <div className={S.wrap}>
      <div className={S.searchSkel} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={S.cardSkel}>
          <div className={S.iconSkel} />
          <div className="flex-1 min-w-0">
            <div className={`${S.line1} w-3/4`} />
            <div className={`${S.line2} w-1/2`} />
          </div>
          <div className="w-6 h-4 rounded-lg bg-[#d0cecd] animate-pulse" />
        </div>
      ))}
    </div>
  );
}