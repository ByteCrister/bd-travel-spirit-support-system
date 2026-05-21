"use client";

import { useCallback, useEffect, useRef } from "react";
import { Loader2, Database, TrendingUp, Users, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import type { AiChatMessage } from "@/types/ai-chat";

// ── Neumorphism style tokens ──────────────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
  "hover:shadow-[5px_5px_12px_#c8c6c5,-5px_-5px_12px_#ffffff] hover:-translate-y-0.5";
const NEU_ICON_WELL_PRIMARY =
  "rounded-xl bg-[#006666]/10 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] p-3";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

// ─────────────────────────────────────────────────────────────────────────────

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

      if (
        node.scrollTop < 80 &&
        hasMore &&
        !loading &&
        !loadingMoreRef.current &&
        onLoadMore
      ) {
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
      className={cn(NEU_SURFACE, "flex-1 overflow-y-auto px-4 py-6")}
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,102,102,0.2) transparent" }}
    >
      {/* ── Load more indicator ── */}
      {hasMore && (
        <div className="mb-5 flex justify-center">
          {loading ? (
            <div
              className={cn(NEU_SURFACE_INSET_SM, "flex items-center gap-2 rounded-full px-4 py-1.5")}
            >
              <Loader2 className="h-3 w-3 animate-spin text-[#006666]" />
              <span className={cn(NEU_MUTED, "text-xs")}>Loading older messages</span>
            </div>
          ) : (
            <span
              className={cn(
                NEU_SURFACE_INSET_SM,
                NEU_MUTED,
                "rounded-full px-4 py-1.5 text-xs"
              )}
            >
              ↑ Scroll for older messages
            </span>
          )}
        </div>
      )}

      <div className="mx-auto flex max-w-2xl flex-col gap-4">

        {/* ── Empty state ── */}
        <AnimatePresence>
          {messages.length === 0 && !sending && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6 py-16"
            >
              {/* Hero icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={cn(NEU_ICON_WELL_PRIMARY, "flex h-20 w-20 items-center justify-center rounded-3xl")}
              >
                <svg
                  className="h-9 w-9 text-[#006666]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="text-center"
              >
                <p className={cn(NEU_HEADING, "text-base")}>Admin AI Assistant</p>
                <p className={cn(NEU_MUTED, "mt-1.5 text-xs max-w-xs text-center")}>
                  Ask anything about travelers, guides, tours, bookings, or revenue.
                </p>
              </motion.div>

              {/* Quick prompt cards */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
                className="grid grid-cols-2 gap-2.5 w-full max-w-sm"
              >
                {QUICK_PROMPTS.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.06, duration: 0.28 }}
                    className={cn(
                      NEU_CARD_SM,
                      NEU_CARD_HOVER,
                      "px-3 py-2.5 text-left cursor-default transition-all duration-200"
                    )}
                  >
                    <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#006666]/10">
                      <Icon className="h-3.5 w-3.5 text-[#006666]" strokeWidth={1.8} />
                    </div>
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70 leading-relaxed">
                      &quot;{label}&quot;
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Message bubbles ── */}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* ── Thinking indicator ── */}
        <AnimatePresence>
          {sending && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3"
            >
              {/* Bot avatar */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]"
              >
                <span className="h-3 w-3 rounded-full bg-[#006666]/20" />
              </div>

              {/* Thinking dots bubble */}
              <div
                className={cn(
                  NEU_CARD_SM,
                  "flex items-center gap-1.5 px-4 py-3 rounded-[18px_18px_18px_4px]"
                )}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[#006666]/50"
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