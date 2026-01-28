import { NextRequest } from "next/server";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { TravelArticleModel } from "@/models/articles/travel-article.model";
import { buildTourArticleDto } from "@/lib/build-responses/build-tour-article-dt";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import ConnectDB from "@/config/db";
import { validateUser } from "@/lib/auth/validateUser";
import { USER_ROLE } from "@/constants/user.const";

/**
 * PATCH /api/support/articles/v1/[articleId]
 * Restores a previously deleted (archived) article
 */

export default async function ArticlePatchHandler(
    _request: NextRequest,
    { params }: { params: Promise<{ articleId: string }> }
) {
    const currentUserId = await getUserIdFromSession();

    if (!currentUserId) {
        throw new ApiError("Insufficient permissions to restore articles", 403);
    }

    const articleId = resolveMongoId((await params).articleId);

    await ConnectDB();

    // Check if user has 'support' role
    await validateUser(currentUserId, USER_ROLE.SUPPORT, {
        errorMessages: { invalidRole: "Only support users can create articles" }
    })

    const article = await withTransaction(async (session) => {
        // Restore using model method
        const article = await TravelArticleModel.restoreById(articleId, session);

        if (!article) {
            throw new ApiError(
                `Article with ID ${articleId} not found or not deleted`,
                404
            );
        }

        // Build response DTO (include deleted if needed)
        const dto = await buildTourArticleDto(articleId, true, session)

        if (!dto) {
            throw new ApiError("Failed to fetch article DTO", 500);
        }

        return dto;
    });


    return {
        data: { article, success: true, message: "Article restored successfully" },
        status: 200,
    };
};