// api/support/article-comments/v1/route.ts

import ArticleCmntListGetHandler from "@/lib/handlers/article-comments/article-cmnts-get-list.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET list of article comments
 */
export const GET = withErrorHandler(ArticleCmntListGetHandler);