// src/components/settings/settings/footer/SocialLinksPanel.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Share2, Sparkles } from "lucide-react";
import type { FooterEntities } from "@/types/site-settings/footer-settings.types";
import { useFooterStore } from "@/store/site-settings/footerSettings.store";
import { SocialLinkRow } from "./SocialLinkRow";
import { SocialLinkFormDialog } from "./SocialLinkFormDialog";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 overflow-hidden";

const NEU_CARD_HEADER =
    "border-b border-white/40 bg-[#E7E5E4] px-5 py-5 sm:px-6";

const NEU_ICON_WELL =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#006666] " +
    "shadow-[3px_3px_6px_#004d4d,-2px_-2px_5px_#008080]";

const NEU_TITLE =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-lg sm:text-xl tracking-tight";

const NEU_SUBTITLE =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

const NEU_BTN_PRIMARY =
    "flex items-center gap-2 rounded-xl bg-[#006666] px-4 py-2 text-sm text-white " +
    "font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_EMPTY_WELL =
    "flex h-20 w-20 items-center justify-center rounded-2xl bg-[#E7E5E4] " +
    "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";

const NEU_EMPTY_TITLE =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-lg";

const NEU_EMPTY_SUBTITLE =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
// ─────────────────────────────────────────────────────────────

type Props = { entities: FooterEntities | null };

export function SocialLinksPanel({ entities }: Props) {
    const [open, setOpen] = useState(false);
    const { setEditingSocialLinkId } = useFooterStore();

    const order = entities?.socialLinkOrder ?? [];
    const byId = entities?.socialLinksById ?? {};

    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
        >
            <div className={NEU_CARD}>
                {/* Header */}
                <div className={NEU_CARD_HEADER}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={NEU_ICON_WELL}>
                                <Share2 className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h2 className={NEU_TITLE}>Social Links</h2>
                                <p className={NEU_SUBTITLE}>Connect your social media profiles</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                                setEditingSocialLinkId(null);
                                setOpen(true);
                            }}
                            className={NEU_BTN_PRIMARY}
                        >
                            <Plus className="h-4 w-4" />
                            Add Link
                        </motion.button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                    <AnimatePresence mode="wait">
                        {order.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                className="flex flex-col items-center justify-center py-16 text-center"
                            >
                                <motion.div
                                    animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className={NEU_EMPTY_WELL}
                                >
                                    <Sparkles className="h-9 w-9 text-[#006666]" />
                                </motion.div>
                                <p className={`mt-5 mb-1.5 ${NEU_EMPTY_TITLE}`}>No social links yet</p>
                                <p className={NEU_EMPTY_SUBTITLE}>Add your first social media link to get started</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                {order.map((id, index) => (
                                    <motion.div
                                        key={id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <SocialLinkRow link={byId[id]} onEdit={() => setOpen(true)} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <SocialLinkFormDialog open={open} onOpenChange={setOpen} />
        </motion.div>
    );
}