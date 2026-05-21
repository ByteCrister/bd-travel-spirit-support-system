"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiMessageCircle,
  FiAlertCircle,
  FiFlag,
  FiSettings,
} from "react-icons/fi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getSocket } from "@/socket/initiateSocket";
import { useSupportSystemNotificationStore } from "@/store/support-system-notification.store";
import { ADMIN_NOTIFICATION_TYPE } from "@/constants/support-system-notification.const";
import { SOCKET_NAMESPACES } from "@/constants/socket.const";
import { SupportSystemNotificationType } from "@/types/notification.types";

// ─── Neumorphism style tokens ────────────────────────────────
const NEU_BTN_ICON =
  "rounded-xl flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_PANEL =
  "absolute right-0 top-12 z-50 w-80 rounded-2xl p-0 overflow-hidden " +
  "bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/60";
const NEU_ITEM =
  "flex items-start gap-3 rounded-xl p-3 cursor-pointer " +
  "transition-all duration-200 " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "hover:text-[#006666]";
const NEU_ITEM_UNREAD =
  "bg-[#006666]/5 shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_BADGE_DANGER =
  "absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full " +
  "bg-[#FF2157] text-[9px] font-bold text-white font-[family-name:var(--font-space-mono)] " +
  "shadow-[2px_2px_4px_#c8c6c5,-1px_-1px_3px_#ffffff]";
const NEU_MARK_ALL_BTN =
  "text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#006666] " +
  "px-2.5 py-1 rounded-lg " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "transition-all duration-200";
// ─────────────────────────────────────────────────────────────

const notificationMeta: Record<
  ADMIN_NOTIFICATION_TYPE,
  { icon: React.ElementType; color: string }
> = {
  [ADMIN_NOTIFICATION_TYPE.NEW_USER_SIGNUP]: { icon: FiMessageCircle, color: "bg-[#006666]" },
  [ADMIN_NOTIFICATION_TYPE.NEW_GUIDE_REGISTRATION]: { icon: FiMessageCircle, color: "bg-[#00A63D]" },
  [ADMIN_NOTIFICATION_TYPE.GUIDE_VERIFIED]: { icon: FiSettings, color: "bg-[#00A63D]" },
  [ADMIN_NOTIFICATION_TYPE.GUIDE_FORGOT_PASSWORD]: { icon: FiAlertCircle, color: "bg-[#FE9900]" },
  [ADMIN_NOTIFICATION_TYPE.SUPPORT_EMP_FORGOT_PASSWORD]: { icon: FiAlertCircle, color: "bg-[#FE9900]" },
  [ADMIN_NOTIFICATION_TYPE.GUIDE_EMP_FORGOT_PASSWORD]: { icon: FiAlertCircle, color: "bg-[#FE9900]" },
  [ADMIN_NOTIFICATION_TYPE.NEW_BOOKING]: { icon: FiMessageCircle, color: "bg-[#006666]" },
  [ADMIN_NOTIFICATION_TYPE.BOOKING_CANCELLED]: { icon: FiFlag, color: "bg-[#FF2157]" },
  [ADMIN_NOTIFICATION_TYPE.FAILED_PAYMENT]: { icon: FiAlertCircle, color: "bg-[#FF2157]" },
  [ADMIN_NOTIFICATION_TYPE.CONTENT_FLAGGED]: { icon: FiFlag, color: "bg-[#FF2157]" },
  [ADMIN_NOTIFICATION_TYPE.SYSTEM_ERROR]: { icon: FiAlertCircle, color: "bg-[#FF2157]" },
  [ADMIN_NOTIFICATION_TYPE.HIGH_TRAFFIC_ALERT]: { icon: FiAlertCircle, color: "bg-[#FE9900]" },
  [ADMIN_NOTIFICATION_TYPE.LOW_INVENTORY]: { icon: FiAlertCircle, color: "bg-[#FE9900]" },
  [ADMIN_NOTIFICATION_TYPE.NEW_REVIEW]: { icon: FiMessageCircle, color: "bg-[#006666]" },
  [ADMIN_NOTIFICATION_TYPE.REFUND_REQUESTED]: { icon: FiFlag, color: "bg-[#FE9900]" },
};

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    loading,
    hasMore,
    totalUnread,
    fetchInitial,
    fetchMore,
    markAsRead,
    markAllAsRead,
    addNotificationFromSocket,
  } = useSupportSystemNotificationStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (isOpen && notifications.length === 0) fetchInitial();
  }, [isOpen, fetchInitial, notifications.length]);

  useEffect(() => {
    const socket = getSocket(SOCKET_NAMESPACES.USER_ONLINE);
    if (!socket) return;
    const handleNew = (payload: { data: SupportSystemNotificationType }) =>
      addNotificationFromSocket(payload.data);
    socket.on(ADMIN_NOTIFICATION_TYPE.NEW_GUIDE_REGISTRATION, handleNew);
    socket.on(ADMIN_NOTIFICATION_TYPE.SYSTEM_ERROR, handleNew);
    return () => {
      socket.off(ADMIN_NOTIFICATION_TYPE.NEW_GUIDE_REGISTRATION, handleNew);
      socket.off(ADMIN_NOTIFICATION_TYPE.SYSTEM_ERROR, handleNew);
    };
  }, [addNotificationFromSocket]);

  const lastNotificationRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) fetchMore();
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, fetchMore]
  );

  return (
    <div className="relative">
      {/* Bell button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(NEU_BTN_ICON, "relative h-10 w-10")}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications${totalUnread > 0 ? ` (${totalUnread} unread)` : ""}`}
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 20 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiBell className="h-5 w-5" />
        </motion.div>

        {totalUnread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={NEU_BADGE_DANGER}
          >
            {totalUnread > 9 ? "9+" : totalUnread}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={NEU_PANEL}
              role="dialog"
              aria-label="Notifications panel"
            >
              {/* Header */}
              <div
                className={cn(
                  "flex items-center justify-between border-b px-4 py-3",
                  NEU_DIVIDER
                )}
              >
                <h3 className={cn(NEU_HEADING, "text-sm")}>Notifications</h3>
                {totalUnread > 0 && (
                  <button onClick={markAllAsRead} className={NEU_MARK_ALL_BTN}>
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <ScrollArea className="max-h-96" ref={scrollRef}>
                {loading && notifications.length === 0 ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={cn(NEU_SKELETON, "h-8 w-8 rounded-full")} />
                        <div className="flex-1 space-y-2">
                          <div className={cn(NEU_SKELETON, "h-3 w-3/4")} />
                          <div className={cn(NEU_SKELETON, "h-2.5 w-1/2")} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <FiBell className="mx-auto h-8 w-8 text-[#1E2938]/20 mb-2" />
                    <p className={cn(NEU_MUTED, "text-[#1E2938]/40")}>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {notifications.map((notification, index) => {
                      const meta =
                        notificationMeta[
                        notification.type as ADMIN_NOTIFICATION_TYPE
                        ] ?? { icon: FiMessageCircle, color: "bg-[#006666]" };
                      const Icon = meta.icon;
                      const isLast = index === notifications.length - 1;

                      return (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={cn(
                            NEU_ITEM,
                            !notification.isRead && NEU_ITEM_UNREAD
                          )}
                          onClick={() => markAsRead(notification._id)}
                          whileTap={{ scale: 0.98 }}
                          ref={isLast ? lastNotificationRef : null}
                        >
                          {/* Icon dot */}
                          <div
                            className={cn(
                              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white",
                              meta.color,
                              "shadow-[2px_2px_5px_rgba(0,0,0,0.15)]"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p
                                className={cn(
                                  "text-xs font-semibold truncate text-[#1E2938]",
                                  "font-[family-name:var(--font-space-mono)]"
                                )}
                              >
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#006666] flex-shrink-0" />
                              )}
                            </div>
                            <p
                              className={cn(
                                NEU_MUTED,
                                "line-clamp-2 text-[#1E2938]/50 leading-relaxed"
                              )}
                            >
                              {notification.message}
                            </p>
                            <p className={cn(NEU_MUTED, "mt-0.5 text-[10px]")}>
                              {new Date(notification.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}

                    {loading && hasMore && (
                      <p className={cn(NEU_MUTED, "py-2 text-center")}>
                        Loading more…
                      </p>
                    )}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}