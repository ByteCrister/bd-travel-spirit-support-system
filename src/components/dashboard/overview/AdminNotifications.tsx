"use client";

import { motion } from "framer-motion";
import {
  FiBell, FiFlag, FiAlertTriangle, FiAlertCircle,
  FiUser, FiCheck, FiClock, FiEye, FiX,
} from "react-icons/fi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { AdminNotification } from "@/types/dashboard/dashboard.types";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";
const NEU_BTN_ICON =
  "rounded-xl w-7 h-7 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_BADGE = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";

interface AdminNotificationsProps {
  notifications: AdminNotification[];
  loading?: boolean;
  onMarkAsRead?: (notificationId: string) => void;
  onView?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  className?: string;
}

const getNotificationIcon = (type: AdminNotification["type"]) => {
  switch (type) {
    case "report": return <FiFlag className="h-4 w-4" />;
    case "ticket": return <FiAlertTriangle className="h-4 w-4" />;
    case "flagged_user": return <FiUser className="h-4 w-4" />;
    case "system_alert": return <FiAlertCircle className="h-4 w-4" />;
    case "revenue_issue": return <FaBangladeshiTakaSign className="h-4 w-4" />;
    case "approval_pending": return <FiCheck className="h-4 w-4" />;
    default: return <FiBell className="h-4 w-4" />;
  }
};

const severityConfig = {
  critical: { iconBg: "bg-[#FF2157]/10", iconColor: "text-[#FF2157]", leftBar: "#FF2157", badge: NEU_BADGE_DANGER },
  high: { iconBg: "bg-[#FE9900]/10", iconColor: "text-[#FE9900]", leftBar: "#FE9900", badge: NEU_BADGE_WARNING },
  medium: { iconBg: "bg-[#FE9900]/10", iconColor: "text-[#FE9900]", leftBar: "#FE9900", badge: NEU_BADGE_WARNING },
  low: { iconBg: "bg-[#006666]/10", iconColor: "text-[#006666]", leftBar: "#006666", badge: NEU_BADGE },
};

const formatTimeAgo = (timestamp: string) => {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export function AdminNotifications({
  notifications,
  loading = false,
  onMarkAsRead,
  onView,
  onDismiss,
  className,
}: AdminNotificationsProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const actionRequiredCount = notifications.filter((n) => n.actionRequired).length;

  if (loading) {
    return (
      <div className={cn(NEU_CARD, "p-5", className)}>
        <div className="flex items-center gap-2 mb-5">
          <div className={cn(NEU_SKELETON, "h-5 w-5 rounded-lg")} />
          <div className={cn(NEU_SKELETON, "h-4 w-32")} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn(NEU_CARD_SM, "p-4")}>
              <div className="flex items-start gap-3">
                <div className={cn(NEU_SKELETON, "h-9 w-9 rounded-xl")} />
                <div className="flex-1 space-y-2">
                  <div className={cn(NEU_SKELETON, "h-3.5 w-full")} />
                  <div className={cn(NEU_SKELETON, "h-3 w-3/4")} />
                  <div className="flex gap-2">
                    <div className={cn(NEU_SKELETON, "h-5 w-16 rounded-lg")} />
                    <div className={cn(NEU_SKELETON, "h-5 w-20 rounded-lg")} />
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
          <div className="p-2 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
            <FiBell className="h-4 w-4 text-[#006666]" />
          </div>
          <h3 className={cn(NEU_HEADING, "text-base")}>Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className={NEU_BADGE_DANGER}>{unreadCount} unread</span>
          )}
          {actionRequiredCount > 0 && (
            <span className={NEU_BADGE_WARNING}>{actionRequiredCount} action</span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center">
              <FiBell className="h-6 w-6 text-[#1E2938]/30" />
            </div>
            <p className={cn(NEU_HEADING, "text-sm")}>No notifications</p>
            <p className={cn(NEU_MUTED, "text-xs mt-1")}>You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map((notification, index) => {
            const cfg = severityConfig[notification.severity] ?? severityConfig.low;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
                className={cn(
                  NEU_CARD_SM,
                  "p-3.5 relative overflow-hidden transition-shadow duration-200",
                  "hover:shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]",
                  !notification.isRead && "ring-2 ring-[#006666]/20"
                )}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                  style={{ backgroundColor: cfg.leftBar }}
                />

                <div className="pl-3 flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center",
                    cfg.iconBg,
                    "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]"
                  )}>
                    <span className={cfg.iconColor}>{getNotificationIcon(notification.type)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={cn(NEU_HEADING, "text-sm truncate flex-1")}>{notification.title}</h4>
                      {!notification.isRead && (
                        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-[#006666] mt-1" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className={cfg.badge}>{notification.severity}</span>
                      {notification.actionRequired && (
                        <span className={NEU_BADGE_DANGER}>Action Required</span>
                      )}
                    </div>

                    <p className={cn(NEU_MUTED, "text-xs leading-relaxed mb-2.5")}>
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <FiClock className="h-3 w-3 text-[#1E2938]/30" />
                        <span className={cn(NEU_MUTED, "text-xs")}>{formatTimeAgo(notification.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onView && (
                          <button
                            onClick={() => onView(notification.id)}
                            className={cn(NEU_BTN_GHOST, "px-2.5 py-1 text-xs flex items-center gap-1")}
                          >
                            <FiEye className="h-3 w-3" /> View
                          </button>
                        )}
                        {onMarkAsRead && !notification.isRead && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className={cn(NEU_BTN_GHOST, "px-2.5 py-1 text-xs flex items-center gap-1 text-[#006666]")}
                          >
                            <FiCheck className="h-3 w-3" /> Read
                          </button>
                        )}
                        {onDismiss && (
                          <button
                            onClick={() => onDismiss(notification.id)}
                            className={cn(NEU_BTN_ICON)}
                          >
                            <FiX className="h-3 w-3" />
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