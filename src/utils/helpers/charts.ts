import { CategoryCount, TimeSeriesPoint } from "@/types/statistics.types";

export function groupByDate<T extends Record<string, unknown>>(
    data: T[],
    dateField: keyof T & string = "date"
): Record<string, T[]> {
    return data.reduce((acc, item) => {
        const date = String(item[dateField]);
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {} as Record<string, T[]>);
}

export function sumByCategory<T extends Record<string, unknown>>(
    data: T[],
    categoryField: keyof T,
    valueField: keyof T
): CategoryCount[] {
    const grouped = data.reduce((acc, item) => {
        const category = String(item[categoryField]);
        const value = Number(item[valueField]) || 0;
        acc[category] = (acc[category] || 0) + value;
        return acc;
    }, {} as { [key: string]: number });

    return Object.entries(grouped)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
}

export function normalizeRanking<T extends { value: number }>(
    data: T[]
): T[] {
    const max = Math.max(...data.map(item => item.value));
    return data.map(item => ({
        ...item,
        normalizedValue: (item.value / max) * 100,
    })) as T[];
}

export function calculatePercentages(data: CategoryCount[]): CategoryCount[] {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    return data.map(item => ({
        ...item,
        percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
}

export function fillMissingDates(
    data: TimeSeriesPoint[],
    startDate: Date,
    endDate: Date
): TimeSeriesPoint[] {
    const result: TimeSeriesPoint[] = [];
    const dataMap = data.reduce((acc, point) => {
        acc[point.date] = point;
        return acc;
    }, {} as { [date: string]: TimeSeriesPoint });

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        result.push(dataMap[dateStr] || { date: dateStr, value: 0 });
    }

    return result;
}

export function aggregateTimeSeriesData(
    data: TimeSeriesPoint[],
    aggregation: 'daily' | 'weekly' | 'monthly' = 'daily'
): TimeSeriesPoint[] {
    if (aggregation === 'daily') return data;

    const grouped: { [key: string]: number[] } = {};

    data.forEach(point => {
        const date = new Date(point.date);
        let key: string;

        if (aggregation === 'weekly') {
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - date.getDay());
            key = startOfWeek.toISOString().split('T')[0];
        } else { // monthly
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        }

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(point.value);
    });

    return Object.entries(grouped)
        .map(([date, values]) => ({
            date,
            value: values.reduce((sum, val) => sum + val, 0)
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}