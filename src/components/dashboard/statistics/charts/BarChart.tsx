'use client';

import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { CategoryCount } from '@/types/dashboard/statistics.types';
import { formatNumber } from '@/utils/helpers/format';

interface BarChartProps {
    data: CategoryCount[];
    title?: string;
    color?: string;
    height?: number;
    formatValue?: (value: number) => string;
}

export const BarChart = React.memo<BarChartProps>(({
    data,
    title,
    color = '#3b82f6',
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
                    <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 12 }}
                            className="text-gray-600 dark:text-gray-400"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            className="text-gray-600 dark:text-gray-400"
                            tickFormatter={(value: any, index: number) => formatValue(value)}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgb(255, 255, 255)',
                                border: '1px solid rgb(229, 231, 235)',
                                borderRadius: '8px',
                                fontSize: '14px',
                            }}
                            formatter={(value: number, name) => [formatValue(value), 'Count']}
                        />
                        <Bar
                            dataKey="count"
                            fill={color}
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                        />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
});

BarChart.displayName = 'BarChart';
