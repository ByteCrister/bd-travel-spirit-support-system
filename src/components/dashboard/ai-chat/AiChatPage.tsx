"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { useAiChatStore } from "@/store/ai-chat/ai-chat.store";
import { spaceMono, jetbrainsMono } from "@/styles/fonts";
import { SessionSidebar } from "./SessionSidebar";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    const router = useRouter();
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
            <Breadcrumbs items={breadcrumbItems} />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="absolute top-4 left-4 rounded-full"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
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