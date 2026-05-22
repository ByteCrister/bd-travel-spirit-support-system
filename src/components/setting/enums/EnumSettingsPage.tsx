// /components/settings/enums/EnumSettingsPage.tsx
"use client";

import React, { JSX, useEffect } from "react";
import { AlertCircle, CheckCircle2, Database, Loader2, RefreshCw, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import useEnumSettingsStore from "@/store/site-settings/enumSettings.store";
import EnumManagerShell from "./EnumManagerShell";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
    page: "min-h-screen bg-[#E7E5E4] p-4 lg:p-6 xl:p-8",
    wrapper: "max-w-7xl mx-auto",
    header: "mb-8",
    headerRow: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
    iconWell:
        "relative flex-none p-3 rounded-2xl bg-[#006666] shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080]",
    titleBlock: "flex items-center gap-4",
    heading:
        "text-3xl font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] tracking-tight",
    subheading:
        "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60 mt-1",
    statusRow: "flex items-center gap-3",
    statusBadge:
        "flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#E7E5E4] " +
        "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/60",
    statusLabel:
        "text-sm font-semibold font-[family-name:var(--font-space-mono)]",
    refreshBtn:
        "p-2.5 rounded-xl bg-[#E7E5E4] text-[#1E2938]/60 " +
        "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
        "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40",
    divider: "h-px bg-[#1E2938]/10 mb-8",
    footer: "mt-8 pt-6 border-t border-[#1E2938]/10 flex items-center justify-center gap-2",
    footerText: "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50",
};

type StatusConfigItem = {
    icon: LucideIcon;
    color: string;
    label: string;
    spin?: boolean;
};
type StatusKey = "idle" | "loading" | "success" | "error";

const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Enums", href: "/setting/enums" },
];

export default function EnumSettingsPage(): JSX.Element {
    const { fetchAll, status } = useEnumSettingsStore();

    useEffect(() => {
        void fetchAll({ force: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const statusConfig: Record<StatusKey, StatusConfigItem> = {
        idle: { icon: Database, color: "text-[#1E2938]/60", label: "Ready" },
        loading: { icon: Loader2, color: "text-[#006666]", label: "Syncing...", spin: true },
        success: { icon: CheckCircle2, color: "text-[#00A63D]", label: "Synced" },
        error: { icon: AlertCircle, color: "text-[#FF2157]", label: "Error" },
    };

    const currentStatus = statusConfig[status as StatusKey] ?? statusConfig.idle;
    const StatusIcon = currentStatus.icon;

    return (
        <main className={S.page}>
            <Breadcrumbs items={breadcrumbItems} />
            <div className={S.wrapper}>
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {/* Header */}
                    <div className={S.header}>
                        <div className={S.headerRow}>
                            {/* Title */}
                            <div className={S.titleBlock}>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                    className={S.iconWell}
                                >
                                    <Settings2 className="w-7 h-7 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className={S.heading}>Enum Manager</h1>
                                    <p className={S.subheading}>
                                        Manage and organize your enumeration groups and values
                                    </p>
                                </div>
                            </div>

                            {/* Sync status */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className={S.statusRow}
                            >
                                <div className={S.statusBadge}>
                                    <StatusIcon
                                        className={`w-4 h-4 ${currentStatus.color} ${currentStatus.spin ? "animate-spin" : ""}`}
                                    />
                                    <span className={`${S.statusLabel} ${currentStatus.color}`}>
                                        {currentStatus.label}
                                    </span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => void fetchAll({ force: true })}
                                    className={S.refreshBtn}
                                    title="Refresh data"
                                    aria-label="Refresh data"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </motion.button>
                            </motion.div>
                        </div>

                        <div className={S.divider} />
                    </div>

                    {/* Shell */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <EnumManagerShell />
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className={S.footer}
                    >
                        <Database className="w-3.5 h-3.5 text-[#1E2938]/40" />
                        <span className={S.footerText}>System configurations are synced in real-time</span>
                    </motion.div>
                </motion.div>
            </div>
        </main>
    );
}