import { NextRequest, NextResponse } from 'next/server';
import { PaginatedResponse } from '@/types/user/traveler.types';
import { ApiResponse } from '@/types/common/api.types';
import { generateTravelerLikedTour } from '@/lib/mocks/traveler.mock';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const allItems = Array.from({ length: 15 }, generateTravelerLikedTour);
    const total = allItems.length;
    const start = (page - 1) * limit;
    const paginatedData = allItems.slice(start, start + limit);

    const response: ApiResponse<PaginatedResponse<typeof paginatedData[0]>> = {
        data: {
            data: paginatedData,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
    return NextResponse.json(response);
}