"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FiUsers, 
  FiUser, 
  FiUserCheck, 
  FiUserX,
  FiPieChart
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { RoleDistribution } from "@/types/dashboard.types";

interface RolePieChartProps {
  data: RoleDistribution | null;
  loading?: boolean;
  className?: string;
}

const roleConfig = {
  travelers: {
    label: 'Travelers',
    icon: FiUsers,
    color: 'bg-blue-500',
    fillColor: '#3b82f6',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  organizers: {
    label: 'Organizers',
    icon: FiUserCheck,
    color: 'bg-green-500',
    fillColor: '#22c55e',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    textColor: 'text-green-600 dark:text-green-400',
  },
  support: {
    label: 'Support',
    icon: FiUser,
    color: 'bg-purple-500',
    fillColor: '#a855f7',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  banned: {
    label: 'Banned',
    icon: FiUserX,
    color: 'bg-red-500',
    fillColor: '#ef4444',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    textColor: 'text-red-600 dark:text-red-400',
  },
} as const;

export function RolePieChart({ data, loading = false, className }: RolePieChartProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiPieChart className="h-5 w-5" />
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse flex-1" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiPieChart className="h-5 w-5" />
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FiPieChart className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.travelers + data.organizers + data.support + data.banned;
  const roles = Object.entries(data) as Array<[keyof RoleDistribution, number]>;

  // Calculate angles for the pie chart
  let currentAngle = 0;
  const segments = roles.map(([key, value]) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    return {
      key,
      value,
      percentage,
      startAngle,
      endAngle,
      config: roleConfig[key],
    };
  });

  // Generate SVG path for pie chart (center-aware)
  const generatePath = (
    startAngle: number,
    endAngle: number,
    radius: number = 60,
    center: number = 80
  ) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", center, center,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiPieChart className="h-5 w-5" />
          Role Distribution
        </CardTitle>
        <div className="text-xs text-slate-500 dark:text-slate-400">User roles breakdown with percentages</div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Donut Chart */}
          <div className="flex justify-center">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <svg width="200" height="200" className="transform -rotate-90">
                <defs>
                  {segments.map((s, i) => (
                    <linearGradient id={`grad-${s.key}`} key={s.key} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={s.config.fillColor} stopOpacity="0.95"/>
                      <stop offset="100%" stopColor={s.config.fillColor} stopOpacity="0.75"/>
                    </linearGradient>
                  ))}
                </defs>
                {segments.map((segment, index) => (
                  <motion.path
                    key={segment.key}
                    d={generatePath(segment.startAngle, segment.endAngle, 80)}
                    fill={`url(#grad-${segment.key})`}
                    initial={{ pathLength: 0, opacity: 0.6 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: index * 0.08, duration: 0.7 }}
                    whileHover={{ scale: 1.03 }}
                    style={{ transformOrigin: '100px 100px' }}
                    className="transition-transform"
                  />
                ))}
                {/* Inner ring */}
                <circle cx="100" cy="100" r="58" className="fill-white dark:fill-slate-900" />
                {/* Subtle outer ring */}
                <circle cx="100" cy="100" r="82" className="fill-none stroke-slate-200 dark:stroke-slate-800" />
              </svg>
              {/* Center KPI */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="text-center">
                  <motion.div
                    className="text-2xl font-semibold text-slate-900 dark:text-slate-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {total.toLocaleString()}
                  </motion.div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Users</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <motion.div
                key={segment.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 + 0.4 }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("h-3 w-3 rounded-full shrink-0", segment.config.color)} />
                    <div className="flex items-center gap-2 min-w-0">
                      <segment.config.icon className={cn("h-4 w-4", segment.config.textColor)} />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {segment.config.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {segment.percentage.toFixed(1)}%
                    </span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {segment.value.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={cn("h-2", segment.config.color)}
                    style={{ width: `${segment.percentage}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
