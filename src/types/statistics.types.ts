// src/types/statistics.types.ts

export type DateRange = {
    from: Date | null;
    to: Date | null;
};

/* Preset enum and exported type alias for backwards compatibility */
export enum PresetEnum {
    LAST_7 = 'LAST_7',
    LAST_30 = 'LAST_30',
    YTD = 'YTD',
    CUSTOM = 'CUSTOM',
}
export type Preset = PresetEnum;

/* Section enum (string values match data keys) */
export enum SectionKeyEnum {
    KPIS = 'kpis',
    USERS = 'users',
    TOURS = 'tours',
    REVIEWS = 'reviews',
    REPORTS = 'reports',
    IMAGES = 'images',
    NOTIFICATIONS = 'notifications',
    CHAT = 'chat',
    EMPLOYEES = 'employees',
}
export type SectionKey = SectionKeyEnum;

/* Basic reusable shapes */
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

/* KPI metrics that the UI expects */
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

/* Section-specific response shapes */
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

/* Store shapes */
export interface StatisticsFilters {
    dateRange: DateRange;
    preset: Preset;
}

export interface StatisticsState {
    filters: StatisticsFilters;
    loading: Record<SectionKey, boolean>;
    error: Record<SectionKey, string | null>;
    data: {
        [SectionKeyEnum.KPIS]: KpiMetrics | null;
        [SectionKeyEnum.USERS]: UsersStats | null;
        [SectionKeyEnum.TOURS]: ToursStats | null;
        [SectionKeyEnum.REVIEWS]: ReviewsStats | null;
        [SectionKeyEnum.REPORTS]: ReportsStats | null;
        [SectionKeyEnum.IMAGES]: ImagesStats | null;
        [SectionKeyEnum.NOTIFICATIONS]: NotificationsStats | null;
        [SectionKeyEnum.CHAT]: ChatStats | null;
        [SectionKeyEnum.EMPLOYEES]: EmployeesStats | null;
    };
}

/* Union of section response shapes (convenience) */
export type SectionResponse =
    | KpiMetrics
    | UsersStats
    | ToursStats
    | ReviewsStats
    | ReportsStats
    | ImagesStats
    | NotificationsStats
    | ChatStats
    | EmployeesStats;
