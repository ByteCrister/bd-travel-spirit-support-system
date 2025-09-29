"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/store/useDashboardStore";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PendingActions } from "@/components/dashboard/PendingActions";
import { RecentBookings } from "@/components/dashboard/RecentBookings";
import { RolePieChart } from "@/components/dashboard/RolePieChart";
import { AdminNotifications } from "@/components/dashboard/AdminNotifications";
import { AnnouncementBoard } from "@/components/dashboard/AnnouncementBoard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatsCardSkeleton } from "@/components/dashboard/skeletons/StatsCardSkeleton";
import { ListCardSkeleton } from "@/components/dashboard/skeletons/ListCardSkeleton";
import { ChartsSkeleton } from "@/components/dashboard/skeletons/ChartsSkeleton";
import {
    FiUsers,
    FiUserCheck,
    FiUser,
    FiMapPin,
    FiCalendar,
    FiFlag,
    FiUserX,
    FiDollarSign,
    FiTrendingUp,
    FiRefreshCw
} from "react-icons/fi";
import { BookingsLineChart } from "@/components/dashboard/Charts/BookingsLineChart";
import { UsersAreaChart } from "@/components/dashboard/Charts/UsersAreaChart";
import { RevenueMiniChart } from "@/components/dashboard/Charts/RevenueMiniChart";
import { Breadcrumbs } from "../global/Breadcrumbs";

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Dashboard", href: "/dashboard" },
];

export default function Dashboard() {
    const {
        currentUser,
        stats,
        recentActivity,
        pendingActions,
        recentBookings,
        roleDistribution,
        announcements,
        adminNotifications,
        analytics,
        loading,
        errors,
        refreshAll,
        markNotificationAsRead,
        markActionAsResolved,
    } = useDashboardStore();

    // Initialize user and fetch data on mount
    useEffect(() => {
        // Set mock user for development
        useDashboardStore.getState().setCurrentUser({
            id: '1',
            name: 'Admin User',
            email: 'admin@travelspirit.com',
            role: 'admin', // Change to 'support' to test support role
        });

        // Fetch all data
        refreshAll();
    }, [refreshAll]);

    const handleRefresh = () => {
        refreshAll();
    };

    const handleNotificationRead = (notificationId: string) => {
        markNotificationAsRead(notificationId);
    };

    const handleActionResolve = (actionId: string) => {
        markActionAsResolved(actionId);
    };

    const handleQuickAction = (action: string) => {
        console.log('Quick action:', action);
        // Implement navigation or modal opening based on action
    };

    const isAdmin = currentUser?.role === 'admin';

    return (
        <div className="space-y-6">
            <Breadcrumbs items={breadcrumbItems} />
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Welcome back, {currentUser?.name || 'User'}
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <FiRefreshCw className="h-4 w-4" />
                    Refresh
                </motion.button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {loading.stats ? (
                    <>
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatsCard
                            title="Total Users"
                            value={stats?.totalUsers || 0}
                            icon={<FiUsers className="h-6 w-6" />}
                            color="blue"
                            loading={loading.stats}
                            description="Registered users"
                        />
                        <StatsCard
                            title="Organizers"
                            value={stats?.totalOrganizers || 0}
                            icon={<FiUserCheck className="h-6 w-6" />}
                            color="green"
                            loading={loading.stats}
                            description="Tour organizers"
                        />
                        <StatsCard
                            title="Support Agents"
                            value={stats?.totalSupportAgents || 0}
                            icon={<FiUser className="h-6 w-6" />}
                            color="purple"
                            loading={loading.stats}
                            description="Support team"
                        />
                        <StatsCard
                            title="Active Tours"
                            value={stats?.activeTours || 0}
                            icon={<FiMapPin className="h-6 w-6" />}
                            color="orange"
                            loading={loading.stats}
                            description="Currently active"
                        />
                        <StatsCard
                            title="Upcoming Tours"
                            value={stats?.upcomingTours || 0}
                            icon={<FiCalendar className="h-6 w-6" />}
                            color="indigo"
                            loading={loading.stats}
                            description="Scheduled tours"
                        />
                        <StatsCard
                            title="Total Bookings"
                            value={stats?.totalBookings || 0}
                            icon={<FiCalendar className="h-6 w-6" />}
                            color="green"
                            loading={loading.stats}
                            description="All time bookings"
                        />
                        <StatsCard
                            title="Pending Reports"
                            value={stats?.pendingReports || 0}
                            icon={<FiFlag className="h-6 w-6" />}
                            color="red"
                            loading={loading.stats}
                            description="Awaiting review"
                        />
                        <StatsCard
                            title="Suspended Users"
                            value={stats?.suspendedUsers || 0}
                            icon={<FiUserX className="h-6 w-6" />}
                            color="red"
                            loading={loading.stats}
                            description="Account suspensions"
                        />
                        {isAdmin && !loading.stats && (
                            <>
                                <StatsCard
                                    title="Total Revenue"
                                    value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
                                    icon={<FiDollarSign className="h-6 w-6" />}
                                    color="green"
                                    loading={loading.stats}
                                    description="All time revenue"
                                />
                                <StatsCard
                                    title="Top Destination"
                                    value={stats?.topDestinationTrends?.[0] || 'N/A'}
                                    icon={<FiTrendingUp className="h-6 w-6" />}
                                    color="blue"
                                    loading={loading.stats}
                                    description="Most popular"
                                />
                            </>
                        )}
                    </>
                )}
            </motion.div>

            {/* Analytics Section */}
            {isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    <div className="lg:col-span-2">
                        {loading.analytics ? (
                            <ChartsSkeleton title="Bookings (Last 14 Days)" />
                        ) : (
                            <BookingsLineChart data={analytics?.bookingsOverTime || []} />
                        )}
                    </div>
                    <div>
                        {loading.analytics ? (
                            <ChartsSkeleton title="Revenue (14 Days)" />
                        ) : (
                            <RevenueMiniChart data={analytics?.revenueOverTime || []} />
                        )}
                    </div>
                    <div className="lg:col-span-3">
                        {loading.analytics ? (
                            <ChartsSkeleton title="Travelers vs Guides (14 Days)" />
                        ) : (
                            <UsersAreaChart
                                travelers={analytics?.travelersOverTime || []}
                                guides={analytics?.guidesOverTime || []}
                            />
                        )}
                    </div>
                </motion.div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Activity */}
                    {loading.recentActivity ? (
                        <ListCardSkeleton title="Recent Activity" rows={6} />
                    ) : (
                        <RecentActivity
                            activities={recentActivity}
                            loading={loading.recentActivity}
                        />
                    )}

                    {/* Recent Bookings */}
                    {loading.recentBookings ? (
                        <ListCardSkeleton title="Recent Bookings" rows={6} />
                    ) : (
                        <RecentBookings
                            bookings={recentBookings}
                            loading={loading.recentBookings}
                        />
                    )}

                    {/* Admin-only: Role Distribution */}
                    {isAdmin && (
                        loading.roleDistribution ? (
                            <ChartsSkeleton title="Role Distribution" />
                        ) : (
                            <RolePieChart
                                data={roleDistribution}
                                loading={loading.roleDistribution}
                            />
                        )
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Pending Actions */}
                    {loading.pendingActions ? (
                        <ListCardSkeleton title="Pending Actions" rows={5} />
                    ) : (
                        <PendingActions
                            actions={pendingActions}
                            loading={loading.pendingActions}
                            onResolve={handleActionResolve}
                        />
                    )}

                    {/* Admin Notifications */}
                    {loading.adminNotifications ? (
                        <ListCardSkeleton title="Notifications" rows={5} />
                    ) : (
                        <AdminNotifications
                            notifications={adminNotifications}
                            loading={loading.adminNotifications}
                            onMarkAsRead={handleNotificationRead}
                        />
                    )}

                    {/* Announcements */}
                    {loading.announcements ? (
                        <ListCardSkeleton title="Announcements" rows={4} />
                    ) : (
                        <AnnouncementBoard
                            announcements={announcements}
                            loading={loading.announcements}
                        />
                    )}

                    {/* Quick Actions */}
                    <QuickActions
                        userRole={currentUser?.role || 'support'}
                        onAction={handleQuickAction}
                    />
                </div>
            </div>

            {/* Error Display */}
            {Object.values(errors).some(error => error) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                >
                    <h3 className="text-red-800 dark:text-red-400 font-medium mb-2">
                        Some data failed to load:
                    </h3>
                    <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                        {Object.entries(errors).map(([key, error]) =>
                            error && (
                                <li key={key}>
                                    {key}: {error}
                                </li>
                            )
                        )}
                    </ul>
                </motion.div>
            )}
        </div>
    );
}
