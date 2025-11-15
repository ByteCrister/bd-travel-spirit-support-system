'use client';

import React, { useEffect, useCallback, JSX } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { MdRefresh, MdError } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';
import useAdsStore from '@/store/ad.store';
import { showToast } from '@/components/global/showToast';
import { AdsOverview } from './AdsOverview';
import { AdsToolbar } from './AdsToolbar';
import { AdsSkeletons } from './AdsSkeletons';
import { AdsTable } from './AdsTable';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const errorVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 20
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: { duration: 0.2 }
    }
};

export default function AdsPage(): JSX.Element {
    // store selectors
    const {
        list,
        listMeta,
        setPage,
        setLimit,
        fetchList,
        fetchOverview,
    } = useAdsStore();

    useEffect(() => {
        // page-level initialization: ensure overview + list
        fetchOverview().catch((e) => {
            showToast.error(String(e?.message ?? 'Failed to load overview'));
        });
        fetchList().catch(() => {
            if (listMeta.error) showToast.error(listMeta.error);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (listMeta.error) {
            showToast.error(listMeta.error);
        }
    }, [listMeta.error]);

    const onPageChange = useCallback(
        (p: number) => {
            setPage(p);
            fetchList().catch(() => {
                if (listMeta.error) showToast.error(listMeta.error);
            });
        },
        [fetchList, listMeta.error, setPage]
    );

    const onLimitChange = useCallback(
        (l: number) => {
            setLimit(l);
            fetchList().catch(() => {
                if (listMeta.error) showToast.error(listMeta.error);
            });
        },
        [fetchList, listMeta.error, setLimit]
    );

    const handleRefresh = useCallback(() => {
        fetchList();
    }, [fetchList]);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50"
        >
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header Section */}
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-20 animate-pulse" />
                            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                                <HiSparkles className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                Advertisements
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Manage and monitor all advertising campaigns
                            </p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        disabled={listMeta.loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MdRefresh
                            className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${
                                listMeta.loading ? 'animate-spin' : ''
                            }`}
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Refresh
                        </span>
                    </motion.button>
                </motion.div>

                {/* Overview Section */}
                <motion.div variants={itemVariants}>
                    <AdsOverview />
                </motion.div>

                {/* Toolbar Section */}
                <motion.div variants={itemVariants}>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
                        <AdsToolbar onRefresh={handleRefresh} />
                    </div>
                </motion.div>

                {/* Error Alert */}
                <AnimatePresence mode="wait">
                    {listMeta.error && (
                        <motion.div
                            variants={errorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            role="alert"
                            className="relative overflow-hidden rounded-xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20" />
                            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-red-200 dark:border-red-800 p-4 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                            <MdError className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                                            Error Loading Data
                                        </h3>
                                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                            {listMeta.error}
                                        </p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleRefresh}
                                        className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                                    >
                                        <MdRefresh className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table Section */}
                <motion.div variants={itemVariants}>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                        <AnimatePresence mode="wait">
                            {listMeta.loading && list.length === 0 ? (
                                <motion.div
                                    key="skeleton"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-6"
                                >
                                    <AdsSkeletons.TableSkeleton rows={6} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="table"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AdsTable
                                        ads={list}
                                        pagination={{
                                            page: listMeta.pagination.page,
                                            limit: listMeta.pagination.limit,
                                            total: listMeta.pagination.total,
                                            pages: listMeta.pagination.pages,
                                        }}
                                        onPageChange={onPageChange}
                                        onLimitChange={onLimitChange}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Footer Info */}
                <motion.div
                    variants={itemVariants}
                    className="text-center text-sm text-slate-500 dark:text-slate-400"
                >
                    <p>
                        Showing {list.length} of {listMeta.pagination.total} advertisements
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}