// api/support/articles/v1/route.ts
import { withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ArticleGetListHandler from '@/lib/handlers/articles/article-get-list.handler';
import ArticlePostHandler from '@/lib/handlers/articles/article-post.handler';

/**
 * GET get the article list
 */
export const GET = withErrorHandler(ArticleGetListHandler);


/**
 * POST for creating new article
 */
export const POST = withErrorHandler(ArticlePostHandler);