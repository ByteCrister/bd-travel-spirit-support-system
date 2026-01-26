// src/app/api/guide-applications/v1/route.ts

import GuideAppPostHandler from "@/lib/handlers/guide-application/guide-application-post.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * POST register application to become a guide
 */
export const POST = withErrorHandler(GuideAppPostHandler);