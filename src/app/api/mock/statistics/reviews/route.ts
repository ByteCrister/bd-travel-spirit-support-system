import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';
import type { ReviewsStats } from '@/types/statistics.types';

export async function GET() {
    const data: ReviewsStats = {
        volumeOverTime: Array.from({ length: 30 }, () => ({
            date: faker.date.recent().toISOString(),
            value: faker.number.int({ min: 0, max: 200 }),
        })),
        avgRatingTrend: Array.from({ length: 30 }, () => ({
            date: faker.date.recent().toISOString(),
            value: faker.number.float({ min: 3, max: 5, fractionDigits: 2 }),
        })),
        verificationStatus: [
            { label: 'Verified', count: 800 },
            { label: 'Unverified', count: 200 },
        ],
        helpfulnessDistribution: [
            { label: 'Helpful', count: 600 },
            { label: 'Not Helpful', count: 400 },
        ],
    };

    return NextResponse.json(data);
}
