// components/employees/primitives/Badge.tsx
"use client";

import React from "react";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_BADGE_BASE =
  "inline-flex items-center px-2.5 py-1 text-xs rounded-lg " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const INTENT_MAP: Record<string, string> = {
  default: "bg-[#E7E5E4] text-[#1E2938]/60",
  success: "bg-[#00A63D]/10 text-[#00A63D]",
  warning: "bg-[#FE9900]/10 text-[#FE9900]",
  danger: "bg-[#FF2157]/10 text-[#FF2157]",
  muted: "bg-[#E7E5E4] text-[#1E2938]/40",
};
// ─────────────────────────────────────────────────────────────

export function Badge({
  children,
  intent = "default",
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  intent?: "default" | "success" | "warning" | "danger" | "muted";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <span
      className={`${NEU_BADGE_BASE} ${INTENT_MAP[intent]} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
