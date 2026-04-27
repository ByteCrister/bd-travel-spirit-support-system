import GetTourListHandler from "@/lib/handlers/users/companies/tours/get.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET api/users/companies/v1/[companyId]/tours
 * Fetch paginated & filtered tours
 */
export const GET = withErrorHandler(GetTourListHandler);