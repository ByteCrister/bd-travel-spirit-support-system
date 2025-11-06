"use client";

import React from "react";
import { CountUp } from "./primitives/CountUp";
import { Skeleton } from "./primitives/Skeleton";
import {
    Users,
    UserCheck,
    UserMinus,
    UserX,
    LucideIcon,
} from "lucide-react";

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

interface CardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    loading: boolean;
    tone?: "primary" | "success" | "warning" | "danger" | "muted";
}

type Tone = "primary" | "success" | "warning" | "danger" | "muted";

const TONE_STYLES: Record<
    Tone,
    { bg: string; text: string; iconBg: string; ring?: string }
> = {
    primary: {
        bg: "bg-gradient-to-br from-primary/5 to-primary/2",
        text: "text-primary dark:text-primary-300",
        iconBg: "bg-primary/10 text-primary",
        ring: "ring-1 ring-primary/10",
    },
    success: {
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-25",
        text: "text-emerald-600",
        iconBg: "bg-emerald-50 text-emerald-600",
        ring: "ring-1 ring-emerald-50",
    },
    warning: {
        bg: "bg-gradient-to-br from-amber-50 to-amber-25",
        text: "text-amber-600",
        iconBg: "bg-amber-50 text-amber-600",
        ring: "ring-1 ring-amber-50",
    },
    danger: {
        bg: "bg-gradient-to-br from-red-50 to-red-25",
        text: "text-destructive",
        iconBg: "bg-destructive/10 text-destructive",
        ring: "ring-1 ring-destructive/10",
    },
    muted: {
        bg: "bg-background",
        text: "text-muted-foreground",
        iconBg: "bg-muted/10 text-muted-foreground",
    },
};

const StatCard: React.FC<CardProps> = ({
    icon: Icon,
    label,
    value,
    loading,
    tone,
}) => {
    const safeTone: Tone = (tone ?? "muted") as Tone;
    const styles = TONE_STYLES[safeTone];

    return (
        <div
            className={`flex flex-col justify-between gap-4 rounded-2xl border border-border/60 p-4 shadow-sm transition-shadow duration-150 hover:shadow-md focus-within:shadow-md ${styles.bg} ${styles.ring ?? ""
                }`}
            role="group"
            aria-label={`${label} statistic`}
            tabIndex={0}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.iconBg} shadow-sm`}
                        aria-hidden="true"
                    >
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex flex-col">
                        <span className={`text-sm font-medium ${styles.text}`}>{label}</span>
                        <span className="mt-0.5 text-xs text-muted-foreground/80">Overview</span>
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="hidden h-10 w-px bg-border/50 md:block" />
                </div>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-3">
                <div className="text-2xl font-semibold leading-none">
                    {loading ? <Skeleton className="h-8 w-20 rounded-md" /> : <CountUp value={value} />}
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    <span className="text-xs text-muted-foreground/80">As of now</span>
                </div>
            </div>
        </div>
    );
};

export function EmployeeSummary({ summary, loading }: EmployeeSummaryProps) {
    const metrics: CardProps[] = [
        { icon: Users, label: "Total Employees", value: summary.total, loading, tone: "primary" },
        { icon: UserCheck, label: "Active", value: summary.active, loading, tone: "success" },
        { icon: UserMinus, label: "On Leave", value: summary.onLeave, loading, tone: "warning" },
        { icon: UserX, label: "Suspended", value: summary.suspended, loading, tone: "danger" },
        { icon: UserX, label: "Terminated", value: summary.terminated, loading, tone: "muted" },
    ];

    return (
        <section aria-labelledby="employee-summary-heading" className="w-full">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h3 id="employee-summary-heading" className="text-base font-semibold">
                        Employee Summary
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Snapshot of company headcount and status distribution
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {metrics.map((m) => (
                    <StatCard
                        key={m.label}
                        icon={m.icon}
                        label={m.label}
                        value={m.value}
                        loading={m.loading}
                        tone={m.tone}
                    />
                ))}
            </div>
        </section>
    );
}
