"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  description?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple" | "indigo";
  loading?: boolean;
  className?: string;
}

const colorVariants = {
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    accent: "bg-blue-500",
  },
  green: {
    bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    accent: "bg-green-500",
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    icon: "text-orange-600 dark:text-orange-400",
    accent: "bg-orange-500",
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    accent: "bg-red-500",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400",
    accent: "bg-purple-500",
  },
  indigo: {
    bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20",
    border: "border-indigo-200 dark:border-indigo-800",
    icon: "text-indigo-600 dark:text-indigo-400",
    accent: "bg-indigo-500",
  },
};

export function StatsCard({
  title,
  value,
  icon,
  change,
  description,
  color = "blue",
  loading = false,
  className,
}: StatsCardProps) {
  const colors = colorVariants[color];

  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", colors.bg, colors.border, className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
            </div>
            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Card className={cn("relative overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-slate-200/60 dark:hover:ring-slate-700/60", colors.bg, colors.border, className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {title}
                </h3>
                {change && (
                  <Badge
                    variant={change.type === "increase" ? "default" : change.type === "decrease" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {change.type === "increase" ? "+" : change.type === "decrease" ? "-" : ""}
                    {Math.abs(change.value)}%
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
                {description && (
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            <div className={cn("p-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm",)}>
              <div className={cn("h-6 w-6", colors.icon)}>
                {icon}
              </div>
            </div>
          </div>
          
          {/* Gradient accent */}
          <div className="absolute inset-x-0 -bottom-px h-1">
            <div className={cn("h-full w-full", colors.accent)} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
