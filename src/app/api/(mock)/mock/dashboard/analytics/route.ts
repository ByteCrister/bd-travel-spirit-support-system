// app/api/mock/dashboard/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateMockAnalytics, generateDateRange, successResponse } from '@/lib/mocks/dashboard.mock';

export async function GET(request: NextRequest) {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate heavier computation

    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start') || undefined;
    const end = searchParams.get('end') || undefined;

    const { startDate, endDate } = generateDateRange(start, end);
    const analytics = generateMockAnalytics(startDate, endDate);

    return NextResponse.json(successResponse(analytics));
}