import axios from 'axios';
import type {
    DateRange,
    KpiMetrics,
    UsersStats,
    ToursStats,
    ReviewsStats,
    ReportsStats,
    ImagesStats,
    NotificationsStats,
    ChatStats,
    EmployeesStats,
} from '../../types/statistics.types';

// Demo axios instance
export const api = axios.create({
    baseURL: '/api/statistics',
    timeout: 10000,
});

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate occasional errors for testing
const shouldSimulateError = () => Math.random() < 0.1; // 10% error rate

// Generate date range for mock data
const generateDateRange = (dateRange: DateRange, days: number = 30) => {
    const end = dateRange.to || new Date();
    const start = dateRange.from || new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
};

export async function fetchKpis(dateRange: DateRange): Promise<KpiMetrics> {
    await delay(800);

    if (shouldSimulateError()) {
        throw new Error('Failed to fetch KPI metrics');
    }

    return {
        totalUsers: 12847,
        totalTours: 1256,
        totalBookings: 8934,
        avgRating: 4.6,
        totalImages: 45632,
        openReports: 23,
        totalRevenue: 892450,
        activeEmployees: 127,
    };
}

export async function fetchUsersStats(dateRange: DateRange): Promise<UsersStats> {
    await delay(1200);

    if (shouldSimulateError()) {
        throw new Error('Failed to fetch user statistics');
    }

    const dates = generateDateRange(dateRange);

    return {
        signupsOverTime: dates.map(date => ({
            date,
            value: Math.floor(Math.random() * 50) + 20,
        })),
        statusDistribution: [
            { label: 'Active', count: 8934, percentage: 69.5 },
            { label: 'Inactive', count: 2845, percentage: 22.1 },
            { label: 'Suspended', count: 734, percentage: 5.7 },
            { label: 'Banned', count: 334, percentage: 2.6 },
        ],
        organizerApplications: {
            pending: 45,
            approved: 234,
            rejected: 67,
            avgReviewTime: 3.2,
        },
    };
}

export async function fetchToursStats(dateRange: DateRange): Promise<ToursStats> {
    await delay(1000);

    if (shouldSimulateError()) {
        throw new Error('Failed to fetch tour statistics');
    }

    const dates = generateDateRange(dateRange);

    return {
        statusCounts: [
            { label: 'Published', count: 834 },
            { label: 'Draft', count: 234 },
            { label: 'Archived', count: 188 },
        ],
        bookingsPerTour: [
            { id: '1', label: 'Paris Food Tour', value: 234 },
            { id: '2', label: 'London Historic Walk', value: 189 },
            { id: '3', label: 'Tokyo Night Life', value: 156 },
            { id: '4', label: 'NYC Art Gallery Tour', value: 143 },
            { id: '5', label: 'Barcelona Architecture', value: 128 },
        ],
        ratingLeaderboard: [
            { id: '1', label: 'Sunset Photography Tour', value: 4.9 },
            { id: '2', label: 'Wine Tasting Experience', value: 4.8 },
            { id: '3', label: 'Mountain Hiking Adventure', value: 4.7 },
            { id: '4', label: 'Cultural Heritage Walk', value: 4.7 },
            { id: '5', label: 'Street Food Discovery', value: 4.6 },
        ],
        upcomingTours: dates.slice(0, 14).map(date => ({
            date,
            value: Math.floor(Math.random() * 15) + 5,
        })),
    };
}

export async function fetchReviewsStats(dateRange: DateRange): Promise<ReviewsStats> {
    await delay(900);

    if (shouldSimulateError()) {
        throw new Error('Failed to fetch review statistics');
    }

    const dates = generateDateRange(dateRange);

    return {
        volumeOverTime: dates.map(date => ({
            date,
            value: Math.floor(Math.random() * 80) + 40,
        })),
        avgRatingTrend: dates.map(date => ({
            date,
            value: 4.2 + Math.random() * 0.8,
        })),
        verificationStatus: [
            { label: 'Verified', count: 6789, percentage: 76.2 },
            { label: 'Unverified', count: 2123, percentage: 23.8 },
        ],
        helpfulnessDistribution: [
            { label: '0-2 helpful votes', count: 2341 },
            { label: '3-10 helpful votes', count: 4567 },
            { label: '11-25 helpful votes', count: 1823 },
            { label: '25+ helpful votes', count: 1181 },
        ],
    };
}

export async function fetchReportsStats(dateRange: DateRange): Promise<ReportsStats> {
    await delay(700);

    if (shouldSimulateError()) {
        throw new Error('Failed to fetch report statistics');
    }

    const dates = generateDateRange(dateRange, 14);

    return {
        statusFunnel: [
            { label: 'Open', count: 23 },
            { label: 'In Review', count: 15 },
            { label: 'Resolved', count: 156 },
            { label: 'Rejected', count: 12 },
        ],
        reasonsBreakdown: [
            { label: 'Inappropriate Content', count: 89 },
            { label: 'Spam', count: 45 },
            { label: 'Safety Concerns', count: 34 },
            { label: 'Pricing Issues', count: 23 },
            { label: 'Other', count: 15 },
        ],
        resolutionTimes: dates.map(date => ({
            date,
            value: Math.floor(Math.random() * 24) + 12,
        })),
        avgResolutionTime: 18.5,
    };
}

export async function fetchImagesStats(dateRange: DateRange): Promise<ImagesStats> {
    await delay(850);

    if (shouldSimulateError()) {
        throw new Error('Failed to fetch image statistics');
    }

    const dates = generateDateRange(dateRange);

    return {
        uploadsOverTime: dates.map(date => ({
            date,
            value: Math.floor(Math.random() * 200) + 100,
        })),
        moderationStatus: [
            { label: 'Approved', count: 43567, percentage: 95.5 },
            { label: 'Pending', count: 1234, percentage: 2.7 },
            { label: 'Rejected', count: 831, percentage: 1.8 },
        ],
        storageProviders: [
            { label: 'AWS S3', count: 28345, percentage: 62.1 },
            { label: 'Cloudinary', count: 12456, percentage: 27.3 },
            { label: 'Google Cloud', count: 4831, percentage: 10.6 },
        ],
        totalStorage: 2.4, // TB
    };
}

export async function fetchNotificationsStats(dateRange: DateRange): Promise<NotificationsStats> {
    await delay(750);

    if (shouldSimulateError()) {
        throw new Error('Failed to fetch notification statistics');
    }

    const dates = generateDateRange(dateRange, 14);

    return {
        sentVsRead: {
            sent: 45632,
            read: 38945,
            readRate: 85.3,
        },
        byType: [
            { label: 'Booking Updates', count: 15234 },
            { label: 'Tour Reminders', count: 12456 },
            { label: 'Reviews', count: 8934 },
            { label: 'Messages', count: 6789 },
            { label: 'System', count: 2219 },
        ],
        byPriority: [
            { label: 'High', count: 3456 },
            { label: 'Medium', count: 28934 },
            { label: 'Low', count: 13242 },
        ],
        deliveryTimeline: dates.map(date => ({
            date,
            value: Math.floor(Math.random() * 500) + 200,
        })),
    };
}

export async function fetchChatStats(dateRange: DateRange): Promise<ChatStats> {
    await delay(650);

    if (shouldSimulateError()) {
        throw new Error('Failed to fetch chat statistics');
    }

    const dates = generateDateRange(dateRange);

    return {
        messagesOverTime: dates.map(date => ({
            date,
            value: Math.floor(Math.random() * 300) + 150,
        })),
        readVsUnread: {
            read: 23456,
            unread: 3445,
            readRate: 87.2,
        },
        topConversations: [
            { id: '1', label: 'Tour Guide Support', value: 2345 },
            { id: '2', label: 'Booking Assistance', value: 1876 },
            { id: '3', label: 'Customer Service', value: 1654 },
            { id: '4', label: 'Technical Support', value: 1234 },
            { id: '5', label: 'General Inquiries', value: 987 },
        ],
        avgResponseTime: 1.3, // hours
    };
}

export async function fetchEmployeesStats(dateRange: DateRange): Promise<EmployeesStats> {
    await delay(550);

    if (shouldSimulateError()) {
        throw new Error('Failed to fetch employee statistics');
    }

    return {
        countsByRole: [
            { label: 'Customer Support', count: 45 },
            { label: 'Tour Guides', count: 38 },
            { label: 'Sales', count: 23 },
            { label: 'Marketing', count: 15 },
            { label: 'Engineering', count: 12 },
            { label: 'Operations', count: 8 },
        ],
        countsByDepartment: [
            { label: 'Operations', count: 67 },
            { label: 'Customer Success', count: 34 },
            { label: 'Technology', count: 18 },
            { label: 'Marketing', count: 8 },
        ],
        countsByStatus: [
            { label: 'Active', count: 119 },
            { label: 'On Leave', count: 6 },
            { label: 'Part-time', count: 2 },
        ],
        shiftsData: {
            scheduled: 2456,
            completed: 2234,
            completionRate: 91.0,
        },
    };
}