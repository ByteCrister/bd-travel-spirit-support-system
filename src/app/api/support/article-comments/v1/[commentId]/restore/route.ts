// api/support/article-comments/v1/[commentId]/restore/route.ts
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import ConnectDB from '@/config/db';
import { validateUser } from '@/lib/auth/validateUser';
import { USER_ROLE } from '@/constants/user.const';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { TravelCommentModel } from '@/models/articles/travel-article-comment.model';

/**
 * POST to restore soft-deleted article comments
 */
export const POST = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) => {

    // 1 Get current user
    const currentUserId = await getUserIdFromSession();
    if (!currentUserId) {
        throw new ApiError('Unauthorized', 401);
    }

    await ConnectDB();

    // 2 Validate support user
    await validateUser(currentUserId, USER_ROLE.SUPPORT);

    // 3 Resolve and validate comment ID
    const commentId = resolveMongoId((await params).commentId);
    if (!commentId || !Types.ObjectId.isValid(commentId)) {
        throw new ApiError('Invalid comment ID format', 401);
    }

    // 4 Find the soft-deleted comment
    const comment = await TravelCommentModel.findOne({
        _id: commentId,
        isDeleted: true,
    });

    if (!comment) {
        throw new ApiError('Comment not found or already restored', 401);
    }

    // 5 Restore the comment
    await comment.restore();

    // 6 Fetch restored comment with nested author avatar → file → publicUrl
    const restoredComment = await TravelCommentModel.findById(commentId)
        .populate({
            path: 'author',
            select: 'name role avatar',
            populate: {
                path: 'avatar',
                select: 'file',
                populate: {
                    path: 'file',
                    select: 'publicUrl',
                },
            },
        })
        .lean();

    if (!restoredComment) {
        throw new ApiError('Failed to retrieve restored comment', 401);
    }

    // 7 Map publicUrl as avatarUrl
    const avatarUrl = restoredComment.author?.avatar?.file?.publicUrl ?? null;

    // 8 Construct response
    const responseData = {
        id: restoredComment._id.toString(),
        articleId: restoredComment.articleId.toString(),
        parentId: restoredComment.parentId
            ? restoredComment.parentId.toString()
            : null,
        author: {
            id: restoredComment.author._id.toString(),
            name: restoredComment.author.name,
            avatarUrl,
            role: restoredComment.author.role,
        },
        content: restoredComment.content,
        likes: restoredComment.likes,
        status: restoredComment.status,
        replyCount: restoredComment.replies?.length || 0,
        createdAt: restoredComment.createdAt.toISOString(),
        updatedAt: restoredComment.updatedAt.toISOString(),
    };

    return {
        data: responseData,
        status: 200,
    };
});