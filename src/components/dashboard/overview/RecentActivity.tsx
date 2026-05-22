"use client";

import { motion } from "framer-motion";
import {
  FiUser, FiCalendar, FiFlag, FiMapPin, FiSettings,
  FiClock, FiAlertCircle, FiCheckCircle, FiInfo,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { RecentActivity as RecentActivityType } from "@/types/dashboard/dashboard.types";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Severity configs ──────────────────────────────────────────────────────────
const severityConfig = {
  high: { iconBg: "bg-[#FF2157]/10", iconColor: "text-[#FF2157]", leftBar: "#FF2157", badgeColor: "bg-[#FF2157]/10 text-[#FF2157]", icon: <FiAlertCircle className="h-3 w-3" /> },
  medium: { iconBg: "bg-[#FE9900]/10", iconColor: "text-[#FE9900]", leftBar: "#FE9900", badgeColor: "bg-[#FE9900]/10 text-[#FE9900]", icon: <FiAlertCircle className="h-3 w-3" /> },
  low: { iconBg: "bg-[#00A63D]/10", iconColor: "text-[#00A63D]", leftBar: "#00A63D", badgeColor: "bg-[#00A63D]/10 text-[#00A63D]", icon: <FiCheckCircle className="h-3 w-3" /> },
  default: { iconBg: "bg-[#006666]/10", iconColor: "text-[#006666]", leftBar: "#006666", badgeColor: "bg-[#006666]/10 text-[#006666]", icon: <FiInfo className="h-3 w-3" /> },
};

const getActivityIcon = (type: RecentActivityType["type"]) => {
  switch (type) {
    case "signup": return <FiUser className="h-4 w-4" />;
    case "booking": return <FiCalendar className="h-4 w-4" />;
    case "report": return <FiFlag className="h-4 w-4" />;
    case "tour": return <FiMapPin className="h-4 w-4" />;
    case "user_action": return <FiSettings className="h-4 w-4" />;
    default: return <FiInfo className="h-4 w-4" />;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

interface RecentActivityProps {
  activities: RecentActivityType[];
  loading?: boolean;
  className?: string;
}

export function RecentActivity({ activities, loading = false, className }: RecentActivityProps) {
  if (loading) {
    return (
      <div className={cn(NEU_CARD, "p-5", className)}>
        <div className="flex items-center gap-2 mb-5">
          <div className={cn(NEU_SKELETON, "h-5 w-5 rounded-lg")} />
          <div className={cn(NEU_SKELETON, "h-4 w-32")} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <div className={cn(NEU_SKELETON, "h-9 w-9 rounded-xl flex-shrink-0")} />
              <div className="flex-1 space-y-2">
                <div className={cn(NEU_SKELETON, "h-3.5 w-full")} />
                <div className={cn(NEU_SKELETON, "h-3 w-3/4")} />
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
      <div className={cn("flex items-center gap-2.5 pb-4 mb-2 border-b", NEU_DIVIDER)}>
        <div className="p-2 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
          <FiClock className="h-4 w-4 text-[#006666]" />
        </div>
        <h3 className={cn(NEU_HEADING, "text-base")}>Recent Activity</h3>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto pr-1 space-y-1.5">
        {activities.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center">
              <FiClock className="h-6 w-6 text-[#1E2938]/30" />
            </div>
            <p className={cn(NEU_HEADING, "text-sm")}>No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const sev = activity.severity ?? "default";
            const cfg = severityConfig[sev as keyof typeof severityConfig] ?? severityConfig.default;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl relative overflow-hidden",
                  "hover:bg-[#E7E5E4] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                  "transition-all duration-200 cursor-default"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center",
                  cfg.iconBg,
                  "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]"
                )}>
                  <span className={cfg.iconColor}>{getActivityIcon(activity.type)}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className={cn(NEU_HEADING, "text-sm truncate")}>{activity.title}</h4>
                    {activity.severity && (
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold",
                        "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
                        cfg.badgeColor
                      )}>
                        {cfg.icon}
                        {activity.severity}
                      </span>
                    )}
                  </div>

                  <p className={cn(NEU_MUTED, "text-xs leading-relaxed mb-1.5")}>{activity.description}</p>

                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(NEU_MUTED, "text-xs")}>{formatTimeAgo(activity.timestamp)}</span>
                    {activity.user && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/60",
                        "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]"
                      )}>
                        {activity.user}
                      </span>
                    )}
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