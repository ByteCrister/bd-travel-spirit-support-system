'use client';

import React, { useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { TimeSeriesPoint } from '@/types/dashboard/statistics.types';
import { formatDate, formatNumber } from '@/utils/helpers/format';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';
const NEU_HEADING =
  'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: '#E7E5E4',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '4px 4px 10px #c8c6c5, -4px -4px 10px #ffffff',
  fontSize: '13px',
  fontFamily: 'var(--font-jetbrains-mono)',
  color: '#1E2938',
};
const GRID_STROKE = '#c8c6c5';
const AXIS_TICK_STYLE = {
  fontSize: 11,
  fill: '#1E2938',
  fontFamily: 'var(--font-jetbrains-mono)',
};

interface LineChartProps {
  data: TimeSeriesPoint[];
  title?: string;
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

export const LineChart = React.memo<LineChartProps>(({
  data,
  title,
  color = '#006666',
  height = 300,
  formatValue = formatNumber,
}) => {
  const chartData = useMemo(
    () => data.map((point) => ({ ...point, displayDate: formatDate(point.date) })),
    [data],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`w-full p-5 ${NEU_CARD}`}
    >
      {title && (
        <h3 className={`text-base mb-5 ${NEU_HEADING}`}>{title}</h3>
      )}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={chartData}
            margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
          >
            <defs>
              <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke={GRID_STROKE}
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              tick={AXIS_TICK_STYLE}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={AXIS_TICK_STYLE}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatValue(v)}
              width={48}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelFormatter={(v) => `Date: ${v}`}
              formatter={(value: number) => [formatValue(value), 'Value']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: '#E7E5E4', stroke: color, strokeWidth: 2.5, r: 4 }}
              activeDot={{
                r: 6,
                fill: color,
                stroke: '#E7E5E4',
                strokeWidth: 2,
              }}
              animationDuration={900}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

LineChart.displayName = 'LineChart';