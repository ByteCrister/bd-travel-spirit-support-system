// api/dashboard/v1/statistics/v1/users/route.ts
import { NextRequest } from "next/server";
import { FilterQuery } from "mongoose";
import ConnectDB from "@/config/db";
import { TravelerModel, ITraveler } from "@/models/travellers/traveler.model";
import GuideModel, { IGuide } from "@/models/guide/guide.model";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { UsersStats } from "@/types/dashboard/statistics.types";

type DateRangeFilter = {
    createdAt?: { $gte?: Date; $lte?: Date };
};

function parseDate(value: string | null): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
}

function buildDateFilter(from?: Date, to?: Date): DateRangeFilter {
    const filter: DateRangeFilter = {};
    if (from) filter.createdAt = { $gte: from };
    if (to) {
        // Make 'to' inclusive of the whole day
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt = { ...filter.createdAt, $lte: endOfDay };
    }
    return filter;
}

async function getUsersStats(req: NextRequest): Promise<HandlerResult<UsersStats>> {
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;
    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));
    const dateFilter = buildDateFilter(from, to);

    // Base filters (exclude soft‑deleted)
    const travelerFilter: FilterQuery<ITraveler> = { deletedAt: null, ...dateFilter };
    const guideFilter: FilterQuery<IGuide> = { deletedAt: null, ...dateFilter };

    // ─────────────────────────────────────────────────────────────
    // 1️⃣ Traveler stats: signups + status distribution in one go
    // ─────────────────────────────────────────────────────────────
    const [travelerStats] = await TravelerModel.aggregate([
        { $match: travelerFilter },
        {
            $facet: {
                signupsOverTime: [
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            value: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                    { $project: { date: "$_id", value: 1, _id: 0 } },
                ],
                statusDistribution: [
                    { $group: { _id: "$accountStatus", count: { $sum: 1 } } },
                    { $project: { label: "$_id", count: 1, _id: 0 } },
                ],
            },
        },
    ]);

    // ─────────────────────────────────────────────────────────────
    // 2️⃣ Guide stats: status counts + average review time
    // ─────────────────────────────────────────────────────────────
    const guideAgg = await GuideModel.aggregate([
        { $match: guideFilter },
        {
            $facet: {
                statusCounts: [
                    { $group: { _id: "$status", count: { $sum: 1 } } },
                ],
                avgReviewTime: [
                    {
                        $match: {
                            status: { $in: [GUIDE_STATUS.APPROVED, GUIDE_STATUS.REJECTED] },
                            reviewedAt: { $exists: true },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            avgMs: { $avg: { $subtract: ["$reviewedAt", "$createdAt"] } },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            avgDays: { $divide: ["$avgMs", 1000 * 60 * 60 * 24] },
                        },
                    },
                ],
            },
        },
    ]);

    const statusCounts: Array<{ _id: string; count: number }> = guideAgg[0]?.statusCounts || [];
    const avgReviewTimeDays: number = guideAgg[0]?.avgReviewTime[0]?.avgDays || 0;

    const pending = statusCounts.find(s => s._id === GUIDE_STATUS.PENDING)?.count ?? 0;
    const approved = statusCounts.find(s => s._id === GUIDE_STATUS.APPROVED)?.count ?? 0;
    const rejected = statusCounts.find(s => s._id === GUIDE_STATUS.REJECTED)?.count ?? 0;

    return {
        data: {
            signupsOverTime: travelerStats?.signupsOverTime || [],
            statusDistribution: travelerStats?.statusDistribution || [],
            guideApplications: {
                pending,
                approved,
                rejected,
                avgReviewTime: avgReviewTimeDays,
            },
        },
    };
}

export const GET = withErrorHandler(getUsersStats);