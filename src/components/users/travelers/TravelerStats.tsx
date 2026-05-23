"use client";

// components/travelers/TravelerStats.tsx

import { motion, Variants } from "framer-motion";
import { TravelerListStats } from "@/types/user/traveler.types";
import {
  Users,
  UserCheck,
  UserX,
  Lock,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD = [
  "relative rounded-2xl bg-[#E7E5E4]",
  "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]",
  "border border-white/60",
  "p-4 h-full overflow-hidden",
  "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff]",
  "hover:-translate-y-0.5 transition-all duration-300",
].join(" ");

const NEU_ICON_WELL_BASE =
  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_VALUE =
  "font-[family-name:var(--font-space-mono)] text-2xl font-bold tracking-tight text-[#1E2938]";
const NEU_LABEL =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium mt-0.5 leading-tight";

// ── Stat configuration ────────────────────────────────────────
const statConfig = [
  {
    key: "totalTravelers" as keyof TravelerListStats,
    title: "Total Travelers",
    icon: Users,
    iconBg: "bg-[#006666]/10",
    iconColor: "text-[#006666]",
    labelColor: "text-[#006666]/70",
    accentBar: "bg-[#006666]",
  },
  {
    key: "activeCount" as keyof TravelerListStats,
    title: "Active",
    icon: UserCheck,
    iconBg: "bg-[#00A63D]/10",
    iconColor: "text-[#00A63D]",
    labelColor: "text-[#00A63D]/70",
    accentBar: "bg-[#00A63D]",
  },
  {
    key: "suspendedCount" as keyof TravelerListStats,
    title: "Suspended",
    icon: UserX,
    iconBg: "bg-[#FF2157]/10",
    iconColor: "text-[#FF2157]",
    labelColor: "text-[#FF2157]/70",
    accentBar: "bg-[#FF2157]",
  },
  {
    key: "lockedCount" as keyof TravelerListStats,
    title: "Locked",
    icon: Lock,
    iconBg: "bg-[#FE9900]/10",
    iconColor: "text-[#FE9900]",
    labelColor: "text-[#FE9900]/70",
    accentBar: "bg-[#FE9900]",
  },
  {
    key: "verifiedCount" as keyof TravelerListStats,
    title: "Verified",
    icon: ShieldCheck,
    iconBg: "bg-[#006666]/10",
    iconColor: "text-[#006666]",
    labelColor: "text-[#006666]/70",
    accentBar: "bg-[#006666]",
  },
  {
    key: "unverifiedCount" as keyof TravelerListStats,
    title: "Unverified",
    icon: ShieldOff,
    iconBg: "bg-[#1E2938]/8",
    iconColor: "text-[#1E2938]/50",
    labelColor: "text-[#1E2938]/40",
    accentBar: "bg-[#1E2938]/20",
  },
] as const;

// ── Animation variants ────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
};

// ── Component ─────────────────────────────────────────────────
interface TravelerStatsProps {
  stats: TravelerListStats;
}

export function TravelerStats({ stats }: TravelerStatsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {statConfig.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key] as number;

        return (
          <motion.div key={item.key} variants={cardVariants}>
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className={NEU_CARD}>
                {/* Accent bar top */}
                <div
                  className={`absolute top-0 left-4 right-4 h-0.5 rounded-b-full ${item.accentBar} opacity-60`}
                />

                <div className="relative flex flex-col gap-3 pt-1">
                  <div className={`${NEU_ICON_WELL_BASE} ${item.iconBg}`}>
                    <Icon
                      className={`h-4 w-4 ${item.iconColor}`}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <motion.p
                      className={NEU_VALUE}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {value.toLocaleString()}
                    </motion.p>
                    <p className={`${NEU_LABEL} ${item.labelColor}`}>
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
