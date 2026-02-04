// api/support/article-comments/v1/stats/route.ts

import ArticleCmntGetHandler from "@/lib/handlers/support/article-comments/stats/get.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET article comment status
 */
export const GET = withErrorHandler(ArticleCmntGetHandler);