"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiChatMessage } from "@/types/ai-chat";

type MessageBubbleProps = {
    message: AiChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <motion.article
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
        >
            {/* Avatar */}
            <div className="flex shrink-0 flex-col items-center">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
                    style={
                        isUser
                            ? {
                                background: "linear-gradient(145deg, #1d4ed8 0%, #1e3a8a 100%)",
                                boxShadow:
                                    "0 0 0 1px rgba(255,255,255,0.15) inset, 0 2px 8px rgba(29,78,216,0.35)",
                            }
                            : {
                                background: "linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)",
                                boxShadow:
                                    "0 0 0 1px rgba(255,255,255,0.8) inset, 0 2px 6px rgba(29,78,216,0.1)",
                            }
                    }
                >
                    {/* Gloss */}
                    <span
                        className="pointer-events-none absolute inset-x-1 top-0.5 h-[45%] rounded-t-full opacity-[0.22]"
                        style={{ background: "linear-gradient(180deg, #fff 0%, transparent 100%)" }}
                    />
                    {isUser ? (
                        <User className="relative h-3.5 w-3.5 text-white/90" />
                    ) : (
                        <Bot className="relative h-3.5 w-3.5" style={{ color: "#1d4ed8" }} />
                    )}
                </motion.div>
            </div>

            {/* Bubble */}
            <motion.div
                initial={{ opacity: 0, x: isUser ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="relative max-w-[82%] overflow-hidden rounded-2xl px-4 py-3 text-sm"
                style={
                    isUser
                        ? {
                            background: "linear-gradient(150deg, #1d4ed8 0%, #1e3a8a 100%)",
                            color: "rgba(255,255,255,0.94)",
                            boxShadow:
                                "0 0 0 1px rgba(255,255,255,0.12) inset, 0 4px 14px rgba(29,78,216,0.3), 0 1px 3px rgba(30,58,138,0.2)",
                            borderRadius: "18px 18px 4px 18px",
                        }
                        : {
                            background:
                                "linear-gradient(150deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.95) 100%)",
                            color: "#1e3a8a",
                            border: "1px solid rgba(147,197,253,0.5)",
                            boxShadow:
                                "0 0 0 1px rgba(255,255,255,0.8) inset, 0 4px 14px rgba(29,78,216,0.07), 0 1px 3px rgba(29,78,216,0.05)",
                            borderRadius: "18px 18px 18px 4px",
                        }
                }
            >
                {/* Gloss overlay */}
                <span
                    className="pointer-events-none absolute inset-x-3 top-1.5 h-[35%] rounded-t-xl"
                    style={{
                        opacity: isUser ? 0.14 : 0.5,
                        background: "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, transparent 100%)",
                    }}
                />

                {isUser ? (
                    <p
                        className="relative whitespace-pre-wrap leading-relaxed"
                        style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: "0.875rem" }}
                    >
                        {message.content}
                    </p>
                ) : (
                    <div
                        className={cn(
                            "relative prose prose-sm max-w-none",
                            "prose-p:my-1 prose-p:leading-relaxed",
                            "prose-headings:my-2 prose-headings:font-semibold prose-headings:tracking-tight",
                            "prose-ul:my-1 prose-ol:my-1",
                            "prose-li:my-0.5",
                            "prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:font-medium",
                            "prose-pre:rounded-xl prose-pre:text-xs",
                            "prose-a:text-blue-700 prose-a:underline prose-a:underline-offset-2",
                            "prose-table:w-full prose-table:text-xs prose-table:border-collapse",
                            "prose-th:border prose-th:border-blue-100 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-blue-700",
                            "prose-td:border prose-td:border-blue-100 prose-td:px-3 prose-td:py-2 prose-td:text-blue-800",
                            "prose-tr:even:bg-blue-50/50"
                        )}
                        style={{
                            fontFamily: "var(--font-dm-sans), sans-serif",
                            color: "#1e3a8a",
                        }}
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#1d4ed8", textDecoration: "underline" }}
                                    >
                                        {children}
                                    </a>
                                ),
                                code: ({ inline, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) =>
                                    inline ? (
                                        <code
                                            style={{
                                                background: "rgba(147,197,253,0.22)",
                                                borderRadius: "5px",
                                                padding: "1px 6px",
                                                fontSize: "0.78em",
                                                color: "#1d4ed8",
                                                fontFamily: "var(--font-dm-mono), monospace",
                                            }}
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    ) : (
                                        <code
                                            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    ),
                                pre: ({ children }) => (
                                    <pre
                                        style={{
                                            background: "linear-gradient(145deg, rgba(219,234,254,0.9), rgba(191,219,254,0.8))",
                                            border: "1px solid rgba(147,197,253,0.4)",
                                            borderRadius: "12px",
                                            padding: "12px 14px",
                                            overflowX: "auto",
                                            fontFamily: "var(--font-dm-mono), monospace",
                                            fontSize: "0.78rem",
                                            color: "#1e3a8a",
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