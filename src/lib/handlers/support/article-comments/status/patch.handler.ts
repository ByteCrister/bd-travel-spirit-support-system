import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { HandlerResult, ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import ConnectDB from '@/config/db';

import {
    UpdateCommentStatusPayloadDTO,
    UpdateCommentStatusResponseDTO,
    CommentDetailDTO,
} from '@/types/article/article-comment.types';

import { COMMENT_STATUS } from '@/constants/articleComment.const';
import { UserRole } from '@/constants/user.const';
import { PopulatedAssetLean } from '@/types/common/populated-asset.types';
import TravelArticleCommentModel, { ITravelArticleComment } from '@/models/articles/travel-article-comment.model';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import VERIFY_USER_ROLE from '@/lib/auth/verify-user-role';
import { AUDIT_ACTION, logAuditBestEffort } from '@/lib/audit/audit-logger';

/* -------------------------------------------------------------------------- */
/*                               Populate config                               */
/* -------------------------------------------------------------------------- */

const AUTHOR_WITH_AVATAR_POPULATE = {
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
};

/* -------------------------------------------------------------------------- */
/*                                    Types                                    */
/* -------------------------------------------------------------------------- */

interface LeanAuthor {
    _id: Types.ObjectId;
    name: string;
    role: UserRole;
    avatar?: PopulatedAssetLean;
}

type LeanComment = Omit<ITravelArticleComment, 'author'> & {
    author: LeanAuthor;
};

/* -------------------------------------------------------------------------- */
/*                               Helper functions                               */
/* -------------------------------------------------------------------------- */


function validateStatusUpdatePayload(
    payload: UpdateCommentStatusPayloadDTO
): void {
    const { status, reason } = payload;

    if (status === COMMENT_STATUS.PENDING) {
        throw new ApiError('Cannot set status to pending', 400);
    }

    if (status === COMMENT_STATUS.REJECTED && (!reason || !reason.trim())) {
        throw new ApiError('Reason is required when rejecting a comment', 400);
    }

    if (reason && reason.length > 1000) {
        throw new ApiError('Reason must not exceed 1000 characters', 400);
    }
}

function mapCommentToDTO(comment: LeanComment): CommentDetailDTO {
    return {
        id: (comment._id as Types.ObjectId).toString(),
        articleId: comment.articleId.toString(),
        parentId: comment.parentId?.toString() ?? null,
        author: {
            id: comment.author._id.toString(),
            name: comment.author.name,
            role: comment.author.role,
            avatarUrl: comment.author.avatar?.file?.publicUrl ?? null,
        },
        content: comment.content,
        likes: comment.likes.length,
        status: comment.status,
        replyCount: comment.replies?.length ?? 0,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
    };
}

/* -------------------------------------------------------------------------- */
/*                                 API Handler                                 */
/* -------------------------------------------------------------------------- */

export default async function ArticleCmntPatchHandler(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
): Promise<HandlerResult<UpdateCommentStatusResponseDTO>> {

    const actorId = await getUserIdFromSession();
    if (!actorId) {
        throw new ApiError('Unauthorized', 401);
    }
    // Check if user has 'admin' or 'support' role
    await VERIFY_USER_ROLE.ADMIN_OR_SUPPORT(actorId);

    const payload: UpdateCommentStatusPayloadDTO = await request.json();
    validateStatusUpdatePayload(payload);

    const commentObjectId = resolveMongoId((await params).commentId);
    await ConnectDB();

    return withTransaction(async (session) => {

        const comment = await TravelArticleCommentModel
            .findById(commentObjectId)
            .populate(AUTHOR_WITH_AVATAR_POPULATE)
            .session(session);

        if (!comment) {
            throw new ApiError('Comment not found', 404);
        }

        if (comment.isDeleted) {
            throw new ApiError('Cannot update a deleted comment', 400);
        }

        if (comment.status === payload.status) {
            throw new ApiError(`Comment already ${payload.status}`, 400);
        }

        if (payload.status === COMMENT_STATUS.APPROVED) {
            await comment.approve();
        } else {
            await comment.reject(payload.reason!);
        }

        const updatedComment = await TravelArticleCommentModel
            .findById(comment._id)
            .populate(AUTHOR_WITH_AVATAR_POPULATE)
            .session(session)
            .lean();

        if (!updatedComment) {
            throw new ApiError('Failed to load updated comment', 500);
        }

        const typedComment = updatedComment as unknown as LeanComment;

        void logAuditBestEffort({
            action: AUDIT_ACTION.UPDATE,
            targetModel: "TravelArticleComment",
            target: (typedComment._id as Types.ObjectId).toString(),
            actor: actorId,
            actorModel: "User",
            note: payload.status === COMMENT_STATUS.APPROVED ? "Approved article comment" : "Rejected article comment",
            before: { status: comment.status },
            after: { status: payload.status, reason: payload.reason ?? null },
        });

        return {
            status: 200,
            data: {
                data: mapCommentToDTO(typedComment),
            },
        };
    });
}