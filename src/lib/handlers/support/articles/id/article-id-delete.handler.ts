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

    // Check if user has 'support' role
    await VERIFY_USER_ROLE.SUPPORT(currentUserId);

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

    return {
        data: { deletedId: articleId, success: true, message: "Article deleted successfully" },
        status: 200,
    };
}