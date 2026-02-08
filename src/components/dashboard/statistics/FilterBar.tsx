'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, RefreshCw, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Preset, PresetEnum } from '@/types/dashboard/statistics.types';
import { formatDateRange } from '@/utils/helpers/format';
import { useStatisticsStore } from '@/store/dashboard/statistics.store';

const presetOptions: { value: Preset; label: string }[] = [
    { value: PresetEnum.LAST_7, label: 'Last 7 days' },
    { value: PresetEnum.LAST_30, label: 'Last 30 days' },
    { value: PresetEnum.YTD, label: 'Year to date' },
    { value: PresetEnum.CUSTOM, label: 'Custom range' },
];

const containerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    }
};

export function FilterBar() {
    const { filters, loading, setDateRange, setPreset, refreshAll } = useStatisticsStore();
    const isLoading = Object.values(loading).some((loading) => loading);

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
        setPreset(PresetEnum.LAST_30);
    };

    const isCustomRange = filters.preset === PresetEnum.CUSTOM;

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        const maxPastDate = new Date();
        maxPastDate.setFullYear(today.getFullYear() - 2);
        return date > today || date < maxPastDate;
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
            role="toolbar"
            aria-label="Statistics filters"
        >
            <div className="px-6 py-5">
                <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
                    {/* Left section - Filters */}
                    <motion.div 
                        variants={itemVariants}
                        className="flex flex-wrap gap-3 items-center w-full lg:w-auto"
                    >
                        {/* Preset Pills */}
                        <div className="flex gap-2 flex-wrap">
                            {presetOptions.slice(0, 3).map((preset) => (
                                <motion.div
                                    key={preset.value}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant={filters.preset === preset.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPreset(preset.value)}
                                        disabled={isLoading}
                                        className={`
                                            relative overflow-hidden font-medium transition-all duration-300
                                            ${filters.preset === preset.value 
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border-0' 
                                                : 'hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                                            }
                                        `}
                                    >
                                        {filters.preset === preset.value && (
                                            <motion.div
                                                layoutId="activePreset"
                                                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10">{preset.label}</span>
                                    </Button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700" />

                        {/* Custom Date Range Picker */}
                        <motion.div variants={itemVariants}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant={isCustomRange ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={isLoading}
                                            className={`
                                                justify-start text-left font-medium min-w-[260px] transition-all duration-300
                                                ${isCustomRange 
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border-0' 
                                                    : 'hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                                                }
                                            `}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            <span className="truncate">
                                                {isCustomRange ? formatDateRange(from, to) : 'Custom range'}
                                            </span>
                                        </Button>
                                    </motion.div>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 shadow-2xl" align="start">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
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
                                    </motion.div>
                                </PopoverContent>
                            </Popover>
                        </motion.div>

                        {/* Date Range Display */}
                        {!isCustomRange && (
                            <motion.div
                                variants={itemVariants}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50"
                            >
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    {formatDateRange(from, to)}
                                </span>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Right section - Actions */}
                    <motion.div 
                        variants={itemVariants}
                        className="flex gap-2 w-full lg:w-auto justify-end"
                    >
                        {/* Clear Filters */}
                        {(isCustomRange || filters.preset !== 'LAST_30') && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    disabled={isLoading}
                                    className="font-medium hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                >
                                    <X className="h-4 w-4 mr-1.5" />
                                    Clear
                                </Button>
                            </motion.div>
                        )}

                        {/* Refresh Button */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refreshAll()}
                                disabled={isLoading}
                                className="font-medium hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 mr-2 transition-transform duration-500 ${
                                        isLoading ? 'animate-spin' : ''
                                    }`}
                                />
                                Refresh
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Loading Progress Bar */}
            {isLoading && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 origin-left"
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
            )}
        </motion.div>
    );
}