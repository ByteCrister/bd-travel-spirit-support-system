// components/guide-password-request/PasswordRequestStats.tsx
"use client";

import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StatsSkeleton from "./skeletons/StatsSkeleton";
import { usePasswordRequestStore } from "@/store/guide/guide-password-request.store";

const STAT_CARDS = [
  {
    key: "total",
    label: "Total Requests",
    icon: BarChart3,
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    gradient: "from-slate-500 to-slate-600",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    gradient: "from-amber-500 to-amber-600",
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    gradient: "from-rose-500 to-rose-600",
  },
  {
    key: "expired",
    label: "Expired",
    icon: AlertCircle,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    gradient: "from-slate-400 to-slate-500",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export function PasswordRequestStats() {
  const { stats, isFetching, fetchStats } = usePasswordRequestStore();

  if (isFetching && !stats) {
    return <StatsSkeleton />;
  }

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 px-4"
      >
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium mb-1">No statistics available</p>
        <p className="text-sm text-slate-500 mb-4">Try refreshing to load data</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStats(true)}
          className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {STAT_CARDS.map((stat, index) => {
        const value = stats[stat.key as keyof typeof stats];
        const showPendingPercentage = stat.key === "pending" && stats.pendingPercentage > 0;
        const showApprovalRate = stat.key === "approved" && stats.approvalRate > 0;

        return (
          <motion.div key={stat.key} variants={cardVariants}>
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-700">
                  {stat.label}
                </CardTitle>
                <div className={cn(
                  "p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110",
                  stat.bgColor
                )}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <motion.div
                  className="text-3xl font-semibold text-slate-900 tabular-nums"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  {value}
                </motion.div>
                
                {showPendingPercentage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <p className="text-xs text-slate-600 font-medium">
                      {stats.pendingPercentage}% of total
                    </p>
                  </motion.div>
                )}
                
                {showApprovalRate && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className="text-xs text-slate-600 font-medium">
                      {stats.approvalRate}% approval rate
                    </p>
                  </motion.div>
                )}

                {/* Progress indicator for pending items */}
                {stat.key === "pending" && stats.total > 0 && (
                  <div className="pt-2">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.pendingPercentage}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                {/* Progress indicator for approval rate */}
                {stat.key === "approved" && stats.total > 0 && (
                  <div className="pt-2">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.approvalRate}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}