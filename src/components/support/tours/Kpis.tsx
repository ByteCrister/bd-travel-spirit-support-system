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

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
        },
    },
};

const numberVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            delay: 0.3,
        },
    },
};

export default function Kpis() {
    const { stats } = useTourApproval();

    const kpis = useMemo(() => {
        const s = stats || { pending: 0, approved: 0, rejected: 0, suspended: 0, total: 0 };

        return [
            {
                id: "pending",
                label: "Pending Review",
                value: s.pending,
                icon: Clock,
                gradient: "from-amber-500 to-orange-500",
                bgGradient: "from-amber-50 to-orange-50",
                borderColor: "border-amber-200",
                iconBg: "bg-amber-500",
                textColor: "text-amber-700",
                glowColor: "shadow-amber-500/20",
                trend: 0, // You can calculate trend based on previous data
            },
            {
                id: "approved",
                label: "Approved",
                value: s.approved,
                icon: CheckCircle2,
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-50 to-emerald-50",
                borderColor: "border-green-200",
                iconBg: "bg-green-500",
                textColor: "text-green-700",
                glowColor: "shadow-green-500/20",
                trend: 0,
            },
            {
                id: "rejected",
                label: "Rejected",
                value: s.rejected,
                icon: XCircle,
                gradient: "from-red-500 to-rose-500",
                bgGradient: "from-red-50 to-rose-50",
                borderColor: "border-red-200",
                iconBg: "bg-red-500",
                textColor: "text-red-700",
                glowColor: "shadow-red-500/20",
                trend: 0,
            },
            {
                id: "suspended",
                label: "Suspended",
                value: s.suspended,
                icon: Ban,
                gradient: "from-slate-500 to-gray-500",
                bgGradient: "from-slate-50 to-gray-50",
                borderColor: "border-slate-200",
                iconBg: "bg-slate-500",
                textColor: "text-slate-700",
                glowColor: "shadow-slate-500/20",
                trend: 0,
            },
            {
                id: "total",
                label: "Total Tours",
                value: s.total,
                icon: BarChart3,
                gradient: "from-blue-500 to-indigo-500",
                bgGradient: "from-blue-50 to-indigo-50",
                borderColor: "border-blue-200",
                iconBg: "bg-blue-500",
                textColor: "text-blue-700",
                glowColor: "shadow-blue-500/20",
                trend: 0,
            },
        ];
    }, [stats]);

    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <ArrowUpRight className="w-3 h-3" />;
        if (trend < 0) return <ArrowDownRight className="w-3 h-3" />;
        return <Minus className="w-3 h-3" />;
    };

    const getTrendColor = (trend: number) => {
        if (trend > 0) return "text-green-600 bg-green-50";
        if (trend < 0) return "text-red-600 bg-red-50";
        return "text-slate-600 bg-slate-50";
    };

    return (
        <section aria-labelledby="kpis">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6"
            >
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;

                    return (
                        <motion.div
                            key={kpi.id}
                            variants={cardVariants}
                            whileHover={{
                                y: -8,
                                scale: 1.02,
                                transition: { duration: 0.2 },
                            }}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300",
                                kpi.borderColor,
                                kpi.glowColor
                            )}
                        >
                            {/* Animated gradient background */}
                            <div
                                className={cn(
                                    "absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity duration-300",
                                    kpi.bgGradient
                                )}
                            />

                            {/* Shimmer effect on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </div>

                            {/* Content */}
                            <div className="relative p-5 md:p-6">
                                {/* Header with Icon */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <p className={cn("text-xs md:text-sm font-semibold mb-1", kpi.textColor)}>
                                            {kpi.label}
                                        </p>

                                        {/* Trend indicator (if applicable) */}
                                        {kpi.trend !== undefined && kpi.trend !== 0 && (
                                            <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", getTrendColor(kpi.trend))}>
                                                {getTrendIcon(kpi.trend)}
                                                <span>{Math.abs(kpi.trend)}%</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Icon with animation */}
                                    <motion.div
                                        variants={iconVariants}
                                        className={cn(
                                            "flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br shadow-lg",
                                            kpi.gradient,
                                            "group-hover:scale-110 transition-transform duration-300"
                                        )}
                                    >
                                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </motion.div>
                                </div>

                                {/* Value */}
                                <motion.div variants={numberVariants} className="space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <motion.p
                                            key={kpi.value}
                                            initial={{ scale: 1.2, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="text-3xl md:text-4xl font-bold text-slate-900"
                                        >
                                            {kpi.value.toLocaleString()}
                                        </motion.p>

                                        {/* Sparkle animation for high values */}
                                        {kpi.value > 0 && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: 0 }}
                                                animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    repeatDelay: 3,
                                                    ease: "easeInOut",
                                                }}
                                                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400"
                                            />
                                        )}
                                    </div>

                                    {/* Progress bar (visual indicator) */}
                                    <div className="h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((kpi.value / (stats?.total || 1)) * 100, 100)}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                            className={cn("h-full rounded-full bg-gradient-to-r", kpi.gradient)}
                                        />
                                    </div>
                                </motion.div>

                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <div className={cn("w-full h-full rounded-full bg-gradient-to-br", kpi.gradient)} />
                                </div>
                            </div>

                            {/* Bottom accent line */}
                            <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", kpi.gradient)} />
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
}