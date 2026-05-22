'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { CategoryCount } from '@/types/dashboard/statistics.types';
import { formatNumber, formatPercentage } from '@/utils/helpers/format';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';
const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_CENTER_VALUE =
    'font-[family-name:var(--font-space-mono)] font-bold text-2xl text-[#1E2938]';
const TOOLTIP_STYLE: React.CSSProperties = {
    backgroundColor: '#E7E5E4',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '4px 4px 10px #c8c6c5, -4px -4px 10px #ffffff',
    fontSize: '13px',
    fontFamily: 'var(--font-jetbrains-mono)',
    color: '#1E2938',
};

const DEFAULT_COLORS = [
    '#006666',
    '#00A63D',
    '#FE9900',
    '#FF2157',
    '#008080',
    '#4da6a6',
    '#80cc80',
    '#ffb84d',
];

interface DonutChartProps {
    data: CategoryCount[];
    title?: string;
    colors?: string[];
    height?: number;
    showPercentages?: boolean;
    showCenterTotal?: boolean;
}

// Chart‑data type with index signature (fixes the assignability error)
interface ChartDataItem {
    label: string;
    count: number;
    percentage: number;
    color: string;
    [key: string]: string | number;
}

// Mimics recharts’ internal LegendPayload (without any, using unknown)
interface LegendPayload {
    color?: string;
    payload?: Record<string, unknown>;
    value: unknown;
}

export const DonutChart = React.memo<DonutChartProps>(
    ({
        data,
        title,
        colors = DEFAULT_COLORS,
        height = 300,
        showPercentages = true,
        showCenterTotal = true,
    }) => {
        const total = data.reduce((sum, item) => sum + item.count, 0);

        const chartData: ChartDataItem[] = data.map((item, index) => ({
            label: item.label,
            count: item.count,
            percentage: total > 0 ? (item.count / total) * 100 : 0,
            color: colors[index % colors.length],
        }));

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`w-full p-5 ${NEU_CARD}`}
            >
                {title && (
                    <h3 className={`text-base mb-5 ${NEU_HEADING}`}>{title}</h3>
                )}

                <div className="relative" style={{ height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={height * 0.2}
                                outerRadius={height * 0.33}
                                dataKey="count"
                                animationDuration={900}
                                paddingAngle={2}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>

                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                formatter={(value: number, _name: string, item) => [
                                    item?.payload && 'percentage' in item.payload
                                        ? `${formatNumber(value)} (${formatPercentage(
                                            (item.payload as ChartDataItem).percentage,
                                        )})`
                                        : formatNumber(value),
                                    'Count',
                                ]}
                            />

                            <Legend
                                verticalAlign="bottom"
                                height={40}
                                formatter={(
                                    value: string,
                                    entry: LegendPayload, // ✅ Matches the expected LegendPayload
                                ) => {
                                    const item = entry.payload as ChartDataItem | undefined;
                                    const percentage =
                                        item && typeof item.percentage === 'number'
                                            ? item.percentage
                                            : undefined;
                                    return (
                                        <span
                                            style={{
                                                color: '#1E2938',
                                                fontFamily: 'var(--font-jetbrains-mono)',
                                                fontSize: 12,
                                            }}
                                        >
                                            {value}
                                            {showPercentages && percentage !== undefined
                                                ? ` (${formatPercentage(percentage)})`
                                                : ''}
                                        </span>
                                    );
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {showCenterTotal && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-10">
                            <div className="text-center">
                                <div className={NEU_CENTER_VALUE}>{formatNumber(total)}</div>
                                <div className={NEU_MUTED}>Total</div>
                            </div>
                        </div>
                    )}
                </div>

                {!showCenterTotal && (
                    <div className="mt-3 text-center">
                        <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]">
                            Total: {formatNumber(total)}
                        </span>
                    </div>
                )}
            </motion.div>
        );
    },
);

DonutChart.displayName = 'DonutChart';