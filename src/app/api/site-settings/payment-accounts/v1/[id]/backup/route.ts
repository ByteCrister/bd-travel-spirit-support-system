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
 * PATCH /api/site-settings/payment-accounts/v1/[id]/backup
 * Update the backup flag of a payment account.
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

    const body: { isBackup?: boolean } = await req.json();

    if (typeof body.isBackup !== "boolean") {
      throw new ApiError("isBackup boolean is required", 400);
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

      // Count other main active accounts
      const otherMainCount = await StripePaymentAccountModel.countDocuments({
        _id: { $ne: account._id },
        ownerId,
        purpose,
        isActive: true,
        isBackup: false,
        isDeleted: { $ne: true },
      }).session(session);

      const totalMainCount = otherMainCount + (account.isActive && !account.isBackup ? 1 : 0);

      // If trying to set as backup
      if (body.isBackup === true) {

        // If this is the only main account
        if (totalMainCount === 1 && account.isActive && !account.isBackup) {
          throw new ApiError(
            "Cannot convert the only main account into backup",
            400
          );
        }

        account.isBackup = true;
      }

      account.updatedAt = new Date();
      await account.save({ session });

      return await buildPaymentAccountResponse(id.toString(), session);
    });

    return { data: updated };
  }
);