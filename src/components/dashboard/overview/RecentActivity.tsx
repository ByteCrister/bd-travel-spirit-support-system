"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FiUser,
  FiCalendar,
  FiFlag,
  FiMapPin,
  FiSettings,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { RecentActivity as RecentActivityType } from "@/types/dashboard/dashboard.types"

interface RecentActivityProps {
  activities: RecentActivityType[];
  loading?: boolean;
  className?: string;
}

const getActivityIcon = (type: RecentActivityType['type']) => {
  switch (type) {
    case 'signup':
      return <FiUser className="h-4 w-4" />;
    case 'booking':
      return <FiCalendar className="h-4 w-4" />;
    case 'report':
      return <FiFlag className="h-4 w-4" />;
    case 'tour':
      return <FiMapPin className="h-4 w-4" />;
    case 'user_action':
      return <FiSettings className="h-4 w-4" />;
    default:
      return <FiInfo className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity?: RecentActivityType['severity']) => {
  switch (severity) {
    case 'high':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20';
    case 'medium':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20';
    case 'low':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20';
    default:
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20';
  }
};

const getSeverityIcon = (severity?: RecentActivityType['severity']) => {
  switch (severity) {
    case 'high':
      return <FiAlertCircle className="h-3 w-3" />;
    case 'medium':
      return <FiAlertCircle className="h-3 w-3" />;
    case 'low':
      return <FiCheckCircle className="h-3 w-3" />;
    default:
      return <FiInfo className="h-3 w-3" />;
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

export function RecentActivity({ activities, loading = false, className }: RecentActivityProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiClock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiClock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <FiClock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full",
                    getSeverityColor(activity.severity)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {activity.title}
                      </h4>
                      {activity.severity && (
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                          getSeverityColor(activity.severity)
                        )}>
                          {getSeverityIcon(activity.severity)}
                          {activity.severity}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {activity.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      {activity.user && (
                        <Badge variant="outline" className="text-xs">
                          {activity.user}
                        </Badge>
                      )}
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
