// src/components/settings/settings/footer/FooterSettingsHeader.tsx
"use client";

import { motion } from "framer-motion";
import { Settings, Info } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const HEADER_CARD =
    "relative overflow-hidden rounded-2xl bg-[#E7E5E4] " +
    "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-6 sm:p-8";

const ICON_CONTAINER =
    "flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl " +
    "bg-[#006666] shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080]";

const TITLE_TEXT =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] " +
    "tracking-tight text-2xl sm:text-3xl lg:text-4xl";

const SUBTITLE_TEXT =
    "mt-1.5 flex items-center gap-2 font-[family-name:var(--font-jetbrains-mono)] " +
    "text-sm text-[#1E2938]/50";

const VERSION_BADGE =
    "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "text-[#006666] bg-[#006666]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

// ─────────────────────────────────────────────────────────────

type Props = { version?: number };

export function FooterSettingsHeader({ version }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={HEADER_CARD}
        >
            {/* Decorative blur blobs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#006666]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#006666]/8 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left — icon + text */}
                <div className="flex items-center gap-4">
                    <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 16 }}
                        className={ICON_CONTAINER}
                    >
                        <Settings className="h-7 w-7 text-white" />
                    </motion.div>

                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className={TITLE_TEXT}
                        >
                            Footer Settings
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className={SUBTITLE_TEXT}
                        >
                            <Info className="h-3.5 w-3.5 shrink-0" />
                            Manage social links and location entries
                        </motion.p>
                    </div>
                </div>

                {/* Right — version badge */}
                {typeof version === "number" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 220 }}
                        className="self-start sm:self-auto"
                    >
                        <span className={VERSION_BADGE}>v{version}</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}