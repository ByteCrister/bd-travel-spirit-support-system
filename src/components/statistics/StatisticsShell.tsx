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
import { useStatisticsStore } from '@/store/useStatisticsStore';
import { RankingItem } from '@/types/statistics.types';
import { MainContent } from './MainContent';
import { Breadcrumbs } from '../global/Breadcrumbs';

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Statistics", href: "/statistics" },
];

export function StatisticsShell() {
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
                    onRefresh={() => refreshSection('users')}
                    onClearError={() => clearError('users')}
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
                    onRefresh={() => refreshSection('tours')}
                    onClearError={() => clearError('tours')}
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
                    onRefresh={() => refreshSection('reviews')}
                    onClearError={() => clearError('reviews')}
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
                    onRefresh={() => refreshSection('reports')}
                    onClearError={() => clearError('reports')}
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
                    onRefresh={() => refreshSection('images')}
                    onClearError={() => clearError('images')}
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
                    onRefresh={() => refreshSection('notifications')}
                    onClearError={() => clearError('notifications')}
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
                    onRefresh={() => refreshSection('chat')}
                    onClearError={() => clearError('chat')}
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
                    onRefresh={() => refreshSection('employees')}
                    onClearError={() => clearError('employees')}
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
            >
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Platform Statistics
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Comprehensive analytics and insights for your platform
                            </p>
                        </div>
                    </div>
                </div>
            </motion.header>

            <FilterBar />

            {/* Main Content */}
            <MainContent tabSections={tabSections} />
        </div>
    );
}