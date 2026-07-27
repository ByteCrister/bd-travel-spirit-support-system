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
    const baseMatch = { deletedAt: null, ...dateFilter };

    // 1. Uploads over time (one data-point per day)
    const uploadsAgg = await AssetModel.aggregate<{ date: string; value: number }>([
        { $match: baseMatch },
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

    // 2. Asset type breakdown (image / video / document / audio / pdf / other)
    const assetTypeAgg = await AssetModel.aggregate<{ label: string; count: number }>([
        { $match: baseMatch },
        { $group: { _id: "$assetType", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
    ]);
    const assetTypeBreakdown: CategoryCount[] = assetTypeAgg;

    // 3. Visibility distribution (public / private / unlisted)
    const visibilityAgg = await AssetModel.aggregate<{ label: string; count: number }>([
        { $match: baseMatch },
        { $group: { _id: "$visibility", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
    ]);
    const visibilityDistribution: CategoryCount[] = visibilityAgg;

    // 4. Total asset count (for stat card)
    const totalAssets = await AssetModel.countDocuments(baseMatch);

    // 5. Storage providers (from AssetFile — only files that belong to a live asset)
    const providerAgg = await AssetFileModel.aggregate<{ label: string; count: number }>([
        {
            $lookup: {
                from: getCollectionName(AssetModel),
                let: { fileId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$file", "$$fileId"] }, deletedAt: null } },
                    { $limit: 1 },
                ],
                as: "assets",
            },
        },
        { $match: { assets: { $ne: [] } } },
        { $group: { _id: "$storageProvider", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
    ]);
    const storageProviders: CategoryCount[] = providerAgg;

    // 6. Content type distribution — top MIME types (from live AssetFiles)
    const contentTypeAgg = await AssetFileModel.aggregate<{ label: string; count: number }>([
        {
            $lookup: {
                from: getCollectionName(AssetModel),
                let: { fileId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$file", "$$fileId"] }, deletedAt: null } },
                    { $limit: 1 },
                ],
                as: "assets",
            },
        },
        { $match: { assets: { $ne: [] } } },
        { $group: { _id: "$contentType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { label: "$_id", count: 1, _id: 0 } },
    ]);
    const contentTypeDistribution: CategoryCount[] = contentTypeAgg;

    // 7. Storage summary — total storage, total files, avg file size (live files only)
    const storageSummaryAgg = await AssetFileModel.aggregate<{
        total: number;
        count: number;
        avg: number;
    }>([
        {
            $lookup: {
                from: getCollectionName(AssetModel),
                let: { fileId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$file", "$$fileId"] }, deletedAt: null } },
                    { $limit: 1 },
                ],
                as: "assets",
            },
        },
        { $match: { assets: { $ne: [] } } },
        {
            $group: {
                _id: null,
                total: { $sum: "$fileSize" },
                count: { $sum: 1 },
                avg: { $avg: "$fileSize" },
            },
        },
    ]);

    const totalStorage = storageSummaryAgg[0]?.total ?? 0;
    const totalFiles = storageSummaryAgg[0]?.count ?? 0;
    const avgFileSize = Math.round(storageSummaryAgg[0]?.avg ?? 0);

    return {
        data: {
            uploadsOverTime,
            assetTypeBreakdown,
            visibilityDistribution,
            contentTypeDistribution,
            storageProviders,
            totalStorage,
            totalFiles,
            avgFileSize,
            totalAssets,
        },
    };
}

export const GET = withErrorHandler(getImagesStats);