'use client';

import React, { useMemo } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TimeSeriesPoint } from '@/types/dashboard/statistics.types';
import { formatDate, formatNumber } from '@/utils/helpers/format';

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
  color = '#3b82f6',
  height = 300,
  formatValue = formatNumber 
}) => {
  const chartData = useMemo(() => 
    data.map(point => ({
      ...point,
      displayDate: formatDate(point.date),
    })), [data]
  );

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
          <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tickFormatter={(value: any) => formatValue(Number(value))}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(255, 255, 255)',
                border: '1px solid rgb(229, 231, 235)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              labelFormatter={(value) => `Date: ${value}`}
              formatter={(value: number) => [formatValue(value), 'Value']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: color }}
              animationDuration={1000}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

LineChart.displayName = 'LineChart';