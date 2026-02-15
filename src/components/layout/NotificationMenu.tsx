"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiMessageCircle, FiAlertCircle, FiFlag, FiSettings } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "message" | "update" | "system" | "flag";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "New Support Ticket",
    message: "User John Doe has submitted a new support request",
    timestamp: "2 min ago",
    isRead: false,
  },
  {
    id: "2",
    type: "update",
    title: "System Update",
    message: "Dashboard has been updated with new features",
    timestamp: "1 hour ago",
    isRead: false,
  },
  {
    id: "3",
    type: "flag",
    title: "Content Flagged",
    message: "A tour listing has been flagged for review",
    timestamp: "3 hours ago",
    isRead: true,
  },
  {
    id: "4",
    type: "system",
    title: "Backup Complete",
    message: "Daily backup has been completed successfully",
    timestamp: "1 day ago",
    isRead: true,
  },
];

const notificationIcons = {
  message: FiMessageCircle,
  update: FiSettings,
  system: FiAlertCircle,
  flag: FiFlag,
};

const notificationColors = {
  message: "bg-blue-500",
  update: "bg-green-500",
  system: "bg-yellow-500",
  flag: "bg-red-500",
};

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isAnimating, setIsAnimating] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setIsAnimating(true);
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setTimeout(() => setIsAnimating(false), 300);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggleMenu}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 15 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiBell className="h-5 w-5" />
        </motion.div>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-medium text-white shadow-lg shadow-red-500/25"
          >
            <motion.span
              animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
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
            
            {/* Notification Panel */}
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
                {unreadCount > 0 && (
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

              <ScrollArea className="max-h-96">
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-600 dark:text-slate-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification, index) => {
                      const Icon = notificationIcons[notification.type];
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:scale-[1.02] cursor-pointer group",
                            !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30"
                          )}
                          onClick={() => markAsRead(notification.id)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-white",
                            notificationColors[notification.type]
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              {notification.timestamp}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
