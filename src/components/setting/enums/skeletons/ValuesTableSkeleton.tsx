// src/components/enums/skeletons/ValuesTableSkeleton.tsx
"use client";

import { JSX } from "react";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  wrap:
    "rounded-2xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] " +
    "border border-white/60 p-4 space-y-3",
  headerRow: "flex items-center gap-4 pb-2 border-b border-[#1E2938]/10 mb-1",
  headerCell: "h-3 rounded-lg bg-[#d0cecd] animate-pulse",
  row: "flex items-center gap-4",
  cell: "h-5 rounded-lg bg-[#d0cecd] animate-pulse",
};

export default function ValuesTableSkeleton(): JSX.Element {
  return (
    <div className={S.wrap}>
      {/* Header */}
      <div className={S.headerRow}>
        <div className={`${S.headerCell} w-20`} />
        <div className={`${S.headerCell} w-28`} />
        <div className={`${S.headerCell} w-20`} />
        <div className={`${S.headerCell} w-12`} />
        <div className={`${S.headerCell} w-16 ml-auto`} />
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={S.row}>
          <div className={`${S.cell} w-24`} />
          <div className={`${S.cell} flex-1`} />
          <div className={`${S.cell} w-20`} />
          <div className={`${S.cell} w-10`} />
          <div className={`${S.cell} w-16 ml-auto`} />
        </div>
      ))}
    </div>
  );
}