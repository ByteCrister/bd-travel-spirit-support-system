"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Announcement } from "@/types/dashboard/dashboard.types";

interface AnnouncementBoardProps {
  announcements: Announcement[];
  loading?: boolean;
  className?: string;
}

const ICON = {
  default: <FiVolume2 className="h-4 w-4" aria-hidden />,
  info: <FiInfo className="h-4 w-4" aria-hidden />,
  warning: <FiAlertTriangle className="h-4 w-4" aria-hidden />,
  urgent: <FiAlertCircle className="h-4 w-4" aria-hidden />
} as const;

const PALETTE: Record<string, string> = {
  info: "from-blue-50/60 to-blue-100/40 border-blue-200 text-blue-700 dark:from-blue-900/30 dark:to-blue-950/20 dark:border-blue-800 dark:text-blue-300",
  warning: "from-orange-50/60 to-orange-100/40 border-orange-200 text-orange-700 dark:from-orange-900/30 dark:to-orange-950/20 dark:border-orange-800 dark:text-orange-300",
  urgent: "from-red-50/60 to-red-100/40 border-red-200 text-red-700 dark:from-red-900/30 dark:to-red-950/20 dark:border-red-800 dark:text-red-300",
  default: "from-slate-50/60 to-slate-100/40 border-slate-200 text-slate-700 dark:from-slate-900/30 dark:to-slate-950/20 dark:border-slate-800 dark:text-slate-300"
};

const getIcon = (type: Announcement["type"]) => ICON[type] ?? ICON.default;
const getPalette = (type: Announcement["type"]) => PALETTE[type] ?? PALETTE.default;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

export function AnnouncementBoard({ announcements, loading = false, className }: AnnouncementBoardProps) {
  const active = announcements?.filter((a) => a.isActive) ?? [];

  // Track expanded items by id; also support "expand all"
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = useState(false);

  const toggle = (id: string) => {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  };

  const toggleAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    if (next) {
      const map = active.reduce<Record<string, boolean>>((acc, a) => {
        acc[a.id] = true;
        return acc;
      }, {});
      setExpanded(map);
    } else {
      setExpanded({});
    }
  };

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
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border bg-gradient-to-r from-slate-50/40 to-slate-100/30 dark:from-slate-900/10 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)} aria-live="polite">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiVolume2 className="h-5 w-5" />
            <span className="text-sm font-semibold truncate">Announcements</span>
          </div>

          <div className="flex items-center gap-2">
            {active.length > 0 && (
              <Badge variant="outline" className="shrink-0 text-xs px-2 py-1">
                {active.length} Active
              </Badge>
            )}
            {active.length > 1 && (
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-slate-500 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-pressed={expandAll}
              >
                {expandAll ? "Collapse all" : "Expand all"}
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="w-full max-h-[50vh] sm:max-h-[46vh] lg:max-h-[52vh] pr-1">
          <div className="space-y-3">
            {active.length === 0 ? (
              <div className="text-center py-10">
                <FiVolume2 className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No active announcements</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Check back later for updates</p>
              </div>
            ) : (
              active.map((a, i) => {
                const isExpanded = !!expanded[a.id];
                const contentId = `announce-${a.id}-content`;

                return (
                  <motion.article
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: i * 0.06 }}
                    className={cn(
                      "group flex gap-3 items-start rounded-lg border p-3 sm:p-3.5 transition-shadow hover:shadow-md",
                      getPalette(a.type)
                    )}
                    role="article"
                    aria-labelledby={`announce-${a.id}-title`}
                  >
                    <div
                      className="flex-none rounded-full grid place-items-center h-9 w-9 sm:h-10 sm:w-10 border bg-white/60 dark:bg-slate-900/40"
                      aria-hidden
                    >
                      <div className="flex items-center justify-center text-current">
                        {getIcon(a.type)}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <header className="flex items-start justify-between gap-3">
                        <h3
                          id={`announce-${a.id}-title`}
                          className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate"
                          title={a.title}
                        >
                          {a.title}
                        </h3>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[11px] px-2 py-1 capitalize">
                            {a.type}
                          </Badge>

                          <button
                            type="button"
                            onClick={() => toggle(a.id)}
                            className="text-xs text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            aria-controls={contentId}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? "Less" : "More"}
                          </button>
                        </div>
                      </header>

                      {/* Animated content area: collapsed (maxHeight) -> expanded (auto) */}
                      <div className="mt-1">
                        <AnimatePresence initial={false}>
                          <motion.div
                            key={isExpanded ? "expanded" : "collapsed"}
                            id={contentId}
                            initial={{ height: isExpanded ? 0 : "auto", opacity: isExpanded ? 0 : 1 }}
                            animate={{ height: isExpanded ? "auto" : "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            style={{ overflow: "hidden" }}
                          >
                            <p
                              className={cn(
                                "text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words",
                                // When collapsed, clamp to 3 lines; when expanded, show full text
                                !isExpanded ? "line-clamp-3" : ""
                              )}
                              aria-hidden={!isExpanded}
                            >
                              {a.content}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <FiUser className="h-3 w-3" />
                          <span className="truncate">{a.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock className="h-3 w-3" />
                          <time dateTime={a.createdAt}>{formatDate(a.createdAt)}</time>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
