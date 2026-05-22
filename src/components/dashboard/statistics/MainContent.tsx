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
    MdDashboard, MdBarChart, MdPeople, MdEvent,
    MdImage, MdReportProblem, MdNotifications, MdChat, MdWork,
} from 'react-icons/md';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_PAGE_BG = 'flex-1 bg-[#E7E5E4] min-h-screen';
const NEU_TABS_RAIL =
    'sticky top-0 z-20 bg-[#E7E5E4] shadow-[0_4px_8px_#c8c6c5] border-b border-[#c8c6c5]/40';
const NEU_TABS_LIST =
    'inline-flex items-center h-auto gap-1 bg-transparent p-0 rounded-none';
const NEU_TAB_TRIGGER =
    'inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm ' +
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/50 ' +
    'bg-[#E7E5E4] border-none shadow-none ' +
    'hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'data-[state=active]:text-white data-[state=active]:bg-[#006666] ' +
    'data-[state=active]:shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080] ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 ' +
    'whitespace-nowrap';
// Neumorphic inset info card for stat rows inside sections
const NEU_STAT_CARD =
    'rounded-xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] p-5';
const NEU_STAT_LABEL =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60';
const NEU_STAT_VALUE =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]';
const NEU_STAT_VALUE_SUCCESS =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#00A63D]';
const NEU_STAT_VALUE_DANGER =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157]';
const NEU_STAT_VALUE_PRIMARY =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#006666]';
const NEU_STAT_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] mb-4';
const NEU_STAT_DIVIDER =
    'border-t border-[#c8c6c5]/50 pt-3 mt-1';

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

function SectionFetcher({ sectionKey, children }: { sectionKey: SectionKeyEnum; children: React.ReactNode }) {
    const refreshSection = useStatisticsStore((state) => state.refreshSection);
    useEffect(() => { refreshSection(sectionKey); }, [refreshSection, sectionKey]);
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LineChart data={data.users?.signupsOverTime || []} title="New Signups Over Time" color="#006666" />
                        <DonutChart data={data.users?.statusDistribution || []} title="User Status Distribution" showPercentages />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className={NEU_STAT_CARD}>
                            <h4 className={NEU_STAT_HEADING}>Organizer Applications</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Pending</span>
                                    <span className={NEU_STAT_VALUE}>{data.users?.guideApplications.pending}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Approved</span>
                                    <span className={NEU_STAT_VALUE_SUCCESS}>{data.users?.guideApplications.approved}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Rejected</span>
                                    <span className={NEU_STAT_VALUE_DANGER}>{data.users?.guideApplications.rejected}</span>
                                </div>
                                <div className={`flex justify-between items-center ${NEU_STAT_DIVIDER}`}>
                                    <span className={NEU_STAT_LABEL}>Avg Review Time</span>
                                    <span className={NEU_STAT_VALUE}>{data.users?.guideApplications.avgReviewTime}d</span>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <BarChart data={data.tours?.statusCounts || []} title="Tours by Status" color="#006666" />
                        <LineChart data={data.tours?.upcomingTours || []} title="Upcoming Tours Timeline" color="#4f46e5" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DataTable<RankingItem>
                            data={data.tours?.bookingsPerTour || []}
                            title="Top Tours by Bookings"
                            columns={[
                                { key: 'label', label: 'Tour Name', sortable: true },
                                { key: 'value', label: 'Bookings', sortable: true, formatter: (v) => formatNumber(v as number) },
                            ]}
                            pageSize={5}
                        />
                        <DataTable<RankingItem>
                            data={data.tours?.ratingLeaderboard || []}
                            title="Top Rated Tours"
                            columns={[
                                { key: 'label', label: 'Tour Name', sortable: true },
                                {
                                    key: 'value', label: 'Rating', sortable: true,
                                    formatter: (v) => (
                                        <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#FE9900]">
                                            ⭐ {(v as number).toFixed(1)}
                                        </span>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LineChart data={data.reviews?.volumeOverTime || []} title="Review Volume Over Time" color="#FE9900" />
                        <LineChart
                            data={data.reviews?.avgRatingTrend || []}
                            title="Average Rating Trend"
                            color="#FF2157"
                            formatValue={(v) => (v as number).toFixed(1)}
                        />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DonutChart data={data.reviews?.verificationStatus || []} title="Verification Status" />
                        <BarChart data={data.reviews?.helpfulnessDistribution || []} title="Helpfulness Distribution" color="#4f46e5" />
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <BarChart data={data.reports?.statusFunnel || []} title="Reports by Status" color="#FF2157" />
                        <DonutChart data={data.reports?.reasonsBreakdown || []} title="Report Reasons" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LineChart
                            data={data.reports?.resolutionTimes || []}
                            title="Average Resolution Time (hours)"
                            color="#0891b2"
                            formatValue={(v) => formatDuration(v as number)}
                        />
                        <div className={NEU_STAT_CARD}>
                            <h4 className={NEU_STAT_HEADING}>Key Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Avg Resolution Time</span>
                                    <span className={NEU_STAT_VALUE}>{formatDuration(data.reports?.avgResolutionTime || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Open Reports</span>
                                    <span className={NEU_STAT_VALUE_DANGER}>{data.reports?.statusFunnel.find(s => s.label === 'Open')?.count || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Resolved This Period</span>
                                    <span className={NEU_STAT_VALUE_SUCCESS}>{data.reports?.statusFunnel.find(s => s.label === 'Resolved')?.count || 0}</span>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LineChart data={data.images?.uploadsOverTime || []} title="Image Uploads Over Time" color="#00A63D" />
                        <DonutChart data={data.images?.moderationStatus || []} title="Moderation Status" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DonutChart data={data.images?.storageProviders || []} title="Storage Providers" />
                        <div className={NEU_STAT_CARD}>
                            <h4 className={NEU_STAT_HEADING}>Storage Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Total Storage</span>
                                    <span className={NEU_STAT_VALUE}>{(data.images?.totalStorage || 0).toFixed(1)} TB</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Approved Images</span>
                                    <span className={NEU_STAT_VALUE_SUCCESS}>
                                        {formatPercentage(data.images?.moderationStatus.find(s => s.label === 'Approved')?.percentage || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Pending Review</span>
                                    <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#FE9900]">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LineChart data={data.notifications?.deliveryTimeline || []} title="Notification Delivery Timeline" color="#0891b2" />
                        <DonutChart data={data.notifications?.byType || []} title="Notifications by Type" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DonutChart data={data.notifications?.byPriority || []} title="Notifications by Priority" />
                        <div className={NEU_STAT_CARD}>
                            <h4 className={NEU_STAT_HEADING}>Engagement Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Total Sent</span>
                                    <span className={NEU_STAT_VALUE}>{formatNumber(data.notifications?.sentVsRead.sent || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Total Read</span>
                                    <span className={NEU_STAT_VALUE_SUCCESS}>{formatNumber(data.notifications?.sentVsRead.read || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Read Rate</span>
                                    <span className={NEU_STAT_VALUE_PRIMARY}>{formatPercentage(data.notifications?.sentVsRead.readRate || 0)}</span>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LineChart data={data.chat?.messagesOverTime || []} title="Messages Over Time" color="#4f46e5" />
                        <div className={NEU_STAT_CARD}>
                            <h4 className={NEU_STAT_HEADING}>Key Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Read Messages</span>
                                    <span className={NEU_STAT_VALUE_SUCCESS}>{formatNumber(data.chat?.readVsUnread.read || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Unread Messages</span>
                                    <span className={NEU_STAT_VALUE_DANGER}>{formatNumber(data.chat?.readVsUnread.unread || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Read Rate</span>
                                    <span className={NEU_STAT_VALUE_PRIMARY}>{formatPercentage(data.chat?.readVsUnread.readRate || 0)}</span>
                                </div>
                                <div className={`flex justify-between items-center ${NEU_STAT_DIVIDER}`}>
                                    <span className={NEU_STAT_LABEL}>Avg Response Time</span>
                                    <span className={NEU_STAT_VALUE}>{formatDuration(data.chat?.avgResponseTime || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DataTable<RankingItem>
                        data={data.chat?.topConversations || []}
                        title="Top Conversation Topics"
                        columns={[
                            { key: 'label', label: 'Topic', sortable: true },
                            { key: 'value', label: 'Messages', sortable: true, formatter: (v) => formatNumber(v as number) },
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <DonutChart data={data.employees?.countsByRole || []} title="Employees by Role" />
                        <DonutChart data={data.employees?.countsByDepartment || []} title="Employees by Department" />
                        <DonutChart data={data.employees?.countsByStatus || []} title="Employees by Status" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DataTable
                            data={data.employees?.countsByRole || []}
                            title="Role Distribution"
                            columns={[
                                { key: 'label', label: 'Role', sortable: true },
                                { key: 'count', label: 'Count', sortable: true, formatter: (v) => formatNumber(v as number) },
                            ]}
                            pageSize={6}
                        />
                        <div className={NEU_STAT_CARD}>
                            <h4 className={NEU_STAT_HEADING}>Shift Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Shifts Scheduled</span>
                                    <span className={NEU_STAT_VALUE}>{formatNumber(data.employees?.shiftsData.scheduled || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Shifts Completed</span>
                                    <span className={NEU_STAT_VALUE_SUCCESS}>{formatNumber(data.employees?.shiftsData.completed || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={NEU_STAT_LABEL}>Completion Rate</span>
                                    <span className={NEU_STAT_VALUE_PRIMARY}>{formatPercentage(data.employees?.shiftsData.completionRate || 0)}</span>
                                </div>
                                <div className={`flex justify-between items-center ${NEU_STAT_DIVIDER}`}>
                                    <span className={NEU_STAT_LABEL}>Active Employees</span>
                                    <span className={NEU_STAT_VALUE_PRIMARY}>
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
        <div className={NEU_PAGE_BG}>
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={onTabChange} className="h-full">
                    {/* ── Tab rail ── */}
                    <div className={NEU_TABS_RAIL}>
                        <div className="py-3 overflow-x-auto">
                            <TabsList className={NEU_TABS_LIST}>
                                {tabSections.map((section) => (
                                    <TabsTrigger
                                        key={section.id}
                                        value={section.id}
                                        className={NEU_TAB_TRIGGER}
                                    >
                                        {iconMap[section.id]}
                                        <span className="hidden sm:inline">{section.label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </div>

                    {/* ── Tab content ── */}
                    <div className="pb-10">
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