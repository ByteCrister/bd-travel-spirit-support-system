"use client";

import { useCallback, useState, KeyboardEvent, useRef } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ChatInputProps = {
    onSend: (message: string) => Promise<void>;
    disabled?: boolean;
    sending?: boolean;
    placeholder?: string;
};

export function ChatInput({
    onSend,
    disabled = false,
    sending = false,
    placeholder = "Ask about travelers, guides, tours, bookings, revenue…",
}: ChatInputProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = useCallback(async () => {
        const trimmed = value.trim();
        if (!trimmed || disabled || sending) return;
        setValue("");
        await onSend(trimmed);
    }, [value, disabled, sending, onSend]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
            }
        },
        [handleSend]
    );

    const canSend = !!value.trim() && !disabled && !sending;

    return (
        <div
            className="px-4 pb-4 pt-3"
            style={{
                background:
                    "linear-gradient(0deg, rgba(239,246,255,0.97) 0%, rgba(219,234,254,0.92) 100%)",
                backdropFilter: "blur(20px) saturate(160%)",
                WebkitBackdropFilter: "blur(20px) saturate(160%)",
                borderTop: "1px solid rgba(147,197,253,0.45)",
                boxShadow: "0 -1px 0 rgba(255,255,255,0.7)",
            }}
        >
            {/* Input container */}
            <div
                className="relative flex items-end gap-0 overflow-hidden rounded-2xl transition-all duration-200"
                style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.95) 100%)",
                    border: `1.5px solid ${canSend ? "rgba(59,130,246,0.5)" : "rgba(147,197,253,0.55)"}`,
                    boxShadow: canSend
                        ? "0 0 0 3px rgba(59,130,246,0.1), 0 4px 16px rgba(29,78,216,0.1), 0 1px 3px rgba(29,78,216,0.08), 0 1px 0 rgba(255,255,255,0.8) inset"
                        : "0 2px 8px rgba(29,78,216,0.06), 0 1px 0 rgba(255,255,255,0.8) inset",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                }}
            >
                {/* Gloss on input */}
                <span
                    className="pointer-events-none absolute inset-x-3 top-1.5 z-10 h-[30%] rounded-t-xl opacity-40"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)" }}
                />

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || sending}
                    rows={2}
                    className="relative z-0 min-h-[52px] flex-1 resize-none border-0 bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-[#93c5fd] disabled:opacity-50"
                    style={{
                        color: "#1e3a8a",
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        lineHeight: "1.6",
                        scrollbarWidth: "none",
                    }}
                />

                {/* Send button */}
                <div className="relative z-10 flex items-end p-2">
                    <motion.button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={!canSend}
                        whileHover={canSend ? { scale: 1.05 } : {}}
                        whileTap={canSend ? { scale: 0.94 } : {}}
                        className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl transition-all duration-200"
                        style={{
                            background: canSend
                                ? "linear-gradient(145deg, #1d4ed8 0%, #1e3a8a 100%)"
                                : "linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)",
                            boxShadow: canSend
                                ? "0 0 0 1px rgba(255,255,255,0.18) inset, 0 3px 10px rgba(29,78,216,0.35), 0 1px 2px rgba(30,58,138,0.25)"
                                : "0 1px 2px rgba(29,78,216,0.06)",
                            cursor: canSend ? "pointer" : "default",
                        }}
                    >
                        {/* Gloss on button */}
                        <span
                            className="pointer-events-none absolute inset-x-1.5 top-1 h-[40%] rounded-t-lg"
                            style={{
                                opacity: canSend ? 0.2 : 0.5,
                                background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)",
                            }}
                        />
                        <AnimatePresence mode="wait" initial={false}>
                            {sending ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Loader2
                                        className="h-4 w-4 animate-spin"
                                        style={{ color: canSend ? "rgba(255,255,255,0.9)" : "#93c5fd" }}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="arrow"
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <ArrowUp
                                        className="h-4 w-4"
                                        style={{ color: canSend ? "rgba(255,255,255,0.95)" : "#93c5fd" }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>

            {/* Hint */}
            <p
                className="mt-2 text-center text-[11px]"
                style={{ color: "#bfdbfe", fontFamily: "var(--font-dm-sans)" }}
            >
                <span className="font-medium" style={{ color: "#93c5fd" }}>Enter</span> to send
                &nbsp;·&nbsp;
                <span className="font-medium" style={{ color: "#93c5fd" }}>Shift + Enter</span> for new line
            </p>
        </div>
    );
}