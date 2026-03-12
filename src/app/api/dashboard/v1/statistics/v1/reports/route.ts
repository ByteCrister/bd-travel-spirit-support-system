// app/api/dashboard/v1/statistics/v1/reports/route.ts

import { NextRequest } from "next/server";
import { FilterQuery } from "mongoose";

import ConnectDB from "@/config/db";

import { ReportModel, IReport } from "@/models/tours/report.model";

import { REPORT_STATUS } from "@/constants/report.const";

import {
    withErrorHandler,
    HandlerResult,
} from "@/lib/helpers/withErrorHandler";

import {
    ReportsStats,
    CategoryCount,
    TimeSeriesPoint,
} from "@/types/dashboard/statistics.types";

/**
 * Mongo date range filter type
 */
type DateRangeFilter = {
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
};

/**
 * Safely parse ISO date
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
 * Build Mongo createdAt filter
 */
function buildDateFilter(from?: Date, to?: Date): DateRangeFilter {
    if (!from && !to) return {};

    const createdAt: DateRangeFilter["createdAt"] = {};

    if (from) createdAt.$gte = from;
    if (to) createdAt.$lte = to;

    return { createdAt };
}

/**
 * Aggregation result types
 */

interface StatusAgg {
    label: string;
    count: number;
}

interface ReasonAgg {
    label: string;
    count: number;
}

interface ResolutionAgg {
    date: string;
    value: number;
}

interface AvgResolutionAgg {
    avgHours: number;
}

/**
 * GET /api/statistics/reports
 *
 * Example:
 * /api/statistics/reports?from=2026-02-28T18:00:00.000Z&to=2026-03-11T18:00:00.000Z
 */
async function getReportsStats(
    req: NextRequest
): Promise<HandlerResult<ReportsStats>> {
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;

    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));

    const dateFilter = buildDateFilter(from, to);

    /**
     * Base report filter
     */
    const reportFilter: FilterQuery<IReport> = {
        deletedAt: null,
        ...dateFilter,
    };

    /**
     * --------------------------------------------------
     * 1️⃣ Report status funnel
     * --------------------------------------------------
     */
    const statusAgg =
        await ReportModel.aggregate<StatusAgg>([
            {
                $match: reportFilter,
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

    const statusFunnel: CategoryCount[] = statusAgg;

    /**
     * --------------------------------------------------
     * 2️⃣ Report reasons breakdown
     * --------------------------------------------------
     */
    const reasonsAgg =
        await ReportModel.aggregate<ReasonAgg>([
            {
                $match: reportFilter,
            },
            {
                $group: {
                    _id: "$reason",
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

    const reasonsBreakdown: CategoryCount[] = reasonsAgg;

    /**
     * --------------------------------------------------
     * 3️⃣ Resolution time trend
     * --------------------------------------------------
     */
    const resolvedFilter: FilterQuery<IReport> = {
        status: REPORT_STATUS.RESOLVED,
        resolvedAt: { $ne: null },
        deletedAt: null,
        ...dateFilter,
    };

    const resolutionAgg =
        await ReportModel.aggregate<ResolutionAgg>([
            {
                $match: resolvedFilter,
            },
            {
                $project: {
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                        },
                    },
                    resolutionHours: {
                        $divide: [
                            { $subtract: ["$resolvedAt", "$createdAt"] },
                            1000 * 60 * 60,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$date",
                    value: { $avg: "$resolutionHours" },
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

    const resolutionTimes: TimeSeriesPoint[] = resolutionAgg;

    /**
     * --------------------------------------------------
     * 4️⃣ Overall average resolution time
     * --------------------------------------------------
     */
    const avgAgg =
        await ReportModel.aggregate<AvgResolutionAgg>([
            {
                $match: resolvedFilter,
            },
            {
                $group: {
                    _id: null,
                    avgHours: {
                        $avg: {
                            $divide: [
                                { $subtract: ["$resolvedAt", "$createdAt"] },
                                1000 * 60 * 60,
                            ],
                        },
                    },
                },
            },
        ]);

    const avgResolutionTime = avgAgg[0]?.avgHours ?? 0;

    /**
     * Final response
     */
    return {
        data: {
            statusFunnel,
            reasonsBreakdown,
            resolutionTimes,
            avgResolutionTime,
        },
    };
}

/**
 * Export GET handler wrapped with error handler
 */
export const GET = withErrorHandler(getReportsStats);