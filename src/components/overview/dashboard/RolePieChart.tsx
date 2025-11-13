"use client";

import React, { JSX } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiUsers, FiUser, FiUserCheck, FiUserX, FiPieChart } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { RoleDistribution } from "@/types/dashboard.types";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
  type SectorProps,
} from "recharts";
import { ActiveShape } from "recharts/types/util/types";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

interface RolePieChartProps {
  data: RoleDistribution | null;
  loading?: boolean;
  className?: string;
}

type MyActiveShapeProps = SectorProps & {
  percent?: number;
  value?: number;
};

const renderActiveShape: ActiveShape<PieSectorDataItem> = (props: MyActiveShapeProps): JSX.Element => {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "#000",
    percent = 0,
    value = 0,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="rgba(255,255,255,0.12)"
      />
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central" className="font-semibold text-slate-900 dark:text-slate-100">
        {value?.toLocaleString?.() ?? String(value)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="central" className="text-xs text-slate-500 dark:text-slate-400">
        {(percent ?? 0) * 100 === 0 ? "0.0%" : `${((percent ?? 0) * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

/** Role config — keep `as const` so keys are literal types */
const roleConfig = {
  travelers: {
    label: "Travelers",
    icon: FiUsers,
    color: "bg-blue-500",
    fillColor: "#3b82f6",
    gradientFrom: "#60a5fa",
    gradientTo: "#1d4ed8",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  organizers: {
    label: "Organizers",
    icon: FiUserCheck,
    color: "bg-green-500",
    fillColor: "#22c55e",
    gradientFrom: "#86efac",
    gradientTo: "#16a34a",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    textColor: "text-green-600 dark:text-green-400",
  },
  support: {
    label: "Support",
    icon: FiUser,
    color: "bg-purple-500",
    fillColor: "#a855f7",
    gradientFrom: "#c4b5fd",
    gradientTo: "#7c3aed",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  banned: {
    label: "Banned",
    icon: FiUserX,
    color: "bg-red-500",
    fillColor: "#ef4444",
    gradientFrom: "#fca5a5",
    gradientTo: "#dc2626",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-600 dark:text-red-400",
  },
} as const;

type RoleKey = keyof typeof roleConfig;

type ChartDatum = {
  name: string;
  key: RoleKey;
  value: number;
  fill: string;
  gradientFrom: string;
  gradientTo: string;
};

type ActiveShapeProps = SectorProps & {
  percent: number;
  value: number;
};

const RenderActiveShape: React.FC<ActiveShapeProps> = ({
  cx = 0,
  cy = 0,
  innerRadius = 0,
  outerRadius = 0,
  startAngle = 0,
  endAngle = 0,
  fill = "#000",
  percent = 0,
  value = 0,
}) => {
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="rgba(255,255,255,0.12)"
      />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-semibold text-slate-900 dark:text-slate-100"
      >
        {value.toLocaleString()}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs text-slate-500 dark:text-slate-400"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

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
  const roleKeys: RoleKey[] = ["travelers", "organizers", "support", "banned"];

  const chartData: ChartDatum[] = roleKeys
    .map((key) => ({
      name: roleConfig[key].label,
      key,
      value: data[key],
      fill: roleConfig[key].fillColor,
      gradientFrom: roleConfig[key].gradientFrom,
      gradientTo: roleConfig[key].gradientTo,
    }))
    .filter((d) => d.value > 0);

  const tooltipFormatter =(value: number, name: string) => [`${value.toLocaleString()}`, name];

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
          <div className="h-56">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={tooltipFormatter}
                    wrapperStyle={{ outline: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="52%"
                    outerRadius="72%"
                    paddingAngle={2}
                    cornerRadius={6}
                    // Provide typed activeShape
                    activeShape={renderActiveShape}
                    isAnimationActive
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Central KPI overlay */}
              <div className="relative -mt-56 h-56 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{total.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Users</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Legend / Details */}
          <div className="space-y-3">
            {roleKeys.map((key, index) => {
              const cfg = roleConfig[key];
              const value = data[key];
              const percentage = total > 0 ? (value / total) * 100 : 0;

              const roleCard = (
                <div
                  className={cn(
                    "p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm",
                    value === 0 ? "opacity-60" : ""
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("h-3 w-3 rounded-full shrink-0", cfg.color)} />
                      <div className="flex items-center gap-2 min-w-0">
                        <cfg.icon className={cn("h-4 w-4", cfg.textColor)} />
                        <span className={cn("text-sm font-medium truncate", value === 0 ? "text-slate-500" : "text-slate-900 dark:text-slate-100")}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {percentage.toFixed(1)}%
                      </span>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{value.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={cn("h-2", cfg.color)} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );

              return (
                <motion.div key={key} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 + 0.2 }}>
                  {roleCard}
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
