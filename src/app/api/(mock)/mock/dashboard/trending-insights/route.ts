// app/api/mock/dashboard/trending-insights/route.ts
import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import { successResponse } from '@/lib/mocks/dashboard.mock';

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 500));

    const insights = Array.from({ length: 8 }, () => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(['destination', 'category', 'tour_type']),
        name: faker.helpers.arrayElement([
            'Beach Tours',
            'Mountain Adventures',
            'City Breaks',
            'Cultural Experiences',
            'Food Tours',
        ]),
        growth: faker.number.int({ min: -20, max: 100 }),
        trend: faker.helpers.arrayElement(['up', 'down', 'stable']),
        value: faker.number.int({ min: 100, max: 10000 }),
    }));

    return NextResponse.json(successResponse(insights));
}