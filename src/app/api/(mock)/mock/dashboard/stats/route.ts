// app/api/mock/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateMockStats, generateDateRange, successResponse } from '@/lib/mocks/dashboard.mock';

export async function GET(request: NextRequest) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start') || undefined;
    const end = searchParams.get('end') || undefined;

    const { startDate, endDate } = generateDateRange(start, end);
    const stats = generateMockStats(startDate, endDate);

    return NextResponse.json(successResponse(stats));
}