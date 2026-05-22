'use client';

// components/travelers/TravelerFilters.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { TravelerFilter } from '@/types/user/traveler.types';
import { ACCOUNT_STATUS, AccountStatus } from '@/constants/user.const';
import {
    RefreshCw,
    SlidersHorizontal,
    Search,
    ShieldCheck,
    ArrowUpDown,
    LayoutList,
    ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TravelerFiltersProps {
    filters: TravelerFilter;
    onFilterChange: <K extends keyof TravelerFilter>(key: K, value: TravelerFilter[K]) => void;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
}

export function TravelerFilters({
    filters,
    onFilterChange,
    onSearchChange,
    onRefresh,
}: TravelerFiltersProps) {
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const statusOptions: AccountStatus[] = Object.values(ACCOUNT_STATUS);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        onSearchChange(value);
    };

    const handleVerifiedChange = (value: string) => {
        onFilterChange('isVerified', value === 'all' ? undefined : value === 'true');
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        onRefresh();
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const activeStatusCount = filters.accountStatus?.length || 0;
    const hasActiveFilters =
        activeStatusCount > 0 ||
        filters.isVerified !== undefined ||
        (filters.search && filters.search.length > 0);

    const statusColors: Record<string, string> = {
        active: 'text-emerald-500',
        suspended: 'text-red-500',
        locked: 'text-amber-500',
        inactive: 'text-slate-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="relative rounded-2xl border border-slate-200 bg-white shadow-sm p-4"
        >
            {/* Subtle top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-t-2xl" />

            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-0 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                        placeholder="Search travelers..."
                        value={searchInput}
                        onChange={handleSearch}
                        className={cn(
                            'pl-9 pr-4 h-9 bg-slate-50 border-slate-200',
                            'focus:border-blue-400 focus:bg-white focus:ring-blue-100',
                            'placeholder:text-slate-400 text-sm text-slate-700',
                            'transition-all duration-200 rounded-xl'
                        )}
                    />
                </div>

                {/* Filter controls */}
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Status multi-select */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'h-9 gap-2 rounded-xl text-xs font-medium border-slate-200 bg-white text-slate-600',
                                    'hover:bg-slate-50 hover:text-slate-800 transition-all duration-200',
                                    activeStatusCount > 0 &&
                                    'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-50'
                                )}
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                Status
                                {activeStatusCount > 0 && (
                                    <Badge className="h-4 px-1.5 text-[10px] bg-blue-100 text-blue-700 border-0 rounded-full">
                                        {activeStatusCount}
                                    </Badge>
                                )}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-48 rounded-xl border-slate-200 bg-white shadow-lg shadow-slate-200/60"
                        >
                            <DropdownMenuLabel className="text-xs text-slate-500 font-medium px-3 py-2">
                                Filter by Status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            {statusOptions.map((status) => (
                                <DropdownMenuCheckboxItem
                                    key={status}
                                    className="text-sm gap-2 rounded-lg mx-1 cursor-pointer text-slate-700"
                                    checked={filters.accountStatus?.includes(status)}
                                    onCheckedChange={(checked) => {
                                        const current = filters.accountStatus || [];
                                        const newStatus = checked
                                            ? [...current, status]
                                            : current.filter((s) => s !== status);
                                        onFilterChange('accountStatus', newStatus);
                                    }}
                                >
                                    <span className={statusColors[status] || 'text-slate-400'}>●</span>
                                    <span className="capitalize">{status}</span>
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Verified filter */}
                    <Select
                        value={
                            filters.isVerified === undefined
                                ? 'all'
                                : filters.isVerified
                                    ? 'true'
                                    : 'false'
                        }
                        onValueChange={handleVerifiedChange}
                    >
                        <SelectTrigger
                            className={cn(
                                'h-9 w-[130px] rounded-xl text-xs font-medium gap-1.5',
                                'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                'transition-all duration-200',
                                filters.isVerified !== undefined &&
                                'border-violet-300 bg-violet-50 text-violet-700'
                            )}
                        >
                            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                            <SelectValue placeholder="Verified" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 bg-white shadow-lg shadow-slate-200/60">
                            <SelectItem value="all" className="text-sm rounded-lg text-slate-700">All Users</SelectItem>
                            <SelectItem value="true" className="text-sm rounded-lg text-emerald-600">✓ Verified</SelectItem>
                            <SelectItem value="false" className="text-sm rounded-lg text-slate-500">✗ Unverified</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select
                        value={`${filters.sortBy}:${filters.sortOrder}`}
                        onValueChange={(value) => {
                            const [sortBy, sortOrder] = value.split(':') as [string, 'asc' | 'desc'];
                            onFilterChange('sortBy', sortBy);
                            onFilterChange('sortOrder', sortOrder);
                        }}
                    >
                        <SelectTrigger
                            className={cn(
                                'h-9 w-[155px] rounded-xl text-xs font-medium gap-1.5',
                                'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                'transition-all duration-200'
                            )}
                        >
                            <ArrowUpDown className="h-3.5 w-3.5 flex-shrink-0" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 bg-white shadow-lg shadow-slate-200/60">
                            <SelectItem value="createdAt:desc" className="text-sm rounded-lg">Newest first</SelectItem>
                            <SelectItem value="createdAt:asc" className="text-sm rounded-lg">Oldest first</SelectItem>
                            <SelectItem value="name:asc" className="text-sm rounded-lg">Name A–Z</SelectItem>
                            <SelectItem value="name:desc" className="text-sm rounded-lg">Name Z–A</SelectItem>
                            <SelectItem value="email:asc" className="text-sm rounded-lg">Email A–Z</SelectItem>
                            <SelectItem value="email:desc" className="text-sm rounded-lg">Email Z–A</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Page size */}
                    <Select
                        value={String(filters.limit)}
                        onValueChange={(value) => onFilterChange('limit', Number(value))}
                    >
                        <SelectTrigger
                            className={cn(
                                'h-9 w-[105px] rounded-xl text-xs font-medium gap-1.5',
                                'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                'transition-all duration-200'
                            )}
                        >
                            <LayoutList className="h-3.5 w-3.5 flex-shrink-0" />
                            <SelectValue placeholder="Rows" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 bg-white shadow-lg shadow-slate-200/60">
                            {[10, 20, 30, 50, 100].map((size) => (
                                <SelectItem key={size} value={String(size)} className="text-sm rounded-lg">
                                    {size} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Divider */}
                    <div className="h-5 w-px bg-slate-200 hidden sm:block" />

                    {/* Refresh */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="h-9 w-9 p-0 rounded-xl border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200"
                    >
                        <motion.div
                            animate={{ rotate: isRefreshing ? 360 : 0 }}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </motion.div>
                    </Button>
                </div>

                {/* Active filter indicator */}
                {hasActiveFilters && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 ml-auto"
                    >
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs text-slate-500 font-medium">Filters active</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}