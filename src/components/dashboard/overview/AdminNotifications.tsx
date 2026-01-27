"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FiBell,
  FiFlag,
  FiAlertTriangle,
  FiAlertCircle,
  FiUser,
  FiCheck,
  FiClock,
  FiEye,
  FiX
} from "react-icons/fi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { AdminNotification } from "@/types/dashboard.types";

interface AdminNotificationsProps {
  notifications: AdminNotification[];
  loading?: boolean;
  onMarkAsRead?: (notificationId: string) => void;
  onView?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  className?: string;
}

const getNotificationIcon = (type: AdminNotification['type']) => {
  switch (type) {
    case 'report':
      return <FiFlag className="h-4 w-4" />;
    case 'ticket':
      return <FiAlertTriangle className="h-4 w-4" />;
    case 'flagged_user':
      return <FiUser className="h-4 w-4" />;
    case 'system_alert':
      return <FiAlertCircle className="h-4 w-4" />;
    case 'revenue_issue':
      return <FaBangladeshiTakaSign className="h-4 w-4" />;
    case 'approval_pending':
      return <FiCheck className="h-4 w-4" />;
    default:
      return <FiBell className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: AdminNotification['severity']) => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
    case 'high':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    case 'low':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    default:
      return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export function AdminNotifications({
  notifications,
  loading = false,
  onMarkAsRead,
  onView,
  onDismiss,
  className
}: AdminNotificationsProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiBell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3 lg:pb-2">
        <CardTitle className="flex items-center justify-between gap-2">
          <FiBell className="h-5 w-5" />
          <span className="truncate">Notifications</span>
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount}
              </Badge>
            )}
            {actionRequiredCount > 0 && (
              <Badge variant="outline">
                {actionRequiredCount} Action Required
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 lg:pt-0">
        <ScrollArea className="w-full pr-1 max-h-[60vh] lg:max-h-[52vh] xl:max-h-[54vh] overflow-auto">
          <div className="space-y-2 lg:space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <FiBell className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No notifications</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-3 lg:p-4 border rounded-lg transition-all duration-200 hover:shadow-sm border-slate-200 dark:border-slate-800",
                    getSeverityColor(notification.severity),
                    !notification.isRead && "ring-2 ring-blue-500/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 lg:h-9 lg:w-9 rounded-full",
                      getSeverityColor(notification.severity)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1 lg:mb-1.5">
                        <h4 className="text-sm lg:text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">
                          {notification.title}
                        </h4>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {notification.severity}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>

                      <p className="text-[13px] lg:text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FiClock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>

                        <div className="flex gap-2 lg:self-start">
                          {onView && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onView(notification.id)}
                              className="h-7 px-2 text-[11px]"
                            >
                              <FiEye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                          {onMarkAsRead && !notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMarkAsRead(notification.id)}
                              className="h-7 px-2 text-[11px]"
                            >
                              <FiCheck className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          {onDismiss && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDismiss(notification.id)}
                              className="h-7 px-2 text-[11px] text-slate-400 hover:text-slate-600"
                            >
                              <FiX className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
