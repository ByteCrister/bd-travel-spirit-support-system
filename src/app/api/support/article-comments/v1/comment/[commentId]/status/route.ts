import ArticleCmntPatchHandler from "@/lib/handlers/support/article-comments/status/patch.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * PATCH update the stats of article comment
 */
export const PATCH = withErrorHandler(ArticleCmntPatchHandler);