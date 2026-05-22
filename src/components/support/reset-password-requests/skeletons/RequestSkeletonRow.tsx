// components/skeletons/RequestSkeletonRow.tsx
"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { NEU_SKELETON } from "@/styles/neu.styles";

/**
 * Neumorphic skeleton row for use inside a <TableBody>.
 * Replaces the previous inline <style> injection with the shared
 * NEU_SKELETON token (bg-[#d0cecd] animate-pulse rounded-lg).
 */
export default function RequestSkeletonRow({ compact = false }: { compact?: boolean }) {
    const h = compact ? "h-5" : "h-7";

    return (
        <TableRow className="border-b border-white/40 hover:bg-transparent">
            {/* Name / primary field */}
            <TableCell>
                <div className={`${NEU_SKELETON} ${h} w-48 rounded-xl`} />
            </TableCell>

            {/* Secondary field */}
            <TableCell>
                <div className={`${NEU_SKELETON} ${h} w-36 rounded-xl`} />
            </TableCell>

            {/* Status badge */}
            <TableCell>
                <div className={`${NEU_SKELETON} ${h} w-24 rounded-xl`} />
            </TableCell>

            {/* Date */}
            <TableCell>
                <div className={`${NEU_SKELETON} ${h} w-32 rounded-xl`} />
            </TableCell>

            {/* Action buttons */}
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <div className={`${NEU_SKELETON} ${h} w-14 rounded-xl`} />
                    <div className={`${NEU_SKELETON} ${h} w-14 rounded-xl`} />
                </div>
            </TableCell>
        </TableRow>
    );
}