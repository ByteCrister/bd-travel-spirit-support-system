import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { AdminNotification } from '@/types/dashboard/dashboard.types';

export async function GET() {
    const types = ['report', 'ticket', 'flagged_user', 'system_alert', 'revenue_issue', 'approval_pending'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const items: AdminNotification[] = Array.from({ length: 5 }).map(() => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(types),
        title: faker.lorem.words({ min: 2, max: 5 }),
        message: faker.lorem.sentence(),
        severity: faker.helpers.arrayElement(severities),
        createdAt: faker.date.recent({ days: 7 }).toISOString(),
        isRead: faker.datatype.boolean(),
        actionRequired: faker.datatype.boolean(),
    }));
    return NextResponse.json({ data: items });
}
