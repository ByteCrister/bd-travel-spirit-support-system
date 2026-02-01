// api/support/article-comments/v1/comment/[commentId]/route.ts

import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { NextRequest } from 'next/server';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { DeleteCommentPayloadDTO, DeleteCommentResponseDTO } from '@/types/article-comment.types';
import ConnectDB from '@/config/db';
import { Types } from 'mongoose';
import { TravelCommentModel } from '@/models/articles/travel-article-comment.model';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

/**
 * Wrapped DELETE handler with error handling
 */
export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) => {
    const commentId = resolveMongoId((await params).commentId);
    const body: DeleteCommentPayloadDTO = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reason } = body;

    // Validate commentId format
    if (!Types.ObjectId.isValid(commentId)) {
        throw new ApiError('Invalid comment ID format', 400);
    }

    const currentUserId = await getUserIdFromSession();

    if (!currentUserId || !Types.ObjectId.isValid(currentUserId)) {
        throw new ApiError('Unauthorized', 404);
    }

    await ConnectDB();

    await VERIFY_USER_ROLE.SUPPORT(currentUserId);

    // Execute in transaction to ensure data consistency
    const result = await withTransaction(async (session) => {
        // Find the comment with session
        const comment = await TravelCommentModel.findById(commentId).session(session);

        if (!comment) {
            throw new ApiError('Comment not found', 404);
        }

        // Check if already deleted
        if (comment.isDeleted) {
            throw new ApiError('Comment is already deleted', 409);
        }

        // If comment has parent, remove it from parent's replies array
        if (comment.parentId) {
            await TravelCommentModel.findByIdAndUpdate(
                comment.parentId,
                { $pull: { replies: comment._id } },
                { session }
            );
        }

        // Soft delete the comment
        const deletedComment = await comment.softDelete();

        // Prepare response data
        const responseData: DeleteCommentResponseDTO = {
            data: {
                commentId: deletedComment._id.toString(),
                deletedAt: deletedComment.deletedAt!.toISOString(),
                status: deletedComment.status,
            }
        };

        return { data: responseData, status: 200 };
    });

    return result;
});