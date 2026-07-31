// app/api/support/tours/v1/[tourId]/history/route.ts
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import TourAnalyticsModel from "@/models/tours/tour-analytics.model";
import {
    TourAnalyticsRunDTO,
    TourHistoryAggregateDTO,
    TourHistoryDTO,
} from "@/types/tour/tour-history.types";

/**
 * GET  /api/support/tours/v1/[tourId]/history
 *
 * Returns ALL analytics runs for a single tour (a tour can be reused
 * multiple times, producing one TourAnalytics document per run).
 * Also returns an aggregate summary across all runs.
 *
 * Accessible by both Admin and Support Member roles.
 */
export const GET = withErrorHandler(async (
    _request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    const rawTourId = (await params).tourId;
    const tourId = resolveMongoId(rawTourId);

    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    await ConnectDB();

    // Fetch ALL analytics records for this tour, sorted newest first
    const analyticsRecords = await TourAnalyticsModel.find({
        tourId: new mongoose.Types.ObjectId(tourId),
    })
        .sort({ createdAt: -1 })
        .lean();

    if (!analyticsRecords || analyticsRecords.length === 0) {
        const emptyDto: TourHistoryDTO = {
            tourId: tourId.toString(),
            aggregate: {
                totalRuns: 0,
                totalBookingsAllRuns: 0,
                totalRevenueAllRuns: 0,
                totalViewsAllRuns: 0,
                totalLikesAllRuns: 0,
                totalSharesAllRuns: 0,
                averageOccupancyRate: 0,
                overallAverageRating: 0,
                totalReviewsAllRuns: 0,
            },
            runs: [],
        };
        return { data: emptyDto, status: 200 };
    }

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Map each record to a run DTO
    const runs: TourAnalyticsRunDTO[] = analyticsRecords.map((a) => ({
        analyticsId:    (a._id as mongoose.Types.ObjectId).toString(),
        tourId:         a.tourId.toString(),
        companyId:      a.companyId.toString(),
        uniqueTourCode: a.uniqueTourCode,

        engagement: {
            viewCount:  a.viewCount,
            likeCount:  a.likeCount,
            shareCount: a.shareCount,
        },

        bookingStats: {
            totalBookings: a.totalBookings,
            totalRevenue:  a.totalRevenue,
            occupancyRate: a.occupancyRate,
            seatsTotal:    a.seatsTotal,
            seatsBooked:   a.seatsBooked,
        },

        reviewSummary: {
            totalReviews:    a.reviewCount,
            averageRating:   a.averageRating,
            ratingBreakdown: { ...ratingBreakdown },
        },

        pricing: {
            baseAmount:         a.basePrice?.amount ?? 0,
            currency:           a.basePrice?.currency ?? "BDT",
            hasActiveDiscounts: (a.discounts?.length ?? 0) > 0,
            discountCount:      a.discounts?.length ?? 0,
        },

        departure: {
            date:         a.departure?.date
                              ? new Date(a.departure.date).toISOString()
                              : null,
            seatsTotal:   a.departure?.seatsTotal ?? 0,
            seatsBooked:  a.departure?.seatsBooked ?? 0,
            meetingPoint: a.departure?.meetingPoint ?? null,
        },

        operatingWindow: a.operatingWindow
            ? {
                  startDate: new Date(a.operatingWindow.startDate).toISOString(),
                  endDate:   new Date(a.operatingWindow.endDate).toISOString(),
              }
            : null,

        createdAt:   new Date(a.createdAt as Date).toISOString(),
        lastUpdated: new Date(a.updatedAt as Date).toISOString(),
    }));

    // Compute aggregate across all runs
    const totalRuns = runs.length;
    const totalBookingsAllRuns  = runs.reduce((s, r) => s + r.bookingStats.totalBookings, 0);
    const totalRevenueAllRuns   = runs.reduce((s, r) => s + r.bookingStats.totalRevenue, 0);
    const totalViewsAllRuns     = runs.reduce((s, r) => s + r.engagement.viewCount, 0);
    const totalLikesAllRuns     = runs.reduce((s, r) => s + r.engagement.likeCount, 0);
    const totalSharesAllRuns    = runs.reduce((s, r) => s + r.engagement.shareCount, 0);
    const totalReviewsAllRuns   = runs.reduce((s, r) => s + r.reviewSummary.totalReviews, 0);

    const averageOccupancyRate = totalRuns > 0
        ? Number((runs.reduce((s, r) => s + r.bookingStats.occupancyRate, 0) / totalRuns).toFixed(2))
        : 0;

    // Weighted average rating across runs (weight = totalReviews per run)
    const weightedRatingSum = runs.reduce((s, r) => s + r.reviewSummary.averageRating * r.reviewSummary.totalReviews, 0);
    const overallAverageRating = totalReviewsAllRuns > 0
        ? Number((weightedRatingSum / totalReviewsAllRuns).toFixed(2))
        : 0;

    const aggregate: TourHistoryAggregateDTO = {
        totalRuns,
        totalBookingsAllRuns,
        totalRevenueAllRuns,
        totalViewsAllRuns,
        totalLikesAllRuns,
        totalSharesAllRuns,
        averageOccupancyRate,
        overallAverageRating,
        totalReviewsAllRuns,
    };

    const dto: TourHistoryDTO = {
        tourId: tourId.toString(),
        aggregate,
        runs,
    };

    return { data: dto, status: 200 };
});
