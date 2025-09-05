"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FiVolume2, 
  FiInfo, 
  FiAlertTriangle, 
  FiAlertCircle,
  FiClock,
  FiUser
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Announcement } from "@/store/useDashboardStore";

interface AnnouncementBoardProps {
  announcements: Announcement[];
  loading?: boolean;
  className?: string;
}

const getAnnouncementIcon = (type: Announcement['type']) => {
  switch (type) {
    case 'info':
      return <FiInfo className="h-4 w-4" />;
    case 'warning':
      return <FiAlertTriangle className="h-4 w-4" />;
    case 'urgent':
      return <FiAlertCircle className="h-4 w-4" />;
    default:
      return <FiVolume2 className="h-4 w-4" />;
  }
};

const getAnnouncementColor = (type: Announcement['type']) => {
  switch (type) {
    case 'info':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    case 'warning':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
    case 'urgent':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
    default:
      return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function AnnouncementBoard({ announcements, loading = false, className }: AnnouncementBoardProps) {
  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiVolume2 className="h-5 w-5" />
            Announcements
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
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAnnouncements = announcements.filter(announcement => announcement.isActive);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiVolume2 className="h-5 w-5" />
          Announcements
          {activeAnnouncements.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {activeAnnouncements.length} Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[60vh] lg:max-h-[65vh]">
          <div className="space-y-4">
            {activeAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <FiVolume2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No active announcements</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Check back later for updates</p>
              </div>
            ) : (
              activeAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-4 border rounded-lg transition-all duration-200 hover:shadow-md",
                    getAnnouncementColor(announcement.type)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-full",
                      getAnnouncementColor(announcement.type)
                    )}>
                      {getAnnouncementIcon(announcement.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {announcement.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {announcement.type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FiUser className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-500">
                              {announcement.createdBy}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-500">
                              {formatDate(announcement.createdAt)}
                            </span>
                          </div>
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
