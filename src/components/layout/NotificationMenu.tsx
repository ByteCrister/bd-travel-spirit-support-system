"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiMessageCircle, FiAlertCircle, FiFlag, FiSettings } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getSocket } from "@/socket/initiateSocket";
import { useAdminNotificationStore } from "@/store/notification.store";
import { ADMIN_NOTIFICATION_TYPE } from "@/constants/support-system-notification.const";
import { SOCKET_NAMESPACES } from "@/constants/socket.const";
import { SupportSystemNotificationType } from "@/types/notification.types";

// Map notification types to icons and colors
const notificationMeta: Record<
  ADMIN_NOTIFICATION_TYPE,
  { icon: React.ElementType; color: string }
> = {
  [ADMIN_NOTIFICATION_TYPE.NEW_USER_SIGNUP]: { icon: FiMessageCircle, color: "bg-blue-500" },
  [ADMIN_NOTIFICATION_TYPE.NEW_GUIDE_REGISTRATION]: { icon: FiMessageCircle, color: "bg-green-500" },
  [ADMIN_NOTIFICATION_TYPE.GUIDE_VERIFIED]: { icon: FiSettings, color: "bg-emerald-500" },
  [ADMIN_NOTIFICATION_TYPE.GUIDE_FORGOT_PASSWORD]: { icon: FiAlertCircle, color: "bg-yellow-500" },
  [ADMIN_NOTIFICATION_TYPE.SUPPORT_EMPLOYEE_FORGOT_PASSWORD]: { icon: FiAlertCircle, color: "bg-orange-500" },
  [ADMIN_NOTIFICATION_TYPE.GUIDE_EMPLOYEE_FORGOT_PASSWORD]: { icon: FiAlertCircle, color: "bg-orange-500" },
  [ADMIN_NOTIFICATION_TYPE.NEW_BOOKING]: { icon: FiMessageCircle, color: "bg-blue-500" },
  [ADMIN_NOTIFICATION_TYPE.BOOKING_CANCELLED]: { icon: FiFlag, color: "bg-red-500" },
  [ADMIN_NOTIFICATION_TYPE.FAILED_PAYMENT]: { icon: FiAlertCircle, color: "bg-red-500" },
  [ADMIN_NOTIFICATION_TYPE.REFUND_REQUESTED]: { icon: FiFlag, color: "bg-amber-500" },
  [ADMIN_NOTIFICATION_TYPE.CONTENT_FLAGGED]: { icon: FiFlag, color: "bg-red-500" },
  [ADMIN_NOTIFICATION_TYPE.NEW_REVIEW]: { icon: FiMessageCircle, color: "bg-purple-500" },
  [ADMIN_NOTIFICATION_TYPE.SYSTEM_ERROR]: { icon: FiAlertCircle, color: "bg-red-600" },
  [ADMIN_NOTIFICATION_TYPE.HIGH_TRAFFIC_ALERT]: { icon: FiAlertCircle, color: "bg-yellow-600" },
  [ADMIN_NOTIFICATION_TYPE.LOW_INVENTORY]: { icon: FiAlertCircle, color: "bg-orange-500" },
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
  } = useAdminNotificationStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initial fetch when panel opens for the first time
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchInitial();
    }
  }, [isOpen, fetchInitial, notifications.length]);

  // Socket listener for new admin notifications
  useEffect(() => {
    const socket = getSocket(SOCKET_NAMESPACES.USER_ONLINE);
    if (!socket) return;

    const handleNewAdminNotification = (payload: { data: SupportSystemNotificationType }) => {
      addNotificationFromSocket(payload.data);
    };

    socket.on(ADMIN_NOTIFICATION_TYPE.NEW_GUIDE_REGISTRATION, handleNewAdminNotification);
    // Add more types as needed
    socket.on(ADMIN_NOTIFICATION_TYPE.NEW_BOOKING, handleNewAdminNotification);
    socket.on(ADMIN_NOTIFICATION_TYPE.SYSTEM_ERROR, handleNewAdminNotification);

    return () => {
      socket.off(ADMIN_NOTIFICATION_TYPE.NEW_GUIDE_REGISTRATION, handleNewAdminNotification);
      socket.off(ADMIN_NOTIFICATION_TYPE.NEW_BOOKING, handleNewAdminNotification);
      socket.off(ADMIN_NOTIFICATION_TYPE.SYSTEM_ERROR, handleNewAdminNotification);
    };
  }, [addNotificationFromSocket]);

  // Infinite scroll: observe the last element
  const lastNotificationRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, fetchMore]
  );

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <motion.button
        onClick={toggleMenu}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications ${totalUnread > 0 ? `(${totalUnread} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 15 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiBell className="h-5 w-5" />
        </motion.div>
        {totalUnread > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-medium text-white shadow-lg shadow-red-500/25"
          >
            {totalUnread > 9 ? "9+" : totalUnread}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20"
              role="dialog"
              aria-label="Notifications panel"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 p-4">
                <h3 className="font-semibold">Notifications</h3>
                {totalUnread > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              <ScrollArea className="max-h-96 thin-scrollbar" ref={scrollRef}>
                {loading && notifications.length === 0 ? (
                  // Skeleton loading
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-600 dark:text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.map((notification, index) => {
                      const meta = notificationMeta[notification.type as ADMIN_NOTIFICATION_TYPE] || {
                        icon: FiMessageCircle,
                        color: "bg-gray-500",
                      };
                      const Icon = meta.icon;
                      const isLast = index === notifications.length - 1;

                      return (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={cn(
                            "flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:scale-[1.02] cursor-pointer group",
                            !notification.isRead &&
                            "bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30"
                          )}
                          onClick={() => markAsRead(notification._id)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          ref={isLast ? lastNotificationRef : null}
                        >
                          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", meta.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{notification.title}</p>
                              {!notification.isRead && (
                                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
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
                      <div className="py-2 text-center text-xs text-slate-500">Loading more...</div>
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