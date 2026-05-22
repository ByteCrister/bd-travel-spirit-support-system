import { NextRequest } from "next/server";
import mongoose from "mongoose";
import Stripe from "stripe";

import { PAYMENT_OWNER_TYPE } from "@/constants/payment.const";
import {
    CreateStripePaymentMethodDTO,
    PaymentAccount,
} from "@/types/site-settings/stripe-payment-account.type";
import ConnectDB from "@/config/db";
import { ApiError, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { validateUpdatedYupSchema } from "@/utils/validators/common/update-updated-yup-schema";
import { createPaymentAccountSchema } from "@/utils/validators/site-settings/payment-account-setting.validator";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import { buildPaymentAccountResponse } from "@/lib/build-responses/build-payment-account-dt";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
});

type MongoId = { toString(): string };

export default async function createPaymentAccountHandler(
    req: NextRequest
): Promise<HandlerResult<PaymentAccount>> {

    // 1 Authenticate user
    const userId = await getUserIdFromSession();
    if (!userId) throw new ApiError("Unauthorized", 401);

    const body = await req.json();

    // 2 Validate request body
    const validated = validateUpdatedYupSchema<CreateStripePaymentMethodDTO>(
        createPaymentAccountSchema,
        body
    );

    await ConnectDB();
    await VERIFY_USER_ROLE.ADMIN(userId);

    // --------------------------------------------------
    // 3 STRIPE VALIDATION (Before DB transaction)
    // --------------------------------------------------

    let paymentMethod: Stripe.PaymentMethod;

    try {
        paymentMethod = await stripe.paymentMethods.retrieve(
            validated.stripePaymentMethodId
        );
    } catch {
        throw new ApiError("Invalid Stripe payment method ID", 400);
    }

    if (!paymentMethod || paymentMethod.object !== "payment_method") {
        throw new ApiError("Stripe payment method not found", 400);
    }

    if (paymentMethod.type !== "card") {
        throw new ApiError("Only card payment methods are allowed", 400);
    }

    if (!paymentMethod.customer) {
        throw new ApiError("Payment method is not attached to a customer", 400);
    }

    if (paymentMethod.customer !== validated.stripeCustomerId) {
        throw new ApiError(
            "Payment method does not belong to the provided customer",
            400
        );
    }

    // Prevent duplicate storage
    const existing = await StripePaymentAccountModel.findOne({
        stripePaymentMethodId: validated.stripePaymentMethodId,
    });

    if (existing) {
        throw new ApiError("This payment method is already saved", 400);
    }

    const card = paymentMethod.card!;

    // --------------------------------------------------
    //  4 DB TRANSACTION
    // --------------------------------------------------

    const paymentAccount = await withTransaction(async (session) => {

        const docData = {
            ownerType: validated.ownerType,
            ownerId:
                validated.ownerType === PAYMENT_OWNER_TYPE.ADMIN
                    ? new mongoose.Types.ObjectId(userId)
                    : null,

            purpose: validated.purpose,
            label: validated.label,
            isBackup: validated.isBackup ?? false,

            stripeCustomerId: validated.stripeCustomerId,
            stripePaymentMethodId: validated.stripePaymentMethodId,

            //  Card data comes ONLY from Stripe
            card: {
                brand: card.brand,
                last4: card.last4,
                expMonth: card.exp_month,
                expYear: card.exp_year,
            },

            isActive: true,
        };

        const [newAccount] = await StripePaymentAccountModel.create(
            [docData],
            { session }
        );

        return await buildPaymentAccountResponse(
            (newAccount._id as MongoId).toString(),
            session
        );
    });

    return { data: paymentAccount, status: 201 };
}