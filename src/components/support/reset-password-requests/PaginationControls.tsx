"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useResetRequestsStore } from "@/store/employee/reset-requests.store";

// ─── Neumorphism Style Tokens ────────────────────────────────
const NEU_SURFACE_RAISED =
    "bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";
const NEU_BTN_ICON =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
// ────────────────────────────────────────────────────────────

export default function PaginationControls() {
    const { currentQuery, fetchList, queryCache } = useResetRequestsStore();

    const page = currentQuery.page ?? 1;
    const limit = currentQuery.limit ?? 20;

    const totalPages = useMemo(() => {
        const cacheKeys = Object.keys(queryCache);
        const relevantCache = cacheKeys.find((key) => {
            try {
                const cached = queryCache[key];
                return (
                    cached?.query?.status === currentQuery.status &&
                    cached?.query?.search === currentQuery.search
                );
            } catch {
                return false;
            }
        });
        if (relevantCache && queryCache[relevantCache]) {
            return Math.ceil(queryCache[relevantCache].total / limit);
        }
        return page;
    }, [queryCache, currentQuery, page, limit]);

    const goToPage = async (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        await fetchList({ ...currentQuery, page: newPage });
    };

    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const navButtons = [
        { icon: ChevronsLeft, action: () => goToPage(1), disabled: !hasPrev, label: "First page" },
        { icon: ChevronLeft, action: () => goToPage(page - 1), disabled: !hasPrev, label: "Previous page" },
        { icon: ChevronRight, action: () => goToPage(page + 1), disabled: !hasNext, label: "Next page" },
        { icon: ChevronsRight, action: () => goToPage(totalPages), disabled: !hasNext, label: "Last page" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${NEU_SURFACE_RAISED} rounded-2xl flex items-center justify-between gap-4 px-5 py-3`}
        >
            {/* Page info */}
            <div className="flex items-center gap-2">
                <span className={NEU_LABEL}>Page</span>
                <span
                    className={`${NEU_SURFACE_INSET_SM} ${NEU_MONO} text-sm font-bold rounded-lg px-3 py-1 min-w-[2.5rem] text-center`}
                >
                    {page}
                </span>
                <span className={`${NEU_LABEL} normal-case tracking-normal`}>of</span>
                <span className={`${NEU_MONO} text-sm font-bold text-[#006666]`}>
                    {totalPages}
                </span>
            </div>

            {/* Nav buttons */}
            <div className="flex items-center gap-1.5">
                {navButtons.map(({ icon: Icon, action, disabled, label }) => (
                    <motion.button
                        key={label}
                        whileHover={disabled ? {} : { scale: 1.05 }}
                        whileTap={disabled ? {} : { scale: 0.95 }}
                        onClick={action}
                        disabled={disabled}
                        aria-label={label}
                        className={NEU_BTN_ICON}
                    >
                        <Icon className="w-4 h-4" />
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}