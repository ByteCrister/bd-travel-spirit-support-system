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
    FiUsers, FiUserCheck, FiUser, FiMapPin, FiCalendar,
    FiFlag, FiUserX, FiTrendingUp, FiRefreshCw,
    FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { BookingsLineChart } from "@/components/dashboard/overview/Charts/BookingsLineChart";
import { UsersAreaChart } from "@/components/dashboard/overview/Charts/UsersAreaChart";
import { RevenueMiniChart } from "@/components/dashboard/overview/Charts/RevenueMiniChart";
import { Breadcrumbs } from "../../global/Breadcrumbs";
import { useCurrentUserStore } from "@/store/current-user.store";
import { USER_ROLE } from "@/constants/user.const";
import { cn } from "@/lib/utils";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-xs " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BTN_ICON =
    "rounded-xl w-8 h-8 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "transition-all duration-200";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";

// ── Breadcrumbs ───────────────────────────────────────────────────────────────
const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard/overview" },
];

// ── Motion variants ───────────────────────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ── DateRangeFilter ───────────────────────────────────────────────────────────
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
        const newEnd = value.end && newStart > value.end ? newStart : value.end;
        onChange({ start: newStart, end: newEnd });
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="date"
                value={value.start}
                max={value.end || today}
                onChange={handleStartChange}
                className={cn(NEU_INPUT, "px-3 py-1.5")}
            />
            <span className={cn(NEU_MUTED, "text-xs select-none")}>—</span>
            <input
                type="date"
                value={value.end}
                min={value.start || undefined}
                max={today}
                onChange={(e) => onChange({ ...value, end: e.target.value })}
                className={cn(NEU_INPUT, "px-3 py-1.5")}
            />
        </div>
    );
};

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({
    page,
    limit,
    onPageChange,
    onLimitChange,
}: {
    page: number;
    limit: number;
    total?: number;
    onPageChange: (p: number) => void;
    onLimitChange: (l: number) => void;
}) => (
    <div className={cn("flex items-center justify-end gap-4 mt-4 pt-3 border-t", NEU_DIVIDER)}>
        <div className="flex items-center gap-2">
            <span className={cn(NEU_LABEL, "normal-case text-xs")}>Rows</span>
            <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className={cn(NEU_INPUT, "px-2 py-1")}
            >
                {[5, 10, 20, 50].map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>
        <div className="flex items-center gap-1.5">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={NEU_BTN_ICON}
            >
                <FiChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className={cn(
                NEU_SURFACE_INSET_SM,
                "px-3 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#006666] min-w-[2rem] text-center"
            )}>
                {page}
            </span>
            <button
                onClick={() => onPageChange(page + 1)}
                className={NEU_BTN_ICON}
            >
                <FiChevronRight className="h-3.5 w-3.5" />
            </button>
        </div>
    </div>
);

// ── Section card wrapper ──────────────────────────────────────────────────────
const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(NEU_CARD, "p-5", className)}>{children}</div>
);

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, action, pill }: { title: string; action?: React.ReactNode; pill?: string }) => (
    <div className={cn("flex items-center justify-between pb-4 mb-4 border-b", NEU_DIVIDER)}>
        <div className="flex items-center gap-2.5">
            <h2 className={cn(NEU_HEADING, "text-sm")}>{title}</h2>
            {pill && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-[family-name:var(--font-space-mono)] font-bold bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                    {pill}
                </span>
            )}
        </div>
        {action && <div>{action}</div>}
    </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const { baseUser, fetchBaseUser } = useCurrentUserStore();

    const {
        stats, recentActivity, pendingActions, recentBookings,
        roleDistribution, adminNotifications, analytics, loading, errors,
        refreshAll, markNotificationAsRead, markActionAsResolved,
        statsDateRange, analyticsDateRange,
        recentActivityPagination, adminNotificationsPagination, recentBookingsPagination,
        setStatsDateRange, setAnalyticsDateRange,
        setRecentActivityPagination, setAdminNotificationsPagination, setRecentBookingsPagination,
        fetchStats, fetchAnalytics, fetchRecentActivity, fetchAdminNotifications, fetchRecentBookings,
    } = useDashboardStore();

    useEffect(() => { fetchBaseUser(); }, [fetchBaseUser]);
    useEffect(() => {
        if (baseUser) refreshAll(baseUser.role === USER_ROLE.ADMIN, false);
    }, [baseUser, refreshAll]);

    const handleRefresh = () => {
        if (baseUser) refreshAll(baseUser.role === USER_ROLE.ADMIN, true);
    };

    const isAdmin = baseUser?.role === USER_ROLE.ADMIN;

    const handleStatsDateRangeChange = (range: typeof statsDateRange) => { setStatsDateRange(range); fetchStats({ force: true }); };
    const handleAnalyticsDateRangeChange = (range: typeof analyticsDateRange) => { setAnalyticsDateRange(range); fetchAnalytics({ force: true }); };
    const handleRecentActivityPageChange = (p: number) => { setRecentActivityPagination({ page: p }); fetchRecentActivity({ force: true }); };
    const handleRecentActivityLimitChange = (l: number) => { setRecentActivityPagination({ page: 1, limit: l }); fetchRecentActivity({ force: true }); };
    const handleNotificationsPageChange = (p: number) => { setAdminNotificationsPagination({ page: p }); fetchAdminNotifications({ force: true }); };
    const handleNotificationsLimitChange = (l: number) => { setAdminNotificationsPagination({ page: 1, limit: l }); fetchAdminNotifications({ force: true }); };
    const handleRecentBookingsPageChange = (p: number) => { setRecentBookingsPagination({ page: p }); fetchRecentBookings({ force: true }); };
    const handleRecentBookingsLimitChange = (l: number) => { setRecentBookingsPagination({ page: 1, limit: l }); fetchRecentBookings({ force: true }); };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={cn(NEU_PAGE_BG, "space-y-6 p-4 lg:p-6 pb-10")}
        >
            {/* Breadcrumbs */}
            <motion.div variants={itemVariants}>
                <Breadcrumbs items={breadcrumbItems} />
            </motion.div>

            {/* ── Page Header ── */}
            <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
                <div>
                    <h1 className={cn(NEU_HEADING, "text-2xl")}>Dashboard</h1>
                    <p className={cn(NEU_MUTED, "mt-0.5")}>Welcome back — here&apos;s what&apos;s happening today.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRefresh}
                    className={cn(NEU_BTN_GHOST, "inline-flex items-center gap-2 px-4 py-2 text-sm")}
                >
                    <FiRefreshCw className="h-3.5 w-3.5" />
                    Refresh
                </motion.button>
            </motion.div>

            {/* ── Key Metrics ── */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <h2 className={cn(NEU_HEADING, "text-sm")}>Key Metrics</h2>
                        <span className="h-px w-8 bg-[#1E2938]/20" />
                    </div>
                    <DateRangeFilter value={statsDateRange} onChange={handleStatsDateRangeChange} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {loading.stats ? (
                        Array.from({ length: 10 }).map((_, i) => <StatsCardSkeleton key={i} />)
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

            {/* ── Analytics (admin only) ── */}
            {isAdmin && (
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <h2 className={cn(NEU_HEADING, "text-sm")}>Analytics</h2>
                            <span className="h-px w-8 bg-[#1E2938]/20" />
                        </div>
                        <DateRangeFilter value={analyticsDateRange} onChange={handleAnalyticsDateRangeChange} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <SectionCard className="lg:col-span-2 !p-0 overflow-hidden">
                            {loading.analytics ? <div className="p-5"><ChartsSkeleton title="Bookings (Last 14 Days)" /></div> : <BookingsLineChart data={analytics?.bookingsOverTime || []} />}
                        </SectionCard>
                        <SectionCard className="!p-0 overflow-hidden">
                            {loading.analytics ? <div className="p-5"><ChartsSkeleton title="Revenue (14 Days)" /></div> : <RevenueMiniChart data={analytics?.revenueOverTime || []} />}
                        </SectionCard>
                        <SectionCard className="lg:col-span-3 !p-0 overflow-hidden">
                            {loading.analytics ? (
                                <div className="p-5"><ChartsSkeleton title="Travelers vs Guides (14 Days)" /></div>
                            ) : (
                                <UsersAreaChart travelers={analytics?.travelersOverTime || []} guides={analytics?.guidesOverTime || []} />
                            )}
                        </SectionCard>
                    </div>
                </motion.div>
            )}

            {/* ── Recent Activity ── */}
            <motion.div variants={itemVariants}>
                <SectionCard>
                    <SectionHeader title="Recent Activity" />
                    {loading.recentActivity ? (
                        <ListCardSkeleton title="Recent Activity" rows={6} />
                    ) : (
                        <>
                            <RecentActivity activities={recentActivity} loading={loading.recentActivity} />
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

            {/* ── Pending Actions + Notifications ── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SectionCard>
                    <SectionHeader title="Pending Actions" />
                    {loading.pendingActions ? (
                        <ListCardSkeleton title="Pending Actions" rows={5} />
                    ) : (
                        <PendingActions actions={pendingActions} loading={loading.pendingActions} onResolve={markActionAsResolved} />
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

            {/* ── Recent Bookings + Role Distribution ── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <SectionCard className="lg:col-span-2">
                    <SectionHeader title="Recent Bookings" />
                    {loading.recentBookings ? (
                        <ListCardSkeleton title="Recent Bookings" rows={6} />
                    ) : (
                        <>
                            <RecentBookings bookings={recentBookings} loading={loading.recentBookings} />
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
                                <RolePieChart data={roleDistribution} loading={loading.roleDistribution} />
                            )}
                        </SectionCard>
                    )}
                </div>
            </motion.div>

            {/* ── Error Display ── */}
            {Object.values(errors).some(Boolean) && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(NEU_CARD, "p-5")}
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] flex items-center justify-center">
                            <FiFlag className="h-4 w-4 text-[#FF2157]" />
                        </div>
                        <div>
                            <h3 className={cn(NEU_HEADING, "text-sm text-[#FF2157] mb-2")}>Some data failed to load</h3>
                            <ul className="space-y-1">
                                {Object.entries(errors).map(([key, error]) =>
                                    error ? (
                                        <li key={key} className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157]/80">
                                            <span className="font-bold">{key}:</span> {error}
                                        </li>
                                    ) : null
                                )}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}