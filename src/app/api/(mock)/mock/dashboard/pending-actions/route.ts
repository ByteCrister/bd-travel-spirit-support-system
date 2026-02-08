import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { PendingAction } from '@/types/dashboard/dashboard.types';

export async function GET() {
    const types = ['report', 'complaint', 'flagged_content', 'organizer_approval', 'tour_approval'] as const;
    const priorities = ['low', 'medium', 'high', 'urgent'] as const;
    const statuses = ['pending', 'in_progress', 'resolved'] as const;

    const items: PendingAction[] = Array.from({ length: 6 }).map(() => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(types),
        title: faker.lorem.sentence({ min: 3, max: 6 }),
        description: faker.lorem.sentences({ min: 1, max: 2 }),
        priority: faker.helpers.arrayElement(priorities),
        createdAt: faker.date.recent({ days: 14 }).toISOString(),
        assignedTo: faker.person.fullName(),
        status: faker.helpers.arrayElement(statuses),
    }));

    return NextResponse.json({ data: items });
}
