// components/guide/StatusBadge.tsx
"use client";

import { GUIDE_STATUS, GuideStatus } from "@/constants/guide.const";
import { FiCheckCircle, FiClock, FiPause, FiXCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_BADGE_BASE =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

// ─────────────────────────────────────────────────────────────────────────────

const statusConfig = {
  [GUIDE_STATUS.PENDING]: {
    label: "Pending",
    colorClass: "bg-[#FE9900]/10 text-[#FE9900]",
    dot: "bg-[#FE9900]",
    icon: FiClock,
  },
  [GUIDE_STATUS.APPROVED]: {
    label: "Approved",
    colorClass: "bg-[#00A63D]/10 text-[#00A63D]",
    dot: "bg-[#00A63D]",
    icon: FiCheckCircle,
  },
  [GUIDE_STATUS.REJECTED]: {
    label: "Rejected",
    colorClass: "bg-[#FF2157]/10 text-[#FF2157]",
    dot: "bg-[#FF2157]",
    icon: FiXCircle,
  },
  [GUIDE_STATUS.SUSPENDED]: {
    label: "Suspended",
    colorClass: "bg-[#FE9900]/10 text-[#FE9900]",
    dot: "bg-[#FE9900]",
    icon: FiPause,
  },
};

const StatusBadge = ({ status }: { status: GuideStatus }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(NEU_BADGE_BASE, config.colorClass)}
      role="status"
      aria-label={config.label}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", config.dot)}
        aria-hidden="true"
      />
      <Icon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
