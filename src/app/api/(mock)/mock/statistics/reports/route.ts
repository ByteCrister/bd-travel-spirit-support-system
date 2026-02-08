import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';
import type { ReportsStats } from '@/types/dashboard/statistics.types';

export async function GET() {
    const data: ReportsStats = {
        statusFunnel: [
            { label: 'Open', count: 50 },
            { label: 'In Progress', count: 30 },
            { label: 'Closed', count: 100 },
        ],
        reasonsBreakdown: [
            { label: 'Abuse', count: 60 },
            { label: 'Spam', count: 40 },
            { label: 'Fraud', count: 80 },
        ],
        resolutionTimes: Array.from({ length: 10 }, () => ({
            date: faker.date.recent().toISOString(),
            value: faker.number.int({ min: 1, max: 10 }),
        })),
        avgResolutionTime: faker.number.float({ min: 1, max: 7, fractionDigits: 1 }),
    };

    return NextResponse.json(data);
}
