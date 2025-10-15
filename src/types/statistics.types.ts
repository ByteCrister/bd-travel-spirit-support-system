export type DateRange = {
    from: Date | null;
    to: Date | null;
};

export type Preset = "LAST_7" | "LAST_30" | "YTD" | "CUSTOM";

export interface TimeSeriesPoint {
    date: string;
    value: number;
    label?: string;
}

export interface CategoryCount {
    label: string;
    count: number;
    percentage?: number;
}

export interface RankingItem {
    id: string;
    label: string;
    value: number;
    change?: number;
}

export interface KpiMetrics {
    totalUsers: number;
    totalTours: number;
    totalBookings: number;
    avgRating: number;
    totalImages: number;
    openReports: number;
    totalRevenue: number;
    activeEmployees: number;
}

export interface UsersStats {
    signupsOverTime: TimeSeriesPoint[];
    statusDistribution: CategoryCount[];
    guideApplications: {
        pending: number;
        approved: number;
        rejected: number;
        avgReviewTime: number;
    };
}

export interface ToursStats {
    statusCounts: CategoryCount[];
    bookingsPerTour: RankingItem[];
    ratingLeaderboard: RankingItem[];
    upcomingTours: TimeSeriesPoint[];
}

export interface ReviewsStats {
    volumeOverTime: TimeSeriesPoint[];
    avgRatingTrend: TimeSeriesPoint[];
    verificationStatus: CategoryCount[];
    helpfulnessDistribution: CategoryCount[];
}

export interface ReportsStats {
    statusFunnel: CategoryCount[];
    reasonsBreakdown: CategoryCount[];
    resolutionTimes: TimeSeriesPoint[];
    avgResolutionTime: number;
}

export interface ImagesStats {
    uploadsOverTime: TimeSeriesPoint[];
    moderationStatus: CategoryCount[];
    storageProviders: CategoryCount[];
    totalStorage: number;
}

export interface NotificationsStats {
    sentVsRead: {
        sent: number;
        read: number;
        readRate: number;
    };
    byType: CategoryCount[];
    byPriority: CategoryCount[];
    deliveryTimeline: TimeSeriesPoint[];
}

export interface ChatStats {
    messagesOverTime: TimeSeriesPoint[];
    readVsUnread: {
        read: number;
        unread: number;
        readRate: number;
    };
    topConversations: RankingItem[];
    avgResponseTime: number;
}

export interface EmployeesStats {
    countsByRole: CategoryCount[];
    countsByDepartment: CategoryCount[];
    countsByStatus: CategoryCount[];
    shiftsData: {
        scheduled: number;
        completed: number;
        completionRate: number;
    };
}

export interface StatisticsFilters {
    dateRange: DateRange;
    preset: Preset;
}

export interface StatisticsState {
    filters: StatisticsFilters;
    loading: {
        kpis: boolean;
        users: boolean;
        tours: boolean;
        reviews: boolean;
        reports: boolean;
        images: boolean;
        notifications: boolean;
        chat: boolean;
        employees: boolean;
    };
    error: {
        kpis: string | null;
        users: string | null;
        tours: string | null;
        reviews: string | null;
        reports: string | null;
        images: string | null;
        notifications: string | null;
        chat: string | null;
        employees: string | null;
    };
    data: {
        kpis: KpiMetrics | null;
        users: UsersStats | null;
        tours: ToursStats | null;
        reviews: ReviewsStats | null;
        reports: ReportsStats | null;
        images: ImagesStats | null;
        notifications: NotificationsStats | null;
        chat: ChatStats | null;
        employees: EmployeesStats | null;
    };
}

export type SectionKey = keyof StatisticsState['data'];