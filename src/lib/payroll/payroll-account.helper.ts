import mongoose from "mongoose";
import { PAYMENT_OWNER_TYPE, PAYMENT_PURPOSE } from "@/constants/payment.const";
import { USER_ROLE } from "@/constants/user.const";
import GuideModel from "@/models/guide/guide.model";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import UserModel from "@/models/user.model";

/**
 * Find the admin user and their active Stripe transaction account.
 * Used as the payer source for SUPPORT employee salary payments.
 * Throws if either the admin user or account is missing.
 */
export async function findAdminTransactionAccount() {
    const adminUsers = await UserModel.find({ role: USER_ROLE.ADMIN })
        .select("_id")
        .lean();

    if (!adminUsers || adminUsers.length === 0) {
        throw new Error("Admin users not found");
    }

    const adminIds = adminUsers.map((u) => u._id);

    const account = await StripePaymentAccountModel.findOne({
        ownerType: PAYMENT_OWNER_TYPE.ADMIN,
        ownerId: { $in: adminIds },
        purpose: PAYMENT_PURPOSE.TRANSACTION_ACCOUNT,
        isActive: true,
        isDeleted: { $ne: true },
    })
        .sort({ isBackup: 1, createdAt: -1 })
        .lean();

    if (!account) {
        throw new Error("Admin Stripe transaction account not found");
    }

    const adminUser = adminUsers.find((u) => u._id.toString() === account.ownerId?.toString()) || adminUsers[0];

    return { adminUser, account };
}

/**
 * Find the guide and their active Stripe transaction account for a given guide (companyId).
 * Used as the payer source for ASSISTANT employee salary payments.
 * Throws if the guide or its account is missing.
 */
export async function findGuideTransactionAccount(guideId: mongoose.Types.ObjectId) {
    const guide = await GuideModel.findById(guideId)
        .select("owner.user companyName")
        .lean();

    if (!guide?.owner?.user) {
        throw new Error(`Guide not found for companyId ${guideId.toString()}`);
    }

    const account = await StripePaymentAccountModel.findOne({
        ownerType: PAYMENT_OWNER_TYPE.GUIDE,
        ownerId: guide.owner.user,
        purpose: PAYMENT_PURPOSE.TRANSACTION_ACCOUNT,
        isActive: true,
        isDeleted: { $ne: true },
    })
        .sort({ isBackup: 1, createdAt: -1 })
        .lean();

    if (!account) {
        throw new Error(
            `Guide Stripe transaction account not found for guide ${guideId.toString()}`
        );
    }

    return { guide, account };
}
