// /components/settings/enums/EnumSettingsPage.tsx
"use client";

import React, { JSX, useEffect } from "react";
import { AlertCircle, CheckCircle2, Database, Loader2, RefreshCw, Settings2, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { motion } from "framer-motion";
import useEnumSettingsStore from "@/store/enumSettings.store";
import EnumManagerShell from "./EnumManagerShell";

type StatusConfigItem = {
    icon: LucideIcon;
    color: string;
    bg: string;
    label: string;
    spin?: boolean;
};

type StatusKey = "idle" | "loading" | "success" | "error";

export default function EnumSettingsPage(): JSX.Element {
    const { fetchAll, status } = useEnumSettingsStore();

    useEffect(() => {
        void fetchAll({ force: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const statusConfig: Record<StatusKey, StatusConfigItem> = {
        idle: { icon: Database, color: "text-slate-600", bg: "bg-slate-50", label: "Ready" },
        loading: { icon: Loader2, color: "text-blue-600", bg: "bg-blue-50", label: "Syncing...", spin: true },
        success: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "Synced" },
        error: { icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", label: "Error" }
    };

    const currentStatus = statusConfig[status];
    const StatusIcon = currentStatus.icon;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                        delay: 0.1
                                    }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-20"></div>
                                    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                                        <Settings2 className="w-7 h-7 text-white" />
                                    </div>
                                </motion.div>

                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-1">
                                        Enum Manager
                                    </h1>
                                    <p className="text-slate-600 text-sm font-medium flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-blue-500" />
                                        Manage and organize your enumeration groups and values
                                    </p>
                                </div>
                            </div>

                            {/* Sync Status Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-3"
                            >
                                <motion.div
                                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${currentStatus.bg} border border-${currentStatus.color.replace('text-', '')}/20 shadow-sm`}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <StatusIcon
                                        className={`w-4 h-4 ${currentStatus.color} ${currentStatus.spin ? 'animate-spin' : ''}`}
                                    />
                                    <span className={`text-sm font-semibold ${currentStatus.color}`}>
                                        {currentStatus.label}
                                    </span>
                                </motion.div>

                                <motion.button
                                    whileHover={{ scale: 1.05, rotate: 180 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => void fetchAll({ force: true })}
                                    className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
                                    title="Refresh data"
                                >
                                    <RefreshCw className="w-4 h-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
                                </motion.button>
                            </motion.div>
                        </div>

                        {/* Divider */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
                        />
                    </div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <EnumManagerShell />
                    </motion.div>

                    {/* Footer Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 pt-6 border-t border-slate-200"
                    >
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                            <Database className="w-3.5 h-3.5" />
                            <span>System configurations are synced in real-time</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </main>
    );
}