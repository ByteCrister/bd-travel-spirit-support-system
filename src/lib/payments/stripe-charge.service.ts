import mongoose, { ClientSession } from "mongoose";
import Stripe from "stripe";
import { stripe } from "@/config/stripe";
import { TRANSACTION_STATUS } from "@/constants/transaction.const";
import StripePaymentAccountModel, {
    IStripePaymentAccount,
} from "@/models/payments/payment-account.model";
import { TransactionModel } from "@/models/payments/transaction.model";

export type StripeChargeParams = {
    paymentAccountId: mongoose.Types.ObjectId | string;
    amountCents: number;
    currency: string;
    description: string;
    idempotencyKey?: string;
    session?: ClientSession;
    metadata?: Stripe.MetadataParam;
};

export type StripeChargeResult = {
    paymentIntentId: string;
    transactionId: mongoose.Types.ObjectId;
    amountCents: number;
    currency: string;
};

/**
 * Charge a saved Stripe payment account off-session and persist a transaction record.
 * Idempotent when `idempotencyKey` is supplied and a matching transaction already exists.
 */
export async function chargeStripePaymentAccount(
    params: StripeChargeParams
): Promise<StripeChargeResult> {
    const {
        paymentAccountId,
        amountCents,
        currency,
        description,
        idempotencyKey,
        session,
        metadata,
    } = params;

    if (amountCents <= 0) {
        throw new Error("Charge amount must be greater than zero");
    }

    if (idempotencyKey) {
        const existing = await TransactionModel.findOne({
            description: { $regex: idempotencyKey },
        })
            .session(session ?? null)
            .lean();

        if (existing) {
            return {
                paymentIntentId: existing.stripePaymentIntentId,
                transactionId: existing._id as mongoose.Types.ObjectId,
                amountCents: existing.amount,
                currency: existing.currency,
            };
        }
    }

    const accountQuery = StripePaymentAccountModel.findById(paymentAccountId);
    if (session) accountQuery.session(session);

    const account = await accountQuery.lean<IStripePaymentAccount>();
    if (!account || account.isDeleted) {
        throw new Error("Payment account not found or inactive");
    }

    if (!account.isActive) {
        throw new Error("Payment account is not active");
    }

    const paymentIntent = await stripe.paymentIntents.create(
        {
            amount: amountCents,
            currency: currency.toLowerCase(),
            customer: account.stripeCustomerId,
            payment_method: account.stripePaymentMethodId,
            off_session: true,
            confirm: true,
            description,
            metadata: {
                ...metadata,
                idempotencyKey: idempotencyKey ?? "",
            },
        },
        idempotencyKey ? { idempotencyKey } : undefined
    );

    if (paymentIntent.status !== "succeeded") {
        throw new Error(`Stripe payment failed with status: ${paymentIntent.status}`);
    }

    const [transaction] = await TransactionModel.create(
        [
            {
                paymentAccountId: account._id,
                stripePaymentIntentId: paymentIntent.id,
                amount: amountCents,
                currency: currency.toLowerCase(),
                status: TRANSACTION_STATUS.SUCCEEDED,
                description: idempotencyKey
                    ? `${description} [${idempotencyKey}]`
                    : description,
            },
        ],
        session ? { session } : undefined
    );

    return {
        paymentIntentId: paymentIntent.id,
        transactionId: transaction._id as mongoose.Types.ObjectId,
        amountCents,
        currency: currency.toLowerCase(),
    };
}

/**
 * Record a settlement ledger entry without charging Stripe again.
 * Used when booking revenue was already captured into the block account.
 */
export async function recordSettlementTransaction(
    params: {
        paymentAccountId: mongoose.Types.ObjectId | string;
        amountCents: number;
        currency: string;
        description: string;
        settlementRef: string;
        session?: ClientSession;
    }
): Promise<{ transactionId: mongoose.Types.ObjectId; settlementRef: string }> {
    const { paymentAccountId, amountCents, currency, description, settlementRef, session } =
        params;

    const existing = await TransactionModel.findOne({
        stripePaymentIntentId: settlementRef,
    })
        .session(session ?? null)
        .lean();

    if (existing) {
        return {
            transactionId: existing._id as mongoose.Types.ObjectId,
            settlementRef,
        };
    }

    const accountQuery = StripePaymentAccountModel.findById(paymentAccountId);
    if (session) accountQuery.session(session);

    const account = await accountQuery.lean();
    if (!account || account.isDeleted || !account.isActive) {
        throw new Error("Payment account not found or inactive");
    }

    const [transaction] = await TransactionModel.create(
        [
            {
                paymentAccountId: account._id,
                stripePaymentIntentId: settlementRef,
                amount: amountCents,
                currency: currency.toLowerCase(),
                status: TRANSACTION_STATUS.SUCCEEDED,
                description,
            },
        ],
        session ? { session } : undefined
    );

    return {
        transactionId: transaction._id as mongoose.Types.ObjectId,
        settlementRef,
    };
}
