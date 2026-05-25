// app/api/mock/dashboard/admin-notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateMockAdminNotifications, createPaginatedResponse, successResponse } from '@/lib/mocks/dashboard.mock';

export async function GET(request: NextRequest) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const totalItems = 80; // Mock total count
    const allItems = generateMockAdminNotifications(totalItems);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = allItems.slice(start, end);

    const response = createPaginatedResponse(paginatedItems, page, limit, totalItems);

    return NextResponse.json(successResponse(response));
}