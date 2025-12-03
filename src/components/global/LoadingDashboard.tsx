// components/LoadingDashboard.tsx
"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

type Size = "sm" | "md" | "lg";
type TextAnimation = "wave" | "ellipsis";

export interface LoaderProps {
    ariaLabel?: string;
    size?: Size;
    center?: boolean;
    className?: string;
    textAnimation?: TextAnimation;
    /** Controls how fast the text animation plays */
    textSpeed?: number;
}

const SIZE_MAP: Record<Size, { dim: string }> = {
    sm: { dim: "h-8 w-8 rounded-lg" },
    md: { dim: "h-12 w-12 rounded-xl" },
    lg: { dim: "h-16 w-16 rounded-2xl" },
};

const letterContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.04,
        },
    },
};

export default function LoadingDashboard({
    ariaLabel = "Loading content",
    size = "md",
    center = true,
    className = "",
    textAnimation = "ellipsis",
    textSpeed = 1,
}: LoaderProps) {
    const { dim } = SIZE_MAP[size];

    return (
        <div
            role="status"
            aria-label={ariaLabel}
            className={`${center ? "min-h-screen flex items-center justify-center" : "inline-flex"} ${className}`}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col items-center gap-3 px-6 py-4"
            >
                <motion.div
                    aria-hidden
                    animate={{
                        rotate: [0, 12, -10, 0],
                        scale: [1, 1.05, 0.98, 1],
                        boxShadow: [
                            "0 6px 18px rgba(99,102,241,0.06)",
                            "0 12px 28px rgba(99,102,241,0.10)",
                            "0 6px 18px rgba(99,102,241,0.06)",
                        ],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                    className={`${dim} flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white`}
                >
                    <span className="sr-only">{ariaLabel}</span>
                    <motion.span
                        layout
                        className="block rounded-md bg-white/18 backdrop-blur-sm"
                        style={{ width: "38%", height: "28%" }}
                        animate={{ x: [0, 4, -3, 0], opacity: [0.95, 1, 0.9, 0.95] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>

                {textAnimation === "wave" ? (
                    <motion.p
                        aria-hidden={false}
                        className="text-sm text-slate-600 dark:text-slate-300 select-none flex gap-1 items-end"
                        variants={letterContainer}
                        initial="hidden"
                        animate="visible"
                        style={{ willChange: "transform, opacity" }}
                    >
                       
                        <span className="sr-only"> {ariaLabel}</span>
                    </motion.p>
                ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300 select-none flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                            <motion.span
                                aria-hidden
                                className="block h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-300"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 0.9 / textSpeed, delay: 0 }}
                            />
                            <motion.span
                                aria-hidden
                                className="block h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-300"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 0.9 / textSpeed, delay: 0.18 }}
                            />
                            <motion.span
                                aria-hidden
                                className="block h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-300"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 0.9 / textSpeed, delay: 0.36 }}
                            />
                        </span>
                        <span className="sr-only"> {ariaLabel}</span>
                    </p>
                )}
            </motion.div>
        </div>
    );
}
