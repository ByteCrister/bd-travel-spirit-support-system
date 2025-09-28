'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, RefreshCw, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Preset } from '@/types/statistics.types';
import { formatDateRange } from '@/utils/helpers/format';
import { useStatisticsStore } from '@/store/useStatisticsStore';

const presetOptions: { value: Preset; label: string }[] = [
    { value: 'LAST_7', label: 'Last 7 days' },
    { value: 'LAST_30', label: 'Last 30 days' },
    { value: 'YTD', label: 'Year to date' },
    { value: 'CUSTOM', label: 'Custom range' },
];

export function FilterBar() {
    const { filters, loading, setDateRange, setPreset, refreshAll } = useStatisticsStore();
    const isLoading = Object.values(loading).some((loading) => loading);

    // Safe destructuring with defaults
    const from = filters.dateRange?.from ?? null;
    const to = filters.dateRange?.to ?? null;

    const handleDateRangeChange = (range: DateRange | undefined) => {
        if (range?.from && range?.to) {
            setDateRange(range.from, range.to);
        } else if (range?.from) {
            setDateRange(range.from, range.from);
        }
    };

    const clearFilters = () => {
        setPreset('LAST_30');
    };

    const isCustomRange = filters.preset === 'CUSTOM';

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        const maxPastDate = new Date();
        maxPastDate.setFullYear(today.getFullYear() - 2);
        return date > today || date < maxPastDate;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
            role="toolbar"
            aria-label="Statistics filters"
        >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Preset buttons */}
                    <div className="flex gap-2">
                        {presetOptions.slice(0, 3).map((preset) => (
                            <Button
                                key={preset.value}
                                variant={filters.preset === preset.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPreset(preset.value)}
                                disabled={isLoading}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    {/* Custom date range picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={isCustomRange ? 'default' : 'outline'}
                                size="sm"
                                disabled={isLoading}
                                className="justify-start text-left font-normal min-w-[240px]"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {isCustomRange ? formatDateRange(from, to) : 'Custom range'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={from || undefined}
                                selected={{
                                    from: from || undefined,
                                    to: to || undefined,
                                }}
                                disabled={isDateDisabled}
                                onSelect={handleDateRangeChange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Current range indicator */}
                    {!isCustomRange && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDateRange(from, to)}
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    {/* Clear filters */}
                    {(isCustomRange || filters.preset !== 'LAST_30') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}

                    {/* Refresh button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshAll}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
