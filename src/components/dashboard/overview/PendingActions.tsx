"use client";

import { motion } from "framer-motion";
import {
  FiFlag, FiAlertTriangle, FiEye, FiCheck,
  FiUser, FiMapPin, FiSettings, FiAlertCircle,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { PendingAction } from "@/types/dashboard/dashboard.types";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_BADGE_DANGER = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Priority configs ──────────────────────────────────────────────────────────
const priorityConfig = {
  urgent: { iconBg: "bg-[#FF2157]/10", iconColor: "text-[#FF2157]", leftBar: "#FF2157", badgeColor: "bg-[#FF2157]/10 text-[#FF2157]" },
  high: { iconBg: "bg-[#FE9900]/10", iconColor: "text-[#FE9900]", leftBar: "#FE9900", badgeColor: "bg-[#FE9900]/10 text-[#FE9900]" },
  medium: { iconBg: "bg-[#FE9900]/10", iconColor: "text-[#FE9900]", leftBar: "#FE9900", badgeColor: "bg-[#FE9900]/10 text-[#FE9900]" },
  low: { iconBg: "bg-[#00A63D]/10", iconColor: "text-[#00A63D]", leftBar: "#00A63D", badgeColor: "bg-[#00A63D]/10 text-[#00A63D]" },
};

const statusConfig = {
  pending: { label: "Pending", color: "bg-[#FE9900]/10 text-[#FE9900]" },
  in_progress: { label: "In Progress", color: "bg-[#006666]/10 text-[#006666]" },
  resolved: { label: "Resolved", color: "bg-[#00A63D]/10 text-[#00A63D]" },
};

const getActionIcon = (type: PendingAction["type"]) => {
  switch (type) {
    case "report": return <FiFlag className="h-4 w-4" />;
    case "complaint": return <FiAlertTriangle className="h-4 w-4" />;
    case "flagged_content": return <FiAlertCircle className="h-4 w-4" />;
    case "organizer_approval": return <FiUser className="h-4 w-4" />;
    case "tour_approval": return <FiMapPin className="h-4 w-4" />;
    default: return <FiSettings className="h-4 w-4" />;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

interface PendingActionsProps {
  actions: PendingAction[];
  loading?: boolean;
  onResolve?: (actionId: string) => void;
  onView?: (actionId: string) => void;
  className?: string;
}

export function PendingActions({
  actions,
  loading = false,
  onResolve,
  onView,
  className,
}: PendingActionsProps) {
  const pendingCount = actions.filter((a) => a.status === "pending").length;

  if (loading) {
    return (
      <div className={cn(NEU_CARD, "p-5", className)}>
        <div className="flex items-center gap-2 mb-5">
          <div className={cn(NEU_SKELETON, "h-5 w-5 rounded-lg")} />
          <div className={cn(NEU_SKELETON, "h-4 w-36")} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn(NEU_CARD_SM, "p-4")}>
              <div className="flex items-start gap-3">
                <div className={cn(NEU_SKELETON, "h-9 w-9 rounded-xl")} />
                <div className="flex-1 space-y-2">
                  <div className={cn(NEU_SKELETON, "h-3.5 w-full")} />
                  <div className={cn(NEU_SKELETON, "h-3 w-3/4")} />
                  <div className="flex gap-2">
                    <div className={cn(NEU_SKELETON, "h-6 w-16 rounded-lg")} />
                    <div className={cn(NEU_SKELETON, "h-6 w-20 rounded-lg")} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(NEU_CARD, "p-5", className)}>
      {/* Header */}
      <div className={cn("flex items-center justify-between pb-4 mb-4 border-b", NEU_DIVIDER)}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FE9900]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
            <FiAlertTriangle className="h-4 w-4 text-[#FE9900]" />
          </div>
          <h3 className={cn(NEU_HEADING, "text-base")}>Pending Actions</h3>
        </div>
        {pendingCount > 0 && (
          <span className={NEU_BADGE_DANGER}>{pendingCount} pending</span>
        )}
      </div>

      {/* List */}
      <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
        {actions.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center">
              <FiCheck className="h-6 w-6 text-[#00A63D]/60" />
            </div>
            <p className={cn(NEU_HEADING, "text-sm")}>No pending actions</p>
            <p className={cn(NEU_MUTED, "text-xs mt-1")}>All caught up!</p>
          </div>
        ) : (
          actions.map((action, index) => {
            const pCfg = priorityConfig[action.priority] ?? priorityConfig.low;
            const sCfg = statusConfig[action.status] ?? { label: action.status, color: "bg-[#1E2938]/10 text-[#1E2938]" };

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
                className={cn(
                  NEU_CARD_SM,
                  "p-3.5 relative overflow-hidden transition-shadow duration-200",
                  "hover:shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]"
                )}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                  style={{ backgroundColor: pCfg.leftBar }}
                />

                <div className="pl-3 flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center",
                    pCfg.iconBg,
                    "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]"
                  )}>
                    <span className={pCfg.iconColor}>{getActionIcon(action.type)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1.5">
                      <h4 className={cn(NEU_HEADING, "text-sm truncate flex-1")}>{action.title}</h4>
                      <span className={cn(
                        "flex-shrink-0 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold",
                        NEU_SURFACE_INSET_SM, sCfg.color
                      )}>
                        {sCfg.label}
                      </span>
                    </div>

                    <p className={cn(NEU_MUTED, "text-xs leading-relaxed mb-2.5")}>
                      {action.description}
                    </p>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold",
                          pCfg.badgeColor,
                          "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]"
                        )}>
                          {action.priority}
                        </span>
                        <span className={cn(NEU_MUTED, "text-xs")}>{formatTimeAgo(action.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onView && (
                          <button
                            onClick={() => onView(action.id)}
                            className={cn(NEU_BTN_GHOST, "px-2.5 py-1 text-xs flex items-center gap-1")}
                          >
                            <FiEye className="h-3 w-3" /> View
                          </button>
                        )}
                        {onResolve && action.status !== "resolved" && (
                          <button
                            onClick={() => onResolve(action.id)}
                            className={cn(NEU_BTN_PRIMARY, "px-2.5 py-1 text-xs flex items-center gap-1")}
                          >
                            <FiCheck className="h-3 w-3" /> Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}