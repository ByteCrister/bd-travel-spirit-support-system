"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { useAiChatStore } from "@/store/ai-chat/ai-chat.store";
import { inter, playfair } from "@/styles/fonts";
import { SessionSidebar } from "./SessionSidebar";
import { ChatPanel } from "./ChatPanel";

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
            className={`${inter.variable} ${playfair.variable} flex h-[calc(100vh-4rem)] flex-col overflow-hidden`}
            style={{
                background:
                    "linear-gradient(160deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)",
                fontFamily: "var(--font-inter), sans-serif",
            }}
        >
            {/* Header */}
            <div
                className="shrink-0 border-b px-4 py-4 md:px-6"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(239,246,255,0.95) 0%, rgba(219,234,254,0.9) 100%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    borderColor: "rgba(147,197,253,0.5)",
                    boxShadow:
                        "0 1px 0 0 rgba(255,255,255,0.8) inset, 0 1px 3px 0 rgba(29,78,216,0.06)",
                }}
            >
                <Breadcrumbs items={breadcrumbItems} />
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-3 flex items-center gap-4"
                >
                    {/* Icon */}
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                        style={{
                            background: "linear-gradient(145deg, #1d4ed8 0%, #1e3a8a 100%)",
                            boxShadow:
                                "0 0 0 1px rgba(255,255,255,0.15) inset, 0 4px 16px rgba(29,78,216,0.35), 0 1px 3px rgba(30,58,138,0.25)",
                        }}
                    >
                        <Sparkles className="h-5 w-5 text-white/90" />
                        {/* Gloss reflection */}
                        <span
                            className="absolute inset-x-2 top-1.5 h-[40%] rounded-t-xl opacity-20"
                            style={{
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)",
                            }}
                        />
                    </motion.span>

                    <div>
                        <h1
                            className="text-xl font-semibold tracking-[-0.02em]"
                            style={{
                                color: "#1e3a8a",
                                fontFamily: "var(--font-playfair), serif",
                                letterSpacing: "-0.025em",
                            }}
                        >
                            AI Assistant
                        </h1>
                        <p
                            className="mt-0.5 text-sm"
                            style={{
                                color: "#60a5fa",
                                fontFamily: "var(--font-inter), sans-serif",
                            }}
                        >
                            Query travelers, guides, tours, bookings &amp; revenue in natural
                            language.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Body */}
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
