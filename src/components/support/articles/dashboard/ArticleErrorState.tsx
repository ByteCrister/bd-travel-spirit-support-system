'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HiExclamationTriangle, HiMagnifyingGlass, HiSparkles } from 'react-icons/hi2';
import { ArticleListItem } from '@/types/article/article.types';

type Props<T extends ArticleListItem = ArticleListItem> = {
    error?: string;
    items: T[];
    isLoading: boolean;
};

export default function ArticleErrorState<T extends ArticleListItem>({
    error,
    items,
    isLoading,
}: Props<T>) {
    if (error) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                >
                    <Alert
                        variant="destructive"
                        className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full -mr-20 -mt-20" />

                        <div className="flex items-start gap-4 relative z-10">
                            <motion.div
                                className="flex-shrink-0 p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg"
                                animate={{
                                    rotate: [0, -5, 5, -5, 0],
                                    scale: [1, 1.05, 1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                <HiExclamationTriangle className="h-5 w-5 text-white" />
                            </motion.div>

                            <div className="flex-1 space-y-1">
                                <AlertTitle className="text-lg font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
                                    Something went wrong
                                    <motion.div
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"
                                    />
                                </AlertTitle>
                                <AlertDescription className="text-red-800 dark:text-red-200 leading-relaxed">
                                    {error}
                                </AlertDescription>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mt-3"
                                />
                            </div>
                        </div>
                    </Alert>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (!isLoading && items.length === 0) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                >
                    <Alert className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 via-indigo-400/20 to-purple-400/20 rounded-full -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 via-indigo-400/20 to-blue-400/20 rounded-full -ml-16 -mb-16" />

                        <div className="flex items-start gap-4 relative z-10">
                            <motion.div
                                className="flex-shrink-0 p-2.5 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg"
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 2, repeat: Infinity, repeatDelay: 1 }
                                }}
                            >
                                <HiMagnifyingGlass className="h-5 w-5 text-white" />
                            </motion.div>

                            <div className="flex-1 space-y-2">
                                <AlertTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    No articles found
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 180, 360]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 2
                                        }}
                                    >
                                        <HiSparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </motion.div>
                                </AlertTitle>
                                <AlertDescription className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    Try adjusting your filters, search terms, or sorting options to discover more content.
                                </AlertDescription>

                                <motion.div className="flex gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                                    {['Clear filters', 'Reset search', 'View all'].map((text, i) => (
                                        <motion.div
                                            key={text}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all duration-200"
                                        >
                                            {text}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </Alert>
                </motion.div>
            </AnimatePresence>
        );
    }

    return null;
}