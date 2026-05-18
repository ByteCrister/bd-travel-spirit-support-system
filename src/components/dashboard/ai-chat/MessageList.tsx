"use client";

import { useCallback, useEffect, useRef } from "react";
import { Loader2, Database, TrendingUp, Users, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import type { AiChatMessage } from "@/types/ai-chat";

type MessageListProps = {
    messages: AiChatMessage[];
    sending?: boolean;
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
};

const QUICK_PROMPTS = [
    { icon: Users, label: "Show pending guides" },
    { icon: MapPin, label: "Travelers from Dhaka" },
    { icon: TrendingUp, label: "Revenue this month" },
    { icon: Database, label: "All active tours" },
];

export function MessageList({
    messages,
    sending = false,
    loading = false,
    hasMore = false,
    onLoadMore,
}: MessageListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const shouldStickToBottomRef = useRef(true);
    const prevScrollHeightRef = useRef(0);
    const loadingMoreRef = useRef(false);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        bottomRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const onScroll = () => {
            const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
            shouldStickToBottomRef.current = distanceFromBottom < 120;

            if (node.scrollTop < 80 && hasMore && !loading && !loadingMoreRef.current && onLoadMore) {
                loadingMoreRef.current = true;
                prevScrollHeightRef.current = node.scrollHeight;
                void Promise.resolve(onLoadMore()).finally(() => {
                    loadingMoreRef.current = false;
                });
            }
        };

        node.addEventListener("scroll", onScroll, { passive: true });
        return () => node.removeEventListener("scroll", onScroll);
    }, [hasMore, loading, onLoadMore]);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        if (loading && prevScrollHeightRef.current > 0) {
            const delta = node.scrollHeight - prevScrollHeightRef.current;
            node.scrollTop = delta;
            prevScrollHeightRef.current = 0;
            return;
        }

        if (shouldStickToBottomRef.current) {
            scrollToBottom(messages.length <= 2 ? "auto" : "smooth");
        }
    }, [messages, sending, loading, scrollToBottom]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 py-6"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(200,200,210,0.4) transparent" }}
        >
            {/* Load more indicator */}
            {hasMore && (
                <div className="mb-5 flex justify-center">
                    {loading ? (
                        <div
                            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
                            style={{
                                background: "rgba(255,255,255,0.9)",
                                border: "1px solid rgba(200,200,210,0.5)",
                                color: "#a1a1aa",
                                fontFamily: "var(--font-dm-sans)",
                            }}
                        >
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading older messages
                        </div>
                    ) : (
                        <span
                            className="rounded-full px-4 py-1.5 text-xs"
                            style={{
                                background: "rgba(255,255,255,0.8)",
                                border: "1px solid rgba(200,200,210,0.4)",
                                color: "#c4c4cc",
                                fontFamily: "var(--font-dm-sans)",
                            }}
                        >
                            ↑ Scroll for older messages
                        </span>
                    )}
                </div>
            )}

            <div className="mx-auto flex max-w-2xl flex-col gap-4">
                {/* Empty state */}
                <AnimatePresence>
                    {messages.length === 0 && !sending && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col items-center gap-6 py-16"
                        >
                            {/* Hero icon */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl"
                                style={{
                                    background: "linear-gradient(145deg, #e8e8ec 0%, #d4d4da 100%)",
                                    boxShadow:
                                        "0 0 0 1px rgba(255,255,255,0.8) inset, 0 8px 24px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.07)",
                                }}
                            >
                                <span
                                    className="pointer-events-none absolute inset-x-4 top-2 h-[40%] rounded-t-xl opacity-50"
                                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)" }}
                                />
                                <svg
                                    className="relative h-9 w-9"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#71717a"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                    <path d="M8 12h8M12 8v8" />
                                </svg>
                            </motion.div>

                            {/* Heading */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="text-center"
                            >
                                <p
                                    className="text-lg font-semibold tracking-tight"
                                    style={{
                                        color: "#18181b",
                                        fontFamily: "var(--font-instrument-serif), serif",
                                        fontStyle: "italic",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    Admin AI Assistant
                                </p>
                                <p
                                    className="mt-1.5 text-sm"
                                    style={{ color: "#a1a1aa", fontFamily: "var(--font-dm-sans)" }}
                                >
                                    Ask anything about travelers, guides, tours, bookings, or revenue.
                                </p>
                            </motion.div>

                            {/* Quick prompts */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="grid grid-cols-2 gap-2 w-full max-w-sm"
                            >
                                {QUICK_PROMPTS.map(({ icon: Icon, label }, i) => (
                                    <motion.div
                                        key={label}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 + i * 0.06, duration: 0.3 }}
                                        className="relative overflow-hidden rounded-xl px-3 py-2.5 text-left cursor-default"
                                        style={{
                                            background:
                                                "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(245,245,248,0.85) 100%)",
                                            border: "1px solid rgba(200,200,210,0.5)",
                                            boxShadow:
                                                "0 0 0 1px rgba(255,255,255,0.7) inset, 0 2px 6px rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        <span
                                            className="pointer-events-none absolute inset-x-2 top-1 h-[40%] rounded-t-lg opacity-50"
                                            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)" }}
                                        />
                                        <Icon
                                            className="relative mb-1.5 h-3.5 w-3.5"
                                            style={{ color: "#71717a" }}
                                        />
                                        <p
                                            className="relative text-xs font-medium"
                                            style={{
                                                color: "#52525b",
                                                fontFamily: "var(--font-dm-sans)",
                                                lineHeight: "1.4",
                                            }}
                                        >
                                            &quot;{label}&quot;
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages */}
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}

                {/* Thinking indicator */}
                <AnimatePresence>
                    {sending && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center gap-3"
                        >
                            {/* Avatar */}
                            <div
                                className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                                style={{
                                    background: "linear-gradient(145deg, #eaeaed 0%, #d8d8de 100%)",
                                    boxShadow:
                                        "0 0 0 1px rgba(255,255,255,0.8) inset, 0 2px 6px rgba(0,0,0,0.08)",
                                }}
                            >
                                <span
                                    className="h-3.5 w-3.5 rounded-full"
                                    style={{ background: "rgba(113,113,122,0.3)" }}
                                />
                            </div>

                            {/* Dots */}
                            <div
                                className="flex items-center gap-1.5 rounded-2xl px-4 py-3"
                                style={{
                                    background:
                                        "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,248,251,0.95) 100%)",
                                    border: "1px solid rgba(200,200,210,0.5)",
                                    boxShadow:
                                        "0 0 0 1px rgba(255,255,255,0.8) inset, 0 4px 14px rgba(0,0,0,0.06)",
                                    borderRadius: "18px 18px 18px 4px",
                                }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ background: "#c4c4cc" }}
                                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={bottomRef} />
            </div>
        </div>
    );
}