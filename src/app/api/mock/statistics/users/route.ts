import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';
import type { UsersStats, TimeSeriesPoint, CategoryCount } from '@/types/statistics.types';

export async function GET() {
    const days = 30;
    const signupsOverTime: TimeSeriesPoint[] = Array.from({ length: days }, (_, i) => ({
        date: faker.date.recent({ days }).toISOString(),
        value: faker.number.int({ min: 10, max: 200 }),
    }));

    const statusDistribution: CategoryCount[] = [
        { label: 'Active', count: 500, percentage: 50 },
        { label: 'Inactive', count: 300, percentage: 30 },
        { label: 'Banned', count: 200, percentage: 20 },
    ];

    const guideApplications = {
        pending: faker.number.int({ min: 0, max: 50 }),
        approved: faker.number.int({ min: 50, max: 200 }),
        rejected: faker.number.int({ min: 0, max: 30 }),
        avgReviewTime: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    };

    const data: UsersStats = { signupsOverTime, statusDistribution, guideApplications };

    return NextResponse.json(data);
}
