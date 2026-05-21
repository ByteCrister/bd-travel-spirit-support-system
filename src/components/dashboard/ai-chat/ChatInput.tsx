"use client";

import { useCallback, useState, KeyboardEvent, useRef } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Neumorphism style tokens ──────────────────────────────────────────────────
const NEU_INPUT_AREA =
    "bg-[#E7E5E4] shadow-[0_-4px_10px_#c8c6c5,0_-1px_0_#ffffff_inset] border-t border-white/60";
const NEU_TEXTAREA_WRAPPER_IDLE =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] border border-white/40";
const NEU_TEXTAREA_WRAPPER_ACTIVE =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] border border-[#006666]/30 ring-2 ring-[#006666]/20";
const NEU_BTN_SEND_ACTIVE =
    "bg-[#006666] shadow-[3px_3px_6px_#004d4d,-2px_-2px_5px_#008080] " +
    "hover:bg-[#007777] hover:shadow-[4px_4px_8px_#004d4d,-3px_-3px_6px_#008080] " +
    "active:shadow-[inset_3px_3px_5px_#004d4d,inset_-2px_-2px_4px_#008080]";
const NEU_BTN_SEND_IDLE =
    "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] cursor-default";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

// ─────────────────────────────────────────────────────────────────────────────

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
        <div className={cn(NEU_INPUT_AREA, "px-4 pb-4 pt-3")}>

            {/* ── Input wrapper (inset well) ── */}
            <div
                className={cn(
                    "relative flex items-end gap-0 overflow-hidden rounded-2xl transition-all duration-200",
                    canSend ? NEU_TEXTAREA_WRAPPER_ACTIVE : NEU_TEXTAREA_WRAPPER_IDLE
                )}
            >
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || sending}
                    rows={2}
                    className={cn(
                        "min-h-[52px] flex-1 resize-none border-0 bg-transparent px-4 py-3.5 text-sm outline-none",
                        "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] leading-relaxed",
                        "placeholder:text-[#1E2938]/30 disabled:opacity-50"
                    )}
                    style={{ scrollbarWidth: "none" }}
                />

                {/* ── Send button ── */}
                <div className="flex items-end p-2">
                    <motion.button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={!canSend}
                        whileHover={canSend ? { scale: 1.05 } : {}}
                        whileTap={canSend ? { scale: 0.93 } : {}}
                        className={cn(
                            "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                            canSend ? NEU_BTN_SEND_ACTIVE : NEU_BTN_SEND_IDLE
                        )}
                    >
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
                                        style={{ color: canSend ? "white" : "#1E2938" }}
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
                                        style={{ color: canSend ? "white" : "#1E2938" }}
                                        strokeWidth={2.5}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>

            {/* ── Keyboard hint ── */}
            <p className={cn(NEU_MUTED, "mt-2 text-center text-[10px]")}>
                <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/60">
                    Enter
                </span>{" "}
                to send &nbsp;·&nbsp;{" "}
                <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/60">
                    Shift + Enter
                </span>{" "}
                for new line
            </p>
        </div>
    );
}