// components/support/tours/Kpis.tsx
"use client";

import { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTourApproval } from "@/store/tour-approval.store";
import {
    Clock,
    CheckCircle2,
    XCircle,
    Ban,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
} from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
    "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-1 transition-all duration-300";
const NEU_ICON_WELL =
    "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

// ── KPI accent colours (tints only — no heavy gradients) ─────
const KPI_META = {
    pending: { iconColor: "text-[#FE9900]", accentBg: "bg-[#FE9900]/10", bar: "bg-[#FE9900]", label: "text-[#FE9900]" },
    approved: { iconColor: "text-[#00A63D]", accentBg: "bg-[#00A63D]/10", bar: "bg-[#00A63D]", label: "text-[#00A63D]" },
    rejected: { iconColor: "text-[#FF2157]", accentBg: "bg-[#FF2157]/10", bar: "bg-[#FF2157]", label: "text-[#FF2157]" },
    suspended: { iconColor: "text-[#1E2938]/50", accentBg: "bg-[#1E2938]/10", bar: "bg-[#1E2938]/40", label: "text-[#1E2938]/50" },
    total: { iconColor: "text-[#006666]", accentBg: "bg-[#006666]/10", bar: "bg-[#006666]", label: "text-[#006666]" },
} as const;

// ── Animation variants ────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};
const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.2 } },
};
const numberVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.3 } },
};

export default function Kpis() {
    const { stats } = useTourApproval();

    const kpis = useMemo(() => {
        const s = stats || { pending: 0, approved: 0, rejected: 0, suspended: 0, total: 0 };
        return [
            { id: "pending" as const, label: "Pending Review", value: s.pending, icon: Clock, trend: 0 },
            { id: "approved" as const, label: "Approved", value: s.approved, icon: CheckCircle2, trend: 0 },
            { id: "rejected" as const, label: "Rejected", value: s.rejected, icon: XCircle, trend: 0 },
            { id: "suspended" as const, label: "Suspended", value: s.suspended, icon: Ban, trend: 0 },
            { id: "total" as const, label: "Total Tours", value: s.total, icon: BarChart3, trend: 0 },
        ];
    }, [stats]);

    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <ArrowUpRight className="w-3 h-3" />;
        if (trend < 0) return <ArrowDownRight className="w-3 h-3" />;
        return <Minus className="w-3 h-3" />;
    };

    const getTrendClass = (trend: number) =>
        trend > 0
            ? "text-[#00A63D] bg-[#00A63D]/10"
            : trend < 0
                ? "text-[#FF2157] bg-[#FF2157]/10"
                : "text-[#1E2938]/50 bg-[#1E2938]/5";

    return (
        <section aria-labelledby="kpis-heading">
            <p id="kpis-heading" className="sr-only">KPI Overview</p>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5"
            >
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    const meta = KPI_META[kpi.id];
                    const pct = Math.min((kpi.value / (stats?.total || 1)) * 100, 100);

                    return (
                        <motion.article
                            key={kpi.id}
                            variants={cardVariants}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className={cn(NEU_CARD, NEU_CARD_HOVER, "overflow-hidden")}
                        >
                            <div className="p-5 space-y-4">
                                {/* Header row */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <p className={cn(NEU_LABEL, meta.label)}>{kpi.label}</p>
                                        {kpi.trend !== 0 && (
                                            <span className={cn(
                                                "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs",
                                                "font-[family-name:var(--font-space-mono)] font-bold",
                                                getTrendClass(kpi.trend)
                                            )}>
                                                {getTrendIcon(kpi.trend)}
                                                {Math.abs(kpi.trend)}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Icon well */}
                                    <motion.div
                                        variants={iconVariants}
                                        className={cn(
                                            NEU_ICON_WELL,
                                            meta.accentBg,
                                            "w-11 h-11 flex items-center justify-center flex-shrink-0"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5", meta.iconColor)} />
                                    </motion.div>
                                </div>

                                {/* Value */}
                                <motion.div variants={numberVariants} className="space-y-2">
                                    <motion.p
                                        key={kpi.value}
                                        initial={{ scale: 1.15, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className={cn(NEU_HEADING, "text-3xl md:text-4xl")}
                                    >
                                        {kpi.value.toLocaleString()}
                                    </motion.p>

                                    {/* Progress bar — inset track */}
                                    <div className={cn(NEU_SURFACE_INSET_SM, "h-2 rounded-full overflow-hidden")}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                            className={cn("h-full rounded-full", meta.bar)}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Bottom accent strip */}
                            <div className={cn("h-0.5 w-full", meta.bar)} />
                        </motion.article>
                    );
                })}
            </motion.div>
        </section>
    );
}