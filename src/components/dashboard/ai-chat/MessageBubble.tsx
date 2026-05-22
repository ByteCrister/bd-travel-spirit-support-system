"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiChatMessage } from "@/types/ai-chat";

// ── Neumorphism style tokens ──────────────────────────────────────────────────
const NEU_AVATAR_USER =
    "bg-[#006666] shadow-[3px_3px_7px_#004d4d,-2px_-2px_5px_#008080]";
const NEU_AVATAR_BOT =
    "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

// User bubble: raised from surface with teal brand color
const NEU_BUBBLE_USER =
    "bg-[#006666] text-white shadow-[4px_4px_10px_#004d4d,-2px_-2px_6px_#008080]";
// Bot bubble: raised white-tinted panel
const NEU_BUBBLE_BOT =
    "bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/70";

// ─────────────────────────────────────────────────────────────────────────────

type MessageBubbleProps = { message: AiChatMessage };

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <motion.article
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
        >
            {/* ── Avatar ── */}
            <div className="flex shrink-0 flex-col items-center">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        isUser ? NEU_AVATAR_USER : NEU_AVATAR_BOT
                    )}
                >
                    {isUser ? (
                        <User className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                    ) : (
                        <Bot className="h-3.5 w-3.5 text-[#006666]" strokeWidth={1.8} />
                    )}
                </motion.div>
            </div>

            {/* ── Bubble ── */}
            <motion.div
                initial={{ opacity: 0, x: isUser ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    "relative max-w-[82%] overflow-hidden px-4 py-3 text-sm",
                    isUser ? NEU_BUBBLE_USER : NEU_BUBBLE_BOT,
                    isUser ? "rounded-[18px_18px_4px_18px]" : "rounded-[18px_18px_18px_4px]"
                )}
            >
                {isUser ? (
                    <p
                        className="whitespace-pre-wrap leading-relaxed font-[family-name:var(--font-jetbrains-mono)] text-white/95"
                        style={{ fontSize: "0.875rem" }}
                    >
                        {message.content}
                    </p>
                ) : (
                    <div
                        className={cn(
                            "prose prose-sm max-w-none",
                            // Paragraph spacing
                            "prose-p:my-1 prose-p:leading-relaxed",
                            // Headings
                            "prose-headings:my-2 prose-headings:font-[family-name:var(--font-space-mono)] prose-headings:font-bold prose-headings:text-[#1E2938] prose-headings:tracking-tight",
                            // Lists
                            "prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5",
                            // Inline code
                            "prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:font-medium",
                            // Links
                            "prose-a:text-[#006666] prose-a:underline prose-a:underline-offset-2",
                            // Tables
                            "prose-table:w-full prose-table:text-xs prose-table:border-collapse",
                            "prose-th:border prose-th:border-[#1E2938]/10 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-[#1E2938] prose-th:font-[family-name:var(--font-space-mono)] prose-th:font-bold",
                            "prose-td:border prose-td:border-[#1E2938]/10 prose-td:px-3 prose-td:py-2 prose-td:text-[#1E2938]/80",
                            "prose-tr:even:bg-[#006666]/5"
                        )}
                        style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#1E2938" }}
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#006666", textDecoration: "underline" }}
                                    >
                                        {children}
                                    </a>
                                ),
                                code: ({
                                    inline,
                                    children,
                                    ...props
                                }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) =>
                                    inline ? (
                                        <code
                                            style={{
                                                background: "rgba(0,102,102,0.1)",
                                                borderRadius: "5px",
                                                padding: "1px 6px",
                                                fontSize: "0.78em",
                                                color: "#006666",
                                                fontFamily: "var(--font-jetbrains-mono), monospace",
                                            }}
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    ) : (
                                        <code
                                            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    ),
                                pre: ({ children }) => (
                                    <pre
                                        style={{
                                            background:
                                                "linear-gradient(145deg, #d8d6d5, #f0eeee)",
                                            boxShadow:
                                                "inset 3px 3px 6px #c8c6c5, inset -3px -3px 6px #ffffff",
                                            borderRadius: "12px",
                                            padding: "12px 14px",
                                            overflowX: "auto",
                                            fontFamily: "var(--font-jetbrains-mono), monospace",
                                            fontSize: "0.78rem",
                                            color: "#1E2938",
                                        }}
                                    >
                                        {children}
                                    </pre>
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
            </motion.div>
        </motion.article>
    );
}