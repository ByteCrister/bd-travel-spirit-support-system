// api/users/companies/v1/[companyId]/employees

import CompanyEmployeeListGetHandler from "@/lib/handlers/users/companies/employees/get.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET employee list table data
 */
export const GET = withErrorHandler(CompanyEmployeeListGetHandler);