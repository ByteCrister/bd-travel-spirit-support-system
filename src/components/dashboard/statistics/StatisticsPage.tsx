'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { FilterBar } from './FilterBar';
import { MainContent } from './MainContent';
import { Breadcrumbs } from '../../global/Breadcrumbs';
import { BarChart3 } from 'lucide-react';
import { SectionKeyEnum } from '@/types/dashboard/statistics.types';
import { useStatisticsStore } from '@/store/dashboard/statistics.store';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_PAGE_BG = 'min-h-screen bg-[#E7E5E4]';
const NEU_HEADER_SURFACE =
    'relative bg-[#E7E5E4] shadow-[0_6px_16px_#c8c6c5] border-b border-[#c8c6c5]/50 overflow-hidden';
const NEU_ICON_WELL =
    'p-2.5 rounded-xl bg-[#006666]/10 shadow-[3px_3px_7px_#c8c6c5,-3px_-3px_7px_#ffffff]';
const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-2xl md:text-3xl tracking-tight';
const NEU_SUBHEADING =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm md:text-base text-[#1E2938]/60 mt-1 max-w-xl';
const NEU_LIVE_BADGE =
    'hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ' +
    'bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60';

const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard/overview' },
    { label: 'Statistics', href: '/dashboard/statistics' },
];

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
        const key = tabToSectionKey[activeTab];
        if (key) refreshSection(key, { force: true });
    }, [activeTab, refreshSection]);

    const handleRefresh = useCallback(() => {
        const key = tabToSectionKey[activeTab];
        if (key) refreshSection(key, { force: true });
    }, [activeTab, refreshSection]);

    return (
        <div className={NEU_PAGE_BG}>
            <Breadcrumbs className="px-4 py-3 lg:px-6" items={breadcrumbItems} />

            {/* ── Page Header ── */}
            <motion.header
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={NEU_HEADER_SURFACE}
            >
                {/* Subtle dot-grid texture */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle, #1E2938 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="relative px-6 py-6 md:py-8">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: icon + title */}
                        <div className="flex items-center gap-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.12, type: 'spring', stiffness: 180 }}
                                className={NEU_ICON_WELL}
                            >
                                <BarChart3 className="w-7 h-7 text-[#006666]" />
                            </motion.div>

                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className={NEU_HEADING}
                                >
                                    Platform Statistics
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={NEU_SUBHEADING}
                                >
                                    Comprehensive analytics and concise insights for your platform
                                </motion.p>
                            </div>
                        </div>

                        {/* Right: live indicator */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.28 }}
                            className={NEU_LIVE_BADGE}
                            aria-hidden
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A63D] opacity-60" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A63D]" />
                            </span>
                            Live
                        </motion.div>
                    </div>
                </div>
            </motion.header>

            <FilterBar onApplyFilters={handleApplyFilters} onRefresh={handleRefresh} />
            <MainContent activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}