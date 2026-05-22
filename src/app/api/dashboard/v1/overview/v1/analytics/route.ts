import { NextRequest } from 'next/server';
import { ClientSession } from 'mongoose';
import {
    BOOKING_STATUS,
} from '@/constants/tour-booking.const';
import { GUIDE_STATUS } from '@/constants/guide.const';
import ConnectDB from '@/config/db';
import BookingModel from '@/models/tours/booking.model';
import GuideModel from '@/models/guide/guide.model';
import { TravelerModel } from '@/models/travelers/traveler.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import TourModel from '@/models/tours/tour.model';
import { withErrorHandler, HandlerResult, ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { Types } from 'mongoose';

// Type for the analytics data returned to the client
type RecentBookingDoc = {
    _id: Types.ObjectId;
    bookingReference: string;
    bookedAt: Date;
    totalPaid: number;
    traveler?: {
        _id: Types.ObjectId;
        name?: string;
    };
};

interface AnalyticsData {
    dateRange: { start: string; end: string };
    summary: {
        totalBookings: number;
        totalRevenue: number;
        averageBookingValue: number;
        totalParticipants: number;
    };
    bookingsByStatus: Record<string, number>;
    popularTours: Array<{ id: string; title: string; bookings: number }>;
    recentBookings: Array<{
        id: string;
        reference: string;
        traveler: string;
        date: Date;
        amount: number;
    }>;
    guides: {
        totalActive: number;
        pendingApplications: number;
    };
    travelers: {
        totalRegistered: number;
        newThisPeriod: number;
    };
}

/**
 * GET /api/dashboard/v1/overview/v1/analytics
 * Returns dashboard analytics for a given date range.
 */
export const GET = withErrorHandler(async (
    request: NextRequest
): Promise<HandlerResult<AnalyticsData>> => {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    // Validate required parameters
    if (!startParam || !endParam) {
        throw new ApiError('Missing start or end date', 400);
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startParam) || !dateRegex.test(endParam)) {
        throw new ApiError('Invalid date format. Use YYYY-MM-DD', 400);
    }

    const startDate = new Date(startParam);
    const endDate = new Date(endParam);
    endDate.setHours(23, 59, 59, 999); // include the whole end day

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError('Invalid date values', 400);
    }

    if (startDate > endDate) {
        throw new ApiError('Start date must be before end date', 400);
    }

    // Execute all analytics queries inside a transaction for consistency
    const data = await withTransaction(async (session: ClientSession): Promise<AnalyticsData> => {
        // ------------------------------------------------------------
        // 1. Bookings summary
        // ------------------------------------------------------------
        const bookingMatch = {
            bookedAt: { $gte: startDate, $lte: endDate },
            deletedAt: null,
        };

        const [
            totalBookings,
            totalParticipantsAgg,
            revenueAgg,
            bookingsByStatusAgg
        ] = await Promise.all([
            BookingModel.countDocuments(bookingMatch).session(session),
            BookingModel.aggregate(
                [
                    { $match: bookingMatch },
                    { $group: { _id: null, total: { $sum: '$totalParticipants' } } }
                ],
                { session }
            ),
            BookingModel.aggregate(
                [
                    {
                        $match: {
                            ...bookingMatch,
                            status: BOOKING_STATUS.CONFIRMED, // only confirmed payments count towards revenue
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$totalPaid' } } }
                ],
                { session }
            ),
            BookingModel.aggregate(
                [
                    { $match: bookingMatch },
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ],
                { session }
            ),
        ]);

        const totalRevenue = revenueAgg[0]?.total || 0;
        const totalParticipants = totalParticipantsAgg[0]?.total || 0;
        const averageBookingValue =
            totalBookings > 0 ? Math.floor(totalRevenue / totalBookings) : 0;

        // Format bookings by status into a clean object
        const bookingsByStatusMap = Object.values(BOOKING_STATUS).reduce(
            (acc, status) => ({ ...acc, [status]: 0 }),
            {} as Record<string, number>
        );
        bookingsByStatusAgg.forEach((item) => {
            bookingsByStatusMap[item._id] = item.count;
        });

        // ------------------------------------------------------------
        // 2. Popular tours (top 5 by bookings in period)
        // ------------------------------------------------------------
        const popularToursAgg = await BookingModel.aggregate(
            [
                { $match: bookingMatch },
                { $group: { _id: '$tour', bookings: { $sum: 1 } } },
                { $sort: { bookings: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: getCollectionName(TourModel),
                        localField: '_id',
                        foreignField: '_id',
                        as: 'tour',
                    },
                },
                { $unwind: '$tour' },
                {
                    $project: {
                        id: '$_id',
                        title: '$tour.title',
                        bookings: 1,
                    },
                },
            ],
            { session }
        );

        // ------------------------------------------------------------
        // 3. Recent bookings (last 5)
        // ------------------------------------------------------------
        const recentBookings = await BookingModel.find(bookingMatch)
            .session(session)
            .sort({ bookedAt: -1 })
            .limit(5)
            .populate({
                path: 'traveler',
                select: 'name',
                options: { session } // ensure populate uses the same session
            })
            .lean<RecentBookingDoc[]>();

        const formattedRecent = recentBookings.map((b) => ({
            id: b._id.toString(),
            reference: b.bookingReference,
            traveler: b.traveler?.name || 'Unknown',
            date: b.bookedAt,
            amount: b.totalPaid,
        }));

        // ------------------------------------------------------------
        // 4. Guides stats
        // ------------------------------------------------------------
        const [totalActiveGuides, pendingGuideApplications] = await Promise.all([
            GuideModel.countDocuments({
                status: GUIDE_STATUS.APPROVED,
                deletedAt: null,
            }).session(session),
            GuideModel.countDocuments({
                status: GUIDE_STATUS.PENDING,
                deletedAt: null,
            }).session(session),
        ]);

        // ------------------------------------------------------------
        // 5. Travelers stats
        // ------------------------------------------------------------
        const [totalTravelers, newTravelersThisPeriod] = await Promise.all([
            TravelerModel.countDocuments({ deletedAt: null }).session(session),
            TravelerModel.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate },
                deletedAt: null,
            }).session(session),
        ]);

        // ------------------------------------------------------------
        // Assemble final data object
        // ------------------------------------------------------------
        return {
            dateRange: {
                start: startParam,
                end: endParam,
            },
            summary: {
                totalBookings,
                totalRevenue,
                averageBookingValue,
                totalParticipants,
            },
            bookingsByStatus: bookingsByStatusMap,
            popularTours: popularToursAgg.map((t) => ({
                id: t.id.toString(),
                title: t.title,
                bookings: t.bookings,
            })),
            recentBookings: formattedRecent,
            guides: {
                totalActive: totalActiveGuides,
                pendingApplications: pendingGuideApplications,
            },
            travelers: {
                totalRegistered: totalTravelers,
                newThisPeriod: newTravelersThisPeriod,
            },
        };
    });

    // Return the data – withErrorHandler will wrap it in { data: ..., status: 200 }
    return { data };
});