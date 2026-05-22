// app/api/dashboard/v1/overview/v1/recent-bookings/route.ts
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { Booking } from '@/types/dashboard/dashboard.types';
import { BOOKING_STATUS } from '@/constants/tour-booking.const';
import ConnectDB from '@/config/db';
import BookingModel, { IBooking } from '@/models/tours/booking.model';
import UserModel, { IUserDoc } from '@/models/user.model';
import { ITraveler } from '@/models/travelers/traveler.model';
import { ITour } from '@/models/tours/tour.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { withErrorHandler, HandlerResult } from '@/lib/helpers/withErrorHandler';

// User fields we selected
type SelectedUser = Pick<IUserDoc, '_id' | 'name' | 'email'>;

// Traveler with populated user (plain object)
type PopulatedTraveler = Omit<ITraveler, 'user'> & {
    user: SelectedUser | null; // user might be null if not found or deleted
} | null; // traveler itself can be null if deleted

// Tour fields we selected
type SelectedTour = Pick<ITour, '_id' | 'title' | 'district'>;

// Populated tour (plain object)
type PopulatedTour = SelectedTour | null;

export type PopulatedBooking = Omit<IBooking, 'traveler' | 'tour'> & {
    traveler: PopulatedTraveler;
    tour: PopulatedTour;
};

// Shape of the data returned by this endpoint
interface RecentBookingsData {
    items: Booking[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

/**
 * GET /api/dashboard/v1/overview/v1/recent-bookings
 * Returns a paginated list of recent bookings (excluding soft-deleted records).
 */
export const GET = withErrorHandler(async (
    request: NextRequest
): Promise<HandlerResult<RecentBookingsData>> => {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    // Fetch bookings with pagination and necessary population
    const query = BookingModel.find({ deletedAt: null })
        .sort({ bookedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'traveler',
            match: { deletedAt: null },
            populate: {
                path: 'user',
                model: getCollectionName(UserModel),
                select: 'name email',
            },
        })
        .populate({
            path: 'tour',
            match: { deletedAt: null },
            select: 'title district',
        });

    const [rawBookings, total] = await Promise.all([
        query.lean().exec(),
        BookingModel.countDocuments({ deletedAt: null }),
    ]);

    const bookings = rawBookings as unknown as PopulatedBooking[];

    // Transform to match the expected Booking interface
    const items: Booking[] = bookings.map((b) => ({
        id: (b._id as Types.ObjectId).toString(),
        user: {
            id: b.traveler?.user?._id?.toString() || '',
            name: b.traveler?.user?.name || '',
            email: b.traveler?.user?.email || '',
        },
        tour: {
            id: b.tour?._id?.toString() || '',
            title: b.tour?.title || '',
            destination: b.tour?.district || '',
        },
        bookingDate: b.bookedAt?.toISOString() || new Date().toISOString(),
        status: b.status as typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS],
        amount: b.totalPaid,
    }));

    return {
        data: {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        },
    };
});