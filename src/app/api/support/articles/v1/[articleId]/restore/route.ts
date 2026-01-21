import { NextRequest } from "next/server";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { TravelArticleModel } from "@/models/articles/travel-article.model";
import { buildTourArticleDto } from "@/lib/build-responses/build-tour-article-dt";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";

/**
 * POST /api/support/articles/v1/[articleId]/restore
 * Restores a previously deleted (archived) article
 */

export const POST = withErrorHandler(async (
    _request: NextRequest,
    { params }: { params: Promise<{ articleId: string }> }
) => {
    const currentUserId = await getUserIdFromSession();

    if (!currentUserId) {
        throw new ApiError("Insufficient permissions to restore articles", 403);
    }

    const articleId = resolveMongoId((await params).articleId);

    const restoredArticle = await withTransaction(async (session) => {
        // Restore using model method
        const article = await TravelArticleModel.restoreById(articleId, session);

        if (!article) {
            throw new ApiError(
                `Article with ID ${articleId} not found or not deleted`,
                404
            );
        }

        // Build response DTO (include deleted if needed)
        return buildTourArticleDto(articleId, true, session);
    });

    return {
        data: restoredArticle,
        status: 200,
    };
});