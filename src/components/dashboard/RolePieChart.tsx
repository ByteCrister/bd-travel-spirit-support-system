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
import { RoleDistribution } from "@/store/useDashboardStore";

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
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
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

  // Generate SVG path for pie chart
  const generatePath = (startAngle: number, endAngle: number, radius: number = 60) => {
    const start = polarToCartesian(radius, radius, radius, endAngle);
    const end = polarToCartesian(radius, radius, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", radius, radius,
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
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="flex justify-center">
            <div className="relative">
              <svg width="160" height="160" className="transform -rotate-90">
                {segments.map((segment, index) => (
                  <motion.path
                    key={segment.key}
                    d={generatePath(segment.startAngle, segment.endAngle)}
                    fill={segment.config.fillColor}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  />
                ))}
                {/* Donut hole */}
                <circle
                  cx="80"
                  cy="80"
                  r="44"
                  className="fill-white dark:fill-slate-900"
                />
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {total.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Total Users
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <motion.div
                key={segment.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-200/60 dark:border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-4 w-4 rounded-full",
                    segment.config.color
                  )} />
                  <div className="flex items-center gap-2">
                    <segment.config.icon className={cn("h-4 w-4", segment.config.textColor)} />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {segment.config.label}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {segment.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {segment.percentage.toFixed(1)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
