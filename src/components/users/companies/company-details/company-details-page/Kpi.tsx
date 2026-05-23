"use cleint";

import CountUp from "react-countup";
import { motion } from "framer-motion";

// ── Neumorphic style tokens ───────────────────────────────────
const NEU_KPI_CARD =
    "relative overflow-hidden rounded-2xl bg-[#E7E5E4] " +
    "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] " +
    "border border-white/60 p-4 " +
    "hover:shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] " +
    "hover:-translate-y-0.5 transition-all duration-300 group";

const NEU_KPI_ICON_WELL =
    "flex h-9 w-9 items-center justify-center rounded-xl " +
    "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.4)] " +
    "group-hover:scale-110 transition-transform duration-200";

const NEU_KPI_VALUE =
    "text-2xl font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]";

const NEU_KPI_LABEL =
    "text-xs font-[family-name:var(--font-space-mono)] font-bold uppercase tracking-widest text-[#1E2938]/55 leading-tight mt-1";

interface KpiProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    decimals?: number;
    color: string;
    bgColor: string;
    iconBg: string;
    delay?: number;
}

export default function Kpi({
    icon: Icon,
    label,
    value,
    decimals = 0,
    iconBg,
    delay = 0,
}: KpiProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.3, ease: "easeOut" }}
            className={NEU_KPI_CARD}
        >
            {/* subtle inner highlight */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

            <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                    <div className={`${NEU_KPI_ICON_WELL} ${iconBg}`}>
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className={NEU_KPI_VALUE}>
                        <CountUp end={value} decimals={decimals} duration={1.5} separator="," />
                    </span>
                </div>
                <p className={NEU_KPI_LABEL}>{label}</p>
            </div>
        </motion.div>
    );
}