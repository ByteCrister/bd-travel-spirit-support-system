import { NextRequest } from "next/server";
import { PipelineStage } from "mongoose";

import { UserModel } from "@/models/user.model";
import { TravelerModel } from "@/models/travelers/traveler.model";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";

import ConnectDB from "@/config/db";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";

import {
    TravelerFilter,
    TravelerListItem,
    TravelerListResponse,
    TravelerListStats,
} from "@/types/user/traveler.types";

import { ACCOUNT_STATUS, AccountStatus } from "@/constants/user.const";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";

type TravelerFacetResult = {
    stats: TravelerListStats[];
    paginatedResults: TravelerListItem[];
    totalCount: { total: number }[];
};

function parseFilters(searchParams: URLSearchParams): TravelerFilter {
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));

    const search = sanitizeSearch(searchParams.get("search")) ?? undefined;

    const accountStatusParam = searchParams.getAll("accountStatus");

    const accountStatus: AccountStatus[] | undefined =
        accountStatusParam.length > 0
            ? accountStatusParam.filter(
                (status): status is AccountStatus =>
                    (Object.values(ACCOUNT_STATUS) as string[]).includes(status)
            )
            : undefined;

    const isVerified = searchParams.has("isVerified")
        ? searchParams.get("isVerified") === "true"
        : undefined;

    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    return {
        page,
        limit,
        search,
        accountStatus: accountStatus?.length ? accountStatus : undefined,
        isVerified,
        sortBy,
        sortOrder,
    };
}
/**
 * GET /api/users/travelers/v1
 */
async function handleGet(req: NextRequest): Promise<HandlerResult<TravelerListResponse>> {
    await ConnectDB();

    const filters = parseFilters(req.nextUrl.searchParams);

    const {
        page = 1,
        limit = 10,
        search,
        accountStatus,
        isVerified,
        sortBy,
        sortOrder,
    } = filters;

    const safeLimit = limit;
    const safePage = page;

    const pipeline: PipelineStage[] = [];

    pipeline.push({
        $match: { deletedAt: null },
    });

    /**
     * Filters
     */
    const filterStages: PipelineStage.FacetPipelineStage[] = [];

    if (accountStatus?.length) {
        filterStages.push({
            $match: { accountStatus: { $in: accountStatus } },
        });
    }

    if (isVerified !== undefined) {
        filterStages.push({
            $match: { isVerified },
        });
    }

    /**
     * Search
     */
    const searchStages: PipelineStage.FacetPipelineStage[] = [];

    if (search) {
        searchStages.push({
            $match: {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                    { "user.email": { $regex: search, $options: "i" } },
                    { "address.area": { $regex: search, $options: "i" } },
                    { "address.upazila": { $regex: search, $options: "i" } },
                    { "address.district": { $regex: search, $options: "i" } },
                ],
            },
        });
    }

    /**
     * Lookups
     */
    const lookupStages: PipelineStage.FacetPipelineStage[] = [
        {
            $lookup: {
                from: getCollectionName(UserModel),
                localField: "user",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },

        {
            $lookup: {
                from: getCollectionName(AssetModel),
                localField: "user.avatar",
                foreignField: "_id",
                as: "user.avatar",
            },
        },
        {
            $unwind: {
                path: "$user.avatar",
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $lookup: {
                from: getCollectionName(AssetFileModel),
                localField: "user.avatar.file",
                foreignField: "_id",
                as: "user.avatar.file",
            },
        },
        {
            $unwind: {
                path: "$user.avatar.file",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

    /**
     * Projection
     */
    const projectStage: PipelineStage.FacetPipelineStage = {
        $project: {
            _id: 1,
            userId: "$user._id",
            name: 1,
            email: "$user.email",
            role: "$user.role",
            accountStatus: 1,
            isVerified: 1,
            createdAt: 1,
            updatedAt: 1,
            avatarUrl: { $ifNull: ["$user.avatar.file.publicUrl", null] },
            phone: 1,
        },
    };

    /**
     * Sorting
     */
    const sortStage: PipelineStage.FacetPipelineStage = {
        $sort: {
            [sortBy as string]: sortOrder === "asc" ? 1 : -1,
        },
    };

    /**
     * Pagination
     */
    const paginationStages: PipelineStage.FacetPipelineStage[] = [
        { $skip: (safePage - 1) * safeLimit },
        { $limit: safeLimit },
    ];

    /**
     * Count stage
     */
    const countStage: PipelineStage.FacetPipelineStage = { $count: "total" };

    /**
     * Facet
     */
    const facetStage: PipelineStage.Facet = {
        $facet: {
            stats: [
                {
                    $group: {
                        _id: null,
                        totalTravelers: { $sum: 1 },

                        activeCount: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$accountStatus", ACCOUNT_STATUS.ACTIVE] },
                                    1,
                                    0,
                                ],
                            },
                        },

                        suspendedCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $or: [
                                            { $eq: ["$accountStatus", ACCOUNT_STATUS.SUSPENDED] },
                                            {
                                                $and: [
                                                    { $ne: ["$suspension", null] },
                                                    { $gt: ["$suspension.until", new Date()] },
                                                ],
                                            },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },

                        lockedCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ["$lockUntil", null] },
                                            { $gt: ["$lockUntil", new Date()] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },

                        verifiedCount: {
                            $sum: { $cond: ["$isVerified", 1, 0] },
                        },

                        unverifiedCount: {
                            $sum: { $cond: ["$isVerified", 0, 1] },
                        },
                    },
                },
            ],

            paginatedResults: [
                ...filterStages,
                ...lookupStages,
                ...searchStages,
                projectStage,
                sortStage,
                ...paginationStages,
            ],

            totalCount: [...filterStages, ...searchStages, countStage],
        },
    };

    pipeline.push(facetStage);

    const result = await TravelerModel.aggregate<TravelerFacetResult>(pipeline);

    const facet = result?.[0] ?? {
        stats: [],
        paginatedResults: [],
        totalCount: [],
    };

    const stats: TravelerListStats = facet.stats?.[0] ?? {
        totalTravelers: 0,
        activeCount: 0,
        suspendedCount: 0,
        lockedCount: 0,
        verifiedCount: 0,
        unverifiedCount: 0,
    };

    const data: TravelerListItem[] = facet.paginatedResults ?? [];

    const total = facet.totalCount?.[0]?.total ?? 0;

    const totalPages = safeLimit > 0 ? Math.ceil(total / safeLimit) : 0;

    const response: TravelerListResponse = {
        data,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
        stats,
    };

    return { data: response };
}

export const GET = withErrorHandler(handleGet);