// api/support/article-comments/v1/route.ts
import { NextRequest } from "next/server";
import { withTransaction } from "@/lib/helpers/withTransaction";
import {
    ArticleCommentSummaryListResponseDTO,
    ArticleSortKey,
    SortDTO,
    ArticleCommentSummaryRowDTO,
} from "@/types/article-comment.types";
import {
    COMMENT_STATUS,
    CommentStatus,
} from "@/constants/articleComment.const";
import mongoose, { ClientSession } from "mongoose";
import { TravelArticleModel } from "@/models/articles/travel-article.model";
import ConnectDB from "@/config/db";
import { USER_ROLE, UserRole } from "@/constants/user.const";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import UserModel from "@/models/user.model";
import AssetModel from "@/models/assets/asset.model";
import { TravelArticleCommentModel } from "@/models/articles/travel-article-comment.model"; // ADD THIS IMPORT

/**
 * Normalized query parameters with defaults
 */
interface NormalizedQuery {
    page: number;
    pageSize: number;
    sort: SortDTO<ArticleSortKey>;
    filters: {
        status: CommentStatus | "any";
        searchQuery: string | null;
        authorName: string | null;
        taggedRegion: string | null;
    };
}

/**
 * Validate and normalize query parameters
 */
function normalizeQueryParams(request: NextRequest): NormalizedQuery {
    const searchParams = request.nextUrl.searchParams;

    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const sortKeyParam = searchParams.get("sortKey");
    const sortDirParam = searchParams.get("sortDir");
    const statusParam = searchParams.get("status");
    const searchQueryParam = searchParams.get("searchQuery");
    const authorNameParam = searchParams.get("authorName");
    const taggedRegionParam = searchParams.get("taggedRegion");

    return {
        page: Math.max(1, parseInt(pageParam || "1")),
        pageSize: Math.min(100, Math.max(1, parseInt(pageSizeParam || "20"))),
        sort: {
            key: (sortKeyParam || "createdAt") as ArticleSortKey,
            direction: (sortDirParam || "desc") as "asc" | "desc",
        },
        filters: {
            status: (statusParam || "any") as CommentStatus | "any",
            searchQuery: searchQueryParam || null,
            authorName: authorNameParam || null,
            taggedRegion: taggedRegionParam || null,
        },
    };
}

/**
 * MongoDB match conditions interface
 */
interface MatchConditions {
    [key: string]: unknown;
    deleted?: boolean;
    "authorDetails.name"?: { $regex: string; $options: "i" };
    tags?: { $in?: string[] };
    $or?: Array<{ [key: string]: { $regex: string; $options: "i" } }>;
}

/**
 * Build MongoDB aggregation pipeline for article comment summary
 */
function buildAggregationPipeline(
    query: NormalizedQuery,
): mongoose.PipelineStage[] {
    const { filters, sort } = query;

    // Initialize base match conditions for articles
    const matchConditions: MatchConditions = {
        deleted: false,
        allowComments: true, // Only include articles that allow comments
    };

    // Add optional filters
    if (filters.authorName && filters.authorName.trim()) {
        matchConditions["authorDetails.name"] = {
            $regex: filters.authorName,
            $options: "i",
        };
    }

    if (filters.taggedRegion && filters.taggedRegion.trim()) {
        matchConditions.tags = { $in: [filters.taggedRegion] };
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
        matchConditions.$or = [
            { title: { $regex: filters.searchQuery, $options: "i" } },
            { slug: { $regex: filters.searchQuery, $options: "i" } },
            { summary: { $regex: filters.searchQuery, $options: "i" } },
        ];
    }

    // Base match stage for articles (non-deleted)
    const matchStage: mongoose.PipelineStage = {
        $match: matchConditions,
    };

    // Lookup heroImage asset for article
    const heroImageLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(AssetModel),
            localField: "heroImage", // field in article
            foreignField: "_id",
            as: "heroImageAsset",
        },
    };
    const unwindHeroImageStage: mongoose.PipelineStage = {
        $unwind: { path: "$heroImageAsset", preserveNullAndEmptyArrays: true },
    };

    // Lookup actual file in AssetFileModel to get publicUrl
    const heroImageFileLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: "assetfiles", // or getCollectionName(AssetFileModel)
            localField: "heroImageAsset.file",
            foreignField: "_id",
            as: "heroImageFile",
        },
    };
    const unwindHeroImageFileStage: mongoose.PipelineStage = {
        $unwind: { path: "$heroImageFile", preserveNullAndEmptyArrays: true },
    };


    // Lookup author details
    const authorLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(UserModel),
            localField: "author",  // points directly to UserModel
            foreignField: "_id",
            as: "authorDetails",
            pipeline: [
                // Lookup avatar asset
                {
                    $lookup: {
                        from: getCollectionName(AssetModel),
                        localField: "avatar",
                        foreignField: "_id",
                        as: "avatarAsset",
                    },
                },
                { $unwind: { path: "$avatarAsset", preserveNullAndEmptyArrays: true } },

                // Lookup actual file in AssetFileModel
                {
                    $lookup: {
                        from: "assetfiles", // or getCollectionName(AssetFileModel) if you have helper
                        localField: "avatarAsset.file",
                        foreignField: "_id",
                        as: "avatarFile",
                    },
                },
                { $unwind: { path: "$avatarFile", preserveNullAndEmptyArrays: true } },

                // Project author details
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        role: 1,
                        avatarUrl: { $ifNull: ["$avatarFile.publicUrl", null] }, // <- real public URL
                    },
                },
            ],
        },
    };

    // Unwind author details
    const unwindAuthorStage: mongoose.PipelineStage = {
        $unwind: {
            path: "$authorDetails",
            preserveNullAndEmptyArrays: true,
        },
    };

    // Lookup comments for each article
    const lookupCommentsStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(TravelArticleCommentModel), // FIXED: Use comment model
            let: { articleId: "$_id" },
            pipeline: [
                {
                    $match: {
                        $expr: { $eq: ["$articleId", "$$articleId"] },
                        isDeleted: false, // Only non-deleted comments
                    },
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        latestComment: { $max: "$createdAt" },
                    },
                },
            ],
            as: "commentStats",
        },
    };

    // Project to reshape data
    const projectStage: mongoose.PipelineStage = {
        $project: {
            article: {
                id: "$_id",
                title: "$title",
               slug: "$slug",
                coverImageUrl: { $ifNull: ["$heroImageFile.publicUrl", null] }, 
                createdAt: 1,
                updatedAt: 1,
                author: {
                    id: "$authorDetails._id",
                    name: {
                        $ifNull: [
                            "$authorDetails.name",
                            "$authorDetails.userDetails.name",
                            "Unknown Author",
                        ],
                    },
                    avatarUrl: "$authorDetails.avatarUrl",
                    role: { $ifNull: ["$authorDetails.role", USER_ROLE.SUPPORT] },
                },
            },
            metrics: {
                totalComments: {
                    $sum: {
                        $map: {
                            input: "$commentStats",
                            as: "stat",
                            in: "$$stat.count",
                        },
                    },
                },
                approvedComments: {
                    $let: {
                        vars: {
                            approvedStat: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$commentStats",
                                            as: "stat",
                                            cond: {
                                                $eq: ["$$stat._id", COMMENT_STATUS.APPROVED],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                        in: { $ifNull: ["$$approvedStat.count", 0] },
                    },
                },
                pendingComments: {
                    $let: {
                        vars: {
                            pendingStat: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$commentStats",
                                            as: "stat",
                                            cond: {
                                                $eq: ["$$stat._id", COMMENT_STATUS.PENDING],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                        in: { $ifNull: ["$$pendingStat.count", 0] },
                    },
                },
                rejectedComments: {
                    $let: {
                        vars: {
                            rejectedStat: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$commentStats",
                                            as: "stat",
                                            cond: {
                                                $eq: ["$$stat._id", COMMENT_STATUS.REJECTED],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                        in: { $ifNull: ["$$rejectedStat.count", 0] },
                    },
                },
                latestCommentAt: {
                    $max: {
                        $map: {
                            input: "$commentStats",
                            as: "stat",
                            in: "$$stat.latestComment",
                        },
                    },
                },
            },
        },
    };

    // Filter articles that have at least one comment
    const filterHasCommentsStage: mongoose.PipelineStage = {
        $match: {
            "metrics.totalComments": { $gt: 0 },
        },
    };

    // Additional filter by comment status if not 'any'
    let filterByCommentStatusStage: mongoose.PipelineStage | null = null;
    if (filters.status !== "any") {
        filterByCommentStatusStage = {
            $match: {
                [`metrics.${filters.status as CommentStatus}Comments`]: { $gt: 0 },
            },
        };
    }

    // Sort stage
    const sortStage: mongoose.PipelineStage = {
        $sort: buildSortStage(sort),
    };

    // Facet for pagination
    const facetStage: mongoose.PipelineStage = {
        $facet: {
            data: [
                { $skip: (query.page - 1) * query.pageSize },
                { $limit: query.pageSize },
            ],
            totalCount: [{ $count: "count" }],
        },
    };

    // Assemble pipeline
    const pipeline: mongoose.PipelineStage[] = [
        matchStage,
        authorLookupStage,
        unwindAuthorStage,
        heroImageLookupStage,
        unwindHeroImageStage,
        heroImageFileLookupStage,
        unwindHeroImageFileStage,
        lookupCommentsStage,
        projectStage,
        filterHasCommentsStage,
    ];

    // Add status filter if needed
    if (filterByCommentStatusStage) {
        pipeline.push(filterByCommentStatusStage);
    }

    // Add sort and facet
    pipeline.push(sortStage, facetStage);

    return pipeline;
}

/**
 * Build sort stage based on sort key
 */
function buildSortStage(sort: SortDTO<ArticleSortKey>): Record<string, 1 | -1> {
    const sortOrder = sort.direction === "asc" ? 1 : -1;

    switch (sort.key) {
        case "title":
            return { "article.title": sortOrder };
        case "totalComments":
            return { "metrics.totalComments": sortOrder };
        case "pendingComments":
            return { "metrics.pendingComments": sortOrder };
        case "updatedAt":
            return { "article.updatedAt": sortOrder };
        case "createdAt":
        default:
            return { "article.createdAt": sortOrder };
    }
}

/**
 * Interface for the aggregation result
 */
interface AggregationResultItem {
    article?: {
        id?: mongoose.Types.ObjectId;
        title?: string;
        slug?: string;
        coverImageUrl?: string;
        createdAt?: Date;
        updatedAt?: Date;
        author?: {
            id?: mongoose.Types.ObjectId;
            name?: string;
            avatarUrl?: string;
            role?: UserRole;
        };
    };
    metrics?: {
        totalComments?: number;
        approvedComments?: number;
        pendingComments?: number;
        rejectedComments?: number;
        latestCommentAt?: Date;
    };
}

/**
 * Execute aggregation with pagination
 */
async function executeArticleCommentAggregation(
    query: NormalizedQuery,
    session?: ClientSession,
): Promise<{
    data: ArticleCommentSummaryRowDTO[];
    totalItems: number;
}> {
    const pipeline = buildAggregationPipeline(query);

    const result = await TravelArticleModel.aggregate(pipeline)
        .session(session || null)
        .option({ allowDiskUse: true });

    const data = (result[0]?.data || []) as AggregationResultItem[];
    const totalItems = result[0]?.totalCount?.[0]?.count || 0;

    // Transform to proper DTO format
    const transformedData: ArticleCommentSummaryRowDTO[] = data.map((item) => ({
        article: {
            id: item.article?.id?.toString() || "",
            title: item.article?.title || "",
            slug: item.article?.slug || "",
            coverImageUrl: item.article?.coverImageUrl?.toString() || null,
            createdAt: item.article?.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: item.article?.updatedAt?.toISOString() || new Date().toISOString(),
            author: {
                id: item.article?.author?.id?.toString() || "",
                name: item.article?.author?.name || "Unknown Author",
                avatarUrl: item.article?.author?.avatarUrl || null,
                role: item.article?.author?.role || USER_ROLE.SUPPORT,
            },
        },
        metrics: {
            totalComments: item.metrics?.totalComments || 0,
            approvedComments: item.metrics?.approvedComments || 0,
            pendingComments: item.metrics?.pendingComments || 0,
            rejectedComments: item.metrics?.rejectedComments || 0,
            latestCommentAt: item.metrics?.latestCommentAt?.toISOString() || null,
        },
    }));

    return {
        data: transformedData,
        totalItems,
    };
}

/**
 * Fetch article comment summary with transaction support
 */
export default async function ArticleCmntListGetHandler(request: NextRequest) {
    await ConnectDB();

    // Parse and validate query parameters
    const query = normalizeQueryParams(request);

    const result = await withTransaction(async (session) => {
        const { data, totalItems } = await executeArticleCommentAggregation(
            query,
            session,
        );

        const totalPages = Math.ceil(totalItems / query.pageSize);

        const response: ArticleCommentSummaryListResponseDTO = {
            data,
            meta: {
                pagination: {
                    page: query.page,
                    pageSize: query.pageSize,
                    totalItems,
                    totalPages,
                },
                sort: query.sort,
                filtersApplied: query.filters,
            },
        };

        return response;
    });

    return {
        data: result,
        status: 200,
    }
}