// components/GuideSubscriptions/VersionBanner.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { RefreshCw, GitCompare, AlertTriangle, Clock } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const BANNER_BASE =
  "w-full px-5 py-4 rounded-2xl flex items-center justify-between gap-4 " +
  "bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] border border-white/60";

const BANNER_CONFLICT =
  "w-full px-5 py-4 rounded-2xl flex items-center justify-between gap-4 " +
  "bg-[#E7E5E4] shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "border border-[#FF2157]/20";

const CONFLICT_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const BTN_OUTLINE =
  "gap-2 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-xs " +
  "font-[family-name:var(--font-space-mono)] " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border-none " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200";

const BTN_DANGER =
  "gap-2 rounded-xl bg-[#FF2157] text-white text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border-none " +
  "hover:bg-[#e01f4f] hover:shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "transition-all duration-200";

const TIMESTAMP_TEXT =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50 flex items-center gap-2";

// ─────────────────────────────────────────────────────────────

export interface VersionBannerProps {
  updatedAt?: string;
  conflict?: boolean;
  onReload?: () => void;
  onCompare?: () => void;
}

export const VersionBanner: React.FC<VersionBannerProps> = ({
  updatedAt,
  conflict = false,
  onReload,
  onCompare,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={conflict ? BANNER_CONFLICT : BANNER_BASE}
    >
      <div className="flex items-center gap-4 flex-wrap">
        {updatedAt && (
          <span className={TIMESTAMP_TEXT}>
            <Clock size={14} className="text-[#006666]" />
            {format(new Date(updatedAt), "PPpp")}
          </span>
        )}

        {conflict && (
          <span className={CONFLICT_BADGE}>
            <AlertTriangle size={12} />
            Conflict Detected
          </span>
        )}
      </div>

      {conflict && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onCompare} className={BTN_OUTLINE}>
            <GitCompare size={14} />
            Compare
          </Button>
          <Button size="sm" onClick={onReload} className={BTN_DANGER}>
            <RefreshCw size={14} />
            Reload
          </Button>
        </div>
      )}
    </motion.div>
  );
};