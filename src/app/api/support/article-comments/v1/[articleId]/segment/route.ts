// api/support/article-comments/v1/[articleId]/segment/route.ts

import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { NextRequest } from 'next/server';
import { withTransaction } from '@/lib/helpers/withTransaction';
import {
    CommentThreadSegmentDTO,
    CommentSortKey,
    SortDTO,
    CommentFiltersDTO,
    EntityId,
    CommentTreeNodeDTO,
} from '@/types/article-comment.types';
import { CommentStatus } from '@/constants/articleComment.const';
import mongoose, { ClientSession, PipelineStage } from 'mongoose';
import ConnectDB from '@/config/db';
import { USER_ROLE, UserRole } from '@/constants/user.const';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import { PopulatedAssetLean } from '@/types/populated-asset.types';
import { TravelCommentModel } from '@/models/articles/travel-article-comment.model';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';

/**
 * Normalized query parameters with defaults
 */
interface NormalizedQuery {
    parentId: EntityId | null;
    cursor: string | null;
    pageSize: number;
    sort: SortDTO<CommentSortKey>;
    filters: CommentFiltersDTO;
}

/**
 * Interface for the aggregation result item
 */
interface AggregationCommentItem {
    _id: mongoose.Types.ObjectId;
    articleId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId | null;
    content: string;
    likes: number;
    status: CommentStatus;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    replyCount?: number;

    // Populated author fields
    author?: {
        _id: mongoose.Types.ObjectId;
        name: string;
        role: UserRole;
        avatar?: PopulatedAssetLean | null;
    };
}

/**
 * Validate and normalize query parameters
 */
function normalizeQueryParams(
    articleId: EntityId,
    request: NextRequest
): NormalizedQuery {
    const searchParams = request.nextUrl.searchParams;

    const parentIdParam = searchParams.get('parentId');
    const cursorParam = searchParams.get('cursor');
    const pageSizeParam = searchParams.get('pageSize');
    const sortKeyParam = searchParams.get('sortKey');
    const sortDirParam = searchParams.get('sortDir');

    // Filter parameters
    const statusParam = searchParams.get('status');
    const minLikesParam = searchParams.get('minLikes');
    const hasRepliesParam = searchParams.get('hasReplies');
    const authorNameParam = searchParams.get('authorName');
    const searchQueryParam = searchParams.get('searchQuery');

    return {
        parentId: parentIdParam === 'null' || !parentIdParam ? null : parentIdParam,
        cursor: cursorParam || null,
        pageSize: Math.min(200, Math.max(1, parseInt(pageSizeParam || '100'))),
        sort: {
            key: (sortKeyParam || 'createdAt') as CommentSortKey,
            direction: (sortDirParam || (parentIdParam ? 'asc' : 'desc')) as 'asc' | 'desc'
        },
        filters: {
            status: (statusParam || 'any') as CommentStatus | 'any',
            minLikes: minLikesParam ? parseInt(minLikesParam) : null,
            hasReplies: hasRepliesParam ? hasRepliesParam === 'true' : null,
            authorName: authorNameParam || null,
            searchQuery: searchQueryParam || null
        }
    };
}

/**
 * Build MongoDB match conditions based on filters
 */
function buildMatchConditions(
    articleId: EntityId,
    query: NormalizedQuery
): Record<string, unknown> {
    const matchConditions: Record<string, unknown> = {
        articleId: new mongoose.Types.ObjectId(articleId),
        isDeleted: false,
    };

    // Handle parentId
    if (query.parentId === null) {
        matchConditions.parentId = null;
    } else if (query.parentId) {
        matchConditions.parentId = new mongoose.Types.ObjectId(query.parentId);
    }

    // Status filter
    if (query.filters.status !== 'any') {
        matchConditions.status = query.filters.status;
    }

    // Minimum likes filter
    if (query.filters.minLikes !== null && query.filters.minLikes !== undefined) {
        // matchConditions.likes = { $gte: query.filters.minLikes };
        matchConditions.$expr = {
            $gte: [{ $size: { $ifNull: ['$likes', []] } }, query.filters.minLikes]
        };
    }

    // Search in content
    if (query.filters.searchQuery && query.filters.searchQuery.trim()) {
        matchConditions.content = {
            $regex: query.filters.searchQuery,
            $options: 'i'
        };
    }

    // Author name filter (will be applied in aggregation)
    // We'll handle this in the $lookup pipeline

    return matchConditions;
}

/**
 * Build cursor condition for pagination
 */
function buildCursorCondition(
    cursor: string | null,
    sort: SortDTO<CommentSortKey>,
    direction: 'next' | 'prev' = 'next'
): Record<string, unknown>[] {
    if (!cursor) return [];

    try {
        const cursorObj = JSON.parse(cursor);
        const cursorValue = cursorObj.value;
        const cursorId = cursorObj.id;
        const sortKey = sort.key;

        // For simple sort keys, we can use direct comparison
        const sortCondition: Record<string, unknown> = {};
        const idCondition: Record<string, unknown> = {};

        const isAscending = sort.direction === 'asc';
        const comparisonOp = isAscending ? '$gt' : '$lt';
        const idOp = '$gt';

        if (direction === 'next') {
            sortCondition[sortKey] = { [comparisonOp]: cursorValue };
            idCondition._id = { [idOp]: new mongoose.Types.ObjectId(cursorId) };
        }

        return [
            {
                $or: [
                    { [sortKey]: sortCondition[sortKey] },
                    {
                        [sortKey]: cursorValue,
                        _id: idCondition._id
                    }
                ]
            }
        ];
    } catch {
        return [];
    }
}

/**
 * Build sort stage for aggregation
 */
function buildSortStage(sort: SortDTO<CommentSortKey>): Record<string, 1 | -1> {
    const sortOrder = sort.direction === 'asc' ? 1 : -1;

    // Always include _id for consistent pagination
    switch (sort.key) {
        case 'createdAt':
            return { createdAt: sortOrder, _id: 1 };
        case 'updatedAt':
            return { updatedAt: sortOrder, _id: 1 };
        case 'likes':
            return { likes: sortOrder, _id: 1 };
        case 'status':
            return { status: sortOrder, _id: 1 };
        default:
            return { createdAt: sortOrder, _id: 1 };
    }
}

/**
 * Build aggregation pipeline for fetching comments
 */
function buildAggregationPipeline(
    articleId: EntityId,
    query: NormalizedQuery
): PipelineStage[] {
    const matchConditions = buildMatchConditions(articleId, query);
    const cursorConditions = buildCursorCondition(query.cursor, query.sort);

    // Start with base match
    const pipeline: PipelineStage[] = [
        { $match: matchConditions }
    ];

    // Add cursor conditions if any
    if (cursorConditions.length > 0) {
        pipeline.push({ $match: { $and: cursorConditions } });
    }

    // Author lookup pipeline
    const authorLookupStage: PipelineStage.Lookup = {
        $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
                {
                    $lookup: {
                        from: AssetModel.collection.name,
                        localField: 'avatar',
                        foreignField: '_id',
                        as: 'avatarAsset',
                        pipeline: [
                            {
                                $lookup: {
                                    from: AssetFileModel.collection.name,
                                    localField: 'file',
                                    foreignField: '_id',
                                    as: 'file'
                                }
                            },
                            {
                                $unwind: {
                                    path: '$file',
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
                },
                {
                    $project: {
                        name: 1,
                        role: 1,
                        avatarUrl: '$avatarAsset.file.publicUrl'
                    }
                }
            ]
        }
    };

    // Author lookup pipeline
    const authorLookupPipeline: PipelineStage[] = [
        authorLookupStage,
        { $unwind: '$author' }
    ];


    // Apply author name filter if specified
    if (query.filters.authorName && query.filters.authorName.trim()) {
        const authorNameRegex = { $regex: query.filters.authorName, $options: 'i' };

        authorLookupStage.$lookup.pipeline!.push({
            $match: { name: authorNameRegex }
        });
    }

    // Add author lookup to main pipeline
    pipeline.push(...authorLookupPipeline);

    pipeline.push({
        $addFields: {
            likes: { $size: { $ifNull: ['$likes', []] } }
        }
    });

    // Sort stage
    pipeline.push({ $sort: buildSortStage(query.sort) });

    // Limit + 1 to check for next page
    pipeline.push({ $limit: query.pageSize + 1 });

    // Project to shape
    pipeline.push({
        $project: {
            _id: 1,
            articleId: 1,
            parentId: 1,
            content: 1,
            likes: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            replyCount: { $size: { $ifNull: ['$replies', []] } },
            author: {
                id: '$author._id',
                name: '$author.name',
                avatarUrl: '$author.avatarUrl',
                role: '$author.role'
            }
        }
    });

    return pipeline;
}

/**
 * Transform aggregation result to CommentTreeNodeDTO
 */
function transformToCommentNode(
    item: AggregationCommentItem
): CommentTreeNodeDTO {
    return {
        id: item._id.toString(),
        articleId: item.articleId.toString(),
        parentId: item.parentId?.toString() || null,
        author: {
            id: item.author?._id.toString() || '',
            name: item.author?.name || 'Unknown',
            avatarUrl: item.author?.avatar?.file?.publicUrl,
            role: item.author?.role ?? USER_ROLE.TRAVELER
        },
        content: item.content,
        likes: item.likes,
        status: item.status,
        replyCount: item.replyCount || 0,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        children: [] // Will be populated if needed
    };
}

/**
 * Execute comment aggregation with pagination
 */
async function executeCommentAggregation(
    articleId: EntityId,
    query: NormalizedQuery,
    session?: ClientSession
): Promise<{
    nodes: CommentTreeNodeDTO[];
    nextCursor: string | null;
    hasNextPage: boolean;
}> {
    const pipeline = buildAggregationPipeline(articleId, query);

    const results = await TravelCommentModel.aggregate<AggregationCommentItem>(pipeline)
        .session(session || null)
        .option({ allowDiskUse: true });

    // Check if we have more items
    const hasNextPage = results.length > query.pageSize;
    const nodes = hasNextPage ? results.slice(0, -1) : results;

    // Generate next cursor from the last item
    let nextCursor: string | null = null;
    if (hasNextPage && nodes.length > 0) {
        const lastItem = nodes[nodes.length - 1];
        nextCursor = JSON.stringify({
            value: getSortKeyValue(lastItem, query.sort.key),
            id: lastItem._id.toString()
        });
    }

    // Transform to DTO format
    const transformedNodes = nodes.map(transformToCommentNode);

    return {
        nodes: transformedNodes,
        nextCursor,
        hasNextPage
    };
}

/**
 * Helper to get sort key value from item
 */
function getSortKeyValue(item: AggregationCommentItem, sortKey: CommentSortKey): unknown {
    switch (sortKey) {
        case 'createdAt':
            return item.createdAt;
        case 'updatedAt':
            return item.updatedAt;
        case 'likes':
            return item.likes;
        case 'status':
            return item.status;
        default:
            return item.createdAt;
    }
}

/**
 * Main handler for GET /api/support/article-comments/v1/[articleId]/segment
 */
export default async function ArticleSegmentGetHandler(
    request: NextRequest,
    { params }: { params: Promise<{ articleId: string }> }) {
    await ConnectDB();

    const articleId = resolveMongoId((await params).articleId);

    // Validate articleId
    if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
        throw new ApiError('Invalid article ID format', 400);
    }

    // Parse and validate query parameters
    const query = normalizeQueryParams(articleId.toString(), request);

    const result = await withTransaction(async (session) => {
        const { nodes, nextCursor, hasNextPage } = await executeCommentAggregation(
            articleId.toString(),
            query,
            session
        );

        const meta: CommentThreadSegmentDTO['meta'] = {
            pagination: {
                cursor: query.cursor,
                nextCursor,
                pageSize: query.pageSize,
                hasNextPage
            },
            sort: query.sort,
            filtersApplied: query.filters,
            scope: {
                articleId: articleId.toString(),
                parentId: query.parentId,
                depthMax: null // Could be parameterized if needed
            }
        };

        return {
            nodes,
            meta
        };
    });

    return {
        data: result,
        status: 200,
    }
}

/**
 * GET get the comments of segments of main root
 */
export const GET = withErrorHandler(ArticleSegmentGetHandler)