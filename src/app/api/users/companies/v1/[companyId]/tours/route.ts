// api/users/companies/v1/tours

import GetTourListHandler from "@/lib/handlers/users/companies/tours/get.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET // api/users/companies/v1/tours
 * Fetch paginated & filtered tours
 */
export const GET = withErrorHandler(GetTourListHandler);