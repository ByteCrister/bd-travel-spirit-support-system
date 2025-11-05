import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { DashboardStats } from '@/types/dashboard.types';

export async function GET() {
    const mock: DashboardStats = {
        totalUsers: faker.number.int({ min: 500, max: 5000 }),
        totalOrganizers: faker.number.int({ min: 10, max: 300 }),
        totalSupportAgents: faker.number.int({ min: 1, max: 50 }),
        activeTours: faker.number.int({ min: 20, max: 500 }),
        upcomingTours: faker.number.int({ min: 0, max: 200 }),
        totalBookings: faker.number.int({ min: 1000, max: 20000 }),
        pendingReports: faker.number.int({ min: 0, max: 50 }),
        suspendedUsers: faker.number.int({ min: 0, max: 20 }),
        totalRevenue: faker.number.int({ min: 10000, max: 2_000_000 }),
        topDestinationTrends: Array.from({ length: 5 }, () => faker.location.country()),
    };
    return NextResponse.json({ data: mock });
}
