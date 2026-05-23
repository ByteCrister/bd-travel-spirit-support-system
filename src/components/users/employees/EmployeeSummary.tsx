"use client";

import React from "react";
import { CountUp } from "./primitives/CountUp";
import { Users, UserCheck, UserMinus, UserX, LucideIcon } from "lucide-react";

// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_CARD_HOVER =
  "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";

const NEU_SURFACE_INSET =
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40";

const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
// ───────────────────────────────────────────────────────────────

type Tone = "primary" | "success" | "warning" | "danger" | "muted";

const TONE: Record<Tone, { iconBg: string; iconText: string; valueText: string }> = {
  primary:  { iconBg: "bg-[#006666]/10", iconText: "text-[#006666]", valueText: "text-[#006666]" },
  success:  { iconBg: "bg-[#00A63D]/10", iconText: "text-[#00A63D]", valueText: "text-[#00A63D]" },
  warning:  { iconBg: "bg-[#FE9900]/10", iconText: "text-[#FE9900]", valueText: "text-[#FE9900]" },
  danger:   { iconBg: "bg-[#FF2157]/10", iconText: "text-[#FF2157]", valueText: "text-[#FF2157]" },
  muted:    { iconBg: "bg-[#1E2938]/5",  iconText: "text-[#1E2938]/40", valueText: "text-[#1E2938]/50" },
};

interface CardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  loading: boolean;
  tone?: Tone;
}

const StatCard: React.FC<CardProps> = ({ icon: Icon, label, value, loading, tone = "muted" }) => {
  const t = TONE[tone];
  return (
    <div
      className={`${NEU_CARD} ${NEU_CARD_HOVER} p-4 flex flex-col justify-between gap-4`}
      role="group"
      aria-label={`${label} statistic`}
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.iconBg} ${NEU_SURFACE_INSET}`}
            aria-hidden="true"
          >
            <Icon className={`h-5 w-5 ${t.iconText}`} />
          </div>
          <div>
            <p className={NEU_LABEL}>{label}</p>
            <p className={NEU_MUTED}>Overview</p>
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-2xl font-bold font-[family-name:var(--font-space-mono)] ${t.valueText}`}>
          {loading ? (
            <div className={`${NEU_SKELETON} h-7 w-20`} />
          ) : (
            <CountUp value={value} />
          )}
        </div>
        <span className={NEU_MUTED}>As of now</span>
      </div>
    </div>
  );
};

interface EmployeeSummaryProps {
  summary: {
    total: number;
    active: number;
    onLeave: number;
    suspended: number;
    terminated: number;
  };
  loading: boolean;
}

export function EmployeeSummary({ summary, loading }: EmployeeSummaryProps) {
  const metrics: CardProps[] = [
    { icon: Users,     label: "Total Employees", value: summary.total,      loading, tone: "primary" },
    { icon: UserCheck, label: "Active",           value: summary.active,     loading, tone: "success" },
    { icon: UserMinus, label: "On Leave",         value: summary.onLeave,    loading, tone: "warning" },
    { icon: UserX,     label: "Suspended",        value: summary.suspended,  loading, tone: "danger"  },
    { icon: UserX,     label: "Terminated",       value: summary.terminated, loading, tone: "muted"   },
  ];

  return (
    <section aria-labelledby="employee-summary-heading" className="w-full">
      <div className="mb-4">
        <h3 id="employee-summary-heading" className={`text-base ${NEU_HEADING}`}>
          Employee Summary
        </h3>
        <p className={`mt-1 ${NEU_MUTED}`}>
          Snapshot of company headcount and status distribution
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {metrics.map((m) => (
          <StatCard key={m.label} {...m} />
        ))}
      </div>
    </section>
  );
}