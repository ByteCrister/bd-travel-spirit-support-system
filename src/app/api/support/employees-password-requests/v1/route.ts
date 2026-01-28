// api/support/employee-password-requests/v1

import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

import EmpPassReqListGetHandler from "@/lib/handlers/support/emp-pass-requests/emp-pass-req-get.handler";
import EmpPassReqPostHandler from "@/lib/handlers/support/emp-pass-requests/emp-pass-req-post.handler";


/* -----------------------------------------
   Get list of request for password resets
------------------------------------------ */

export const GET = withErrorHandler(EmpPassReqListGetHandler);

/* -----------------------------------------
   Employee requests for password reset
------------------------------------------ */
export const POST = withErrorHandler(EmpPassReqPostHandler);