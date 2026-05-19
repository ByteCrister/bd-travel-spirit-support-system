"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Bot, PanelLeftClose, PanelLeftOpen, Wifi } from "lucide-react";
import { useAiChatStore } from "@/store/ai-chat/ai-chat.store";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

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
        <section
            className="flex h-full min-w-0 flex-1 flex-col overflow-hidden"
            style={{
                background: "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
                fontFamily: "var(--font-dm-sans), sans-serif",
            }}
        >
            {/* Panel Header */}
            <header
                className="shrink-0 flex items-center gap-3 px-5 py-4"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(239,246,255,0.95) 0%, rgba(219,234,254,0.9) 100%)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(147,197,253,0.45)",
                    boxShadow:
                        "0 1px 0 rgba(255,255,255,0.8) inset, 0 1px 4px rgba(29,78,216,0.06)",
                }}
            >
                {/* Sidebar toggle button */}
                <motion.button
                    type="button"
                    onClick={onToggleSidebar}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.93 }}
                    className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150"
                    style={{
                        background: "rgba(147,197,253,0.2)",
                        border: "1px solid rgba(147,197,253,0.4)",
                        color: "#3b82f6",
                    }}
                    title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                    {sidebarOpen ? (
                        <PanelLeftClose className="h-4 w-4" />
                    ) : (
                        <PanelLeftOpen className="h-4 w-4" />
                    )}
                </motion.button>

                {/* Bot icon */}
                <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                        background: "linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)",
                        boxShadow:
                            "0 0 0 1px rgba(255,255,255,0.8) inset, 0 2px 8px rgba(29,78,216,0.12), 0 1px 2px rgba(29,78,216,0.08)",
                    }}
                >
                    <Bot className="h-5 w-5" style={{ color: "#1d4ed8" }} />
                    <span
                        className="pointer-events-none absolute inset-x-2 top-1 h-[40%] rounded-t-lg opacity-60"
                        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)" }}
                    />
                </motion.span>

                <div className="min-w-0 flex-1">
                    <motion.h2
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.3 }}
                        className="truncate text-base font-semibold"
                        style={{ color: "#1e3a8a", letterSpacing: "-0.02em" }}
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
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                                background: activeSessionId ? "#22c55e" : "#93c5fd",
                                boxShadow: activeSessionId ? "0 0 6px rgba(34,197,94,0.5)" : "none",
                            }}
                        />
                        <p className="text-xs" style={{ color: "#93c5fd" }}>
                            {activeSessionId ? "Session active" : "New conversation"}
                        </p>
                    </motion.div>
                </div>

                {/* Connection status */}
                <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                        background: "rgba(147,197,253,0.2)",
                        border: "1px solid rgba(147,197,253,0.4)",
                    }}
                >
                    <Wifi className="h-3.5 w-3.5" style={{ color: "#93c5fd" }} />
                </span>
            </header>

            {/* Error banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="shrink-0 mx-4 mt-3 overflow-hidden"
                    >
                        <div
                            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm"
                            style={{
                                background: "linear-gradient(145deg, rgba(254,242,242,0.95), rgba(254,226,226,0.9))",
                                border: "1px solid rgba(252,165,165,0.4)",
                                boxShadow: "0 2px 8px rgba(239,68,68,0.08)",
                                color: "#b91c1c",
                                fontFamily: "var(--font-dm-sans)",
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </span>
                            <button
                                type="button"
                                onClick={clearError}
                                className="text-xs font-medium underline underline-offset-2 opacity-70 hover:opacity-100"
                            >
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            {messagesLoading && messages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                            className="h-6 w-6 rounded-full border-2 border-transparent"
                            style={{ borderTopColor: "#3b82f6", borderRightColor: "rgba(59,130,246,0.25)" }}
                        />
                        <p className="text-sm" style={{ color: "#93c5fd", fontFamily: "var(--font-dm-sans)" }}>
                            Loading messages…
                        </p>
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

            {/* Input */}
            <div className="shrink-0">
                <ChatInput onSend={sendMessage} sending={sending} />
            </div>
        </section>
    );
}