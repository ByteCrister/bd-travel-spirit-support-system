// components/guide/GuideKPI.tsx
"use client";

import CountUp from "react-countup";
import { FiFileText, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_CARD_BASE =
  "relative overflow-hidden rounded-2xl bg-[#E7E5E4] " +
  "border border-white/60 p-5 sm:p-6 " +
  "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] " +
  "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] " +
  "hover:-translate-y-0.5 transition-all duration-300";

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 " +
  "uppercase tracking-widest mb-3";

const NEU_VALUE =
  "font-[family-name:var(--font-space-mono)] font-bold tracking-tight text-4xl";

const NEU_ICON_WELL =
  "flex items-center justify-center w-14 h-14 rounded-xl " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "transition-transform duration-300 hover:scale-105";

const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  title: string;
  value: number;
  variant?: "green" | "red" | "yellow" | "blue";
  loading?: boolean;
};

const variantConfig = {
  blue: {
    textColor: "text-[#006666]",
    iconBg: "bg-[#006666]/10",
    iconColor: "text-[#006666]",
    icon: FiFileText,
    decoratorColor: "bg-[#006666]/8",
  },
  yellow: {
    textColor: "text-[#FE9900]",
    iconBg: "bg-[#FE9900]/10",
    iconColor: "text-[#FE9900]",
    icon: FiClock,
    decoratorColor: "bg-[#FE9900]/8",
  },
  green: {
    textColor: "text-[#00A63D]",
    iconBg: "bg-[#00A63D]/10",
    iconColor: "text-[#00A63D]",
    icon: FiCheckCircle,
    decoratorColor: "bg-[#00A63D]/8",
  },
  red: {
    textColor: "text-[#FF2157]",
    iconBg: "bg-[#FF2157]/10",
    iconColor: "text-[#FF2157]",
    icon: FiXCircle,
    decoratorColor: "bg-[#FF2157]/8",
  },
};

export function GuideKPI({ title, value, variant = "blue", loading }: Props) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={NEU_CARD_BASE}>
      <div className="flex items-start justify-between">
        {/* Left — label + value */}
        <div className="flex-1">
          <p className={NEU_LABEL}>{title}</p>
          <div className={cn(NEU_VALUE, config.textColor)}>
            {loading ? (
              <div className={cn(NEU_SKELETON, "h-10 w-20")} />
            ) : (
              <CountUp
                end={value}
                duration={1.2}
                separator=","
                useEasing
                easingFn={(t, b, c, d) =>
                  c * (-Math.pow(2, -10 * (t / d)) + 1) + b
                }
              />
            )}
          </div>
        </div>

        {/* Right — icon well */}
        <div className={cn(NEU_ICON_WELL, config.iconBg)}>
          <Icon
            className={cn("w-6 h-6", config.iconColor)}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Decorative circle */}
      <div
        className={cn(
          "absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-[0.08]",
          config.iconBg,
        )}
        aria-hidden="true"
      />
    </div>
  );
}
