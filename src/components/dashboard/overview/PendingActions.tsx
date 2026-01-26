"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FiFlag,
  FiAlertTriangle,
  FiEye,
  FiCheck,
  FiUser,
  FiMapPin,
  FiSettings,
  FiAlertCircle
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { PendingAction } from "@/types/dashboard.types";

interface PendingActionsProps {
  actions: PendingAction[];
  loading?: boolean;
  onResolve?: (actionId: string) => void;
  onView?: (actionId: string) => void;
  className?: string;
}

const getActionIcon = (type: PendingAction['type']) => {
  switch (type) {
    case 'report':
      return <FiFlag className="h-4 w-4" />;
    case 'complaint':
      return <FiAlertTriangle className="h-4 w-4" />;
    case 'flagged_content':
      return <FiAlertCircle className="h-4 w-4" />;
    case 'organizer_approval':
      return <FiUser className="h-4 w-4" />;
    case 'tour_approval':
      return <FiMapPin className="h-4 w-4" />;
    default:
      return <FiSettings className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: PendingAction['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
    case 'high':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    case 'low':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
    default:
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
  }
};

const getStatusColor = (status: PendingAction['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
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

export function PendingActions({
  actions,
  loading = false,
  onResolve,
  onView,
  className
}: PendingActionsProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5" />
            Pending Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
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
          <FiAlertTriangle className="h-5 w-5" />
          <span className="truncate">Pending Actions</span>
          {actions.length > 0 && (
            <Badge variant="destructive" className="shrink-0">
              {actions.filter(action => action.status === 'pending').length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 lg:pt-0">
        <ScrollArea className="w-full pr-1 max-h-[60vh] lg:max-h-[52vh] xl:max-h-[54vh] overflow-auto">
          <div className="space-y-2 lg:space-y-3">
            {actions.length === 0 ? (
              <div className="text-center py-8">
                <FiCheck className="h-12 w-12 text-green-300 dark:text-green-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No pending actions</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">All caught up!</p>
              </div>
            ) : (
              actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-3 lg:p-4 border rounded-lg transition-all duration-200 hover:shadow-sm border-slate-200 dark:border-slate-800",
                    getPriorityColor(action.priority)
                  )}
                >
                  <div className="flex items-start gap-3 lg:gap-3 lg:grid lg:grid-cols-[1fr_auto]">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 lg:h-9 lg:w-9 rounded-full",
                      getPriorityColor(action.priority)
                    )}>
                      {getActionIcon(action.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1 lg:mb-1.5">
                        <h4 className="text-sm lg:text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">
                          {action.title}
                        </h4>
                        <Badge className={cn("text-xs", getStatusColor(action.status))}>
                          {action.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-[13px] lg:text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {action.description}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <Badge variant="outline" className="text-xs">
                            {action.priority}
                          </Badge>
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {formatTimeAgo(action.createdAt)}
                          </span>
                        </div>

                        <div className="flex gap-2 lg:self-start">
                          {onView && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onView(action.id)}
                              className="h-7 px-2 text-[11px]"
                            >
                              <FiEye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                          {onResolve && action.status !== 'resolved' && (
                            <Button
                              size="sm"
                              onClick={() => onResolve(action.id)}
                              className="h-7 px-2 text-[11px]"
                            >
                              <FiCheck className="h-3 w-3 mr-1" />
                              Resolve
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
