// components/article/ArticleRefreshButton.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { HiArrowPath } from 'react-icons/hi2';
import { useArticleStore } from '@/store/article/article.store';

export default function ArticleRefreshButton() {
    const invalidateStats = useArticleStore((s) => s.invalidateStats);
    const invalidateList = useArticleStore((s) => s.invalidateList);
    const fetchArticleStats = useArticleStore((s) => s.fetchArticleStats);
    const fetchArticleList = useArticleStore((s) => s.fetchArticleList);
    const loading = useArticleStore((s) => s.loading);

    const [isRotating, setIsRotating] = React.useState(false);

    const onRefresh = async () => {
        setIsRotating(true);
        invalidateStats();
        invalidateList();
        await Promise.all([fetchArticleStats(true), fetchArticleList()]);
        setTimeout(() => setIsRotating(false), 600);
    };

    const isLoading = loading.isLoadingList || loading.isLoadingStats;

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Button
                variant="outline"
                onClick={onRefresh}
                aria-label="Refresh data"
                disabled={isLoading}
                className="relative overflow-hidden border-2 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
            >
                <motion.div
                    animate={{ rotate: isRotating || isLoading ? 360 : 0 }}
                    transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                        repeat: isLoading ? Infinity : 0,
                    }}
                    className="mr-2"
                >
                    <HiArrowPath className="h-4 w-4" />
                </motion.div>
                Refresh
                {isLoading && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </Button>
        </motion.div>
    );
}