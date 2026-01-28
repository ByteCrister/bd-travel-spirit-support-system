// api/support/article-comments/v1/[articleId]/[parentId]/route.ts
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
import mongoose, { ClientSession, PipelineStage, Types } from 'mongoose';
import ConnectDB from '@/config/db';
import { UserRole } from '@/constants/user.const';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { TravelCommentModel } from '@/models/articles/travel-article-comment.model';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import UserModel from '@/models/user.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import AssetModel from '@/models/assets/asset.model';

/**
 * Normalized query parameters for child comments
 */
interface NormalizedChildQuery {
    cursor: string | null;
    pageSize: number;
    sort: SortDTO<CommentSortKey>;
    filters: CommentFiltersDTO;
}

/**
 * Aggregation result interface
 */
interface AggregatedComment {
    _id: Types.ObjectId;
    articleId: Types.ObjectId;
    parentId: Types.ObjectId | null;
    content: string;
    likes: number;
    status: CommentStatus;
    createdAt: Date;
    updatedAt: Date;
    replyCount: number;
    author: {
        _id: Types.ObjectId;
        name: string;
        role: string;
        avatarUrl?: string | null;
    };
}

/**
 * Cursor object structure
 */
interface CursorObject {
    value: unknown;
    id: string;
}

/**
 * Validate and normalize query parameters
 */
function normalizeChildQueryParams(request: NextRequest): NormalizedChildQuery {
    const searchParams = request.nextUrl.searchParams;

    // Pagination params
    const cursorParam = searchParams.get('cursor');
    const pageSizeParam = searchParams.get('pageSize');

    // Sort params
    const sortKeyParam = searchParams.get('sortKey');
    const sortDirParam = searchParams.get('sortDir');

    // Filter params
    const statusParam = searchParams.get('status');
    const minLikesParam = searchParams.get('minLikes');
    const hasRepliesParam = searchParams.get('hasReplies');
    const authorNameParam = searchParams.get('authorName');
    const searchQueryParam = searchParams.get('searchQuery');

    return {
        cursor: cursorParam || null,
        pageSize: Math.min(200, Math.max(1, parseInt(pageSizeParam || '10'))),
        sort: {
            key: (sortKeyParam || 'createdAt') as CommentSortKey,
            direction: (sortDirParam || 'asc') as 'asc' | 'desc'
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
 * Parse cursor string to object
 */
function parseCursor(cursor: string | null): CursorObject | null {
    if (!cursor) return null;

    try {
        return JSON.parse(cursor) as CursorObject;
    } catch {
        return null;
    }
}

/**
 * Generate cursor string from comment data
 */
function generateCursor(
    comment: AggregatedComment,
    sortKey: CommentSortKey
): string {
    let value: unknown;

    switch (sortKey) {
        case 'createdAt':
            value = comment.createdAt;
            break;
        case 'updatedAt':
            value = comment.updatedAt;
            break;
        case 'likes':
            value = comment.likes;
            break;
        case 'status':
            value = comment.status;
            break;
        default:
            value = comment.createdAt;
    }

    return JSON.stringify({
        value,
        id: comment._id.toString()
    });
}

/**
 * Build match conditions for child comments
 */
function buildChildMatchConditions(
    articleId: EntityId,
    parentId: EntityId,
    filters: CommentFiltersDTO
): Record<string, unknown> {
    const matchConditions: Record<string, unknown> = {
        articleId: new Types.ObjectId(articleId),
        parentId: new Types.ObjectId(parentId), // Specific parent comment
        isDeleted: false,
    };

    // Apply status filter
    if (filters.status !== 'any') {
        matchConditions.status = filters.status;
    }

    // Apply minimum likes filter
    if (filters.minLikes !== null && filters.minLikes !== undefined) {
        matchConditions.likes = { $gte: filters.minLikes };
    }

    // Apply hasReplies filter
    if (filters.hasReplies !== null) {
        if (filters.hasReplies === true) {
            matchConditions.replies = { $exists: true, $ne: [], $size: { $gt: 0 } };
        } else {
            matchConditions.$or = [
                { replies: { $exists: false } },
                { replies: { $size: 0 } },
                { replies: null }
            ];
        }
    }

    // Apply content search filter
    if (filters.searchQuery && filters.searchQuery.trim()) {
        matchConditions.content = {
            $regex: filters.searchQuery,
            $options: 'i'
        };
    }

    return matchConditions;
}

/**
 * Build cursor-based pagination condition
 */
function buildCursorCondition(
    cursor: CursorObject | null,
    sort: SortDTO<CommentSortKey>
): Record<string, unknown>[] {
    if (!cursor) return [];

    const { value, id } = cursor;
    const sortKey = sort.key;
    const sortOrder = sort.direction === 'asc' ? 1 : -1;

    // For ascending order: find records with sortKey > value OR (sortKey = value AND _id > id)
    // For descending order: find records with sortKey < value OR (sortKey = value AND _id > id)
    const comparisonOp = sortOrder === 1 ? '$gt' : '$lt';
    const idOp = '$gt';

    return [
        {
            $or: [
                { [sortKey]: { [comparisonOp]: value } },
                {
                    $and: [
                        { [sortKey]: value },
                        { _id: { [idOp]: new Types.ObjectId(id) } }
                    ]
                }
            ]
        }
    ];
}

/**
 * Build sort stage for aggregation
 */
function buildSortStage(sort: SortDTO<CommentSortKey>): Record<string, 1 | -1> {
    const sortOrder = sort.direction === 'asc' ? 1 : -1;

    // Always include _id for consistent cursor pagination
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
 * Build aggregation pipeline for child comments
 */
function buildChildCommentPipeline(
    articleId: EntityId,
    parentId: EntityId,
    query: NormalizedChildQuery
): PipelineStage[] {
    const matchConditions = buildChildMatchConditions(articleId, parentId, query.filters);
    const cursorObj = parseCursor(query.cursor);
    const cursorConditions = buildCursorCondition(cursorObj, query.sort);

    const pipeline: PipelineStage[] = [
        // Initial match
        { $match: matchConditions },

        // Apply cursor conditions if any
        ...(cursorConditions.length > 0 ? [{ $match: { $and: cursorConditions } }] : []),

        // Lookup author details
        {
            $lookup: {
                from: getCollectionName(UserModel),
                let: { authorId: '$author' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$authorId'] }
                        }
                    },
                    {
                        $lookup: {
                            from: getCollectionName(AssetModel),
                            localField: 'avatar',
                            foreignField: '_id',
                            as: 'avatarAsset'
                        }
                    },
                    {
                        $unwind: {
                            path: '$avatarAsset',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: getCollectionName(AssetFileModel),
                            localField: 'avatarAsset.file',
                            foreignField: '_id',
                            as: 'avatarFile'
                        }
                    },
                    {
                        $unwind: {
                            path: '$avatarFile',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            role: 1,
                            avatarUrl: '$avatarFile.publicUrl'
                        }
                    }
                ],
                as: 'authorDetails'
            }
        },
        {
            $unwind: {
                path: '$authorDetails',
                preserveNullAndEmptyArrays: true
            }
        },

        // Apply author name filter if specified
        ...(query.filters.authorName && query.filters.authorName.trim() ? [{
            $match: {
                'authorDetails.name': {
                    $regex: query.filters.authorName,
                    $options: 'i'
                }
            }
        }] : []),

        // Add replyCount virtual field
        {
            $addFields: {
                replyCount: { $size: { $ifNull: ['$replies', []] } }
            }
        },

        {
            $addFields: {
                likes: { $size: { $ifNull: ['$likes', []] } }
            }
        },

        // Sort
        { $sort: buildSortStage(query.sort) },

        // Limit + 1 to check for next page
        { $limit: query.pageSize + 1 },

        // Project final shape
        {
            $project: {
                _id: 1,
                articleId: 1,
                parentId: 1,
                content: 1,
                likes: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                replyCount: 1,
                author: {
                    id: '$authorDetails._id',
                    name: '$authorDetails.name',
                    role: '$authorDetails.role',
                    avatarUrl: '$authorDetails.avatarUrl'
                }
            }
        }
    ];

    return pipeline;
}

/**
 * Transform aggregated comment to CommentTreeNodeDTO
 */
function transformToCommentNode(comment: AggregatedComment): CommentTreeNodeDTO {
    return {
        id: comment._id.toString(),
        articleId: comment.articleId.toString(),
        parentId: comment.parentId?.toString() || null,
        author: {
            id: comment.author._id.toString(),
            name: comment.author.name,
            avatarUrl: comment.author.avatarUrl || null,
            role: comment.author.role as UserRole
        },
        content: comment.content,
        likes: comment.likes,
        status: comment.status,
        replyCount: comment.replyCount || 0,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        children: [] // Can be populated later if needed
    };
}

/**
 * Execute child comment aggregation
 */
async function fetchChildComments(
    articleId: EntityId,
    parentId: EntityId,
    query: NormalizedChildQuery,
    session?: ClientSession
): Promise<{
    nodes: CommentTreeNodeDTO[];
    nextCursor: string | null;
    hasNextPage: boolean;
}> {
    const pipeline = buildChildCommentPipeline(articleId, parentId, query);

    const results = await TravelCommentModel.aggregate<AggregatedComment>(pipeline)
        .session(session || null)
        .option({ allowDiskUse: true });

    // Check if we have more items
    const hasNextPage = results.length > query.pageSize;
    const items = hasNextPage ? results.slice(0, query.pageSize) : results;

    // Generate next cursor from last item
    let nextCursor: string | null = null;
    if (hasNextPage && items.length > 0) {
        const lastItem = items[items.length - 1];
        nextCursor = generateCursor(lastItem, query.sort.key);
    }

    // Transform to DTO
    const nodes = items.map(transformToCommentNode);

    return { nodes, nextCursor, hasNextPage };
}

/**
 * Validate request parameters
 */
function validateRequest(articleId: string, parentId: string): { isValid: boolean; error?: string } {
    if (!mongoose.isValidObjectId(articleId)) {
        return {
            isValid: false,
            error: 'Invalid article ID format'
        };
    }

    if (!mongoose.isValidObjectId(parentId)) {
        return {
            isValid: false,
            error: 'Invalid parent comment ID format'
        };
    }

    return { isValid: true };
}

/**
 * Verify parent comment exists and belongs to the article
 */
async function verifyParentComment(
    articleId: string,
    parentId: string,
    session?: ClientSession
): Promise<boolean> {
    const parentComment = await TravelCommentModel.findOne({
        _id: new Types.ObjectId(parentId),
        articleId: new Types.ObjectId(articleId),
        isDeleted: false
    }).session(session || null);

    return !!parentComment;
}

/**
 * Generate API response
 */
function generateResponse(
    nodes: CommentTreeNodeDTO[],
    meta: CommentThreadSegmentDTO['meta']
): CommentThreadSegmentDTO {
    return {
        nodes,
        meta
    };
}

/**
 * GET /api/support/article-comments/v1/[articleId]/[parentId]
 * Fetch child comments of a specific parent comment
 */

export default async function ArticleChileCmntGetHandler(
    request: NextRequest,
    { params }: { params: Promise<{ articleId: string; parentId: string }> }
) {
    await ConnectDB();

    const { articleId: rawArticleId, parentId: rawParentId } = await params;
    const articleId = resolveMongoId(rawArticleId);
    const parentId = resolveMongoId(rawParentId);

    // Validate IDs
    const validation = validateRequest(articleId.toString(), parentId.toString());
    if (!validation.isValid) {
        throw new ApiError(validation.error!, 400);
    }

    // Normalize query parameters
    const query = normalizeChildQueryParams(request);

    const result = await withTransaction(async (session) => {
        // Verify parent comment exists and belongs to article
        const isValidParent = await verifyParentComment(
            articleId.toString(),
            parentId.toString(),
            session
        );

        if (!isValidParent) {
            throw new ApiError('Parent comment not found or does not belong to this article', 404);
        }

        const { nodes, nextCursor, hasNextPage } = await fetchChildComments(
            articleId.toString(),
            parentId.toString(),
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
                parentId: parentId.toString(), // Child comments of this parent
                depthMax: null
            }
        };

        return generateResponse(nodes, meta);
    });

    return {
        data: result,
        status: 200,
    }
}

export const GET = withErrorHandler(ArticleChileCmntGetHandler)