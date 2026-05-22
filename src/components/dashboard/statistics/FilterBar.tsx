'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, RefreshCw, X, Check } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Preset, PresetEnum } from '@/types/dashboard/statistics.types';
import { formatDateRange } from '@/utils/helpers/format';
import { useStatisticsStore } from '@/store/dashboard/statistics.store';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_SURFACE_RAISED =
    'bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]';
const NEU_BTN_GHOST =
    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E7E5E4] text-sm text-[#1E2938] ' +
    'font-[family-name:var(--font-space-mono)] ' +
    'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
    'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
    'active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40';
const NEU_BTN_ACTIVE =
    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#006666] text-white text-sm ' +
    'font-[family-name:var(--font-space-mono)] font-bold ' +
    'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
    'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] ' +
    'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50';
const NEU_BTN_PRIMARY =
    'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006666] text-white text-sm ' +
    'font-[family-name:var(--font-space-mono)] font-bold tracking-wide ' +
    'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
    'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] ' +
    'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50';
const NEU_BTN_DANGER_GHOST =
    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E7E5E4] text-[#FF2157] text-sm ' +
    'font-[family-name:var(--font-space-mono)] ' +
    'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
    'hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ' +
    'transition-all duration-200';
const NEU_DIVIDER = 'w-px h-7 bg-[#c8c6c5]/70 hidden sm:block';
const NEU_DATE_BADGE =
    'hidden md:inline-flex items-center px-3 py-1.5 rounded-lg ' +
    'bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#006666] font-bold';

const containerVariants: Variants = {
    hidden: { opacity: 0, y: -16 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.05 },
    },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const presetOptions: { value: Preset; label: string }[] = [
    { value: PresetEnum.LAST_7, label: 'Last 7 days' },
    { value: PresetEnum.LAST_30, label: 'Last 30 days' },
    { value: PresetEnum.YTD, label: 'Year to date' },
    { value: PresetEnum.CUSTOM, label: 'Custom range' },
];

interface FilterBarProps {
    onApplyFilters: () => void;
    onRefresh: () => void;
}

export function FilterBar({ onApplyFilters, onRefresh }: FilterBarProps) {
    const { filters, loading, setDateRange, setPreset } = useStatisticsStore();
    const isLoading = Object.values(loading).some(Boolean);

    const from = filters.dateRange?.from ?? null;
    const to = filters.dateRange?.to ?? null;

    const handleDateRangeChange = (range: DateRange | undefined) => {
        if (range?.from && range?.to) setDateRange(range.from, range.to);
        else if (range?.from) setDateRange(range.from, range.from);
    };

    const clearFilters = () => setPreset(PresetEnum.LAST_30);
    const isCustomRange = filters.preset === PresetEnum.CUSTOM;
    const isDateDisabled = (date: Date) => {
        const today = new Date();
        const maxPast = new Date();
        maxPast.setFullYear(today.getFullYear() - 2);
        return date > today || date < maxPast;
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`sticky top-0 z-10 ${NEU_SURFACE_RAISED}`}
            role="toolbar"
            aria-label="Statistics filters"
        >
            <div className="px-4 sm:px-6 py-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

                    {/* ── Left: Presets + Date Picker ── */}
                    <motion.div variants={itemVariants} className="flex flex-wrap gap-2 items-center w-full lg:w-auto">

                        {/* Preset pills */}
                        {presetOptions.slice(0, 3).map((preset) => (
                            <motion.button
                                key={preset.value}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setPreset(preset.value)}
                                disabled={isLoading}
                                className={filters.preset === preset.value ? NEU_BTN_ACTIVE : NEU_BTN_GHOST}
                            >
                                {preset.label}
                            </motion.button>
                        ))}

                        <div className={NEU_DIVIDER} />

                        {/* Custom date range picker */}
                        <motion.div variants={itemVariants}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        disabled={isLoading}
                                        className={`${isCustomRange ? NEU_BTN_ACTIVE : NEU_BTN_GHOST} min-w-[200px] justify-start`}
                                    >
                                        <CalendarIcon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {isCustomRange ? formatDateRange(from, to) : 'Custom range'}
                                        </span>
                                    </motion.button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 bg-[#E7E5E4] border-none rounded-2xl shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff]"
                                    align="start"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={from || undefined}
                                            selected={{ from: from || undefined, to: to || undefined }}
                                            disabled={isDateDisabled}
                                            onSelect={handleDateRangeChange}
                                            numberOfMonths={2}
                                        />
                                    </motion.div>
                                </PopoverContent>
                            </Popover>
                        </motion.div>

                        {/* Active date range badge */}
                        {!isCustomRange && (
                            <motion.span
                                variants={itemVariants}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={NEU_DATE_BADGE}
                            >
                                {formatDateRange(from, to)}
                            </motion.span>
                        )}
                    </motion.div>

                    {/* ── Right: Actions ── */}
                    <motion.div variants={itemVariants} className="flex gap-2 w-full lg:w-auto justify-end">
                        {/* Clear */}
                        {(isCustomRange || filters.preset !== 'LAST_30') && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={clearFilters}
                                disabled={isLoading}
                                className={NEU_BTN_DANGER_GHOST}
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </motion.button>
                        )}

                        {/* Apply */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onApplyFilters}
                            disabled={isLoading}
                            className={NEU_BTN_PRIMARY}
                        >
                            <Check className="h-4 w-4" />
                            Apply
                        </motion.button>

                        {/* Refresh */}
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={onRefresh}
                            disabled={isLoading}
                            className={NEU_BTN_GHOST}
                            aria-label="Refresh current section"
                        >
                            <RefreshCw
                                className={`h-4 w-4 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </motion.button>
                    </motion.div>
                </div>
            </div>

            {/* Loading progress bar */}
            {isLoading && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#006666] origin-left"
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                />
            )}
        </motion.div>
    );
}