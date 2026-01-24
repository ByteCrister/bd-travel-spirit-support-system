// api/articles/v1/[articleId]/route.ts
import { withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ArticlePutHandler from '@/lib/handlers/articles/id/article-id-put.handler';
import ArticleGetHandler from '@/lib/handlers/articles/id/article-id-get.handler';
import ArticleDeleteHandler from '@/lib/handlers/articles/id/article-id-delete.handler';
import ArticlePatchHandler from '@/lib/handlers/articles/id/article-id-patch.handler';

/**
 * GET handler for fetching a single article by ID
 */
export const GET = withErrorHandler(ArticleGetHandler);

/**
 * Update an Article
 */
export const PUT = withErrorHandler(ArticlePutHandler);

/**
 * Restore an Article/back to draft status from archived
 */
export const PATCH = withErrorHandler(ArticlePatchHandler);

/**
 * Soft delete an article
 */
export const DELETE = withErrorHandler(ArticleDeleteHandler);