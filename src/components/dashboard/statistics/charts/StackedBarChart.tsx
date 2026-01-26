'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { formatNumber } from '@/utils/helpers/format';

interface StackedBarChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  title?: string;
  keys: string[];
  colors?: string[];
  height?: number;
  formatValue?: (value: number) => string;
}

const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export const StackedBarChart = React.memo<StackedBarChartProps>(({ 
  data, 
  title, 
  keys,
  colors = DEFAULT_COLORS,
  height = 300,
  formatValue = formatNumber
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tickFormatter={(value: any) => formatValue(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(255, 255, 255)',
                border: '1px solid rgb(229, 231, 235)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              formatter={(value: number) => [formatValue(value), 'Value']}
            />
            <Legend />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={colors[index % colors.length]}
                radius={index === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                animationDuration={1000}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

StackedBarChart.displayName = 'StackedBarChart';