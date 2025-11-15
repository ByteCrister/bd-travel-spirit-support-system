// components/ads/AdsTable.tsx
'use client';

import React, { JSX } from 'react';
import { motion, Variants } from 'framer-motion';
import { MdInbox } from 'react-icons/md';
import type { AdvertisementResponse } from '@/types/advertising.types';
import { AdRow } from './AdRow';
import { AdsPagination } from './AdsPagination';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export interface AdsTableProps {
    ads: AdvertisementResponse[];
    pagination: { page: number; limit: number; total: number; pages: number };
    onPageChange: (p: number) => void;
    onLimitChange: (l: number) => void;
}

const emptyVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

export function AdsTable({ ads, pagination, onPageChange, onLimitChange }: AdsTableProps): JSX.Element {
    if (!ads || ads.length === 0) {
        return (
            <motion.div
                variants={emptyVariants}
                initial="hidden"
                animate="visible"
                className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-6 py-12"
            >
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <MdInbox className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            No advertisements found
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Try adjusting your filters or search query
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <TableHead className="w-[50px]">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">SEL</span>
                                </TableHead>
                                <TableHead className="min-w-[250px]">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">ADVERTISEMENT</span>
                                </TableHead>
                                <TableHead className="min-w-[150px]">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">PLACEMENTS</span>
                                </TableHead>
                                <TableHead className="w-[120px]">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">STATUS</span>
                                </TableHead>
                                <TableHead className="w-[100px] text-right">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">IMPR.</span>
                                </TableHead>
                                <TableHead className="w-[100px] text-right">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">CLICKS</span>
                                </TableHead>
                                <TableHead className="w-[120px]">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">CREATED</span>
                                </TableHead>
                                <TableHead className="w-[100px] text-right">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">ACTIONS</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ads.map((ad, idx) => (
                                <AdRow key={ad.id} ad={ad} index={idx} />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <AdsPagination
                page={pagination.page}
                limit={pagination.limit}
                total={pagination.total}
                pages={pagination.pages}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange}
            />
        </div>
    );
}