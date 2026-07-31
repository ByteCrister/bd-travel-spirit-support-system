"use client";

import { useEffect, useState } from "react";
import { useAiChatStore } from "@/store/ai-chat/ai-chat.store";
import { spaceMono, jetbrainsMono } from "@/styles/fonts";
import { SessionSidebar } from "./SessionSidebar";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";

// ── Neumorphism style tokens ──────────────────────────────────────────────────
const NEU_PAGE_BG = "bg-[#E7E5E4]";

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
                "flex h-[calc(100vh-4rem)] md:p-4 p-2 flex-col overflow-hidden"
            )}
        >
            {/* ── Body ── */}
            <div className="flex min-h-0 flex-1 overflow-hidden relative">
                <SessionSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className={cn("flex-1 min-w-0 flex", sidebarOpen ? "hidden md:flex" : "flex")}>
                    <ChatPanel
                        sidebarOpen={sidebarOpen}
                        onToggleSidebar={() => setSidebarOpen((v) => !v)}
                    />
                </div>
            </div>
        </div>
    );
}