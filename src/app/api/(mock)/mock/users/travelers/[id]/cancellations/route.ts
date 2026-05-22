import { NextRequest, NextResponse } from 'next/server';
import { BOOKING_STATUS } from '@/constants/tour-booking.const';
import { PaginatedResponse } from '@/types/user/traveler.types';
import { ApiResponse } from '@/types/common/api.types';
import { generateTravelerBooking } from '@/lib/mocks/traveler.mock';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Generate 50 bookings and filter only cancelled ones
    const allBookings = Array.from({ length: 50 }, generateTravelerBooking);
    const cancelled = allBookings.filter(b => b.status === BOOKING_STATUS.CANCELLED);
    const total = cancelled.length;
    const start = (page - 1) * limit;
    const paginatedData = cancelled.slice(start, start + limit);

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