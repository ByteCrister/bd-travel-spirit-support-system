import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { RoleDistribution } from '@/types/dashboard.types';

export async function GET() {
    const travelers = faker.number.int({ min: 1000, max: 10000 });
    const organizers = faker.number.int({ min: 10, max: 500 });
    const support = faker.number.int({ min: 1, max: 200 });
    const banned = faker.number.int({ min: 0, max: 50 });

    const result: RoleDistribution = { travelers, organizers, support, banned };
    return NextResponse.json({ data: result });
}
