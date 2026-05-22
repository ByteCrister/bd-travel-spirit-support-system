'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { formatNumber } from '@/utils/helpers/format';

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
const DEFAULT_COLORS = [
  '#006666', '#00A63D', '#FE9900', '#FF2157',
  '#008080', '#4da6a6', '#80cc80', '#ffb84d',
];

interface StackedBarChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  title?: string;
  keys: string[];
  colors?: string[];
  height?: number;
  formatValue?: (value: number) => string;
}

export const StackedBarChart = React.memo<StackedBarChartProps>(({
  data,
  title,
  keys,
  colors = DEFAULT_COLORS,
  height = 300,
  formatValue = formatNumber,
}) => {
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
          <BarChart
            data={data}
            margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke={GRID_STROKE}
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis
              dataKey="label"
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
              cursor={{ fill: 'rgba(0,102,102,0.07)', radius: 6 }}
              formatter={(value: number) => [formatValue(value), 'Value']}
            />
            <Legend
              wrapperStyle={{
                fontFamily: 'var(--font-jetbrains-mono)',
                fontSize: 12,
                color: '#1E2938',
                paddingTop: 8,
              }}
            />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={colors[index % colors.length]}
                radius={
                  index === keys.length - 1
                    ? [6, 6, 0, 0]
                    : [0, 0, 0, 0]
                }
                animationDuration={900}
                maxBarSize={48}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

StackedBarChart.displayName = 'StackedBarChart';