// app/api/dashboard/v1/statistics/v1/reviews/route.ts

import { NextRequest } from "next/server";
import { FilterQuery } from "mongoose";


import {
    withErrorHandler,
    HandlerResult,
} from "@/lib/helpers/withErrorHandler";

import {
    TimeSeriesPoint,
    CategoryCount,
} from "@/types/dashboard/statistics.types";
import ConnectDB from "@/config/db";
import { IReview, ReviewModel } from "@/models/tours/review.model";

/**
 * Mongo date range filter
 */
type DateRangeFilter = {
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
};

/**
 * Safe date parser
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
 * Build MongoDB createdAt filter
 */
function buildDateFilter(from?: Date, to?: Date): DateRangeFilter {
    if (!from && !to) return {};

    const createdAt: DateRangeFilter["createdAt"] = {};

    if (from) createdAt.$gte = from;
    if (to) createdAt.$lte = to;

    return { createdAt };
}

/**
 * Aggregation types
 */

interface VolumeAgg {
    date: string;
    value: number;
}

interface AvgRatingAgg {
    date: string;
    value: number;
}

interface VerificationAgg {
    label: string;
    count: number;
}

interface HelpfulnessAgg {
    label: string;
    count: number;
}

/**
 * API Response shape
 */
interface ReviewsStats {
    volumeOverTime: TimeSeriesPoint[];
    avgRatingTrend: TimeSeriesPoint[];
    verificationStatus: CategoryCount[];
    helpfulnessDistribution: CategoryCount[];
}

/**
 * GET /api/statistics/reviews
 *
 * Example:
 * /api/statistics/reviews?from=2026-02-28T18:00:00.000Z&to=2026-03-11T18:00:00.000Z
 */
async function getReviewsStats(
    req: NextRequest
): Promise<HandlerResult<ReviewsStats>> {
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;

    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));

    const dateFilter = buildDateFilter(from, to);

    /**
     * Review base filter
     */
    const reviewFilter: FilterQuery<IReview> = {
        deletedAt: null,
        ...dateFilter,
    };

    /**
     * --------------------------------------------------
     * 1️⃣ Review volume over time
     * --------------------------------------------------
     */
    const volumeAgg =
        await ReviewModel.aggregate<VolumeAgg>([
            {
                $match: reviewFilter,
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
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

    const volumeOverTime: TimeSeriesPoint[] = volumeAgg;

    /**
     * --------------------------------------------------
     * 2️⃣ Average rating trend
     * --------------------------------------------------
     */
    const ratingFilter: FilterQuery<IReview> = {
        isApproved: true,
        deletedAt: null,
        ...dateFilter,
    };

    const avgRatingAgg =
        await ReviewModel.aggregate<AvgRatingAgg>([
            {
                $match: ratingFilter,
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                        },
                    },
                    value: { $avg: "$rating" },
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

    const avgRatingTrend: TimeSeriesPoint[] = avgRatingAgg;

    /**
     * --------------------------------------------------
     * 3️⃣ Verification status distribution
     * --------------------------------------------------
     */
    const verificationAgg =
        await ReviewModel.aggregate<VerificationAgg>([
            {
                $match: reviewFilter,
            },
            {
                $group: {
                    _id: "$isVerified",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    label: {
                        $cond: ["$_id", "Verified", "Unverified"],
                    },
                    count: 1,
                    _id: 0,
                },
            },
        ]);

    const verificationStatus: CategoryCount[] = verificationAgg;

    /**
     * --------------------------------------------------
     * 4️⃣ Helpfulness distribution
     * --------------------------------------------------
     */
    const helpfulnessAgg =
        await ReviewModel.aggregate<HelpfulnessAgg>([
            {
                $match: reviewFilter,
            },
            {
                $bucket: {
                    groupBy: "$helpfulCount",
                    boundaries: [0, 1, 5, Infinity],
                    default: "Other",
                    output: {
                        count: { $sum: 1 },
                    },
                },
            },
            {
                $project: {
                    label: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 0] }, then: "0" },
                                { case: { $lt: ["$_id", 5] }, then: "1-4" },
                                { case: { $gte: ["$_id", 5] }, then: "5+" },
                            ],
                            default: "Other",
                        },
                    },
                    count: 1,
                    _id: 0,
                },
            },
        ]);

    const helpfulnessDistribution: CategoryCount[] = helpfulnessAgg;

    /**
     * Final response
     */
    return {
        data: {
            volumeOverTime,
            avgRatingTrend,
            verificationStatus,
            helpfulnessDistribution,
        },
    };
}

/**
 * Export GET handler with global error handler
 */
export const GET = withErrorHandler(getReviewsStats);