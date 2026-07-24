// api/articles/v1/[articleId]/route.ts
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

import { withTransaction } from '@/lib/helpers/withTransaction';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { TravelArticleModel } from '@/models/articles/travel-article.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import ConnectDB from '@/config/db';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import VERIFY_USER_ROLE from '@/lib/auth/verify-user-role';
import { AUDIT_ACTION, logAuditBestEffort } from '@/lib/audit/audit-logger';

export default async function ArticleDeleteHandler(
    request: NextRequest,
    { params }: { params: Promise<{ articleId: string }> }
) {
    const articleId = resolveMongoId((await params).articleId);

    // Validate ID format
    if (!Types.ObjectId.isValid(articleId)) {
        throw new Error("Invalid article ID format");
    }

    const currentUserId = await getUserIdFromSession();
    if (!currentUserId) {
        throw new ApiError("Unauthorized", 401);
    }

    await ConnectDB();

    // Check if user has 'admin' or 'support' role
    await VERIFY_USER_ROLE.ADMIN_OR_SUPPORT(currentUserId);

    const before = await TravelArticleModel.findById(articleId)
        .select("title status slug deleted deletedAt")
        .lean()
        .exec();

    await withTransaction(async (session) => {
        // Get current user from session (for deletedBy field)
        const currentUserId = await getUserIdFromSession();
        const deletedBy = currentUserId ? new Types.ObjectId(currentUserId) : undefined;

        // Perform soft delete
        const deletedArticle = await TravelArticleModel.softDeleteById(articleId, deletedBy, session);

        if (!deletedArticle) {
            throw new Error("Article not found or already deleted");
        }

        return deletedArticle;
    });

    void logAuditBestEffort({
        action: AUDIT_ACTION.DELETE,
        targetModel: "TravelArticle",
        target: articleId,
        actor: currentUserId,
        actorModel: "User",
        note: "Soft-deleted support article",
        before: before ? (before as Record<string, unknown>) : undefined,
        after: { deleted: true },
    });

    return {
        data: { deletedId: articleId, success: true, message: "Article deleted successfully" },
        status: 200,
    };
}