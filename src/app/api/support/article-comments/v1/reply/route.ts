// app/api/support/article-comments/v1/reply/route.ts
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { NextRequest } from 'next/server';
import { withTransaction } from '@/lib/helpers/withTransaction';
import {
    CreateCommentPayloadDTO,
    CommentDetailDTO,
} from '@/types/article-comment.types';
import { COMMENT_STATUS, CommentStatus } from '@/constants/articleComment.const';
import mongoose, { ClientSession, Types } from 'mongoose';
import ConnectDB from '@/config/db';
import { USER_ROLE, UserRole } from '@/constants/user.const';
import { TravelCommentModel } from '@/models/articles/travel-article-comment.model';
import { TravelArticleModel } from '@/models/articles/travel-article.model';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import UserModel from '@/models/user.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { PipelineStage } from "mongoose";

/**
 * Validate create comment payload
 */
function validateCreatePayload(payload: CreateCommentPayloadDTO): { isValid: boolean; error?: string } {
    if (!payload.articleId || !mongoose.isValidObjectId(payload.articleId)) {
        return { isValid: false, error: 'Invalid article ID format' };
    }

    if (!payload.content?.trim()) {
        return { isValid: false, error: 'Content is required' };
    }

    if (payload.content.trim().length > 5000) {
        return { isValid: false, error: 'Content exceeds maximum length of 5000 characters' };
    }

    // If parentId is provided, validate it
    if (payload.parentId && !mongoose.isValidObjectId(payload.parentId)) {
        return { isValid: false, error: 'Invalid parent comment ID format' };
    }

    return { isValid: true };
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
 * Build aggregation pipeline for fetching a comment with author details
 */
function buildCommentAggregationPipeline(commentId: Types.ObjectId): PipelineStage[] {
    return [
        { $match: { _id: commentId, isDeleted: false } },
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
                            _id: 1,
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
        {
            $addFields: {
                likes: { $size: { $ifNull: ['$likes', []] } },
                replyCount: { $size: { $ifNull: ['$replies', []] } }
            }
        },
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
}

/**
 * Transform aggregated comment to CommentDetailDTO
 */
function transformToCommentDetailDTO(comment: AggregatedComment): CommentDetailDTO {
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
        updatedAt: comment.updatedAt.toISOString()
    };
}

/**
 * Create a new comment/reply
 */
async function createComment(
    payload: CreateCommentPayloadDTO,
    authorId: Types.ObjectId,
    session?: ClientSession
): Promise<CommentDetailDTO> {
    const articleId = new Types.ObjectId(payload.articleId);
    const parentId = payload.parentId ? new Types.ObjectId(payload.parentId) : null;

    // Check if article exists and allows comments
    const article = await TravelArticleModel.findOne({
        _id: articleId,
        deleted: false,
        status: { $ne: 'DRAFT' } // Only allow comments on published articles
    }).session(session || null);

    if (!article) {
        throw new ApiError('Article not found or not published', 404);
    }

    if (!article.allowComments) {
        throw new ApiError('Comments are disabled for this article', 403);
    }

    // If replying to a comment, validate parent comment exists
    if (parentId) {
        const parentComment = await TravelCommentModel.findOne({
            _id: parentId,
            articleId,
            isDeleted: false
        }).session(session || null);

        if (!parentComment) {
            throw new ApiError('Parent comment not found or belongs to different article', 404);
        }
    }

    // Determine initial status based on user role
    const author = await UserModel.findById(authorId).session(session || null);
    const initialStatus = author?.role === USER_ROLE.SUPPORT ?
        COMMENT_STATUS.APPROVED :
        COMMENT_STATUS.PENDING;

    // Create the comment
    const newComment = new TravelCommentModel({
        articleId,
        parentId,
        author: authorId,
        content: payload.content.trim(),
        status: initialStatus,
        likes: [],
        replies: [],
        isDeleted: false
    });

    const savedComment = await newComment.save({ session });

    // If this is a reply, update parent comment's replies array
    if (parentId) {
        await TravelCommentModel.findByIdAndUpdate(
            parentId,
            { $push: { replies: savedComment._id } },
            { session }
        );
    }

    // Fetch the created comment with full author details
    const pipeline = buildCommentAggregationPipeline(savedComment._id as Types.ObjectId);
    const [aggregatedComment] = await TravelCommentModel.aggregate(pipeline)
        .session(session || null)
        .option({ allowDiskUse: true });

    if (!aggregatedComment) {
        throw new ApiError('Failed to create comment', 500);
    }

    return transformToCommentDetailDTO(aggregatedComment);
}

/**
 * POST /api/support/article-comments/v1/reply
 * Create a new comment or reply
 */
async function CreateReplyHandler(
    request: NextRequest
) {
    await ConnectDB();

    // Get current user (assuming you have authentication middleware)
    const currentUserId = await getUserIdFromSession();
    if (!currentUserId) {
        throw new ApiError('Authentication required', 401);
    }

    // Parse request body
    const payload: CreateCommentPayloadDTO = await request.json();

    // Validate payload
    const validation = validateCreatePayload(payload);
    if (!validation.isValid) {
        throw new ApiError(validation.error!, 400);
    }

    const result = await withTransaction(async (session) => {
        const createdComment = await createComment(
            payload,
            new Types.ObjectId(currentUserId),
            session
        );

        return createdComment;
    });

    return {
        data: result,
        status: 200,
    }
}

export const POST = withErrorHandler(CreateReplyHandler);