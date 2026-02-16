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
            const existing = await StripePaymentAccountModel.findById(id)
                .session(session)
                .exec();

            if (!existing || existing.isDeleted) {
                throw new ApiError("Payment account not found", 404);
            }

            const ownerId = existing.ownerId ?? null;
            const purpose = existing.purpose;

            // Check if another active main account exists
            const otherActiveMain = await StripePaymentAccountModel.findOne({
                _id: { $ne: existing._id },
                ownerId,
                purpose,
                isActive: true,
                isBackup: false,
                isDeleted: { $ne: true },
            })
                .session(session)
                .exec();

            const isActive = payload.isActive ?? existing.isActive;
            let isBackup = payload.isBackup ?? existing.isBackup;

            // -------- BUSINESS RULE ENFORCEMENT --------

            if (!otherActiveMain && isActive === true) {
                // First account must be main
                isBackup = false;
            }

            if (isActive === false) {
                // Inactive accounts must be backup
                isBackup = true;
            }

            const updateDoc: Partial<IStripePaymentAccount> = {
                ...payload,
                ownerId: payload.ownerId
                    ? new Types.ObjectId(payload.ownerId)
                    : existing.ownerId,
                isActive,
                isBackup,
                updatedAt: new Date(),
            };

            await StripePaymentAccountModel.findByIdAndUpdate(
                id,
                updateDoc,
                { new: true, runValidators: true, session },
            )
                .lean<IStripePaymentAccount>()
                .exec();

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
            // 1 Load target account
            const account = await StripePaymentAccountModel.findById(id)
                .session(session)
                .exec();

            if (!account || account.isDeleted) {
                throw new ApiError("Payment account not found", 404);
            }

            // 2 If this is a main active account, enforce rule
            if (account.isActive && !account.isBackup) {
                const otherMainAccount = await StripePaymentAccountModel.findOne({
                    _id: { $ne: account._id },
                    ownerType: account.ownerType,
                    ownerId: account.ownerId ?? null,
                    purpose: account.purpose,
                    isActive: true,
                    isBackup: false,
                    isDeleted: { $ne: true },
                })
                    .session(session)
                    .exec();

                if (!otherMainAccount) {
                    throw new ApiError(
                        "Cannot delete the only active main payment account",
                        400
                    );
                }
            }

            // 3 Perform soft delete
            account.isDeleted = true;
            account.deletedAt = new Date();
            await account.save({ session });

            return account;
        });

        return { data: { success: true } };
    },
);