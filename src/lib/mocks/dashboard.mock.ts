// app/api/mock/dashboard/utils.ts
import { faker } from '@faker-js/faker';
import {
    DashboardStats,
    RecentActivity,
    PendingAction,
    Booking,
    RoleDistribution,
    AdminNotification,
    AnalyticsData,
} from '@/types/dashboard/dashboard.types';
import { BOOKING_STATUS } from '@/constants/tour-booking.const';

type PaginatedResponse<T> = {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};

// Seed for consistent data during development
faker.seed(123);

export const generateDateRange = (start?: string, end?: string) => {
    const startDate = start ? new Date(start) : new Date();
    startDate.setDate(startDate.getDate() - faker.number.int({ min: 0, max: 30 }));
    const endDate = end ? new Date(end) : new Date();
    return { startDate, endDate };
};


export const getDaysInRange = (startDate: Date, endDate: Date): string[] => {
    const days: string[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        days.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return days;
};

export const generateMockStats = (startDate: Date, endDate: Date): DashboardStats => {
    const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const multiplier = daysDiff / 30; // Scale based on date range

    return {
        totalUsers: faker.number.int({ min: 1000, max: 50000 }),
        totalOrganizers: faker.number.int({ min: 50, max: 2000 }),
        totalSupportAgents: faker.number.int({ min: 10, max: 200 }),
        activeTours: faker.number.int({ min: 100, max: 5000 }),
        upcomingTours: faker.number.int({ min: 50, max: 1000 }),
        totalBookings: faker.number.int({ min: 5000, max: 100000 }) * multiplier,
        pendingReports: faker.number.int({ min: 0, max: 500 }),
        suspendedUsers: faker.number.int({ min: 0, max: 200 }),
        totalRevenue: faker.number.int({ min: 100000, max: 5000000 }) * multiplier,
        topDestinationTrends: ['Bali', 'Paris', 'Tokyo', 'New York', 'London'],
        lastUpdated: new Date().toISOString(),
    };
};

export const generateMockRecentActivity = (count: number): RecentActivity[] => {
    const types = ['signup', 'booking', 'report', 'tour', 'user_action'] as const;
    const severities = ['low', 'medium', 'high'] as const;

    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(types),
        title: faker.helpers.arrayElement([
            'New user registration',
            'Booking confirmed',
            'New report filed',
            'Tour created',
            'User reported',
            'Payment received',
        ]),
        description: faker.lorem.sentence(),
        timestamp: faker.date.recent({ days: 7 }).toISOString(),
        user: faker.internet.username(),
        severity: faker.helpers.arrayElement(severities),
    }));
};

export const generateMockPendingActions = (count: number): PendingAction[] => {
    const types = ['report', 'complaint', 'flagged_content', 'organizer_approval', 'tour_approval'] as const;
    const priorities = ['low', 'medium', 'high', 'urgent'] as const;
    const statuses = ['pending', 'in_progress', 'resolved'] as const;

    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(types),
        title: faker.helpers.arrayElement([
            'Suspicious activity reported',
            'User complaint about tour',
            'Inappropriate content flagged',
            'Organizer verification needed',
            'Tour approval request',
        ]),
        description: faker.lorem.paragraph(),
        priority: faker.helpers.arrayElement(priorities),
        createdAt: faker.date.recent({ days: 14 }).toISOString(),
        assignedTo: faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.3 }),
        status: faker.helpers.arrayElement(statuses),
        metadata: { reason: faker.lorem.word() },
    }));
};

export const generateMockBookings = (count: number): Booking[] => {
    const statuses = Object.values(BOOKING_STATUS);

    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        user: {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
        },
        tour: {
            id: faker.string.uuid(),
            title: faker.helpers.arrayElement([
                'Bali Beach Tour',
                'Paris City Tour',
                'Tokyo Adventure',
                'New York Explorer',
                'London Heritage Tour',
            ]),
            destination: faker.location.city(),
        },
        bookingDate: faker.date.recent({ days: 30 }).toISOString(),
        status: faker.helpers.arrayElement(statuses),
        amount: faker.number.int({ min: 100, max: 5000 }),
    }));
};

export const generateMockRoleDistribution = (): RoleDistribution => ({
    travelers: faker.number.int({ min: 5000, max: 50000 }),
    organizers: faker.number.int({ min: 100, max: 2000 }),
    support: faker.number.int({ min: 20, max: 300 }),
    banned: faker.number.int({ min: 0, max: 500 }),
    lastUpdated: new Date().toISOString(),
});

export const generateMockAdminNotifications = (count: number): AdminNotification[] => {
    const types = ['report', 'ticket', 'flagged_user', 'system_alert', 'revenue_issue', 'approval_pending'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;

    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(types),
        title: faker.helpers.arrayElement([
            'New report submitted',
            'Support ticket opened',
            'User flagged for review',
            'System maintenance scheduled',
            'Revenue discrepancy detected',
            'Organizer approval pending',
        ]),
        message: faker.lorem.sentence(),
        severity: faker.helpers.arrayElement(severities),
        createdAt: faker.date.recent({ days: 7 }).toISOString(),
        isRead: faker.datatype.boolean({ probability: 0.3 }),
        actionRequired: faker.datatype.boolean({ probability: 0.7 }),
        meta: { reference: faker.string.alphanumeric(8) },
    }));
};

export const generateMockAnalytics = (startDate: Date, endDate: Date): AnalyticsData => {
    const days = getDaysInRange(startDate, endDate);

    const bookingsOverTime = days.map(date => ({
        date,
        count: faker.number.int({ min: 10, max: 500 }),
        revenue: faker.number.int({ min: 1000, max: 50000 }),
    }));

    const travelersOverTime = days.map(date => ({
        date,
        count: faker.number.int({ min: 50, max: 2000 }),
    }));

    const guidesOverTime = days.map(date => ({
        date,
        count: faker.number.int({ min: 5, max: 100 }),
    }));

    const revenueOverTime = days.map(date => ({
        date,
        amount: faker.number.int({ min: 5000, max: 100000 }),
    }));

    const reportsOverTime = days.map(date => ({
        date,
        count: faker.number.int({ min: 0, max: 50 }),
    }));

    return {
        bookingsOverTime,
        travelersOverTime,
        guidesOverTime,
        revenueOverTime,
        reportsOverTime,
        generatedAt: new Date().toISOString(),
    };
};

export const createPaginatedResponse = <T>(
    items: T[],
    page: number,
    limit: number,
    total: number
): PaginatedResponse<T> => ({
    items,
    pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
    },
});

export const successResponse = <T>(data: T) => ({
    success: true,
    data,
    message: 'Success',
});