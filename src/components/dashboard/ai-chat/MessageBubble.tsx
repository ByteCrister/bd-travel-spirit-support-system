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
                                background: "linear-gradient(145deg, #3d3d3d 0%, #1a1a1a 100%)",
                                boxShadow:
                                    "0 0 0 1px rgba(255,255,255,0.12) inset, 0 2px 8px rgba(0,0,0,0.22)",
                            }
                            : {
                                background: "linear-gradient(145deg, #eaeaed 0%, #d8d8de 100%)",
                                boxShadow:
                                    "0 0 0 1px rgba(255,255,255,0.8) inset, 0 2px 6px rgba(0,0,0,0.08)",
                            }
                    }
                >
                    {/* Gloss */}
                    <span
                        className="pointer-events-none absolute inset-x-1 top-0.5 h-[45%] rounded-t-full opacity-[0.2]"
                        style={{ background: "linear-gradient(180deg, #fff 0%, transparent 100%)" }}
                    />
                    {isUser ? (
                        <User className="relative h-3.5 w-3.5 text-white/90" />
                    ) : (
                        <Bot className="relative h-3.5 w-3.5" style={{ color: "#52525b" }} />
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
                            background: "linear-gradient(150deg, #2d2d2d 0%, #111111 100%)",
                            color: "rgba(255,255,255,0.92)",
                            boxShadow:
                                "0 0 0 1px rgba(255,255,255,0.08) inset, 0 4px 14px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15)",
                            borderRadius: "18px 18px 4px 18px",
                        }
                        : {
                            background:
                                "linear-gradient(150deg, rgba(255,255,255,0.98) 0%, rgba(248,248,251,0.95) 100%)",
                            color: "#27272a",
                            border: "1px solid rgba(200,200,210,0.5)",
                            boxShadow:
                                "0 0 0 1px rgba(255,255,255,0.8) inset, 0 4px 14px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
                            borderRadius: "18px 18px 18px 4px",
                        }
                }
            >
                {/* Gloss overlay */}
                <span
                    className="pointer-events-none absolute inset-x-3 top-1.5 h-[35%] rounded-t-xl"
                    style={{
                        opacity: isUser ? 0.1 : 0.5,
                        background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)",
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
                            "prose-a:text-zinc-700 prose-a:underline prose-a:underline-offset-2",
                            // table
                            "prose-table:w-full prose-table:text-xs prose-table:border-collapse",
                            "prose-th:border prose-th:border-zinc-200 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-zinc-700",
                            "prose-td:border prose-td:border-zinc-200 prose-td:px-3 prose-td:py-2 prose-td:text-zinc-600",
                            "prose-tr:even:bg-zinc-50/60"
                        )}
                        style={{
                            fontFamily: "var(--font-dm-sans), sans-serif",
                            color: "#27272a",
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
                                        style={{ color: "#3f3f46", textDecoration: "underline" }}
                                    >
                                        {children}
                                    </a>
                                ),
                                code: ({ inline, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) =>
                                    inline ? (
                                        <code
                                            style={{
                                                background: "rgba(200,200,210,0.25)",
                                                borderRadius: "5px",
                                                padding: "1px 6px",
                                                fontSize: "0.78em",
                                                color: "#3f3f46",
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
                                            background: "linear-gradient(145deg, rgba(240,240,244,0.95), rgba(232,232,238,0.9))",
                                            border: "1px solid rgba(200,200,210,0.4)",
                                            borderRadius: "12px",
                                            padding: "12px 14px",
                                            overflowX: "auto",
                                            fontFamily: "var(--font-dm-mono), monospace",
                                            fontSize: "0.78rem",
                                            color: "#3f3f46",
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