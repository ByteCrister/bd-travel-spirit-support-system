import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { TrendingInsight } from '@/types/dashboard/dashboard.types';

export async function GET() {
    const types = ['destination', 'category', 'tour_type'] as const;
    const trends = ['up', 'down', 'stable'] as const;

    const items: TrendingInsight[] = Array.from({ length: 4 }).map(() => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(types),
        title: faker.lorem.words({ min: 2, max: 5 }),
        description: faker.lorem.sentence(),
        trend: faker.helpers.arrayElement(trends),
        percentage: faker.number.int({ min: 1, max: 100 }),
        confidence: faker.number.float({ min: 0.5, max: 0.99, multipleOf: 0.01 }),
    }));

    return NextResponse.json({ data: items });
}
