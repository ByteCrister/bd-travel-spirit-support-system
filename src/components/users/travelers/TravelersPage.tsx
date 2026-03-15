'use client';

// src/components/users/travelers/Travelers.tsx
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TravelerFilter, TravelerListItem, TravelerListStats } from '@/types/user/traveler.types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useTravelerStore } from '@/store/traveler/travelers.store';
import { TravelerStats } from './TravelerStats';
import { TravelerFilters } from './TravelerFilters';
import TravelerTableSkeleton from './skeletons/TravelerTableSkeleton';
import { TravelerTable } from './TravelerTable';
import { TravelerPagination } from './TravelerPagination';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';
import { Users } from 'lucide-react';

export default function TravelersPage() {
    const router = useRouter();
    const { fetchTravelers, clearTravelerListCache, loading, errors } = useTravelerStore();

    const [filters, setFilters] = useState<TravelerFilter>({
        page: 1,
        limit: 10,
        search: '',
        accountStatus: [],
        isVerified: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const [data, setData] = useState<{
        travelers: TravelerListItem[];
        total: number;
        totalPages: number;
        stats: TravelerListStats | null;
    }>({
        travelers: [],
        total: 0,
        totalPages: 0,
        stats: null,
    });

    const loadTravelers = useCallback(
        async (forceRefresh = false) => {
            try {
                const response = await fetchTravelers(filters, forceRefresh);
                setData({
                    travelers: response.data,
                    total: response.total,
                    totalPages: response.totalPages,
                    stats: response.stats,
                });
            } catch (error) {
                console.error('Failed to fetch travelers:', error);
            }
        },
        [fetchTravelers, filters]
    );

    useEffect(() => {
        loadTravelers();
    }, [loadTravelers]);

    const debouncedSearch = useDebouncedCallback((search: string) => {
        setFilters((prev) => ({ ...prev, search, page: 1 }));
    }, 500);

    const handleFilterChange = <K extends keyof TravelerFilter>(key: K, value: TravelerFilter[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleRefresh = () => {
        clearTravelerListCache();
        loadTravelers(true);
    };

    const handleRowClick = (travelerId: string) => {
        router.push(`/users/travelers/${encodeURIComponent(encodeId(travelerId))}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="container mx-auto py-8 px-4 space-y-6 max-w-[1400px]">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-200">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Traveler Management
                            </h1>
                            {data.total > 0 && (
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {data.total.toLocaleString()} travelers total
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                {data.stats ? (
                    <TravelerStats stats={data.stats} />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-[88px] rounded-2xl bg-slate-200/60" />
                        ))}
                    </div>
                )}

                {/* Filters */}
                <TravelerFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearchChange={debouncedSearch}
                    onRefresh={handleRefresh}
                />

                {/* Table card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                    {/* Table header strip */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-slate-500">
                                {loading.list ? 'Loading...' : `${data.travelers.length} results`}
                            </span>
                        </div>
                        {data.total > 0 && !loading.list && (
                            <span className="text-xs text-slate-400 tabular-nums">
                                Showing {((filters.page! - 1) * filters.limit!) + 1}–
                                {Math.min(filters.page! * filters.limit!, data.total)} of {data.total}
                            </span>
                        )}
                    </div>

                    {/* Table */}
                    <div className="p-1">
                        {loading.list ? (
                            <TravelerTableSkeleton />
                        ) : (
                            <TravelerTable
                                travelers={data.travelers}
                                onRowClick={handleRowClick}
                                emptyMessage={errors.list || 'No travelers found'}
                            />
                        )}
                    </div>
                </motion.div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                    <TravelerPagination
                        currentPage={filters.page!}
                        totalPages={data.totalPages}
                        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                    />
                )}
            </div>
        </div>
    );
}