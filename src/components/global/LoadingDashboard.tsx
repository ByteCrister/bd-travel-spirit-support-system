// components/global/LoadingDashboard.tsx
import React from "react";
import { MotionDiv, MotionSpan } from "./motion-elements";

type Size = "sm" | "md" | "lg";

export interface LoaderProps {
    ariaLabel?: string;
    size?: Size;
    center?: boolean;
    className?: string;
    /** Controls how fast the text animation plays */
    textSpeed?: number;
}

const SIZE_MAP: Record<Size, { dim: string }> = {
    sm: { dim: "h-8 w-8 rounded-lg" },
    md: { dim: "h-12 w-12 rounded-xl" },
    lg: { dim: "h-16 w-16 rounded-2xl" },
};

export default function LoadingDashboard({
    ariaLabel = "Loading content",
    size = "md",
    center = true,
    className = "",
    textSpeed = 1,
}: LoaderProps) {
    const { dim } = SIZE_MAP[size];

    return (
        <div
            role="status"
            aria-label={ariaLabel}
            className={`${center ? "min-h-screen flex items-center justify-center" : "inline-flex"} ${className}`}
        >
            <div className="flex flex-col items-center gap-3 px-6 py-4">
                <span className="sr-only">{ariaLabel}</span>

                {/* Liquid Loader */}
                <MotionDiv
                    aria-hidden
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -30, -30, 0],
                        rotate: [0, 0, 180, 180, 360],
                    }}
                    transition={{
                        opacity: { duration: 0.45, ease: "easeOut" },
                        scale: { duration: 0.45, ease: "easeOut" },
                        y: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.25, 0.75, 1]
                        },
                        rotate: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                            times: [0, 0.25, 0.5, 0.75, 1]
                        }
                    }}
                    className={`${dim} relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900`}
                >
                    <MotionDiv
                        animate={{
                            y: ["100%", "-100%"],
                            borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%",
                                "30% 60% 70% 40% / 50% 60% 30% 60%",
                                "60% 40% 30% 70% / 60% 30% 70% 40%"],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-t from-cyan-400 via-blue-500 to-indigo-600"
                    />
                    <MotionDiv
                        animate={{
                            y: ["120%", "-120%"],
                            borderRadius: ["40% 60% 70% 30% / 40% 70% 30% 60%",
                                "70% 30% 40% 60% / 60% 40% 70% 30%",
                                "40% 60% 70% 30% / 40% 70% 30% 60%"],
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-t from-purple-400 via-pink-500 to-rose-600 opacity-70"
                    />
                </MotionDiv>

                {/* Ellipsis Animation */}
                <p className="text-sm text-slate-600 dark:text-slate-300 select-none flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                        <MotionSpan
                            aria-hidden
                            className="block h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-300"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.9 / textSpeed, delay: 0 }}
                        />
                        <MotionSpan
                            aria-hidden
                            className="block h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-300"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.9 / textSpeed, delay: 0.18 }}
                        />
                        <MotionSpan
                            aria-hidden
                            className="block h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-300"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.9 / textSpeed, delay: 0.36 }}
                        />
                    </span>
                    <span className="sr-only">{ariaLabel}</span>
                </p>
            </div>
        </div>
    );
}