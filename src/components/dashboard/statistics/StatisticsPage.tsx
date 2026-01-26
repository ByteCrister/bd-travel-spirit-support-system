'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { KpiCards } from './KpiCards';
import { Section } from './Section';
import { LineChart } from './charts/LineChart';
import { DonutChart } from './charts/DonutChart';
import { BarChart } from './charts/BarChart';
import { DataTable } from './tables/DataTable';
import { formatDuration, formatNumber, formatPercentage } from '@/utils/helpers/format';
import { FilterBar } from './FilterBar';
import { useStatisticsStore } from '@/store/statistics.store';
import { RankingItem, SectionKeyEnum } from '@/types/statistics.types';
import { MainContent } from './MainContent';
import { Breadcrumbs } from '../../global/Breadcrumbs';
import { BarChart3, Sparkles } from 'lucide-react';

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Dashboard", href: "/dashboard/overview" },
    { label: "Statistics", href: "/dashboard/statistics" },
];

export function StatisticsPage() {
    const { data, loading, error, clearError, refreshSection, refreshAll } = useStatisticsStore();


    // Initialize data on mount
    useEffect(() => {
        refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tabSections = [
        {
            id: 'overview',
            label: 'Overview',
            content: (
                <div className="space-y-8">
                    <KpiCards data={data.kpis} loading={loading.kpis} />
                </div>
            )
        },
        {
            id: 'users',
            label: 'Users',
            content: (
                <Section
                    title="User Analytics"
                    description="User registration trends and account status distribution"
                    loading={loading.users}
                    error={error.users}
                    data={data.users}
                    onRefresh={() => refreshSection(SectionKeyEnum.USERS)}
                    onClearError={() => clearError(SectionKeyEnum.USERS)}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <LineChart
                            data={data.users?.signupsOverTime || []}
                            title="New Signups Over Time"
                            color="#3b82f6"
                        />
                        <DonutChart
                            data={data.users?.statusDistribution || []}
                            title="User Status Distribution"
                            showPercentages={true}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Organizer Applications</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending:</span>
                                    <span className="font-medium">{data.users?.guideApplications.pending}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Approved:</span>
                                    <span className="font-medium text-green-600">{data.users?.guideApplications.approved}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Rejected:</span>
                                    <span className="font-medium text-red-600">{data.users?.guideApplications.rejected}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Review Time:</span>
                                    <span className="font-medium">{data.users?.guideApplications.avgReviewTime}d</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            )
        },
        {
            id: 'tours',
            label: 'Tours',
            content: (
                <Section
                    title="Tour Analytics"
                    description="Tour performance, bookings, and ratings analysis"
                    loading={loading.tours}
                    error={error.tours}
                    data={data.tours}
                    onRefresh={() => refreshSection(SectionKeyEnum.TOURS)}
                    onClearError={() => clearError(SectionKeyEnum.TOURS)}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <BarChart
                            data={data.tours?.statusCounts || []}
                            title="Tours by Status"
                            color="#10b981"
                        />
                        <LineChart
                            data={data.tours?.upcomingTours || []}
                            title="Upcoming Tours Timeline"
                            color="#8b5cf6"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <DataTable<RankingItem>
                            data={data.tours?.bookingsPerTour || []}
                            title="Top Tours by Bookings"
                            columns={[
                                { key: 'label', label: 'Tour Name', sortable: true },
                                {
                                    key: 'value',
                                    label: 'Bookings',
                                    sortable: true,
                                    formatter: (value) => formatNumber(value as number)
                                },
                            ]}
                            pageSize={5}
                        />

                        <DataTable<RankingItem>
                            data={data.tours?.ratingLeaderboard || []}
                            title="Top Rated Tours"
                            columns={[
                                { key: 'label', label: 'Tour Name', sortable: true },
                                {
                                    key: 'value',
                                    label: 'Rating',
                                    sortable: true,
                                    formatter: (value) => (
                                        <div className="flex items-center">
                                            <span className="mr-1">⭐</span>
                                            {(value as number).toFixed(1)}
                                        </div>
                                    )
                                },
                            ]}
                            pageSize={5}
                        />
                    </div>
                </Section>
            )
        },
        {
            id: 'reviews',
            label: 'Reviews',
            content: (
                <Section
                    title="Review Analytics"
                    description="Review trends, ratings, and verification status"
                    loading={loading.reviews}
                    error={error.reviews}
                    data={data.reviews}
                    onRefresh={() => refreshSection(SectionKeyEnum.REVIEWS)}
                    onClearError={() => clearError(SectionKeyEnum.REVIEWS)}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <LineChart
                            data={data.reviews?.volumeOverTime || []}
                            title="Review Volume Over Time"
                            color="#f59e0b"
                        />
                        <LineChart
                            data={data.reviews?.avgRatingTrend || []}
                            title="Average Rating Trend"
                            color="#ef4444"
                            formatValue={(value) => (value as number).toFixed(1)}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <DonutChart
                            data={data.reviews?.verificationStatus || []}
                            title="Verification Status"
                        />
                        <BarChart
                            data={data.reviews?.helpfulnessDistribution || []}
                            title="Helpfulness Distribution"
                            color="#8b5cf6"
                        />
                    </div>
                </Section>
            )
        },
        {
            id: 'reports',
            label: 'Reports',
            content: (
                <Section
                    title="Report Analytics"
                    description="Report status, resolution times, and common issues"
                    loading={loading.reports}
                    error={error.reports}
                    data={data.reports}
                    onRefresh={() => refreshSection(SectionKeyEnum.REPORTS)}
                    onClearError={() => clearError(SectionKeyEnum.REPORTS)}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <BarChart
                            data={data.reports?.statusFunnel || []}
                            title="Reports by Status"
                            color="#ef4444"
                        />
                        <DonutChart
                            data={data.reports?.reasonsBreakdown || []}
                            title="Report Reasons"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <LineChart
                            data={data.reports?.resolutionTimes || []}
                            title="Average Resolution Time (hours)"
                            color="#06b6d4"
                            formatValue={(value) => formatDuration(value as number)}
                        />

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Key Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Average Resolution Time:</span>
                                    <span className="font-medium">{formatDuration(data.reports?.avgResolutionTime || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Open Reports:</span>
                                    <span className="font-medium text-red-600">{data.reports?.statusFunnel.find(s => s.label === 'Open')?.count || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Resolved This Period:</span>
                                    <span className="font-medium text-green-600">{data.reports?.statusFunnel.find(s => s.label === 'Resolved')?.count || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            )
        },
        {
            id: 'media',
            label: 'Media',
            content: (
                <Section
                    title="Media Analytics"
                    description="Image uploads, moderation status, and storage metrics"
                    loading={loading.images}
                    error={error.images}
                    data={data.images}
                    onRefresh={() => refreshSection(SectionKeyEnum.IMAGES)}
                    onClearError={() => clearError(SectionKeyEnum.IMAGES)}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <LineChart
                            data={data.images?.uploadsOverTime || []}
                            title="Image Uploads Over Time"
                            color="#10b981"
                        />
                        <DonutChart
                            data={data.images?.moderationStatus || []}
                            title="Moderation Status"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <DonutChart
                            data={data.images?.storageProviders || []}
                            title="Storage Providers"
                        />

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Storage Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Storage:</span>
                                    <span className="font-medium">{(data.images?.totalStorage || 0).toFixed(1)} TB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Approved Images:</span>
                                    <span className="font-medium text-green-600">
                                        {formatPercentage(data.images?.moderationStatus.find(s => s.label === 'Approved')?.percentage || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Pending Review:</span>
                                    <span className="font-medium text-yellow-600">
                                        {data.images?.moderationStatus.find(s => s.label === 'Pending')?.count || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            )
        },
        {
            id: 'notifications',
            label: 'Notifications',
            content: (
                <Section
                    title="Notification Analytics"
                    description="Notification delivery, read rates, and engagement metrics"
                    loading={loading.notifications}
                    error={error.notifications}
                    data={data.notifications}
                    onRefresh={() => refreshSection(SectionKeyEnum.NOTIFICATIONS)}
                    onClearError={() => clearError(SectionKeyEnum.NOTIFICATIONS)}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <LineChart
                            data={data.notifications?.deliveryTimeline || []}
                            title="Notification Delivery Timeline"
                            color="#06b6d4"
                        />
                        <DonutChart
                            data={data.notifications?.byType || []}
                            title="Notifications by Type"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <DonutChart
                            data={data.notifications?.byPriority || []}
                            title="Notifications by Priority"
                        />

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Engagement Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Sent:</span>
                                    <span className="font-medium">{formatNumber(data.notifications?.sentVsRead.sent || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Read:</span>
                                    <span className="font-medium text-green-600">{formatNumber(data.notifications?.sentVsRead.read || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Read Rate:</span>
                                    <span className="font-medium">{formatPercentage(data.notifications?.sentVsRead.readRate || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            )
        },
        {
            id: 'chat',
            label: 'Chat',
            content: (
                <Section
                    title="Chat Analytics"
                    description="Message volume, response times, and conversation insights"
                    loading={loading.chat}
                    error={error.chat}
                    data={data.chat}
                    onRefresh={() => refreshSection(SectionKeyEnum.CHAT)}
                    onClearError={() => clearError(SectionKeyEnum.CHAT)}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <LineChart
                            data={data.chat?.messagesOverTime || []}
                            title="Messages Over Time"
                            color="#8b5cf6"
                        />

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Key Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Read Messages:</span>
                                    <span className="font-medium text-green-600">{formatNumber(data.chat?.readVsUnread.read || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Unread Messages:</span>
                                    <span className="font-medium text-red-600">{formatNumber(data.chat?.readVsUnread.unread || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Read Rate:</span>
                                    <span className="font-medium">{formatPercentage(data.chat?.readVsUnread.readRate || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Avg Response Time:</span>
                                    <span className="font-medium">{formatDuration(data.chat?.avgResponseTime || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DataTable<RankingItem>
                        data={data.chat?.topConversations || []}
                        title="Top Conversation Topics"
                        columns={[
                            { key: 'label', label: 'Topic', sortable: true },
                            {
                                key: 'value',
                                label: 'Messages',
                                sortable: true,
                                formatter: (value) => formatNumber(value as number)
                            },
                        ]}
                        pageSize={5}
                    />
                </Section>
            )
        },
        {
            id: 'employees',
            label: 'Employees',
            content: (
                <Section
                    title="Employee Analytics"
                    description="Staff distribution, shift completion, and workforce metrics"
                    loading={loading.employees}
                    error={error.employees}
                    data={data.employees}
                    onRefresh={() => refreshSection(SectionKeyEnum.EMPLOYEES)}
                    onClearError={() => clearError(SectionKeyEnum.EMPLOYEES)}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <DonutChart
                            data={data.employees?.countsByRole || []}
                            title="Employees by Role"
                        />
                        <DonutChart
                            data={data.employees?.countsByDepartment || []}
                            title="Employees by Department"
                        />
                        <DonutChart
                            data={data.employees?.countsByStatus || []}
                            title="Employees by Status"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <DataTable
                            data={data.employees?.countsByRole || []}
                            title="Role Distribution"
                            columns={[
                                { key: 'label', label: 'Role', sortable: true },
                                {
                                    key: 'count',
                                    label: 'Count',
                                    sortable: true,
                                    formatter: (value) => formatNumber(value as number)
                                },
                            ]}
                            pageSize={6}
                        />

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Shift Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Shifts Scheduled:</span>
                                    <span className="font-medium">{formatNumber(data.employees?.shiftsData.scheduled || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Shifts Completed:</span>
                                    <span className="font-medium text-green-600">{formatNumber(data.employees?.shiftsData.completed || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Completion Rate:</span>
                                    <span className="font-medium">{formatPercentage(data.employees?.shiftsData.completionRate || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Active Employees:</span>
                                    <span className="font-medium text-blue-600">
                                        {data.employees?.countsByStatus.find(s => s.label === 'Active')?.count || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Breadcrumbs items={breadcrumbItems} />
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-slate-700 via-indigo-700 to-slate-800 overflow-hidden"
            >
                {/* Subtle animated background pattern */}
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

                {/* Bottom separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path
                            d="M0 48h1440V0s-187.2 48-360 48S720 0 720 0 532.8 48 360 48 0 0 0 0v48z"
                            className="fill-gray-50/95 dark:fill-slate-900"
                        />
                    </svg>
                </div>
            </motion.header>

            <FilterBar />

            {/* Main Content */}
            <MainContent tabSections={tabSections} />
        </div>
    );
}