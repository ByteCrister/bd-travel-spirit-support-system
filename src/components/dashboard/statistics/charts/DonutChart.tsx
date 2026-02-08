'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { CategoryCount } from '@/types/dashboard/statistics.types';
import { formatNumber, formatPercentage } from '@/utils/helpers/format';

interface DonutChartProps {
    data: CategoryCount[];
    title?: string;
    colors?: string[];
    height?: number;
    showPercentages?: boolean;
    showCenterTotal?: boolean;
}

interface ChartDataItem extends CategoryCount {
    percentage: number;
    color: string;
}


const DEFAULT_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export const DonutChart = React.memo<DonutChartProps>(({
    data,
    title,
    colors = DEFAULT_COLORS,
    height = 300,
    showPercentages = true,
    showCenterTotal = true
}) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    const chartData = data.map((item, index) => ({
        ...item,
        percentage: total > 0 ? (item.count / total) * 100 : 0,
        color: colors[index % colors.length],
    }));

    // Custom label function for center text
    const renderCustomizedLabel = () => null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
            {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {title}
                </h3>
            )}

            <div className="relative" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="count"
                            animationDuration={1000}
                            label={renderCustomizedLabel}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgb(255, 255, 255)',
                                border: '1px solid rgb(229, 231, 235)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                zIndex: 1000,
                            }}
                            formatter={(value: number, name: string, item) => [
                                item && item.payload && 'percentage' in item.payload
                                    ? `${formatNumber(value)} (${formatPercentage((item.payload as ChartDataItem).percentage)})`
                                    : formatNumber(value),
                                'Count'
                            ]}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: string, entry: any) => {
                                // entry.payload may be undefined or not ChartDataItem
                                const percentage =
                                    entry && entry.payload && typeof entry.payload.percentage === 'number'
                                        ? entry.payload.percentage
                                        : undefined;
                                const color =
                                    entry && entry.color
                                        ? entry.color
                                        : undefined;
                                return (
                                    <span style={{ color }} className="text-sm">
                                        {value}
                                        {showPercentages && percentage !== undefined && ` (${formatPercentage(percentage)})`}
                                    </span>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center total - positioned absolutely within the relative container */}
                {showCenterTotal && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(total)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Alternative: Show total below the chart instead of in center */}
            {!showCenterTotal && (
                <div className="mt-4 text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total: {formatNumber(total)}
                    </div>
                </div>
            )}
        </motion.div>
    );
});

DonutChart.displayName = 'DonutChart';