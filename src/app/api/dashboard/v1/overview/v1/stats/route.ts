import { NextRequest } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';
import UserModel from '@/models/user.model';
import GuideModel from '@/models/guide/guide.model';
import TourModel from '@/models/tours/tour.model';
import BookingModel from '@/models/tours/booking.model';
import { ReportModel } from '@/models/tours/report.model';
import ConnectDB from '@/config/db';
import { DashboardStats } from '@/types/dashboard/dashboard.types';
import { BOOKING_STATUS } from '@/constants/tour-booking.const';
import { REPORT_STATUS } from '@/constants/report.const';
import { TOUR_STATUS } from '@/constants/tour.const';
import { USER_ROLE } from '@/constants/user.const';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { withErrorHandler, HandlerResult, ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { ClientSession } from 'mongoose';

/**
 * GET api/dashboard/v1/overview/v1/stats/route.ts
 * Returns dashboard statistics with optional date range filtering.
 */
export const GET = withErrorHandler(async (req: NextRequest): Promise<HandlerResult<DashboardStats>> => {
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    // Default to last 30 days if no range provided
    const endDate = endParam ? new Date(endParam) : new Date();
    const startDate = startParam
        ? new Date(startParam)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        // Throw an ApiError to be caught by withErrorHandler
        throw new ApiError('Invalid date format', 400);
    }

    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    // Run all statistics inside a transaction for a consistent snapshot
    const stats = await withTransaction(async (session: ClientSession): Promise<DashboardStats> => {
        // All database operations use the same session
        const [
            totalUsers,
            totalOrganizers,
            totalSupportAgents,
            activeTours,
            upcomingTours,
            totalBookings,
            pendingReports,
            suspendedUsers,
            totalRevenue,
            topDestinations,
        ] = await Promise.all([
            // total users (no soft‑delete)
            UserModel.countDocuments({}, { session }),

            // total organizers (guides not soft‑deleted)
            GuideModel.countDocuments({ deletedAt: null }, { session }),

            // total support agents (role = ASSISTANT)
            UserModel.countDocuments({ role: USER_ROLE.ASSISTANT }, { session }),

            // active tours (status = ACTIVE, not deleted)
            TourModel.countDocuments(
                { status: TOUR_STATUS.ACTIVE, deletedAt: null },
                { session }
            ),

            // upcoming tours: active tours with at least one future departure
            (async (): Promise<number> => {
                const now = new Date();
                const result = await TourModel.aggregate(
                    [
                        { $match: { deletedAt: null, status: TOUR_STATUS.ACTIVE } },
                        { $unwind: '$departures' },
                        { $match: { 'departures.date': { $gt: now } } },
                        { $group: { _id: '$_id' } },
                        { $count: 'count' },
                    ],
                    { session }
                );
                return result[0]?.count || 0;
            })(),

            // total bookings (not soft‑deleted)
            BookingModel.countDocuments({ deletedAt: null }, { session }),

            // pending reports (open or in review, not deleted)
            ReportModel.countDocuments(
                {
                    status: { $in: [REPORT_STATUS.OPEN, REPORT_STATUS.IN_REVIEW] },
                    deletedAt: null,
                },
                { session }
            ),

            // suspended users (guides with active suspension)
            GuideModel.countDocuments(
                { 'suspension.until': { $gt: new Date() }, deletedAt: null },
                { session }
            ),

            // total revenue from confirmed/completed bookings in date range
            (async (): Promise<number> => {
                const result = await BookingModel.aggregate(
                    [
                        {
                            $match: {
                                deletedAt: null,
                                status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
                                bookedAt: { $gte: start, $lte: end },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$totalPaid' },
                            },
                        },
                    ],
                    { session }
                );
                return result[0]?.total || 0;
            })(),

            // top 5 destination districts by booking count in date range
            (async (): Promise<string[]> => {
                const topDistricts = await BookingModel.aggregate(
                    [
                        {
                            $match: {
                                deletedAt: null,
                                bookedAt: { $gte: start, $lte: end },
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(TourModel),
                                localField: 'tour',
                                foreignField: '_id',
                                as: 'tourInfo',
                            },
                        },
                        { $unwind: '$tourInfo' },
                        {
                            $group: {
                                _id: '$tourInfo.district',
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        { $limit: 5 },
                        { $project: { _id: 0, district: '$_id' } },
                    ],
                    { session }
                );
                return topDistricts.map((item: { district: string }) => item.district);
            })(),
        ]);

        return {
            totalUsers,
            totalOrganizers,
            totalSupportAgents,
            activeTours,
            upcomingTours,
            totalBookings,
            pendingReports,
            suspendedUsers,
            totalRevenue,
            topDestinationTrends: topDestinations,
            lastUpdated: new Date().toISOString(),
        };
    });

    // Return the stats – withErrorHandler will wrap it in { data: stats, status: 200 }
    return { data: stats };
});