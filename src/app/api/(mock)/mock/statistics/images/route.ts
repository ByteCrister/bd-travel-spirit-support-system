import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';
import type { ImagesStats } from '@/types/dashboard/statistics.types';

export async function GET() {
    const data: ImagesStats = {
        uploadsOverTime: Array.from({ length: 30 }, () => ({
            date: faker.date.recent().toISOString(),
            value: faker.number.int({ min: 100, max: 1000 }),
        })),
        assetTypeBreakdown: [
            { label: 'Destination', count: 400 },
            { label: 'Tour', count: 300 },
            { label: 'User', count: 200 },
        ],
        visibilityDistribution: [
            { label: 'public', count: 800 },
            { label: 'private', count: 100 },
        ],
        contentTypeDistribution: [
            { label: 'image/jpeg', count: 600 },
            { label: 'image/png', count: 300 },
        ],
        storageProviders: [
            { label: 'AWS S3', count: 800 },
            { label: 'Local', count: 100 },
        ],
        totalAssets: 900,
        totalFiles: 950,
        totalStorage: faker.number.int({ min: 100000, max: 10000000 }),
        avgFileSize: faker.number.int({ min: 1024, max: 5000000 }),
    };

    return NextResponse.json({ data });
}
