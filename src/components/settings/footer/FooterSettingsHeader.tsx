// src/components/settings/settings/footer/FooterSettingsHeader.tsx
"use client";

import { motion } from "framer-motion";
import { Settings, Info, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = { version?: number };

export function FooterSettingsHeader({ version }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/40 p-8 shadow-xl dark:border-slate-800/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30"
        >
            {/* Decorative Elements */}
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-gradient-to-tr from-purple-400/15 to-pink-400/15 blur-2xl" />
            
            {/* Floating Sparkles */}
            <motion.div
                animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute right-24 top-8"
            >
                <Sparkles className="h-5 w-5 text-indigo-400/60" />
            </motion.div>

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ 
                                delay: 0.3, 
                                type: "spring", 
                                stiffness: 200,
                                damping: 15
                            }}
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30"
                        >
                            <Settings className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-slate-100 dark:to-slate-300"
                            >
                                Footer Settings
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
                            >
                                <Info className="h-4 w-4" />
                                Manage social links and location entries
                            </motion.p>
                        </div>
                    </div>
                </div>
                {typeof version === "number" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    >
                        <Badge 
                            variant="secondary" 
                            className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm dark:text-blue-300"
                        >
                            v{version}
                        </Badge>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}