"use client";

import { useCallback, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Plus, MessageSquare, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiChatStore } from "@/store/ai-chat/ai-chat.store";
import { cn } from "@/lib/utils";
import type { AiChatSession } from "@/types/ai-chat";

// ── Neumorphism style tokens ──────────────────────────────────────────────────
const NEU_SIDEBAR_BG =
    "bg-[#E7E5E4] shadow-[4px_0_12px_#c8c6c5] border-r border-white/70";
const NEU_BTN_PRIMARY =
    "w-full rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold text-sm tracking-wide " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_SKELETON = "rounded-xl bg-[#d0cecd] animate-pulse";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_ICON_WELL =
    "rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_SESSION_ACTIVE =
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] bg-[#E7E5E4]";
const NEU_SESSION_IDLE =
    "shadow-[3px_3px_7px_#c8c6c5,-3px_-3px_7px_#ffffff] bg-[#E7E5E4] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

// ─────────────────────────────────────────────────────────────────────────────

type SessionSidebarProps = { open: boolean };

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
                    className={cn(
                        NEU_SIDEBAR_BG,
                        "flex h-full flex-col overflow-hidden md:w-72 lg:w-72"
                    )}
                    style={{ minWidth: open ? undefined : 0 }}
                >
                    {/* ── Sidebar header ── */}
                    <header className={cn("shrink-0 p-3 border-b", NEU_DIVIDER)}>
                        <motion.button
                            type="button"
                            onClick={startNewSession}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(NEU_BTN_PRIMARY, "flex items-center justify-center gap-2 px-4 py-2.5")}
                        >
                            <Plus className="h-4 w-4" strokeWidth={2.5} />
                            New conversation
                        </motion.button>
                    </header>

                    {/* ── Section label ── */}
                    <div className="shrink-0 px-4 pb-1 pt-4">
                        <span className={NEU_LABEL}>Recent chats</span>
                    </div>

                    {/* ── Scrollable session list ── */}
                    <section
                        ref={listRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto px-2 pb-4"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {sessionsLoading && sessions.length === 0 ? (
                            <ul className="mt-2 space-y-2 px-1">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <li key={i} className={cn(NEU_SKELETON, "h-16 w-full")} />
                                ))}
                            </ul>
                        ) : sessions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-8 flex flex-col items-center gap-3 px-4 text-center"
                            >
                                <span className={cn(NEU_ICON_WELL, "flex h-12 w-12 items-center justify-center")}>
                                    <MessageSquare className="h-5 w-5 text-[#1E2938]/40" strokeWidth={1.5} />
                                </span>
                                <p className={cn(NEU_MUTED, "text-xs")}>
                                    No chats yet.
                                    <br />
                                    Start a new conversation.
                                </p>
                            </motion.div>
                        ) : (
                            <AnimatePresence initial={false}>
                                <ul className="mt-2 space-y-1.5">
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
                                <Loader2 className="h-4 w-4 animate-spin text-[#006666]" />
                            </div>
                        )}
                    </section>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

// ── Session item ──────────────────────────────────────────────────────────────
function SessionItem({
    session,
    isActive,
    onSelect,
}: {
    session: AiChatSession;
    isActive: boolean;
    onSelect: () => void;
}) {
    const MAX_PREVIEW_LENGTH = 22;
    const rawPreview = session.lastMessagePreview || "No messages yet";
    const preview =
        rawPreview.length > MAX_PREVIEW_LENGTH
            ? `${rawPreview.slice(0, MAX_PREVIEW_LENGTH)}…`
            : rawPreview;

    const timeLabel = session.lastMessageAt
        ? formatDistanceToNow(new Date(session.lastMessageAt), { addSuffix: true })
        : formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true });

    return (
        <motion.button
            type="button"
            onClick={onSelect}
            whileTap={{ scale: 0.99 }}
            className={cn(
                "relative w-full rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                isActive ? NEU_SESSION_ACTIVE : NEU_SESSION_IDLE
            )}
        >
            {/* Active accent bar */}
            {isActive && (
                <span
                    className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-[#006666]"
                />
            )}

            {/* Title */}
            <span
                className={cn(
                    "block truncate text-xs font-bold font-[family-name:var(--font-space-mono)]",
                    isActive ? "text-[#006666]" : "text-[#1E2938]"
                )}
            >
                {session.title}
            </span>

            {/* Preview */}
            <span className="mt-0.5 block truncate font-[family-name:var(--font-jetbrains-mono)] text-[11px] text-[#1E2938]/50">
                {preview}
            </span>

            {/* Timestamp */}
            <span className="mt-1 flex items-center gap-1 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[#1E2938]/30">
                <Clock className="h-2.5 w-2.5" />
                {timeLabel}
            </span>
        </motion.button>
    );
}