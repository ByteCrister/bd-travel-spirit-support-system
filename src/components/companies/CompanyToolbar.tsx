'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SortAsc, SortDesc, Filter, Rows3, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { CompanySortBy, SortDir } from '@/types/company.types';
import { useCompanyStore } from '@/store/useCompanyStore';

/**
 * CompanyToolbar: Search, sort, direction toggle, and page size controls.
 * Debounces search to reduce unnecessary fetches. Animates in with framer-motion.
 */
export function CompanyToolbar() {
    const {
        params,
        setSearch,
        setSort,
        setLimit,
    } = useCompanyStore();

    const [searchLocal, setSearchLocal] = useState<string>(params.search ?? '');

    // Debounce search input updates to store
    useEffect(() => {
        const handle = setTimeout(() => {
            if (searchLocal !== params.search) {
                setSearch(searchLocal);
            }
        }, 400);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchLocal]);

    const sortOptions: CompanySortBy[] = useMemo(
        () => [
            'name',
            'employeesCount',
            'toursCount',
            'reviewsCount',
            'averageRating',
            'createdAt',
        ],
        [],
    );

    const toggleDir = () => {
        const next: SortDir = params.sortDir === 'asc' ? 'desc' : 'asc';
        setSort(params.sortBy, next);
    };

    return (
        <motion.div
            className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900 shadow-lg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            {/* Gradient Overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Filter & Search
                        </h2>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const { refresh } = useCompanyStore.getState();
                            refresh();
                        }}
                        className="flex items-center gap-2 h-9 rounded-lg border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all group"
                    >
                        <svg
                            className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                </div>

                {/* Search Bar - Full Width */}
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <Input
                        id="company-search"
                        value={searchLocal}
                        onChange={(e) => setSearchLocal(e.target.value)}
                        placeholder="Search companies, emails, or tags..."
                        className="pl-12 pr-4 h-12 text-base border-slate-300 dark:border-slate-700 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-transparent bg-white dark:bg-slate-800/50 transition-all placeholder:text-slate-400"
                    />
                    {searchLocal && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            <button
                                onClick={() => setSearchLocal('')}
                                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                aria-label="Clear search"
                            >
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sort By */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Sort By
                            </label>
                        </div>
                        <Select
                            value={params.sortBy}
                            onValueChange={(v) => setSort(v as CompanySortBy, params.sortDir)}
                        >
                            <SelectTrigger className="h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                {sortOptions.map((opt) => (
                                    <SelectItem
                                        key={opt}
                                        value={opt}
                                        className="cursor-pointer rounded-md"
                                    >
                                        {labelForSort(opt)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort Direction */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            {params.sortDir === 'asc' ? (
                                <SortAsc className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            ) : (
                                <SortDesc className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            )}
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Order
                            </label>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={toggleDir}
                            aria-label={`Toggle sort direction (${params.sortDir})`}
                            className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 dark:hover:from-blue-950/30 dark:hover:to-violet-950/30 hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
                        >
                            {params.sortDir === 'asc' ? (
                                <div className="flex items-center gap-2">
                                    <SortAsc className="w-4 h-4 group-hover:scale-110 transition-transform text-blue-600 dark:text-blue-400" />
                                    <span>Ascending</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <SortDesc className="w-4 h-4 group-hover:scale-110 transition-transform text-violet-600 dark:text-violet-400" />
                                    <span>Descending</span>
                                </div>
                            )}
                        </Button>
                    </div>

                    {/* Per Page */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <Rows3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Show
                            </label>
                        </div>
                        <Select
                            value={String(params.limit)}
                            onValueChange={(v) => setLimit(Number(v))}
                        >
                            <SelectTrigger className="h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                {[10, 20, 50, 100].map((n) => (
                                    <SelectItem
                                        key={n}
                                        value={String(n)}
                                        className="cursor-pointer rounded-md"
                                    >
                                        {n} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filters Info */}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>Showing {params.limit} results</span>
                    </div>
                    {searchLocal && (
                        <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>Filtered by search</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function labelForSort(key: CompanySortBy): string {
    switch (key) {
        case 'name':
            return 'Company Name';
        case 'employeesCount':
            return 'Employees Count';
        case 'toursCount':
            return 'Tours Count';
        case 'reviewsCount':
            return 'Reviews Count';
        case 'averageRating':
            return 'Average Rating';
        case 'createdAt':
            return 'Date Created';
        default:
            return key;
    }
}