// api/support/articles/v1/route.ts
import { withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ArticleGetListHandler from '@/lib/handlers/support/articles/article-get-list.handler';
import ArticlePostHandler from '@/lib/handlers/support/articles/article-post.handler';

export const maxDuration = 120; // Allow up to 2 minutes for large article payloads (like base64 images)

/**
 * GET get the article list
 */
export const GET = withErrorHandler(ArticleGetListHandler);


/**
 * POST for creating new article
 */
export const POST = withErrorHandler(ArticlePostHandler);