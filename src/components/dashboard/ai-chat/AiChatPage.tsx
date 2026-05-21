"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { useAiChatStore } from "@/store/ai-chat/ai-chat.store";
import { spaceMono, jetbrainsMono } from "@/styles/fonts";
import { SessionSidebar } from "./SessionSidebar";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";

// ── Neumorphism style tokens ──────────────────────────────────────────────────
const NEU_PAGE_BG = "bg-[#E7E5E4]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_HEADER_SURFACE =
    "bg-[#E7E5E4] shadow-[0_4px_12px_#c8c6c5,0_1px_0_#ffffff_inset] border-b border-white/60";
const NEU_ICON_WELL_PRIMARY =
    "rounded-2xl bg-[#006666]/10 shadow-[3px_3px_7px_#c8c6c5,-3px_-3px_7px_#ffffff]";

// ─────────────────────────────────────────────────────────────────────────────

const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard/overview" },
    { label: "AI Assistant", href: "/dashboard/ai-chat" },
];

export function AiChatPage() {
    const reset = useAiChatStore((state) => state.reset);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        return () => reset();
    }, [reset]);

    return (
        <div
            className={cn(
                spaceMono.variable,
                jetbrainsMono.variable,
                NEU_PAGE_BG,
                "flex h-[calc(100vh-4rem)] flex-col overflow-hidden"
            )}
        >
            {/* ── Page Header ── */}
            <div className={cn(NEU_HEADER_SURFACE, "shrink-0 px-4 py-4 md:px-6")}>
                <Breadcrumbs items={breadcrumbItems} />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-3 flex items-center gap-4"
                >
                    {/* Icon well */}
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                            NEU_ICON_WELL_PRIMARY,
                            "relative flex h-12 w-12 shrink-0 items-center justify-center"
                        )}
                    >
                        <Sparkles className="h-5 w-5 text-[#006666]" strokeWidth={1.8} />
                    </motion.span>

                    <div>
                        <h1 className={cn(NEU_HEADING, "text-xl")}>AI Assistant</h1>
                        <p className={cn(NEU_MUTED, "mt-0.5 text-xs")}>
                            Query travelers, guides, tours, bookings &amp; revenue in natural language.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ── Body ── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
                <SessionSidebar open={sidebarOpen} />
                <ChatPanel
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen((v) => !v)}
                />
            </div>
        </div>
    );
}