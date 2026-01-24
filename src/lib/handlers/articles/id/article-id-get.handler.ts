// api/articles/v1/[articleId]/route.ts
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

import { ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { buildTourArticleDto } from '@/lib/build-responses/build-tour-article-dt';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import ConnectDB from '@/config/db';

export default async function ArticleGetHandler(
    _request: NextRequest,
    { params }: { params: Promise<{ articleId: string }> }
) {
    const articleId = resolveMongoId((await params).articleId);

    if (!articleId || !Types.ObjectId.isValid(articleId)) {
        throw new ApiError('Invalid article ID format', 400);
    }

    // Get the withDeleted query parameter
    const withDeleted = _request.nextUrl.searchParams.get('withDeleted');
    // Convert to boolean: if the string is 'true', then true, otherwise false.
    const withDeletedBool = withDeleted === 'true';

    await ConnectDB();

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
}