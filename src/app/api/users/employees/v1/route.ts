// api/users/employees/v1/route.ts

import { EmployeeAddPostHandler } from "@/lib/handlers/users/employees/employee-add-post.handler";
import { UserEmployeeListGetHandler } from "@/lib/handlers/users/employees/employee-list-get.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET employee list table data
 */
export const GET = withErrorHandler(UserEmployeeListGetHandler);
/**
 * POST add new employee
 */
export const POST = withErrorHandler(EmployeeAddPostHandler);