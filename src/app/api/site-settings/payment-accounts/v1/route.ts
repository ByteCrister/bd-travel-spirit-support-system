// api/site-settings/payment-accounts/v1/route.ts

import getPaymentAccounts from "@/lib/handlers/payment-accounts/get.handler";
import createPaymentAccountHandler from "@/lib/handlers/payment-accounts/post.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";


export const GET = withErrorHandler(getPaymentAccounts);

export const POST = withErrorHandler(createPaymentAccountHandler);