// components/support/tours/SupportToursPage.tsx
"use client";

import { useTourApproval } from "@/store/tour-approval.store";
import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { RefreshCw, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Kpis from "./Kpis";
import FiltersBar from "./FiltersBar";
import ToursTable from "./ToursTable";
import Pagination from "./Pagination";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Animation variants ────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function SupportToursPage() {
    const { filters, pagination, isLoading, error, fetchTours, clearFilters } =
        useTourApproval();

    useEffect(() => {
        fetchTours(filters || {}, pagination.page, pagination.limit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={NEU_PAGE_BG}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-7"
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <motion.header variants={itemVariants}>
                    <div className={cn(NEU_CARD, "p-5 md:p-6")}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className={cn(NEU_HEADING, "text-2xl md:text-3xl")}>
                                    Tour Management Center
                                </h1>
                                <p className={NEU_MUTED}>
                                    Review, approve, and manage tour submissions
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() =>
                                        fetchTours(filters || {}, pagination.page, pagination.limit)
                                    }
                                    className={cn(NEU_BTN_GHOST, "h-10 px-4 flex items-center gap-2 text-sm group")}
                                    aria-label="Refresh"
                                >
                                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                    Refresh
                                </button>
                                <button
                                    onClick={() => {
                                        clearFilters();
                                        fetchTours({}, 1, pagination.limit);
                                    }}
                                    className={cn(NEU_BTN_PRIMARY, "h-10 px-4 flex items-center gap-2 text-sm")}
                                    aria-label="Reset filters"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset Filters
                                </button>
                            </div>
                        </div>

                        {/* Status banners */}
                        {(isLoading || error) && (
                            <div className={cn("mt-4 pt-4 border-t space-y-2", NEU_DIVIDER)}>
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={cn(NEU_SURFACE_INSET_SM, "flex items-center gap-3 px-4 py-3 rounded-xl")}
                                    >
                                        <Loader2 className="w-4 h-4 animate-spin text-[#006666] flex-shrink-0" />
                                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#006666] font-medium">
                                            Loading tours…
                                        </p>
                                    </motion.div>
                                )}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FF2157]/10 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]"
                                    >
                                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#FF2157] font-medium">
                                            {error}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.header>

                {/* ── KPIs ───────────────────────────────────────────── */}
                <motion.div variants={itemVariants}>
                    <Kpis />
                </motion.div>

                {/* ── Filters ────────────────────────────────────────── */}
                <motion.div variants={itemVariants}>
                    <FiltersBar />
                </motion.div>

                {/* ── Tours table ────────────────────────────────────── */}
                <motion.div variants={itemVariants} className={cn(NEU_CARD, "overflow-hidden")}>
                    <div className="p-5 md:p-6">
                        <ToursTable />
                    </div>
                </motion.div>

                {/* ── Pagination ─────────────────────────────────────── */}
                <motion.div variants={itemVariants}>
                    <Pagination />
                </motion.div>
            </motion.div>
        </div>
    );
}