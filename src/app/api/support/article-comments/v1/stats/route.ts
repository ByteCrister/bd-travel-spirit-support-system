// api/support/article-comments/v1/stats/route.ts

import ArticleCmntGetHandler from "@/lib/handlers/support/article-comments/status/get.handler";
import ArticleCmntPatchHandler from "@/lib/handlers/support/article-comments/status/patch.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET article comment status
 */
export const GET = withErrorHandler(ArticleCmntGetHandler);

/**
 * PATCH update the status of article comment
 */
export const PATCH = withErrorHandler(ArticleCmntPatchHandler);