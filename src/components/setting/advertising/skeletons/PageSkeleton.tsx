import React from "react";
import { motion } from "framer-motion";

// ── Neumorphism style constants ───────────────────────────────
const S = {
  page: "min-h-screen bg-[#E7E5E4] p-4 lg:p-6 xl:p-8 space-y-6",
  skeleton: "rounded-lg bg-[#d0cecd] animate-pulse",

  card:
    "rounded-2xl bg-[#E7E5E4] p-5 " +
    "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60",

  tableWrap:
    "rounded-2xl bg-[#E7E5E4] overflow-hidden " +
    "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60",

  theadRow:
    "flex items-center gap-4 px-4 py-3 border-b border-[#1E2938]/10",
  tRow: "flex items-center gap-4 px-4 py-4 border-b border-[#1E2938]/8 last:border-0",
};

const Skel = ({ className }: { className: string }) => (
  <div className={`${S.skeleton} ${className}`} />
);

const PageSkeleton: React.FC = () => (
  <div className={S.page}>
    {/* Header skeleton */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <Skel className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skel className="h-6 w-48" />
          <Skel className="h-3.5 w-72" />
        </div>
      </div>
      <Skel className="hidden md:block h-14 w-44 rounded-2xl" />
    </motion.div>

    {/* Toolbar skeleton */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className={S.card}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skel className="h-10 w-28 rounded-xl" />
          <Skel className="h-10 w-28 rounded-xl" />
          <Skel className="h-10 w-24 rounded-xl" />
        </div>
        <Skel className="h-9 w-9 rounded-xl" />
      </div>
    </motion.div>

    {/* Table skeleton */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={S.tableWrap}
    >
      {/* thead */}
      <div className={S.theadRow}>
        <Skel className="h-4 w-4 rounded" />
        <Skel className="h-3 w-20" />
        <Skel className="h-3 w-14" />
        <Skel className="h-3 w-16" />
        <Skel className="h-3 w-14" />
        <Skel className="h-3 w-18 ml-auto" />
        <Skel className="h-3 w-16" />
      </div>

      {/* tbody rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 + i * 0.07 }}
          className={S.tRow}
        >
          <Skel className="h-4 w-4 rounded flex-shrink-0" />
          <div className="flex items-center gap-2">
            <Skel className="h-8 w-8 rounded-xl flex-shrink-0" />
            <div className="space-y-1.5">
              <Skel className="h-3.5 w-28" />
              <Skel className="h-2.5 w-20" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <Skel className="h-3.5 w-16" />
            <Skel className="h-3.5 w-12" />
            <Skel className="h-5 w-16 rounded-lg" />
            <Skel className="h-3.5 w-20" />
            <div className="flex gap-1">
              <Skel className="h-8 w-8 rounded-xl" />
              <Skel className="h-8 w-8 rounded-xl" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

export default PageSkeleton;