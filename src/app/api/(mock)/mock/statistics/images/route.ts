import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';
import type { ImagesStats } from '@/types/dashboard/statistics.types';

export async function GET() {
    const data: ImagesStats = {
        uploadsOverTime: Array.from({ length: 30 }, () => ({
            date: faker.date.recent().toISOString(),
            value: faker.number.int({ min: 100, max: 1000 }),
        })),
        moderationStatus: [
            { label: 'Approved', count: 900 },
            { label: 'Rejected', count: 100 },
        ],
        storageProviders: [
            { label: 'AWS S3', count: 500 },
            { label: 'GCP', count: 300 },
            { label: 'Local', count: 200 },
        ],
        totalStorage: faker.number.int({ min: 100000, max: 10000000 }),
    };

    return NextResponse.json(data);
}
