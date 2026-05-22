"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Bot, PanelLeftClose, PanelLeftOpen, Wifi } from "lucide-react";
import { useAiChatStore } from "@/store/ai-chat/ai-chat.store";
import { cn } from "@/lib/utils";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

// ── Neumorphism style tokens ──────────────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_PANEL_HEADER =
    "bg-[#E7E5E4] shadow-[0_4px_10px_#c8c6c5,0_1px_0_#ffffff_inset] border-b border-white/60";
const NEU_BTN_ICON =
    "rounded-xl flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/50 " +
    "shadow-[1px_1px_2px_#c8c6c5,-1px_-1px_2px_#ffffff] " +   
    "hover:text-[#006666] hover:shadow-[inset_1px_1px_2px_#c8c6c5,inset_-1px_-1px_2px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_ICON_WELL =
    "rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";

// ─────────────────────────────────────────────────────────────────────────────

type ChatPanelProps = {
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
};

export function ChatPanel({ sidebarOpen, onToggleSidebar }: ChatPanelProps) {
    const {
        activeSessionId,
        activeSessionTitle,
        messages,
        messagesLoading,
        messagesHasMore,
        sending,
        error,
        sendMessage,
        fetchMoreMessages,
        clearError,
    } = useAiChatStore();

    return (
        <section className={cn(NEU_SURFACE, "flex h-full min-w-0 flex-1 flex-col overflow-hidden")}>

            {/* ── Panel header ── */}
            <header className={cn(NEU_PANEL_HEADER, "shrink-0 flex items-center gap-3 px-4 py-3 sm:px-5")}>

                {/* Sidebar toggle */}
                <motion.button
                    type="button"
                    onClick={onToggleSidebar}
                    whileTap={{ scale: 0.93 }}
                    className={cn(NEU_BTN_ICON, "h-9 w-9 shrink-0")}
                    title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                    {sidebarOpen ? (
                        <PanelLeftClose className="h-4 w-4" />
                    ) : (
                        <PanelLeftOpen className="h-4 w-4" />
                    )}
                </motion.button>

                {/* Bot icon well */}
                <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(NEU_ICON_WELL, "relative flex h-9 w-9 shrink-0 items-center justify-center")}
                >
                    <Bot className="h-4 w-4 text-[#006666]" strokeWidth={1.8} />
                </motion.span>

                {/* Title + status */}
                <div className="min-w-0 flex-1">
                    <motion.h2
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.3 }}
                        className={cn(NEU_HEADING, "truncate text-sm")}
                    >
                        {activeSessionTitle}
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mt-0.5 flex items-center gap-1.5"
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                            style={{
                                backgroundColor: activeSessionId ? "#00A63D" : "#1E2938",
                                opacity: activeSessionId ? 1 : 0.3,
                                boxShadow: activeSessionId ? "0 0 5px rgba(0,166,61,0.5)" : "none",
                            }}
                        />
                        <p className={cn(NEU_MUTED, "text-[11px]")}>
                            {activeSessionId ? "Session active" : "New conversation"}
                        </p>
                    </motion.div>
                </div>

                {/* Connection indicator */}
                <span className={cn(NEU_BTN_ICON, "h-9 w-9 shrink-0 pointer-events-none")}>
                    <Wifi className="h-3.5 w-3.5 text-[#006666]/60" />
                </span>
            </header>

            {/* ── Error banner ── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="shrink-0 mx-4 mt-3 overflow-hidden"
                    >
                        <div
                            className={cn(
                                NEU_CARD_SM,
                                "flex items-center justify-between gap-3 px-4 py-3 text-sm border-[#FF2157]/20"
                            )}
                        >
                            <span className="flex items-center gap-2 font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157] text-xs">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </span>
                            <button
                                type="button"
                                onClick={clearError}
                                className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#FF2157]/70 hover:text-[#FF2157] underline underline-offset-2 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Messages ── */}
            {messagesLoading && messages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                            className="h-6 w-6 rounded-full border-2 border-transparent"
                            style={{
                                borderTopColor: "#006666",
                                borderRightColor: "rgba(0,102,102,0.2)",
                            }}
                        />
                        <p className={cn(NEU_MUTED, "text-xs")}>Loading messages…</p>
                    </div>
                </div>
            ) : (
                <MessageList
                    messages={messages}
                    sending={sending}
                    loading={messagesLoading}
                    hasMore={messagesHasMore}
                    onLoadMore={activeSessionId ? () => void fetchMoreMessages() : undefined}
                />
            )}

            {/* ── Input ── */}
            <div className="shrink-0">
                <ChatInput onSend={sendMessage} sending={sending} />
            </div>
        </section>
    );
}