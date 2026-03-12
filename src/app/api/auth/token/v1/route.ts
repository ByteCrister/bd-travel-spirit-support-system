// api/auth/token/v1
import TokenPatchHandler from "@/lib/handlers/guide-application/token/token-patch.handler";
import TokenPostHandler from "@/lib/handlers/guide-application/token/token-post.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * POST handler to send token on users email to apply for an guide application
 */
export const POST = withErrorHandler(TokenPostHandler);

/**
 * API Route Handler (wrapped with error handling)
 */
export const PATCH = withErrorHandler(TokenPatchHandler);