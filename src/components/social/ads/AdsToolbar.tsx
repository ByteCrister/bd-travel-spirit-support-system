// components/ads/AdsToolbar.tsx
'use client';

import React, { JSX, useState, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    MdSearch,
    MdFilterList,
    MdClear,
    MdRefresh,
    MdCalendarToday,
    MdKeyboardArrowDown,
    MdClose
} from 'react-icons/md';
import { HiAdjustments } from 'react-icons/hi';
import { BiCheckCircle } from 'react-icons/bi';
import useAdsStore from '@/store/ad.store';
import { AdStatusType, PLACEMENT, PlacementType } from '@/constants/advertising.const';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdsToolbarProps {
    onRefresh: () => void;
}

const STATUS_OPTIONS: { value: AdStatusType; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'bg-slate-100 text-slate-700' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
    { value: 'paused', label: 'Paused', color: 'bg-blue-100 text-blue-700' },
    { value: 'expired', label: 'Expired', color: 'bg-orange-100 text-orange-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    { value: 'rejected', label: 'Rejected', color: 'bg-rose-100 text-rose-700' },
];

const PLACEMENT_OPTIONS: { value: PlacementType; label: string }[] = [
    { value: PLACEMENT.LANDING_BANNER, label: "Landing Banner" },
    { value: PLACEMENT.POPUP_MODAL, label: "Popup Modal" },
    { value: PLACEMENT.EMAIL, label: "Email" },
    { value: PLACEMENT.SIDEBAR, label: "Sidebar" },
    { value: PLACEMENT.SPONSORED_LIST, label: "Sponsored List" },
];

const filterVariants: Variants = {
    hidden: {
        opacity: 0,
        height: 0,
        marginTop: 0,
        transition: { duration: 0.2 }
    },
    visible: {
        opacity: 1,
        height: 'auto',
        marginTop: '1rem',
        transition: {
            duration: 0.3,
            ease: 'easeOut'
        }
    }
};

const badgeVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { type: 'spring', stiffness: 500, damping: 25 }
    },
    exit: {
        scale: 0,
        opacity: 0,
        transition: { duration: 0.15 }
    }
};

export function AdsToolbar({ onRefresh }: AdsToolbarProps): JSX.Element {
    const { filters, setFilters, clearFilters, listMeta, fetchList, setQuery } = useAdsStore();
    const [showFilters, setShowFilters] = useState(false);
    const [localSearch, setLocalSearch] = useState(filters.q);

    const handleSearchSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setFilters({ q: localSearch });
        setQuery({ q: localSearch, page: 1 });
        fetchList();
    }, [localSearch, setFilters, setQuery, fetchList]);

    const handleSearchClear = useCallback(() => {
        setLocalSearch('');
        setFilters({ q: '' });
        setQuery({ q: '', page: 1 });
        fetchList();
    }, [setFilters, setQuery, fetchList]);

    const toggleStatus = useCallback((status: AdStatusType) => {
        const newStatuses = filters.status.includes(status)
            ? filters.status.filter(s => s !== status)
            : [...filters.status, status];
        setFilters({ status: newStatuses });
        setQuery({ status: newStatuses, page: 1 });
        fetchList();
    }, [filters.status, setFilters, setQuery, fetchList]);

    const togglePlacement = useCallback((placement: PlacementType) => {
        const newPlacements = filters.placements.includes(placement)
            ? filters.placements.filter(p => p !== placement)
            : [...filters.placements, placement];
        setFilters({ placements: newPlacements });
        setQuery({ placements: newPlacements, page: 1 });
        fetchList();
    }, [filters.placements, setFilters, setQuery, fetchList]);

    const handleClearFilters = useCallback(() => {
        clearFilters();
        setLocalSearch('');
        setQuery({ q: '', status: [], placements: [], page: 1 });
        fetchList();
    }, [clearFilters, setQuery, fetchList]);

    const activeFilterCount = filters.status.length + filters.placements.length + (filters.q ? 1 : 0);

    return (
        <div className="space-y-4">
            {/* Main Toolbar Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                    <div className="relative group">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="Search by title, guide name, or tour..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <AnimatePresence>
                            {localSearch && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    type="button"
                                    onClick={handleSearchClear}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <MdClose className="w-4 h-4" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </form>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-11 px-4 relative border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <HiAdjustments className="w-5 h-5 mr-2" />
                            <span className="hidden sm:inline">Filters</span>
                            <MdKeyboardArrowDown
                                className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                            />
                            <AnimatePresence>
                                {activeFilterCount > 0 && (
                                    <motion.span
                                        variants={badgeVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                                    >
                                        {activeFilterCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            onClick={onRefresh}
                            disabled={listMeta.loading}
                            className="h-11 px-4 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <MdRefresh
                                className={`w-5 h-5 mr-2 ${listMeta.loading ? 'animate-spin' : ''}`}
                            />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </motion.div>

                    {activeFilterCount > 0 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant="ghost"
                                onClick={handleClearFilters}
                                className="h-11 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <MdClear className="w-5 h-5 mr-2" />
                                Clear
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Active Filter Pills */}
            <AnimatePresence>
                {activeFilterCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-wrap gap-2"
                    >
                        {filters.q && (
                            <FilterPill
                                label={`Search: "${filters.q}"`}
                                onRemove={handleSearchClear}
                            />
                        )}
                        {filters.status.map(status => {
                            const statusOption = STATUS_OPTIONS.find(s => s.value === status);
                            return (
                                <FilterPill
                                    key={status}
                                    label={statusOption?.label ?? status}
                                    color={statusOption?.color}
                                    onRemove={() => toggleStatus(status)}
                                />
                            );
                        })}
                        {filters.placements.map(placement => {
                            const placementOption = PLACEMENT_OPTIONS.find(p => p.value === placement);
                            return (
                                <FilterPill
                                    key={placement}
                                    label={placementOption?.label ?? placement}
                                    onRemove={() => togglePlacement(placement)}
                                />
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expanded Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        variants={filterVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="overflow-hidden"
                    >
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
                            {/* Status Filters */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <BiCheckCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Status</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {STATUS_OPTIONS.map(option => (
                                        <motion.button
                                            key={option.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleStatus(option.value)}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filters.status.includes(option.value)
                                                    ? `${option.color} ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600`
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            {option.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Placement Filters */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MdFilterList className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Placement</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {PLACEMENT_OPTIONS.map(option => (
                                        <motion.button
                                            key={option.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => togglePlacement(option.value)}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filters.placements.includes(option.value)
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-offset-2 ring-blue-400 dark:ring-blue-600'
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            {option.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range (placeholder for future implementation) */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MdCalendarToday className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Date Range</h3>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Date range filtering coming soon...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface FilterPillProps {
    label: string;
    color?: string;
    onRemove: () => void;
}

function FilterPill({ label, color = 'bg-slate-100 text-slate-700', onRemove }: FilterPillProps) {
    return (
        <motion.div
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${color} dark:bg-slate-700 dark:text-slate-200`}
        >
            <span>{label}</span>
            <motion.button
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRemove}
                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
            >
                <MdClose className="w-3.5 h-3.5" />
            </motion.button>
        </motion.div>
    );
}