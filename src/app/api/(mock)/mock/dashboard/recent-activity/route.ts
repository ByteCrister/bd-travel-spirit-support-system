import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { RecentActivity } from '@/types/dashboard/dashboard.types';

export async function GET() {
    const types = ['signup', 'booking', 'report', 'tour', 'user_action'] as const;
    const severities = ['low', 'medium', 'high'] as const;
    const items: RecentActivity[] = Array.from({ length: 8 }).map(() => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(types),
        title: faker.lorem.words({ min: 2, max: 5 }),
        description: faker.lorem.sentence(),
        timestamp: faker.date.recent({ days: 7 }).toISOString(),
        user: faker.person.fullName(),
        severity: faker.helpers.arrayElement(severities),
    }));
    return NextResponse.json({ data: items });
}
