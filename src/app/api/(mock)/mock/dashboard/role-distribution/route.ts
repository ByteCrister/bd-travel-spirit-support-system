// app/api/mock/dashboard/role-distribution/route.ts
import { NextResponse } from 'next/server';
import { generateMockRoleDistribution, successResponse } from '@/lib/mocks/dashboard.mock';

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 500));

    const distribution = generateMockRoleDistribution();

    return NextResponse.json(successResponse(distribution));
}