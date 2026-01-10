// components/support/tours/SupportToursPage.tsx
"use client";

import { useTourApproval } from "@/store/tour-approval.store";
import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Kpis from "./Kpis";
import FiltersBar from "./FiltersBar";
import ToursTable from "./ToursTable";
import Pagination from "./Pagination";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export default function SupportToursPage() {
    const { filters, pagination, isLoading, error, fetchTours, clearFilters } =
        useTourApproval();

    useEffect(() => {
        fetchTours(filters || {}, pagination.page, pagination.limit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
            >
                {/* Enhanced Header */}
                <motion.header variants={itemVariants} className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                Tour Management Center
                            </h1>
                            <p className="text-sm md:text-base text-slate-600">
                                Review, approve, and manage tour submissions
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    fetchTours(filters || {}, pagination.page, pagination.limit)
                                }
                                className="border-2 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md group"
                            >
                                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                Refresh
                            </Button>
                            <Button
                                onClick={() => {
                                    clearFilters();
                                    fetchTours({}, 1, pagination.limit);
                                }}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Filters
                            </Button>
                        </div>
                    </div>

                    {/* Loading/Error States with Animation */}
                    {(isLoading || error) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-2xl overflow-hidden shadow-md"
                        >
                            {isLoading && (
                                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-5 h-5">
                                            <div className="absolute inset-0 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        <p className="text-sm font-medium text-blue-900">
                                            Loading tours...
                                        </p>
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-200 p-4">
                                    <p className="text-sm font-medium text-red-900">{error}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.header>

                {/* KPIs Section */}
                <motion.div variants={itemVariants}>
                    <Kpis />
                </motion.div>

                {/* Filters Section */}
                <motion.div variants={itemVariants}>
                    <FiltersBar />
                </motion.div>

                {/* Tours Table Section */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden"
                >
                    <div className="p-6">
                        <ToursTable />
                    </div>
                </motion.div>

                {/* Pagination Section */}
                <motion.div variants={itemVariants}>
                    <Pagination />
                </motion.div>
            </motion.div>
        </div>
    );
}