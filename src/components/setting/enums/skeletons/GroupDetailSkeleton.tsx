// src/components/enums/skeletons/GroupDetailSkeleton.tsx
"use client";

import { JSX } from "react";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  wrap: "p-5 space-y-5",
  skel: "rounded-xl bg-[#d0cecd] animate-pulse",
};

export default function GroupDetailSkeleton(): JSX.Element {
  return (
    <div className={S.wrap}>
      <div className={`${S.skel} h-7 w-1/3`} />
      <div className={`${S.skel} h-4 w-2/3`} />
      <div className="space-y-3 pt-2">
        <div className={`${S.skel} h-10 w-full`} />
        <div className={`${S.skel} h-36 w-full`} />
      </div>
    </div>
  );
}