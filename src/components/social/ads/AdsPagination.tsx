// components/ads/AdsPagination.tsx
'use client';

import React, { JSX } from 'react';
import { motion } from 'framer-motion';
import {
    MdKeyboardDoubleArrowLeft,
    MdKeyboardDoubleArrowRight,
    MdNavigateBefore,
    MdNavigateNext,
} from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdsPaginationProps {
    page: number;
    limit: number;
    total: number;
    pages: number;
    onPageChange: (p: number) => void;
    onLimitChange: (l: number) => void;
}

export function AdsPagination({
    page,
    limit,
    total,
    pages,
    onPageChange,
    onLimitChange,
}: AdsPaginationProps): JSX.Element {
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
        >
            {/* Info Section */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600 dark:text-slate-400">Showing</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                    {start}–{end}
                </span>
                <span className="text-slate-600 dark:text-slate-400">of</span>
                <span className="font-semibold text-slate-900 dark:text-white">{total}</span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(1)}
                            disabled={page <= 1}
                            aria-label="First page"
                            className="h-9 w-9 p-0"
                        >
                            <MdKeyboardDoubleArrowLeft className="w-5 h-5" />
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            aria-label="Previous page"
                            className="h-9 w-9 p-0"
                        >
                            <MdNavigateBefore className="w-5 h-5" />
                        </Button>
                    </motion.div>

                    <div className="flex items-center gap-2 px-3 h-9 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{page}</span>
                        <span className="text-sm text-slate-400">/</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{pages || 1}</span>
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(pages || 1, page + 1))}
                            disabled={page >= (pages || 1)}
                            aria-label="Next page"
                            className="h-9 w-9 p-0"
                        >
                            <MdNavigateNext className="w-5 h-5" />
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pages || 1)}
                            disabled={page >= (pages || 1)}
                            aria-label="Last page"
                            className="h-9 w-9 p-0"
                        >
                            <MdKeyboardDoubleArrowRight className="w-5 h-5" />
                        </Button>
                    </motion.div>
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">Rows</span>
                    <Select onValueChange={(v) => onLimitChange(Number(v))} value={String(limit)}>
                        <SelectTrigger className="w-[80px] h-9">
                            <SelectValue placeholder={String(limit)} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </motion.div>
    );
}