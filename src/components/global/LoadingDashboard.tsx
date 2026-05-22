// components/global/LoadingDashboard.tsx
import { MotionDiv, MotionSpan } from "./motion-elements";

// ── Style tokens (neu design system) ──────────────────────────
const STYLES = {
    wrapper: {
        center: "min-h-screen flex items-center justify-center",
        inline: "inline-flex",
    },
    inner: "flex flex-col items-center gap-4 px-6 py-5",
    dotsRow: "inline-flex items-center gap-1.5",
    dot: "block rounded-full bg-[#006666]/60",
    label: "font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-widest uppercase text-[#1E2938]/40 select-none",
} as const;

type Size = "sm" | "md" | "lg";

export interface LoaderProps {
    ariaLabel?: string;
    size?: Size;
    center?: boolean;
    className?: string;
    /** Controls how fast the text animation plays */
    textSpeed?: number;
}

const SIZE_MAP: Record<Size, { dim: string; dot: string }> = {
    sm: { dim: "h-8 w-8 rounded-lg", dot: "h-1 w-1" },
    md: { dim: "h-12 w-12 rounded-xl", dot: "h-1.5 w-1.5" },
    lg: { dim: "h-16 w-16 rounded-2xl", dot: "h-2 w-2" },
};

export default function LoadingDashboard({
    ariaLabel = "Loading content",
    size = "md",
    center = true,
    className = "",
    textSpeed = 1,
}: LoaderProps) {
    const { dim, dot } = SIZE_MAP[size];

    return (
        <div
            role="status"
            aria-label={ariaLabel}
            className={`${center ? STYLES.wrapper.center : STYLES.wrapper.inline} ${className}`}
        >
            <div className={STYLES.inner}>
                <span className="sr-only">{ariaLabel}</span>

                {/* Neumorphic liquid loader */}
                <MotionDiv
                    aria-hidden
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -28, -28, 0],
                        rotate: [0, 0, 180, 180, 360],
                    }}
                    transition={{
                        opacity: { duration: 0.4, ease: "easeOut" },
                        scale: { duration: 0.4, ease: "easeOut" },
                        y: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.25, 0.75, 1],
                        },
                        rotate: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                            times: [0, 0.25, 0.5, 0.75, 1],
                        },
                    }}
                    className={`${dim} relative overflow-hidden bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]`}
                >
                    {/* Primary liquid layer */}
                    <MotionDiv
                        animate={{
                            y: ["100%", "-100%"],
                            borderRadius: [
                                "60% 40% 30% 70% / 60% 30% 70% 40%",
                                "30% 60% 70% 40% / 50% 60% 30% 60%",
                                "60% 40% 30% 70% / 60% 30% 70% 40%",
                            ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-t from-[#004d4d] via-[#006666] to-[#009999]"
                    />
                    {/* Secondary liquid layer */}
                    <MotionDiv
                        animate={{
                            y: ["120%", "-120%"],
                            borderRadius: [
                                "40% 60% 70% 30% / 40% 70% 30% 60%",
                                "70% 30% 40% 60% / 60% 40% 70% 30%",
                                "40% 60% 70% 30% / 40% 70% 30% 60%",
                            ],
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-t from-[#006666]/80 via-[#009999]/60 to-transparent opacity-70"
                    />
                </MotionDiv>

                {/* Bouncing dots */}
                <p className={STYLES.label}>
                    <span className={STYLES.dotsRow}>
                        {[0, 0.18, 0.36].map((delay, i) => (
                            <MotionSpan
                                key={i}
                                aria-hidden
                                className={`${STYLES.dot} ${dot}`}
                                animate={{ y: [0, -5, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.9 / textSpeed,
                                    delay,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </span>
                    <span className="sr-only">{ariaLabel}</span>
                </p>
            </div>
        </div>
    );
}