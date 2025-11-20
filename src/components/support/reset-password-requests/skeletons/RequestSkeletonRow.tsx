"use client";

import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

/**
 * Self-contained skeleton row that injects required CSS via an inline <style>.
 * Keeps theme-aware base via Tailwind classes (bg-slate-100 dark:bg-slate-800)
 */
export default function RequestSkeletonRow({ compact = false }: { compact?: boolean }) {
    const h = compact ? "h-6" : "h-8";
    const baseBg = "bg-slate-100 dark:bg-slate-800";

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
/* Inline-scoped skeleton styles (applies globally but included inline for portability) */
@keyframes rs-skeleton-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

/* Use a specific class name to avoid colliding with other rules */
.rs-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 0.375rem;
}

/* Shimmer overlay */
.rs-skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.10) 50%,
    rgba(255,255,255,0) 100%);
  mix-blend-mode: overlay;
  transform: translateX(-100%);
  animation: rs-skeleton-shimmer 1.2s linear infinite;
  pointer-events: none;
}

/* Slight dark-mode tweak if your app doesn't use the dark utility above */
.dark .rs-skeleton::after {
  background: linear-gradient(90deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.06) 50%,
    rgba(255,255,255,0) 100%);
}
`,
                }}
            />

            <TableRow className="animate-[fadeIn_120ms_ease-in]">
                <TableCell>
                    <div className={`${baseBg} ${h} w-48 rounded-md rs-skeleton`} />
                </TableCell>

                <TableCell>
                    <div className={`${baseBg} ${h} w-36 rounded-md rs-skeleton`} />
                </TableCell>

                <TableCell>
                    <div className={`${baseBg} ${h} w-24 rounded-md rs-skeleton`} />
                </TableCell>

                <TableCell>
                    <div className={`${baseBg} ${h} w-32 rounded-md rs-skeleton`} />
                </TableCell>

                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <div className={`${baseBg} ${h} w-12 rounded-md rs-skeleton`} />
                        <div className={`${baseBg} ${h} w-12 rounded-md rs-skeleton`} />
                    </div>
                </TableCell>
            </TableRow>
        </>
    );
}
