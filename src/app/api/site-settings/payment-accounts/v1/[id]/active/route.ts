import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import ConnectDB from "@/config/db";
import StripePaymentAccountModel, { IStripePaymentAccount } from "@/models/payment-account.model";
import { PaymentAccount } from "@/types/site-settings/stripe-payment-account.type";
import { Lean } from "@/types/common/mongoose-lean.types";
import { buildPaymentAccountResponse } from "@/lib/build-responses/build-payment-account-dt";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

/**
 * PATCH /api/site-settings/payment-accounts/v1/[id]/active
 * Update the active flag of a payment account.
 */
export const PATCH = withErrorHandler(
    async (
        req: NextRequest,
        { params }: { params: Promise<{ id: string }> }
    ): Promise<HandlerResult<PaymentAccount>> => {

        const id = resolveMongoId((await params).id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid id", 400);
        }

        const body: { isActive?: boolean } = await req.json();

        if (typeof body.isActive !== "boolean") {
            throw new ApiError("isActive boolean is required", 400);
        }

        const userId = await getUserIdFromSession();
        if (!userId) {
            throw new ApiError("Unauthorized", 401);
        }

        await ConnectDB();

        await VERIFY_USER_ROLE.ADMIN(userId);

        // Execute update within a transaction for consistency
        const updated = await withTransaction(async (session) => {
            const result = await StripePaymentAccountModel.findByIdAndUpdate(
                id,
                { isActive: body.isActive, updatedAt: new Date() },
                { new: true, runValidators: true, session }
            )
                .lean<Lean<IStripePaymentAccount>>()
                .exec();

            if (!result) {
                throw new ApiError("Payment account not found", 404);
            }

            return await buildPaymentAccountResponse(id.toString(), session);

        });

        return { data: updated };
    }
);