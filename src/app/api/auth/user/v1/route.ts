// app/api/auth/user/v1/route.ts
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import AuthUserGetHandler from "@/lib/handlers/auth-user/auth-user-get.handler";

/**
 * GET /api/auth/user/v1
 * Returns base info for the currently logged-in user
 */
export const GET = withErrorHandler(AuthUserGetHandler)