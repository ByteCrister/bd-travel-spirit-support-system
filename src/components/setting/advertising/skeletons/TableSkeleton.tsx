import React from "react";

// ── Neumorphism style constants ───────────────────────────────
const S = {
  wrap:
    "rounded-2xl bg-[#E7E5E4] overflow-hidden " +
    "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60",
  row: "flex items-center gap-4 px-4 py-3 border-b border-[#1E2938]/8 last:border-0",
  skel: "rounded-lg bg-[#d0cecd] animate-pulse",
};

const RowSkeleton = () => (
  <div className={S.row}>
    <div className={`${S.skel} h-4 w-4`} />
    <div className={`${S.skel} h-4 w-1/4`} />
    <div className={`${S.skel} h-4 w-1/6`} />
    <div className={`${S.skel} h-4 w-1/6`} />
    <div className={`${S.skel} h-4 w-1/6`} />
    <div className={`${S.skel} h-4 w-1/12 ml-auto`} />
  </div>
);

const TableSkeleton: React.FC = () => (
  <div className={S.wrap}>
    {Array.from({ length: 8 }).map((_, i) => (
      <RowSkeleton key={i} />
    ))}
  </div>
);

export default TableSkeleton;