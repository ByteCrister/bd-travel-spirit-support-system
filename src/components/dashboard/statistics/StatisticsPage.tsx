'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { FilterBar } from './FilterBar';
import { MainContent } from './MainContent';
import { Breadcrumbs } from '../../global/Breadcrumbs';
import { BarChart3, Sparkles } from 'lucide-react';
import { SectionKeyEnum } from '@/types/dashboard/statistics.types';
import { useStatisticsStore } from '@/store/dashboard/statistics.store';

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Dashboard", href: "/dashboard/overview" },
    { label: "Statistics", href: "/dashboard/statistics" },
];

// Map tab IDs to section keys for manual refresh
const tabToSectionKey: Record<string, SectionKeyEnum> = {
    overview: SectionKeyEnum.KPIS,
    users: SectionKeyEnum.USERS,
    tours: SectionKeyEnum.TOURS,
    reviews: SectionKeyEnum.REVIEWS,
    reports: SectionKeyEnum.REPORTS,
    media: SectionKeyEnum.IMAGES,
    notifications: SectionKeyEnum.NOTIFICATIONS,
    chat: SectionKeyEnum.CHAT,
    employees: SectionKeyEnum.EMPLOYEES,
};

export function StatisticsPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const { refreshSection } = useStatisticsStore();

    const handleApplyFilters = useCallback(() => {
        const sectionKey = tabToSectionKey[activeTab];
        if (sectionKey) {
            refreshSection(sectionKey, { force: true }); // force bypasses cache
        }
    }, [activeTab, refreshSection]);

    const handleRefresh = useCallback(() => {
        const sectionKey = tabToSectionKey[activeTab];
        if (sectionKey) {
            refreshSection(sectionKey, { force: true });
        }
    }, [activeTab, refreshSection]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
            <Breadcrumbs className="p-4 lg:p-6" items={breadcrumbItems} />

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-slate-700 via-indigo-700 to-slate-800 overflow-hidden"
            >
                <div className="absolute inset-0 opacity-6 pointer-events-none">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                <div className="relative px-6 py-6 md:py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.15, type: "spring", stiffness: 160 }}
                                className="bg-white/10 backdrop-blur-sm p-2.5 rounded-lg"
                            >
                                <BarChart3 className="w-7 h-7 text-white/95" />
                            </motion.div>

                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-2xl md:text-3xl font-semibold text-white"
                                >
                                    Platform Statistics
                                    <Sparkles className="w-5 h-5 text-slate-200 inline-block ml-2 opacity-75" />
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.22 }}
                                    className="text-white/80 mt-1 text-sm md:text-base max-w-xl"
                                >
                                    Comprehensive analytics and concise insights for your platform
                                </motion.p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.28 }}
                            className="hidden md:flex items-center space-x-2 bg-white/6 backdrop-blur-sm px-3 py-2 rounded-md"
                            aria-hidden
                        >
                            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <span className="text-white text-sm font-medium">Live</span>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path
                            d="M0 48h1440V0s-187.2 48-360 48S720 0 720 0 532.8 48 360 48 0 0 0 0v48z"
                            className="fill-gray-50/95 dark:fill-slate-900"
                        />
                    </svg>
                </div>
            </motion.header>

            <FilterBar onApplyFilters={handleApplyFilters} onRefresh={handleRefresh} />
            <MainContent activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}