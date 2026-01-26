// api/auth/token/v1
import GuideAppTokenPatchHandler from "@/lib/handlers/guide-application/token/token-patch.handler";
import GuideAppTokenPostHandler from "@/lib/handlers/guide-application/token/token-post.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * POST handler to send token on users email to apply for an guide application
 */
export const POST = withErrorHandler(GuideAppTokenPostHandler);

/**
 * API Route Handler (wrapped with error handling)
 */
export const PATCH = withErrorHandler(GuideAppTokenPatchHandler);