import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import ConnectDB from "@/config/db";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import { PaymentAccount } from "@/types/site-settings/stripe-payment-account.type";
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
            const account = await StripePaymentAccountModel.findById(id)
                .session(session)
                .exec();

            if (!account || account.isDeleted) {
                throw new ApiError("Payment account not found", 404);
            }

            const ownerId = account.ownerId ?? null;
            const purpose = account.purpose;

            // Check other active main accounts
            const otherActiveMain = await StripePaymentAccountModel.findOne({
                _id: { $ne: account._id },
                ownerId,
                purpose,
                isActive: true,
                isBackup: false,
                isDeleted: { $ne: true },
            })
                .session(session)
                .exec();

            if (body.isActive === false) {
                // Trying to deactivate

                if (!otherActiveMain) {
                    throw new ApiError(
                        "Cannot deactivate the only active main account",
                        400
                    );
                }

                account.isActive = false;
                account.isBackup = true;
            }

            account.updatedAt = new Date();
            await account.save({ session });

            return await buildPaymentAccountResponse(id.toString(), session);
        });

        return { data: updated };
    }
);