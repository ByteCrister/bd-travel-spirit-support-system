// app/api/dashboard/v1/statistics/v1/tours/route.ts

import { NextRequest } from "next/server";
import { FilterQuery } from "mongoose";



import { TOUR_STATUS } from "@/constants/tour.const";

import {
    withErrorHandler,
    HandlerResult,
} from "@/lib/helpers/withErrorHandler";

import {
    ToursStats,
    CategoryCount,
    RankingItem,
    TimeSeriesPoint,
} from "@/types/dashboard/statistics.types";
import ConnectDB from "@/config/db";
import TourModel, { ITour } from "@/models/tours/tour.model";
import BookingModel, { IBooking } from "@/models/tours/booking.model";
import { IReview, ReviewModel } from "@/models/tours/review.model";
import { getCollectionName } from "@/lib/helpers/get-collection-name";

/**
 * MongoDB date range filter type.
 */
type DateRangeFilter = {
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
};

/**
 * Parse ISO date safely.
 */
function parseDate(value: string | null): Date | undefined {
    if (!value) return undefined;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    return date;
}

/**
 * Build MongoDB createdAt filter.
 */
function buildDateFilter(from?: Date, to?: Date): DateRangeFilter {
    if (!from && !to) {
        return {};
    }

    const createdAt: DateRangeFilter["createdAt"] = {};

    if (from) createdAt.$gte = from;
    if (to) createdAt.$lte = to;

    return { createdAt };
}

/**
 * Aggregation result types
 */

interface TourStatusAgg {
    label: string;
    count: number;
}

interface BookingLeaderboardAgg {
    id: string;
    label: string;
    value: number;
}

interface RatingLeaderboardAgg {
    id: string;
    label: string;
    value: number;
}

interface UpcomingToursAgg {
    date: string;
    value: number;
}

/**
 * GET /api/statistics/tours
 *
 * Example:
 * /api/statistics/tours?from=2026-02-28T18:00:00.000Z&to=2026-03-11T18:00:00.000Z
 */
async function getToursStats(
    req: NextRequest
): Promise<HandlerResult<ToursStats>> {
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;

    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));

    /**
     * Shared date filter
     */
    const dateFilter = buildDateFilter(from, to);

    /**
     * Tour filters
     */
    const tourFilter: FilterQuery<ITour> = {
        deletedAt: null,
        ...dateFilter,
    };

    /**
     * Booking filters
     */
    const bookingFilter: FilterQuery<IBooking> = {
        deletedAt: null,
        ...dateFilter,
    };

    /**
     * Review filters
     */
    const reviewFilter: FilterQuery<IReview> = {
        isApproved: true,
        deletedAt: null,
        ...dateFilter,
    };

    /**
     * --------------------------------------------------
     * 1️⃣ Tours grouped by status
     * --------------------------------------------------
     */
    const statusAgg =
        await TourModel.aggregate<TourStatusAgg>([
            {
                $match: tourFilter,
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    label: "$_id",
                    count: 1,
                    _id: 0,
                },
            },
        ]);

    const statusCounts: CategoryCount[] = statusAgg;

    /**
     * --------------------------------------------------
     * 2️⃣ Top tours by number of bookings
     * --------------------------------------------------
     */
    const bookingsAgg =
        await BookingModel.aggregate<BookingLeaderboardAgg>([
            {
                $match: bookingFilter,
            },
            {
                $group: {
                    _id: "$tour",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: getCollectionName(TourModel),
                    localField: "_id",
                    foreignField: "_id",
                    as: "tour",
                },
            },
            {
                $unwind: "$tour",
            },
            {
                $project: {
                    id: "$_id",
                    label: "$tour.title",
                    value: "$count",
                    _id: 0,
                },
            },
        ]);

    const bookingsPerTour: RankingItem[] = bookingsAgg;

    /**
     * --------------------------------------------------
     * 3️⃣ Top rated tours
     * --------------------------------------------------
     */
    const ratingAgg =
        await ReviewModel.aggregate<RatingLeaderboardAgg>([
            {
                $match: reviewFilter,
            },
            {
                $group: {
                    _id: "$tour",
                    avgRating: { $avg: "$rating" },
                },
            },
            {
                $sort: { avgRating: -1 },
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: getCollectionName(TourModel),
                    localField: "_id",
                    foreignField: "_id",
                    as: "tour",
                },
            },
            {
                $unwind: "$tour",
            },
            {
                $project: {
                    id: "$_id",
                    label: "$tour.title",
                    value: "$avgRating",
                    _id: 0,
                },
            },
        ]);

    const ratingLeaderboard: RankingItem[] = ratingAgg;

    /**
     * --------------------------------------------------
     * 4️⃣ Upcoming tours grouped by departure date
     * --------------------------------------------------
     */

    type DepartureDateFilter = {
        "departures.date"?: {
            $gte?: Date;
            $lte?: Date;
        };
    };

    const upcomingFilter: DepartureDateFilter = {};

    if (from || to) {
        upcomingFilter["departures.date"] = {};

        if (from) upcomingFilter["departures.date"].$gte = from;
        if (to) upcomingFilter["departures.date"].$lte = to;
    }

    const upcomingAgg =
        await TourModel.aggregate<UpcomingToursAgg>([
            {
                $match: {
                    deletedAt: null,
                    status: TOUR_STATUS.ACTIVE,
                },
            },
            {
                $unwind: "$departures",
            },
            {
                $match: upcomingFilter,
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$departures.date",
                        },
                    },
                    value: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $project: {
                    date: "$_id",
                    value: 1,
                    _id: 0,
                },
            },
        ]);

    const upcomingTours: TimeSeriesPoint[] = upcomingAgg;

    /**
     * Final response
     */
    return {
        data: {
            statusCounts,
            bookingsPerTour,
            ratingLeaderboard,
            upcomingTours,
        },
    };
}

/**
 * Export GET handler wrapped with global error handler
 */
export const GET = withErrorHandler(getToursStats);