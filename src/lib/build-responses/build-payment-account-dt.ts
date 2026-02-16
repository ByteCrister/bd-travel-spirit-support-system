import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import { PaymentAccount } from "@/types/site-settings/stripe-payment-account.type";
import { ClientSession, Types } from "mongoose";

/**
 * Builds a PaymentAccount response object from a database document.
 *
 * @param id - The MongoDB ObjectId string of the payment account.
 * @param session - Optional Mongoose client session for transactional consistency.
 * @returns The PaymentAccount object if found, otherwise throws an error.
 */
export async function buildPaymentAccountResponse(
    id: string,
    session?: ClientSession
): Promise<PaymentAccount> {
    const query = StripePaymentAccountModel.findById(id).session(session || null);
    const doc = await query.exec();

    if (!doc) {
        throw new Error(`Payment account with id ${id} not found`);
    }

    // Map database document to PaymentAccount type
    const paymentAccount: PaymentAccount = {
        id: (doc._id as Types.ObjectId).toString(),
        ownerType: doc.ownerType,
        ownerId: doc.ownerId ? doc.ownerId.toString() : null,
        purpose: doc.purpose,
        isActive: doc.isActive,
        isBackup: doc.isBackup,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        label: doc.label,
        stripeCustomerId: doc.stripeCustomerId,
        stripePaymentMethodId: doc.stripePaymentMethodId,
        // stripeConnectedAccountId is not stored in this model; set to undefined
        stripeConnectedAccountId: undefined,
        card: doc.card
            ? {
                brand: doc.card.brand,
                last4: doc.card.last4,
                expMonth: doc.card.expMonth,
                expYear: doc.card.expYear,
            }
            : undefined,
        isDeleted: doc.isDeleted,
        deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
    };

    return paymentAccount;
}