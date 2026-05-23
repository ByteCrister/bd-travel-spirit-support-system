"use client";

import { motion } from "framer-motion";
import {
  MdPerson,
  MdContactEmergency,
  MdWork,
  MdAttachMoney,
  MdAccessTime,
  MdStarRate,
  MdSecurity,
  MdDescription,
} from "react-icons/md";
import React from "react";

// ── Neumorphic style tokens ───────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_CARD_INSET =
  "rounded-xl bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]";

// ─────────────────────────────────────────────────────────────

export function EmployeeDetailDialogSkeleton() {
  return (
    <div
      className={`max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden ${NEU_SURFACE}`}
    >
      <h2 className="sr-only">Loading Employee Details</h2>

      {/* Header */}
      <motion.div
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-6 pb-5 border-b border-[#c8c6c5]/60"
      >
        <div className="flex items-start gap-4">
          {/* Avatar placeholder */}
          <div className="h-20 w-20 rounded-2xl bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] flex-shrink-0 animate-pulse" />

          <div className="flex-1 min-w-0">
            <div className={`${NEU_SKELETON} h-6 w-52 mb-3`} />
            <div className="flex flex-wrap gap-2 mb-3">
              {[20, 24, 20].map((w, i) => (
                <div key={i} className={`${NEU_SKELETON} h-6 w-${w}`} />
              ))}
            </div>
            <div className={`${NEU_SKELETON} h-4 w-36`} />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <div className={`${NEU_SKELETON} h-8 w-24 rounded-xl`} />
            <div className={`${NEU_SKELETON} h-8 w-8 rounded-xl`} />
          </div>
        </div>
      </motion.div>

      {/* Body */}
      <div
        className={`flex-1 h-[calc(90vh-220px)] overflow-auto ${NEU_SURFACE}`}
      >
        <div className="p-6 space-y-6">
          <SectionSkeleton icon={MdPerson} titleWidth="w-44">
            <GridSkeleton cols={3} count={6} />
          </SectionSkeleton>

          <SectionSkeleton icon={MdContactEmergency} titleWidth="w-48">
            <GridSkeleton cols={3} count={3} />
          </SectionSkeleton>

          <SectionSkeleton icon={MdWork} titleWidth="w-40">
            <GridSkeleton cols={3} count={6} />
          </SectionSkeleton>

          <SectionSkeleton icon={MdAttachMoney} titleWidth="w-44">
            <GridSkeleton cols={3} count={4} />
          </SectionSkeleton>

          <SectionSkeleton icon={MdAccessTime} titleWidth="w-44">
            <div className="space-y-3">
              {[3, 2].map((chips, i) => (
                <div key={i} className={`${NEU_CARD_INSET} p-3`}>
                  <div className={`${NEU_SKELETON} h-4 w-40 mb-2`} />
                  <div className="flex gap-2">
                    {Array.from({ length: chips }).map((_, j) => (
                      <div key={j} className={`${NEU_SKELETON} h-6 w-12`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionSkeleton>

          <SectionSkeleton icon={MdStarRate} titleWidth="w-36">
            <GridSkeleton cols={3} count={2} />
            <div className={`${NEU_CARD_INSET} p-4 mt-3`}>
              <div className={`${NEU_SKELETON} h-12 w-full`} />
            </div>
          </SectionSkeleton>

          <SectionSkeleton icon={MdSecurity} titleWidth="w-36">
            <div className="flex flex-wrap gap-2">
              {[24, 28, 20].map((w, i) => (
                <div
                  key={i}
                  className={`${NEU_SKELETON} h-6 w-${w} rounded-lg`}
                />
              ))}
            </div>
          </SectionSkeleton>

          <SectionSkeleton icon={MdDescription} titleWidth="w-36">
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`${NEU_CARD_INSET} p-3 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${NEU_SKELETON} h-5 w-5 rounded-md`} />
                    <div>
                      <div className={`${NEU_SKELETON} h-4 w-36 mb-1`} />
                      <div className={`${NEU_SKELETON} h-3 w-28`} />
                    </div>
                  </div>
                  <div className={`${NEU_SKELETON} h-4 w-10`} />
                </div>
              ))}
            </div>
          </SectionSkeleton>

          {/* Footer timestamps */}
          <div className="pt-4 border-t border-[#c8c6c5]/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`${NEU_SKELETON} h-3 w-48`} />
              <div className={`${NEU_SKELETON} h-3 w-48`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Small helpers ─────────────────────────────────────────── */
type IconComp = React.ComponentType<{ className?: string }>;

interface SectionSkeletonProps {
  icon?: IconComp;
  titleWidth?: string;
  children?: React.ReactNode;
}

export function SectionSkeleton({
  icon: Icon,
  titleWidth = "w-40",
  children,
}: SectionSkeletonProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {Icon ? (
          <Icon className="h-5 w-5 text-[#006666]/70" />
        ) : (
          <div className="h-5 w-5 rounded bg-[#d0cecd] animate-pulse" />
        )}
        <div
          className={`h-4 ${titleWidth} rounded-lg bg-[#d0cecd] animate-pulse`}
        />
      </div>
      <div className="h-px w-full bg-[#c8c6c5]/60" />
      <div>{children}</div>
    </div>
  );
}

function GridSkeleton({ cols = 2, count }: { cols?: number; count: number }) {
  const colClass =
    cols === 3
      ? "lg:grid-cols-3 sm:grid-cols-2 grid-cols-1"
      : cols === 2
        ? "sm:grid-cols-2 grid-cols-1"
        : "grid-cols-1";
  return (
    <div className={`grid ${colClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <CellSkeleton key={i} />
      ))}
    </div>
  );
}

function CellSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-32 rounded-md bg-[#d0cecd] animate-pulse" />
      <div className="h-5 w-full rounded-md bg-[#c8c6c5] animate-pulse" />
    </div>
  );
}
