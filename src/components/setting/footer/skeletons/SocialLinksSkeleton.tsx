// src/components/settings/settings/footers/skeletons/SocialLinksSkeleton.tsx
"use client";

import { motion } from "framer-motion";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 overflow-hidden";

const NEU_CARD_HEADER =
    "border-b border-white/60 bg-[#E7E5E4] px-6 py-5 shadow-[0_2px_4px_#c8c6c5]";

const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

const NEU_SKELETON_ROW =
    "rounded-xl bg-[#E7E5E4] p-4 shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
// ─────────────────────────────────────────────────────────────

export function SocialLinksSkeleton() {
    return (
        <div className={NEU_CARD}>
            {/* Header skeleton */}
            <div className={NEU_CARD_HEADER}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`${NEU_SKELETON} h-9 w-9 rounded-xl`} />
                        <div className="space-y-2">
                            <div className={`${NEU_SKELETON} h-5 w-28`} />
                            <div className={`${NEU_SKELETON} h-3.5 w-44`} />
                        </div>
                    </div>
                    <div className={`${NEU_SKELETON} h-9 w-24 rounded-xl`} />
                </div>
            </div>

            {/* Rows skeleton */}
            <div className="space-y-3 p-6">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={NEU_SKELETON_ROW}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex flex-1 items-center gap-4">
                                <div className={`${NEU_SKELETON} h-8 w-4 rounded`} />
                                <div className={`${NEU_SKELETON} h-4 w-4 rounded-full`} />
                                <div className="flex-1 space-y-2">
                                    <div className={`${NEU_SKELETON} h-4 w-28`} />
                                    <div className={`${NEU_SKELETON} h-3 w-44`} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className={`${NEU_SKELETON} h-8 w-16 rounded-xl`} />
                                <div className={`${NEU_SKELETON} h-8 w-16 rounded-xl`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}