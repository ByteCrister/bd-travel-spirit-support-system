// api/support/article-comments/v1/route.ts
import { NextRequest } from 'next/server';
import { withTransaction } from '@/lib/helpers/withTransaction';
import {
    ArticleCommentSummaryListResponseDTO,
    ArticleSortKey,
    SortDTO,
    ArticleCommentSummaryRowDTO,
} from '@/types/article-comment.types';
import { COMMENT_STATUS, CommentStatus } from '@/constants/articleComment.const';
import mongoose, { ClientSession } from 'mongoose';
import { TravelArticleModel } from '@/models/articles/travel-article.model';
import ConnectDB from '@/config/db';
import { USER_ROLE, UserRole } from '@/constants/user.const';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import EmployeeModel from '@/models/employees/employees.model';
import UserModel from '@/models/user.model';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';

/**
 * Normalized query parameters with defaults
 */
interface NormalizedQuery {
    page: number;
    pageSize: number;
    sort: SortDTO<ArticleSortKey>;
    filters: {
        status: CommentStatus | 'any';
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

    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const sortKeyParam = searchParams.get('sortKey');
    const sortDirParam = searchParams.get('sortDir');
    const statusParam = searchParams.get('status');
    const searchQueryParam = searchParams.get('searchQuery');
    const authorNameParam = searchParams.get('authorName');
    const taggedRegionParam = searchParams.get('taggedRegion');

    return {
        page: Math.max(1, parseInt(pageParam || '1')),
        pageSize: Math.min(100, Math.max(1, parseInt(pageSizeParam || '20'))),
        sort: {
            key: (sortKeyParam || 'createdAt') as ArticleSortKey,
            direction: (sortDirParam || 'desc') as 'asc' | 'desc'
        },
        filters: {
            status: (statusParam || 'any') as CommentStatus | 'any',
            searchQuery: searchQueryParam || null,
            authorName: authorNameParam || null,
            taggedRegion: taggedRegionParam || null
        }
    };
}

/**
 * MongoDB match conditions interface
 */
interface MatchConditions {
    [key: string]: unknown;
    deleted?: boolean;
    'author.name'?: { $regex: string; $options: 'i' };
    tags?: string;
    $or?: Array<{ [key: string]: { $regex: string; $options: 'i' } }>;
}

/**
 * Build MongoDB aggregation pipeline for article comment summary
 */
function buildAggregationPipeline(
    query: NormalizedQuery,
): mongoose.PipelineStage[] {
    const { filters, sort } = query;

    // Initialize base match conditions
    const matchConditions: MatchConditions = {
        deleted: false
    };

    // Add optional filters
    if (filters.authorName && filters.authorName.trim()) {
        matchConditions['author.name'] = { $regex: filters.authorName, $options: 'i' };
    }

    if (filters.taggedRegion && filters.taggedRegion.trim()) {
        matchConditions.tags = filters.taggedRegion;
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
        matchConditions.$or = [
            { title: { $regex: filters.searchQuery, $options: 'i' } },
            { slug: { $regex: filters.searchQuery, $options: 'i' } },
            { summary: { $regex: filters.searchQuery, $options: 'i' } }
        ];
    }

    // Base match stage for articles (non-deleted)
    const matchStage: mongoose.PipelineStage = {
        $match: matchConditions
    };

    // Build comment match conditions
    const commentMatchConditions: Record<string, unknown> = {
        $expr: { $eq: ['$articleId', '$$articleId'] },
        isDeleted: false
    };

    // Add status filter to comments if specified
    if (filters.status !== 'any') {
        commentMatchConditions.status = filters.status;
    }

    // Lookup comments for each article
    const lookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(TravelArticleModel),
            let: { articleId: '$_id' },
            pipeline: [
                {
                    $match: commentMatchConditions
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        latestComment: { $max: '$createdAt' }
                    }
                }
            ],
            as: 'commentStats'
        }
    };

    // Lookup author (employee) details
    const authorLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(EmployeeModel),
            localField: 'author',
            foreignField: '_id',
            as: 'authorDetails',
            pipeline: [
                // Lookup user from employee
                {
                    $lookup: {
                        from: getCollectionName(UserModel),
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails',
                        pipeline: [
                            // Lookup avatar asset from user
                            {
                                $lookup: {
                                    from: getCollectionName(AssetModel),
                                    localField: 'avatar',
                                    foreignField: '_id',
                                    as: 'avatarAsset',
                                    pipeline: [
                                        // Lookup asset file
                                        {
                                            $lookup: {
                                                from: getCollectionName(AssetFileModel),
                                                localField: 'file',
                                                foreignField: '_id',
                                                as: 'assetFile'
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: '$assetFile',
                                                preserveNullAndEmptyArrays: true
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: {
                                    path: '$avatarAsset',
                                    preserveNullAndEmptyArrays: true
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]
        }
    };

    // Project to reshape data
    const projectStage: mongoose.PipelineStage = {
        $project: {
            article: {
                id: '$_id',
                title: 1,
                slug: 1,
                coverImageUrl: 1,
                createdAt: 1,
                updatedAt: 1,
                author: {
                    $arrayElemAt: [
                        {
                            $map: {
                                input: '$authorDetails',
                                as: 'author',
                                in: {
                                    id: '$$author._id',
                                    name: { $ifNull: ['$$author.name', 'Unknown'] },
                                    avatarUrl: {
                                        $ifNull: [
                                            '$$author.userDetails.avatarAsset.assetFile.publicUrl',
                                            null
                                        ]
                                    },
                                    role: { $ifNull: ['$$author.role', 'USER'] }
                                }
                            }
                        },
                        0
                    ]
                }
            },
            metrics: {
                $let: {
                    vars: {
                        approved: {
                            $ifNull: [
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$commentStats',
                                                as: 'stat',
                                                cond: { $eq: ['$$stat._id', COMMENT_STATUS.APPROVED] }
                                            }
                                        },
                                        0
                                    ]
                                },
                                { count: 0, latestComment: null }
                            ]
                        },
                        pending: {
                            $ifNull: [
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$commentStats',
                                                as: 'stat',
                                                cond: { $eq: ['$$stat._id', COMMENT_STATUS.PENDING] }
                                            }
                                        },
                                        0
                                    ]
                                },
                                { count: 0, latestComment: null }
                            ]
                        },
                        rejected: {
                            $ifNull: [
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$commentStats',
                                                as: 'stat',
                                                cond: { $eq: ['$$stat._id', COMMENT_STATUS.REJECTED] }
                                            }
                                        },
                                        0
                                    ]
                                },
                                { count: 0, latestComment: null }
                            ]
                        }
                    },
                    in: {
                        totalComments: {
                            $sum: {
                                $map: {
                                    input: '$commentStats',
                                    as: 'stat',
                                    in: '$$stat.count'
                                }
                            }
                        },
                        approvedComments: '$$approved.count',
                        pendingComments: '$$pending.count',
                        rejectedComments: '$$rejected.count',
                        latestCommentAt: {
                            $max: [
                                '$$approved.latestComment',
                                '$$pending.latestComment',
                                '$$rejected.latestComment'
                            ]
                        }
                    }
                }
            }
        }
    };

    // Filter by comment status if not 'any'
    let filterByStatusStage: mongoose.PipelineStage | null = null;
    if (filters.status !== 'any') {
        filterByStatusStage = {
            $match: {
                [`metrics.${filters.status as CommentStatus}Comments`]: { $gt: 0 }
            }
        };
    }

    // Sort stage
    const sortStage: mongoose.PipelineStage = {
        $sort: buildSortStage(sort)
    };

    // Facet for pagination
    const facetStage: mongoose.PipelineStage = {
        $facet: {
            data: [
                { $skip: (query.page - 1) * query.pageSize },
                { $limit: query.pageSize }
            ],
            totalCount: [
                { $count: 'count' }
            ]
        }
    };

    // Assemble pipeline
    const pipeline: mongoose.PipelineStage[] = [
        matchStage,
        lookupStage,
        authorLookupStage,
        { $unwind: { path: '$authorDetails', preserveNullAndEmptyArrays: true } },
        projectStage
    ];

    // Add status filter if needed
    if (filterByStatusStage) {
        pipeline.push(filterByStatusStage);
    }

    // Add sort and facet
    pipeline.push(sortStage, facetStage);

    return pipeline;
}

/**
 * Build sort stage based on sort key
 */
function buildSortStage(sort: SortDTO<ArticleSortKey>): Record<string, 1 | -1> {
    const sortOrder = sort.direction === 'asc' ? 1 : -1;

    switch (sort.key) {
        case 'title':
            return { 'article.title': sortOrder };
        case 'totalComments':
            return { 'metrics.totalComments': sortOrder };
        case 'pendingComments':
            return { 'metrics.pendingComments': sortOrder };
        case 'updatedAt':
            return { 'article.updatedAt': sortOrder };
        case 'createdAt':
        default:
            return { 'article.createdAt': sortOrder };
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
    session?: ClientSession
): Promise<{
    data: ArticleCommentSummaryRowDTO[];
    totalItems: number;
}> {
    const pipeline = buildAggregationPipeline(query);

    const result = await TravelArticleModel.aggregate(pipeline)
        .session(session || null)
        .option({ allowDiskUse: true });

    const data = (result[0]?.data as AggregationResultItem[]) || [];
    const totalItems = result[0]?.totalCount?.[0]?.count || 0;

    // Transform to proper DTO format
    const transformedData: ArticleCommentSummaryRowDTO[] = data.map((item: AggregationResultItem) => ({
        article: {
            id: item.article?.id?.toString() || '',
            title: item.article?.title || '',
            slug: item.article?.slug || '',
            coverImageUrl: item.article?.coverImageUrl || null,
            createdAt: item.article?.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: item.article?.updatedAt?.toISOString() || new Date().toISOString(),
            author: {
                id: item.article?.author?.id?.toString() || '',
                name: item.article?.author?.name || 'Unknown Author',
                avatarUrl: item.article?.author?.avatarUrl || null,
                role: item.article?.author?.role ?? USER_ROLE.SUPPORT
            }
        },
        metrics: {
            totalComments: item.metrics?.totalComments || 0,
            approvedComments: item.metrics?.approvedComments || 0,
            pendingComments: item.metrics?.pendingComments || 0,
            rejectedComments: item.metrics?.rejectedComments || 0,
            latestCommentAt: item.metrics?.latestCommentAt?.toISOString() || null
        }
    }));

    return {
        data: transformedData,
        totalItems
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
        const { data, totalItems } = await executeArticleCommentAggregation(query, session);

        const totalPages = Math.ceil(totalItems / query.pageSize);

        const meta: ArticleCommentSummaryListResponseDTO['meta'] = {
            pagination: {
                page: query.page,
                pageSize: query.pageSize,
                totalItems,
                totalPages
            },
            sort: query.sort,
            filtersApplied: query.filters
        };

        return {
            data,
            meta
        };

    });

    return {
        data: result,
        status: 200,
    }
}