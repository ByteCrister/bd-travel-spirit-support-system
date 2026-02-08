import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { Announcement } from '@/types/dashboard/dashboard.types';

export async function GET() {
    const types = ['info', 'warning', 'urgent'] as const;
    const items: Announcement[] = Array.from({ length: 3 }).map(() => ({
        id: faker.string.uuid(),
        title: faker.lorem.sentence({ min: 3, max: 6 }),
        content: faker.lorem.sentences({ min: 1, max: 3 }),
        type: faker.helpers.arrayElement(types),
        createdAt: faker.date.recent({ days: 10 }).toISOString(),
        createdBy: faker.person.fullName(),
        isActive: faker.datatype.boolean(),
    }));
    return NextResponse.json({ data: items });
}
