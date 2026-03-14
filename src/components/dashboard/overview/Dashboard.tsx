"use client";

import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useDashboardStore } from "@/store/dashboard/dashboard.store";
import { StatsCard } from "@/components/dashboard/overview/StatsCard";
import { RecentActivity } from "@/components/dashboard/overview/RecentActivity";
import { PendingActions } from "@/components/dashboard/overview/PendingActions";
import { RecentBookings } from "@/components/dashboard/overview/RecentBookings";
import { RolePieChart } from "@/components/dashboard/overview/RolePieChart";
import { AdminNotifications } from "@/components/dashboard/overview/AdminNotifications";
import { StatsCardSkeleton } from "@/components/dashboard/overview/skeletons/StatsCardSkeleton";
import { ListCardSkeleton } from "@/components/dashboard/overview/skeletons/ListCardSkeleton";
import { ChartsSkeleton } from "@/components/dashboard/overview/skeletons/ChartsSkeleton";
import {
    FiUsers,
    FiUserCheck,
    FiUser,
    FiMapPin,
    FiCalendar,
    FiFlag,
    FiUserX,
    FiTrendingUp,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { BookingsLineChart } from "@/components/dashboard/overview/Charts/BookingsLineChart";
import { UsersAreaChart } from "@/components/dashboard/overview/Charts/UsersAreaChart";
import { RevenueMiniChart } from "@/components/dashboard/overview/Charts/RevenueMiniChart";
import { Breadcrumbs } from "../../global/Breadcrumbs";
import { useCurrentUserStore } from "@/store/current-user.store";
import { USER_ROLE } from "@/constants/user.const";

const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard/overview" },
];

const DateRangeFilter = ({
    value,
    onChange,
}: {
    value: { start: string; end: string };
    onChange: (range: { start: string; end: string }) => void;
}) => {
    const today = new Date().toISOString().split("T")[0];

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = e.target.value;
        // If new start is after current end, reset end to new start
        const newEnd = value.end && newStart > value.end ? newStart : value.end;
        onChange({ start: newStart, end: newEnd });
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, end: e.target.value });
    };

    return (
        <div className="flex items-center gap-2 text-xs">
            <input
                type="date"
                value={value.start}
                max={value.end || today}   // can't pick start after end or future
                onChange={handleStartChange}
                className="
                    px-2.5 py-1.5 rounded-lg border text-xs font-medium
                    bg-white dark:bg-slate-900
                    border-slate-200 dark:border-slate-700
                    text-slate-700 dark:text-slate-300
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                    transition-all
                "
            />
            <span className="text-slate-400 font-medium select-none">—</span>
            <input
                type="date"
                value={value.end}
                min={value.start || undefined}  // can't pick end before start
                max={today}                     // can't pick future date
                onChange={handleEndChange}
                className="
                    px-2.5 py-1.5 rounded-lg border text-xs font-medium
                    bg-white dark:bg-slate-900
                    border-slate-200 dark:border-slate-700
                    text-slate-700 dark:text-slate-300
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                    transition-all
                "
            />
        </div>
    );
};

const Pagination = ({
    page,
    limit,
    onPageChange,
    onLimitChange,
}: {
    page: number;
    limit: number;
    total?: number;
    onPageChange: (newPage: number) => void;
    onLimitChange: (newLimit: number) => void;
}) => (
    <div className="flex items-center justify-end gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="
          px-2 py-1 rounded-md border text-xs font-medium
          bg-white dark:bg-slate-900
          border-slate-200 dark:border-slate-700
          text-slate-700 dark:text-slate-300
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30
        "
            >
                {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                ))}
            </select>
        </div>
        <div className="flex items-center gap-1">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="
          p-1.5 rounded-md
          hover:bg-slate-100 dark:hover:bg-slate-800
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors
        "
            >
                <FiChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold min-w-[2rem] text-center">
                {page}
            </span>
            <button
                onClick={() => onPageChange(page + 1)}
                className="
          p-1.5 rounded-md
          hover:bg-slate-100 dark:hover:bg-slate-800
          transition-colors
        "
            >
                <FiChevronRight className="h-3.5 w-3.5" />
            </button>
        </div>
    </div>
);

/** Reusable section wrapper with consistent card styling */
const SectionCard = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={`
      bg-white dark:bg-slate-900
      border border-slate-200 dark:border-slate-800
      rounded-2xl shadow-sm
      p-5
      ${className}
    `}
    >
        {children}
    </div>
);

/** Section header: title on the left, optional action on the right */
const SectionHeader = ({
    title,
    action,
    pill,
}: {
    title: string;
    action?: React.ReactNode;
    pill?: string;
}) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                {title}
            </h2>
            {pill && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                    {pill}
                </span>
            )}
        </div>
        {action && <div>{action}</div>}
    </div>
);

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Dashboard() {
    const { baseUser, fetchBaseUser } = useCurrentUserStore();

    const {
        stats,
        recentActivity,
        pendingActions,
        recentBookings,
        roleDistribution,
        adminNotifications,
        analytics,
        loading,
        errors,
        refreshAll,
        markNotificationAsRead,
        markActionAsResolved,
        statsDateRange,
        analyticsDateRange,
        recentActivityPagination,
        adminNotificationsPagination,
        recentBookingsPagination,
        setStatsDateRange,
        setAnalyticsDateRange,
        setRecentActivityPagination,
        setAdminNotificationsPagination,
        setRecentBookingsPagination,
        fetchStats,
        fetchAnalytics,
        fetchRecentActivity,
        fetchAdminNotifications,
        fetchRecentBookings,
    } = useDashboardStore();

    useEffect(() => {
        fetchBaseUser();
    }, [fetchBaseUser]);

    useEffect(() => {
        if (baseUser) {
            refreshAll(baseUser.role === USER_ROLE.ADMIN);
        }
    }, [baseUser, refreshAll]);

    const handleRefresh = () => {
        if (baseUser) refreshAll(baseUser.role === USER_ROLE.ADMIN);
    };

    const isAdmin = baseUser?.role === USER_ROLE.ADMIN;

    const handleStatsDateRangeChange = (range: typeof statsDateRange) => {
        setStatsDateRange(range);
        fetchStats({ force: true });
    };

    const handleAnalyticsDateRangeChange = (range: typeof analyticsDateRange) => {
        setAnalyticsDateRange(range);
        fetchAnalytics({ force: true });
    };

    const handleRecentActivityPageChange = (newPage: number) => {
        setRecentActivityPagination({ page: newPage });
        fetchRecentActivity({ force: true });
    };

    const handleRecentActivityLimitChange = (newLimit: number) => {
        setRecentActivityPagination({ page: 1, limit: newLimit });
        fetchRecentActivity({ force: true });
    };

    const handleNotificationsPageChange = (newPage: number) => {
        setAdminNotificationsPagination({ page: newPage });
        fetchAdminNotifications({ force: true });
    };

    const handleNotificationsLimitChange = (newLimit: number) => {
        setAdminNotificationsPagination({ page: 1, limit: newLimit });
        fetchAdminNotifications({ force: true });
    };

    const handleRecentBookingsPageChange = (newPage: number) => {
        setRecentBookingsPagination({ page: newPage });
        fetchRecentBookings({ force: true });
    };

    const handleRecentBookingsLimitChange = (newLimit: number) => {
        setRecentBookingsPagination({ page: 1, limit: newLimit });
        fetchRecentBookings({ force: true });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-7 pb-10"
        >
            {/* Breadcrumbs */}
            <motion.div variants={itemVariants}>
                <Breadcrumbs items={breadcrumbItems} />
            </motion.div>

            {/* ── Page Header ───────────────────────────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Welcome back — here&apos;s what&apos;s happening today.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRefresh}
                    className="
            inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-700
            text-slate-700 dark:text-slate-300
            hover:bg-slate-50 dark:hover:bg-slate-800
            shadow-sm transition-all duration-150
          "
                >
                    <FiRefreshCw className="h-3.5 w-3.5" />
                    Refresh
                </motion.button>
            </motion.div>

            {/* ── Key Metrics ───────────────────────────────────────────── */}
            <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                            Key Metrics
                        </h2>
                        <span className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <DateRangeFilter
                        value={statsDateRange}
                        onChange={handleStatsDateRangeChange}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {loading.stats ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <StatsCardSkeleton key={i} />
                        ))
                    ) : (
                        <>
                            <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon={<FiUsers />} color="blue" loading={loading.stats} description="Registered users" />
                            <StatsCard title="Organizers" value={stats?.totalOrganizers || 0} icon={<FiUserCheck />} color="green" loading={loading.stats} description="Tour organizers" />
                            <StatsCard title="Support Agents" value={stats?.totalSupportAgents || 0} icon={<FiUser />} color="purple" loading={loading.stats} description="Support team" />
                            <StatsCard title="Active Tours" value={stats?.activeTours || 0} icon={<FiMapPin />} color="orange" loading={loading.stats} description="Currently active" />
                            <StatsCard title="Upcoming Tours" value={stats?.upcomingTours || 0} icon={<FiCalendar />} color="indigo" loading={loading.stats} description="Scheduled tours" />
                            <StatsCard title="Total Bookings" value={stats?.totalBookings || 0} icon={<FiCalendar />} color="green" loading={loading.stats} description="All time bookings" />
                            <StatsCard title="Pending Reports" value={stats?.pendingReports || 0} icon={<FiFlag />} color="red" loading={loading.stats} description="Awaiting review" />
                            <StatsCard title="Suspended Users" value={stats?.suspendedUsers || 0} icon={<FiUserX />} color="red" loading={loading.stats} description="Account suspensions" />
                            {isAdmin && !loading.stats && (
                                <>
                                    <StatsCard title="Total Revenue" value={`৳${(stats?.totalRevenue || 0).toLocaleString()}`} icon={<FaBangladeshiTakaSign />} color="green" loading={loading.stats} description="All time revenue" />
                                    <StatsCard title="Top Destination" value={stats?.topDestinationTrends?.[0] || "N/A"} icon={<FiTrendingUp />} color="blue" loading={loading.stats} description="Most popular" />
                                </>
                            )}
                        </>
                    )}
                </div>
            </motion.div>

            {/* ── Analytics (admin only) ────────────────────────────────── */}
            {isAdmin && (
                <motion.div variants={itemVariants} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                                Analytics
                            </h2>
                            <span className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                        </div>
                        <DateRangeFilter
                            value={analyticsDateRange}
                            onChange={handleAnalyticsDateRangeChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <SectionCard className="lg:col-span-2 !p-0 overflow-hidden">
                            {loading.analytics ? (
                                <div className="p-5">
                                    <ChartsSkeleton title="Bookings (Last 14 Days)" />
                                </div>
                            ) : (
                                <BookingsLineChart data={analytics?.bookingsOverTime || []} />
                            )}
                        </SectionCard>

                        <SectionCard className="!p-0 overflow-hidden">
                            {loading.analytics ? (
                                <div className="p-5">
                                    <ChartsSkeleton title="Revenue (14 Days)" />
                                </div>
                            ) : (
                                <RevenueMiniChart data={analytics?.revenueOverTime || []} />
                            )}
                        </SectionCard>

                        <SectionCard className="lg:col-span-3 !p-0 overflow-hidden">
                            {loading.analytics ? (
                                <div className="p-5">
                                    <ChartsSkeleton title="Travelers vs Guides (14 Days)" />
                                </div>
                            ) : (
                                <UsersAreaChart
                                    travelers={analytics?.travelersOverTime || []}
                                    guides={analytics?.guidesOverTime || []}
                                />
                            )}
                        </SectionCard>
                    </div>
                </motion.div>
            )}

            {/* ── Recent Activity ───────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
                <SectionCard>
                    <SectionHeader title="Recent Activity" />
                    {loading.recentActivity ? (
                        <ListCardSkeleton title="Recent Activity" rows={6} />
                    ) : (
                        <>
                            <RecentActivity
                                activities={recentActivity}
                                loading={loading.recentActivity}
                            />
                            <Pagination
                                page={recentActivityPagination.page}
                                limit={recentActivityPagination.limit}
                                onPageChange={handleRecentActivityPageChange}
                                onLimitChange={handleRecentActivityLimitChange}
                            />
                        </>
                    )}
                </SectionCard>
            </motion.div>

            {/* ── Pending Actions + Notifications ──────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <SectionCard>
                    <SectionHeader title="Pending Actions" />
                    {loading.pendingActions ? (
                        <ListCardSkeleton title="Pending Actions" rows={5} />
                    ) : (
                        <PendingActions
                            actions={pendingActions}
                            loading={loading.pendingActions}
                            onResolve={markActionAsResolved}
                        />
                    )}
                </SectionCard>

                <SectionCard>
                    <SectionHeader title="Notifications" />
                    {loading.adminNotifications ? (
                        <ListCardSkeleton title="Notifications" rows={5} />
                    ) : (
                        <>
                            <AdminNotifications
                                notifications={adminNotifications}
                                loading={loading.adminNotifications}
                                onMarkAsRead={markNotificationAsRead}
                            />
                            <Pagination
                                page={adminNotificationsPagination.page}
                                limit={adminNotificationsPagination.limit}
                                onPageChange={handleNotificationsPageChange}
                                onLimitChange={handleNotificationsLimitChange}
                            />
                        </>
                    )}
                </SectionCard>
            </motion.div>

            {/* ── Recent Bookings + Role Distribution ──────────────────── */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
                <SectionCard className="lg:col-span-2">
                    <SectionHeader title="Recent Bookings" />
                    {loading.recentBookings ? (
                        <ListCardSkeleton title="Recent Bookings" rows={6} />
                    ) : (
                        <>
                            <RecentBookings
                                bookings={recentBookings}
                                loading={loading.recentBookings}
                            />
                            <Pagination
                                page={recentBookingsPagination.page}
                                limit={recentBookingsPagination.limit}
                                onPageChange={handleRecentBookingsPageChange}
                                onLimitChange={handleRecentBookingsLimitChange}
                            />
                        </>
                    )}
                </SectionCard>

                <div className="space-y-4">
                    {isAdmin && (
                        <SectionCard>
                            <SectionHeader title="Role Distribution" />
                            {loading.roleDistribution ? (
                                <ChartsSkeleton title="Role Distribution" />
                            ) : (
                                <RolePieChart
                                    data={roleDistribution}
                                    loading={loading.roleDistribution}
                                />
                            )}
                        </SectionCard>
                    )}
                </div>
            </motion.div>

            {/* ── Error Display ─────────────────────────────────────────── */}
            {Object.values(errors).some((error) => error) && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="
            bg-red-50 dark:bg-red-950/20
            border border-red-200 dark:border-red-800
            rounded-2xl p-5
          "
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <FiFlag className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1.5">
                                Some data failed to load
                            </h3>
                            <ul className="space-y-1">
                                {Object.entries(errors).map(
                                    ([key, error]) =>
                                        error && (
                                            <li
                                                key={key}
                                                className="text-xs text-red-700 dark:text-red-400 font-mono"
                                            >
                                                <span className="font-semibold">{key}:</span> {error}
                                            </li>
                                        )
                                )}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}