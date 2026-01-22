// src/app/api/articles/[articleId]/route.ts
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { buildTourArticleDto } from '@/lib/build-responses/build-tour-article-dt';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { TravelArticleModel } from '@/models/articles/travel-article.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';

/**
 * GET handler for fetching a single article by ID
 */
export const GET = withErrorHandler(async (
    _request: NextRequest,
    { params }: { params: Promise<{ articleId: string }> }
) => {
    const articleId = resolveMongoId((await params).articleId);

    if (!articleId || !Types.ObjectId.isValid(articleId)) {
        throw new ApiError('Invalid article ID format', 400);
    }

    // Get the withDeleted query parameter
    const withDeleted = _request.nextUrl.searchParams.get('withDeleted');
    // Convert to boolean: if the string is 'true', then true, otherwise false.
    const withDeletedBool = withDeleted === 'true';

    // Execute with transaction for data consistency
    const articleDetail = await withTransaction(async (session) => {
        const article = await buildTourArticleDto(articleId, withDeletedBool, session);

        if (!article) {
            throw new ApiError('Article not found', 404);
        }

        return article;
    });

    return {
        data: articleDetail,
        status: 200
    };
});

/**
 * DELETE /api/mock/articles/[id]
 * Soft delete an article
 */
export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ articleId: string }> }
) => {
    const articleId = resolveMongoId((await params).articleId);

    // Validate ID format
    if (!Types.ObjectId.isValid(articleId)) {
        throw new Error("Invalid article ID format");
    }

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
        data: { deletedId: (await params).articleId },
        status: 200,
    };
});