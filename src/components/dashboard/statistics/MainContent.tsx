'use client';

import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useStatisticsStore } from '@/store/dashboard/statistics.store';
import { SectionKeyEnum } from '@/types/dashboard/statistics.types';
import { KpiCards } from './KpiCards';
import { Section } from './Section';
import { LineChart } from './charts/LineChart';
import { DonutChart } from './charts/DonutChart';
import { BarChart } from './charts/BarChart';
import { DataTable } from './tables/DataTable';
import { formatDuration, formatNumber, formatPercentage } from '@/utils/helpers/format';
import { RankingItem } from '@/types/dashboard/statistics.types';
import {
    MdDashboard,
    MdBarChart,
    MdPeople,
    MdEvent,
    MdImage,
    MdReportProblem,
    MdNotifications,
    MdChat,
    MdWork,
} from 'react-icons/md';

const iconMap: Record<string, React.ReactNode> = {
    overview: <MdDashboard className="w-4 h-4" />,
    users: <MdPeople className="w-4 h-4" />,
    tours: <MdEvent className="w-4 h-4" />,
    reviews: <MdBarChart className="w-4 h-4" />,
    reports: <MdReportProblem className="w-4 h-4" />,
    media: <MdImage className="w-4 h-4" />,
    notifications: <MdNotifications className="w-4 h-4" />,
    chat: <MdChat className="w-4 h-4" />,
    employees: <MdWork className="w-4 h-4" />,
};

// Fetches data for a section when the tab becomes active or filters change
function SectionFetcher({ sectionKey, children }: { sectionKey: SectionKeyEnum; children: React.ReactNode }) {
    const refreshSection = useStatisticsStore((state) => state.refreshSection);

    useEffect(() => {
        refreshSection(sectionKey);
    }, [refreshSection, sectionKey]); // No filters dependency – manual apply only

    return <>{children}</>;
}

interface MainContentProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function MainContent({ activeTab, onTabChange }: MainContentProps) {
    const { data, loading, error, clearError, refreshSection } = useStatisticsStore();

    const tabSections = [
        {
            id: 'overview',
            label: 'Overview',
            sectionKey: SectionKeyEnum.KPIS,
            content: (
                <div className="space-y-8">
                    <KpiCards data={data.kpis} loading={loading.kpis} />
                </div>
            ),
        },
        {
            id: 'users',
            label: 'Users',
            sectionKey: SectionKeyEnum.USERS,
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
            ),
        },
        {
            id: 'tours',
            label: 'Tours',
            sectionKey: SectionKeyEnum.TOURS,
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
                                    formatter: (value) => formatNumber(value as number),
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
                                    ),
                                },
                            ]}
                            pageSize={5}
                        />
                    </div>
                </Section>
            ),
        },
        {
            id: 'reviews',
            label: 'Reviews',
            sectionKey: SectionKeyEnum.REVIEWS,
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
            ),
        },
        {
            id: 'reports',
            label: 'Reports',
            sectionKey: SectionKeyEnum.REPORTS,
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
            ),
        },
        {
            id: 'media',
            label: 'Media',
            sectionKey: SectionKeyEnum.IMAGES,
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
            ),
        },
        {
            id: 'notifications',
            label: 'Notifications',
            sectionKey: SectionKeyEnum.NOTIFICATIONS,
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
            ),
        },
        {
            id: 'chat',
            label: 'Chat',
            sectionKey: SectionKeyEnum.CHAT,
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
                                formatter: (value) => formatNumber(value as number),
                            },
                        ]}
                        pageSize={5}
                    />
                </Section>
            ),
        },
        {
            id: 'employees',
            label: 'Employees',
            sectionKey: SectionKeyEnum.EMPLOYEES,
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
                                    formatter: (value) => formatNumber(value as number),
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
            ),
        },
    ];

    return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={onTabChange} className="h-full">
                    <div className="sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="py-3">
                            <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-white dark:bg-gray-800 p-1 shadow-sm border border-gray-200 dark:border-gray-700 gap-1">
                                {tabSections.map((section) => (
                                    <TabsTrigger
                                        key={section.id}
                                        value={section.id}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-all duration-200 hover:text-gray-900 dark:hover:text-gray-200 data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 whitespace-nowrap"
                                    >
                                        {iconMap[section.id]}
                                        <span className="hidden sm:inline">{section.label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </div>

                    <div className="pb-8">
                        {tabSections.map((section) => (
                            <TabsContent
                                key={section.id}
                                value={section.id}
                                className="mt-0 pt-6 focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:duration-300"
                            >
                                <SectionFetcher sectionKey={section.sectionKey}>
                                    {section.content}
                                </SectionFetcher>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}