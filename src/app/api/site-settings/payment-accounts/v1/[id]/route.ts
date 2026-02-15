// app/api/site-settings/payment-accounts/v1/[id]/route.ts
import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";
import {
    withErrorHandler,
    HandlerResult,
    ApiError,
} from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import ConnectDB from "@/config/db";
import StripePaymentAccountModel, {
    IStripePaymentAccount,
} from "@/models/payment-account.model";
import {
    PaymentAccount,
    PaymentAccountUpdateDTO,
} from "@/types/site-settings/stripe-payment-account.type";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { buildPaymentAccountResponse } from "@/lib/build-responses/build-payment-account-dt";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

/**
 * GET /api/site-settings/payment-accounts/v1/[id]
 * Fetch a single payment account by ID.
 */
export const GET = withErrorHandler(
    async (
        request: NextRequest,
        { params }: { params: Promise<{ id: string }> },
    ): Promise<HandlerResult<PaymentAccount>> => {
        const id = resolveMongoId((await params).id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid id", 400);
        }

        await ConnectDB();

        const doc = await StripePaymentAccountModel.findById(id)
            .lean<IStripePaymentAccount>()
            .exec();

        if (!doc) {
            throw new ApiError("Payment account not found", 404);
        }

        const paymentAccount = await buildPaymentAccountResponse(id.toString());

        return { data: paymentAccount };
    },
);

/**
 * PATCH /api/site-settings/payment-accounts/v1/[id]
 * Update a payment account (partial update).
 */
export const PATCH = withErrorHandler(
    async (
        request: NextRequest,
        { params }: { params: Promise<{ id: string }> },
    ): Promise<HandlerResult<PaymentAccount>> => {
        const id = resolveMongoId((await params).id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid id", 400);
        }

        const userId = await getUserIdFromSession();
        if (!userId) {
            throw new ApiError("Unauthorized", 401);
        }

        const payload = (await request.json()) as PaymentAccountUpdateDTO;

        await ConnectDB();

        await VERIFY_USER_ROLE.ADMIN(userId);

        // Use a transaction to ensure consistency (optional but following pattern)
        const updated = await withTransaction(async (session) => {
            const updateDoc: Partial<IStripePaymentAccount> = {
                ...payload,
                ownerId: payload.ownerId
                    ? new Types.ObjectId(payload.ownerId)
                    : undefined,
                updatedAt: new Date(),
            };

            const result = await StripePaymentAccountModel.findByIdAndUpdate(
                id,
                updateDoc,
                { new: true, runValidators: true, session },
            )
                .lean<IStripePaymentAccount>()
                .exec();

            if (!result) {
                throw new ApiError("Payment account not found", 404);
            }

            return await buildPaymentAccountResponse(id.toString(), session);
        });

        return { data: updated };
    },
);

/**
 * DELETE /api/site-settings/payment-accounts/v1/[id]
 * Soft delete a payment account.
 */
export const DELETE = withErrorHandler(
    async (
        request: NextRequest,
        { params }: { params: Promise<{ id: string }> },
    ): Promise<HandlerResult<{ success: boolean }>> => {
        const id = resolveMongoId((await params).id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid id", 400);
        }

        const userId = await getUserIdFromSession();
        if (!userId) {
            throw new ApiError("Unauthorized", 401);
        }

        await ConnectDB();

        await VERIFY_USER_ROLE.ADMIN(userId);

        // Use transaction to be safe (even though it's a single update)
        await withTransaction(async (session) => {
            // Manually perform soft delete to use session (instead of static method)
            const result = await StripePaymentAccountModel.findByIdAndUpdate(
                id,
                { isDeleted: true, deletedAt: new Date() },
                { new: true, session },
            ).exec();

            if (!result) {
                throw new ApiError("Payment account not found", 404);
            }

            return result;
        });

        return { data: { success: true } };
    },
);
