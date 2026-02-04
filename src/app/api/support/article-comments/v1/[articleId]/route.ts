// api/support/article-comments/v1/[articleId]/route.ts

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
import { ApiError } from '@/lib/helpers/withErrorHandler';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import UserModel from '@/models/user.model';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import TravelArticleCommentModel from "@/models/articles/travel-article-comment.model";

/**
 * Normalized query parameters for root comments
 */
interface NormalizedRootQuery {
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
function normalizeRootQueryParams(request: NextRequest): NormalizedRootQuery {
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
        pageSize: Math.min(200, Math.max(1, parseInt(pageSizeParam || '100'))),
        sort: {
            key: (sortKeyParam || 'createdAt') as CommentSortKey,
            direction: (sortDirParam || 'desc') as 'asc' | 'desc'
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
 * Build match conditions for root comments
 */
function buildRootMatchConditions(
    articleId: EntityId,
    filters: CommentFiltersDTO
): Record<string, unknown> {
    const matchConditions: Record<string, unknown> = {
        articleId: new Types.ObjectId(articleId),
        parentId: null, // Root comments only
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
 * Build aggregation pipeline for root comments
 */
function buildRootCommentPipeline(
    articleId: EntityId,
    query: NormalizedRootQuery
): PipelineStage[] {
    const matchConditions = buildRootMatchConditions(articleId, query.filters);
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
                localField: 'author',
                foreignField: '_id',
                as: 'authorDetails'
            }
        },
        {
            $unwind: {
                path: '$authorDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        // Lookup avatar asset
        {
            $lookup: {
                from: getCollectionName(AssetModel),
                localField: 'authorDetails.avatar',
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
        // Lookup avatar file
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
        // Final project
        {
            $addFields: {
                author: {
                    _id: '$authorDetails._id',
                    name: '$authorDetails.name',
                    role: '$authorDetails.role',
                    avatarUrl: { $ifNull: ['$avatarFile.publicUrl', null] }
                }
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
                author: 1
            }
        }

    ];

    return pipeline;
}

/**
 * Transform aggregated comment to CommentTreeNodeDTO
 */
function transformToCommentNode(comment: AggregatedComment): CommentTreeNodeDTO {
    const author = comment.author || { _id: null, name: 'Unknown Author', role: 'support', avatarUrl: null };

    return {
        id: comment._id.toString(),
        articleId: comment.articleId.toString(),
        parentId: comment.parentId?.toString() || null,
        author: {
            id: author._id?.toString() || '',
            name: author.name,
            avatarUrl: author.avatarUrl || null,
            role: author.role as UserRole
        },
        content: comment.content,
        likes: comment.likes,
        status: comment.status,
        replyCount: comment.replyCount || 0,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        children: []
    };
}

/**
 * Execute root comment aggregation
 */
async function fetchRootComments(
    articleId: EntityId,
    query: NormalizedRootQuery,
    session?: ClientSession
): Promise<{
    nodes: CommentTreeNodeDTO[];
    nextCursor: string | null;
    hasNextPage: boolean;
}> {
    const pipeline = buildRootCommentPipeline(articleId, query);

    const results = await TravelArticleCommentModel.aggregate<AggregatedComment>(pipeline)
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
function validateRequest(articleId: string): { isValid: boolean; error?: string } {
    if (!mongoose.isValidObjectId(articleId)) {
        return {
            isValid: false,
            error: 'Invalid article ID format'
        };
    }

    return { isValid: true };
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
 * GET /api/support/article-comments/v1/[articleId]
 * Fetch root comments for an article
 */
async function ArticleRootGetHandler(
    request: NextRequest,
    { params }: { params: Promise<{ articleId: string }> }) {

    await ConnectDB();

    const articleId = resolveMongoId((await params).articleId);

    // Validate article ID
    const validation = validateRequest(articleId.toString());
    if (!validation.isValid) {
        throw new ApiError(validation.error!, 400)
    }

    // Normalize query parameters
    const query = normalizeRootQueryParams(request);

    const result = await withTransaction(async (session) => {
        const { nodes, nextCursor, hasNextPage } = await fetchRootComments(
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
                parentId: null, // Root comments
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

export const GET = withErrorHandler(ArticleRootGetHandler)