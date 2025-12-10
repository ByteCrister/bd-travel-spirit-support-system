import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { SystemHealth } from '@/types/dashboard.types';

export async function GET() {
    const status = faker.helpers.arrayElement(['healthy', 'warning', 'critical'] as const);
    const health: SystemHealth = {
        serverStatus: status,
        databaseConnections: faker.number.int({ min: 0, max: 200 }),
        activeCronJobs: faker.number.int({ min: 0, max: 20 }),
        lastBackup: faker.date.recent({ days: 2 }).toISOString(),
        errorLogs: Array.from({ length: faker.number.int({ min: 0, max: 4 }) }).map(() => ({
            id: faker.string.uuid(),
            level: faker.helpers.arrayElement(['error', 'warning', 'info'] as const),
            message: faker.lorem.sentence(),
            timestamp: faker.date.recent({ days: 3 }).toISOString(),
        })),
    };
    return NextResponse.json({ data: health });
}
