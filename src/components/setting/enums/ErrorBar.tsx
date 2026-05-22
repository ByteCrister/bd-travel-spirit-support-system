// src/components/enums/ErrorBar.tsx
"use client";

import { JSX } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  wrap:
    "flex items-start gap-3 p-4 m-4 rounded-xl bg-[#E7E5E4] " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] " +
    "border border-[#FF2157]/20",
  iconWell:
    "flex-none p-2 rounded-lg bg-[#FF2157]/10 text-[#FF2157] " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  title:
    "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#FF2157]",
  msg:
    "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60 mt-0.5",
  retryBtn:
    "flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl text-xs font-bold " +
    "font-[family-name:var(--font-space-mono)] text-white bg-[#FF2157] " +
    "shadow-[3px_3px_6px_rgba(255,33,87,0.4)] hover:bg-[#e01d4f] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50",
};

export default function ErrorBar({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}): JSX.Element {
  return (
    <div role="alert" className={S.wrap}>
      <div className={S.iconWell}>
        <AlertCircle className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={S.title}>Error</p>
        <p className={S.msg}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className={S.retryBtn}>
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}