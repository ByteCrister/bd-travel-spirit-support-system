"use client";

import React from "react";
import { RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PayrollStatus } from "@/constants/employee.const";

// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_BADGE_BASE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_BTN_ICON =
  "rounded-lg w-6 h-6 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed " +
  "transition-all duration-200";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";
// ───────────────────────────────────────────────────────────────

interface PaymentStatusBadgeProps {
  status: PayrollStatus;
  amount: number;
  currency: string;
  isRetryable?: boolean;
  onRetry?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  pending: {
    icon: <Clock className="h-3 w-3" />,
    label: "Pending",
    badgeClass: "bg-[#FE9900]/10 text-[#FE9900]",
  },
  paid: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    label: "Paid",
    badgeClass: "bg-[#00A63D]/10 text-[#00A63D]",
  },
  failed: {
    icon: <AlertCircle className="h-3 w-3" />,
    label: "Failed",
    badgeClass: "bg-[#FF2157]/10 text-[#FF2157]",
  },
} as const;

export function PaymentStatusBadge({
  status,
  amount,
  currency,
  isRetryable = false,
  onRetry,
  isLoading = false,
  className,
}: PaymentStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn(NEU_BADGE_BASE, cfg.badgeClass)}>
        {cfg.icon}
        {cfg.label}
      </span>

      <span className={NEU_MUTED}>
        {currency} {amount.toLocaleString()}
      </span>

      {status === "failed" && isRetryable && onRetry && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRetry(e);
          }}
          disabled={isLoading}
          className={NEU_BTN_ICON}
          title="Retry payment"
        >
          <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
        </button>
      )}
    </div>
  );
}
