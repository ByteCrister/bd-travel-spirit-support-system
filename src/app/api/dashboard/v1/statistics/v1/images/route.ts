// app/api/dashboard/v1/statistics/v1/images/route.ts

import { NextRequest } from "next/server";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { ImagesStats, TimeSeriesPoint, CategoryCount } from "@/types/dashboard/statistics.types";
import ConnectDB from "@/config/db";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import { getCollectionName } from "@/lib/helpers/get-collection-name";

type DateRangeFilter = {
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
};

function parseDate(value: string | null): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function buildDateFilter(from: string | null, to: string | null): DateRangeFilter {
    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    if (!fromDate && !toDate) return {};
    const createdAt: DateRangeFilter["createdAt"] = {};
    if (fromDate) createdAt.$gte = fromDate;
    if (toDate) createdAt.$lte = toDate;
    return { createdAt };
}

async function getImagesStats(req: NextRequest): Promise<HandlerResult<ImagesStats>> {
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const dateFilter = buildDateFilter(from, to);

    // 1. Uploads over time
    const uploadsAgg = await AssetModel.aggregate<{ date: string; value: number }>([
        { $match: { deletedAt: null, ...dateFilter } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                value: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", value: 1, _id: 0 } },
    ]);
    const uploadsOverTime: TimeSeriesPoint[] = uploadsAgg;

    // 2. Moderation status (visibility)
    const modAgg = await AssetModel.aggregate<{ label: string; count: number }>([
        { $match: { deletedAt: null, ...dateFilter } },
        { $group: { _id: "$visibility", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
    ]);
    const moderationStatus: CategoryCount[] = modAgg;

    // 3. Storage providers
    const providerAgg = await AssetFileModel.aggregate<{ label: string; count: number }>([
        { $group: { _id: "$storageProvider", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
    ]);
    const storageProviders: CategoryCount[] = providerAgg;

    // 4.  Total storage – count each file only once if it has at least one non‑deleted asset
    const totalAgg = await AssetFileModel.aggregate<{ total: number }>([
        {
            $lookup: {
                from: getCollectionName(AssetModel),
                let: { fileId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$file", "$$fileId"] }, deletedAt: null } },
                    { $limit: 1 } // we only need to know if at least one exists
                ],
                as: "assets"
            }
        },
        { $match: { assets: { $ne: [] } } }, // keep only files with at least one non‑deleted asset
        { $group: { _id: null, total: { $sum: "$fileSize" } } }
    ]);

    const totalStorage = totalAgg[0]?.total ?? 0;

    return {
        data: {
            uploadsOverTime,
            moderationStatus,
            storageProviders,
            totalStorage,
        },
    };
}

export const GET = withErrorHandler(getImagesStats);