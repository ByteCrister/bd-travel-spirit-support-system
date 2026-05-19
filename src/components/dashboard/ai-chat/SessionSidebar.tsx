"use client";

import { useCallback, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Plus, MessageSquare, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiChatStore } from "@/store/ai-chat/ai-chat.store";
import type { AiChatSession } from "@/types/ai-chat";

type SessionSidebarProps = {
    open: boolean;
};

export function SessionSidebar({ open }: SessionSidebarProps) {
    const {
        sessions,
        activeSessionId,
        sessionsLoading,
        sessionsHasMore,
        fetchSessionsInitial,
        fetchMoreSessions,
        selectSession,
        startNewSession,
    } = useAiChatStore();

    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        void fetchSessionsInitial();
    }, [fetchSessionsInitial]);

    const handleScroll = useCallback(() => {
        const node = listRef.current;
        if (!node || sessionsLoading || !sessionsHasMore) return;
        const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
        if (distanceFromBottom < 80) void fetchMoreSessions();
    }, [sessionsLoading, sessionsHasMore, fetchMoreSessions]);

    return (
        <AnimatePresence initial={false}>
            {open && (
                <motion.aside
                    key="sidebar"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="flex h-full flex-col overflow-hidden md:w-80 lg:w-72"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(239,246,255,0.97) 0%, rgba(219,234,254,0.97) 100%)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        borderRight: "1px solid rgba(147,197,253,0.5)",
                        boxShadow: "1px 0 0 0 rgba(255,255,255,0.7)",
                        minWidth: open ? undefined : 0,
                    }}
                >
                    {/* Header */}
                    <header
                        className="shrink-0 p-3"
                        style={{ borderBottom: "1px solid rgba(147,197,253,0.4)" }}
                    >
                        <motion.button
                            type="button"
                            onClick={startNewSession}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative w-full overflow-hidden rounded-xl px-4 py-2.5 text-sm font-medium text-white"
                            style={{
                                background: "linear-gradient(145deg, #1d4ed8 0%, #1e3a8a 100%)",
                                boxShadow:
                                    "0 0 0 1px rgba(255,255,255,0.15) inset, 0 3px 12px rgba(29,78,216,0.35), 0 1px 2px rgba(30,58,138,0.3)",
                                fontFamily: "var(--font-dm-sans), sans-serif",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {/* Gloss */}
                            <span
                                className="pointer-events-none absolute inset-x-3 top-1 h-[45%] rounded-lg opacity-[0.2]"
                                style={{ background: "linear-gradient(180deg, #fff 0%, transparent 100%)" }}
                            />
                            <span className="relative flex items-center justify-center gap-2">
                                <Plus className="h-4 w-4" />
                                New conversation
                            </span>
                        </motion.button>
                    </header>

                    {/* Label */}
                    <div className="shrink-0 px-4 pb-1 pt-4">
                        <span
                            className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                            style={{ color: "#93c5fd", fontFamily: "var(--font-dm-sans), sans-serif" }}
                        >
                            Recent chats
                        </span>
                    </div>

                    {/* Scrollable list */}
                    <section
                        ref={listRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto px-2 pb-4"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {sessionsLoading && sessions.length === 0 ? (
                            <ul className="mt-2 space-y-1.5 px-1">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <li key={i}>
                                        <Skeleton
                                            className="h-[64px] w-full rounded-xl"
                                            style={{
                                                background:
                                                    "linear-gradient(90deg, rgba(191,219,254,0.5) 0%, rgba(219,234,254,0.5) 50%, rgba(191,219,254,0.5) 100%)",
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        ) : sessions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-8 flex flex-col items-center gap-3 px-4 text-center"
                            >
                                <span
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                                    style={{
                                        background: "rgba(147,197,253,0.2)",
                                        border: "1px solid rgba(147,197,253,0.45)",
                                    }}
                                >
                                    <MessageSquare className="h-5 w-5" style={{ color: "#93c5fd" }} />
                                </span>
                                <p className="text-sm" style={{ color: "#93c5fd", fontFamily: "var(--font-dm-sans)" }}>
                                    No chats yet.
                                    <br />
                                    Start a new conversation.
                                </p>
                            </motion.div>
                        ) : (
                            <AnimatePresence initial={false}>
                                <ul className="mt-1 space-y-0.5">
                                    {sessions.map((session, i) => (
                                        <motion.li
                                            key={session.sessionId}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <SessionItem
                                                session={session}
                                                isActive={activeSessionId === session.sessionId}
                                                onSelect={() => void selectSession(session.sessionId)}
                                            />
                                        </motion.li>
                                    ))}
                                </ul>
                            </AnimatePresence>
                        )}

                        {sessionsLoading && sessions.length > 0 && (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#93c5fd" }} />
                            </div>
                        )}
                    </section>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

function SessionItem({
    session,
    isActive,
    onSelect,
}: {
    session: AiChatSession;
    isActive: boolean;
    onSelect: () => void;
}) {
    const MAX_PREVIEW_LENGTH = 20;
    const rawPreview = session.lastMessagePreview || "No messages yet";
    const preview =
        rawPreview.length > MAX_PREVIEW_LENGTH
            ? `${rawPreview.slice(0, MAX_PREVIEW_LENGTH)}...`
            : rawPreview;

    const timeLabel = session.lastMessageAt
        ? formatDistanceToNow(new Date(session.lastMessageAt), { addSuffix: true })
        : formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true });

    return (
        <motion.button
            type="button"
            onClick={onSelect}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            className="relative w-full overflow-hidden rounded-xl px-3 py-2.5 text-left transition-all duration-200"
            style={{
                background: isActive
                    ? "linear-gradient(145deg, rgba(239,246,255,0.98) 0%, rgba(219,234,254,0.92) 100%)"
                    : "transparent",
                boxShadow: isActive
                    ? "0 0 0 1px rgba(147,197,253,0.55), 0 2px 8px rgba(29,78,216,0.1), 0 1px 2px rgba(29,78,216,0.06)"
                    : "none",
                fontFamily: "var(--font-dm-sans), sans-serif",
            }}
        >
            {isActive && (
                <span
                    className="pointer-events-none absolute inset-x-2 top-1 h-[40%] rounded-t-lg opacity-50"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, transparent 100%)" }}
                />
            )}
            {!isActive && (
                <span
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 hover:opacity-100"
                    style={{ background: "rgba(147,197,253,0.15)" }}
                />
            )}
            <span
                className="relative block truncate text-sm font-semibold"
                style={{ color: isActive ? "#1e3a8a" : "#1e40af", letterSpacing: "-0.01em" }}
            >
                {session.title}
            </span>
            <span
                className="relative mt-0.5 block truncate text-xs"
                style={{ color: isActive ? "#3b82f6" : "#93c5fd" }}
            >
                {preview}
            </span>
            <span
                className="relative mt-1 flex items-center gap-1 text-[10px]"
                style={{ color: "#bfdbfe" }}
            >
                <Clock className="h-2.5 w-2.5" />
                {timeLabel}
            </span>
        </motion.button>
    );
}