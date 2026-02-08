// src/app/api/mock/statistics/kpis/route.ts
import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';
import type { KpiMetrics } from '@/types/dashboard/statistics.types';

export async function GET() {
    const data: KpiMetrics = {
        totalUsers: faker.number.int({ min: 1000, max: 50000 }),
        totalTours: faker.number.int({ min: 100, max: 5000 }),
        totalBookings: faker.number.int({ min: 500, max: 20000 }),
        avgRating: faker.number.float({ min: 3, max: 5, fractionDigits: 2 }),
        totalImages: faker.number.int({ min: 10000, max: 100000 }),
        openReports: faker.number.int({ min: 0, max: 200 }),
        totalRevenue: faker.number.float({ min: 100000, max: 10000000, fractionDigits: 2 }),
        activeEmployees: faker.number.int({ min: 10, max: 300 }),
    };

    return NextResponse.json(data);
}
