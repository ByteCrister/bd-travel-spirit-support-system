"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useResetRequestsStore } from "@/store/reset-requests.store";

export default function PaginationControls() {
    const { currentQuery, fetchList, queryCache } = useResetRequestsStore();

    const page = currentQuery.page ?? 1;
    const limit = currentQuery.limit ?? 20;

    // Calculate total pages from cache
    const totalPages = useMemo(() => {
        const cacheKeys = Object.keys(queryCache);
        const relevantCache = cacheKeys.find(key => {
            try {
                const cached = queryCache[key];
                return cached?.query?.status === currentQuery.status &&
                    cached?.query?.search === currentQuery.search;
            } catch {
                return false;
            }
        });

        if (relevantCache && queryCache[relevantCache]) {
            const total = queryCache[relevantCache].total;
            return Math.ceil(total / limit);
        }
        return page; // Fallback to current page
    }, [queryCache, currentQuery, page, limit]);

    const goToPage = async (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        await fetchList({ ...currentQuery, page: newPage });
    };

    const prev = () => goToPage(page - 1);
    const next = () => goToPage(page + 1);
    const first = () => goToPage(1);
    const last = () => goToPage(totalPages);

    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800"
        >
            {/* Page Info */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                    Page
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 px-2 py-0.5 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                    {page}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                    of {totalPages}
                </span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
                {/* First Page */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={first}
                        disabled={!hasPrev}
                        className="shadow-sm"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </Button>
                </motion.div>

                {/* Previous Page */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prev}
                        disabled={!hasPrev}
                        className="shadow-sm gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>
                </motion.div>

                {/* Next Page */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={next}
                        disabled={!hasNext}
                        className="shadow-sm gap-1"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </motion.div>

                {/* Last Page */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={last}
                        disabled={!hasNext}
                        className="shadow-sm"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}