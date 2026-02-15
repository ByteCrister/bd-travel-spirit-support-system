// api/payment-accounts/v1/route.ts
import { NextRequest } from "next/server";
import Stripe from "stripe";
import {
    PAYMENT_PROVIDER,
    CardBrand,
} from "@/constants/payment.const";
import {
    CreateStripePaymentMethodDTO,
    PaymentAccount,
    SafeCardInfo,
} from "@/types/site-settings/stripe-payment-account.type";
import ConnectDB from "@/config/db";
import paymentAccountModel from "@/models/site-settings/payment-account.model";
import { ApiError, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const stripe = stripeSecret
    ? new Stripe(stripeSecret, { apiVersion: "2025-11-17.clover" })
    : null;

type MongoId = { toString(): string };
type LeanDoc = Omit<Partial<PaymentAccount>, "id" | "ownerId"> & {
    _id?: MongoId | string;
    ownerId?: MongoId | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    card?: Partial<SafeCardInfo> & {
        exp_month?: number;
        exp_year?: number;
        last4?: string;
        brand?: string;
    };
};

// helper type guard
function isDate(value: unknown): value is Date {
    return Object.prototype.toString.call(value) === "[object Date]";
}

/** Convert Mongoose doc to frontend PaymentAccount shape */
function normalizeDocToPaymentAccount(doc: LeanDoc): PaymentAccount {
    if (!doc) throw new Error("No document to normalize");

    const id =
        typeof doc._id === "string"
            ? doc._id
            : doc._id && typeof doc._id.toString === "function"
                ? doc._id.toString()
                : "";

    const createdAtRaw: Date | string | undefined = doc.createdAt;
    const createdAt = isDate(createdAtRaw)
        ? createdAtRaw.toISOString()
        : String(createdAtRaw ?? new Date().toISOString());

    const updatedAtRaw: Date | string | undefined = doc.updatedAt;
    const updatedAt = isDate(updatedAtRaw)
        ? updatedAtRaw.toISOString()
        : String(updatedAtRaw ?? new Date().toISOString());

    const card: SafeCardInfo | undefined = doc.card
        ? {
            brand: (doc.card.brand as CardBrand) ?? ("unknown" as CardBrand),
            last4: doc.card.last4,
            expMonth: doc.card.expMonth ?? doc.card.exp_month,
            expYear: doc.card.expYear ?? doc.card.exp_year,
        }
        : undefined;

    return {
        id,
        ownerType: doc.ownerType!,
        ownerId: doc.ownerId?.toString() ?? null,
        purpose: doc.purpose!,
        isActive: !!doc.isActive,
        isBackup: !!doc.isBackup,
        createdAt,
        updatedAt,
        label: doc.label ?? undefined,
        card,
        stripeCustomerId: doc.stripeCustomerId!,
        stripePaymentMethodId: doc.stripePaymentMethodId!,
        stripeConnectedAccountId: doc.stripeConnectedAccountId,
        isDeleted: doc.isDeleted ?? undefined,
        deletedAt: doc.deletedAt ? new Date(doc.deletedAt).toISOString() : null,
    };
}

/**
 * Main handler function for creating payment accounts
 */
export default async function createPaymentAccountHandler(
    req: NextRequest
): Promise<HandlerResult<PaymentAccount>> {
    await ConnectDB();

    const body = (await req.json()) as CreateStripePaymentMethodDTO;

    // Validate required fields
    if (!body.ownerType) throw new ApiError("ownerType is required", 400);
    if (!body.purpose) throw new ApiError("purpose is required", 400);
    if (!body.email) throw new ApiError("email is required", 400);
    if (!body.name) throw new ApiError("name is required", 400);
    if (!body.stripeCustomerId && !body.stripePaymentMethodId) {
        throw new ApiError("stripeCustomerId and stripePaymentMethodId are required", 400);
    }

    if (!stripe) {
        throw new ApiError("Stripe is not configured on this server", 500);
    }

    // Execute within a transaction
    const result = await withTransaction(async (session) => {
        // Try to find or create Stripe customer
        let stripeCustomerId = body.stripeCustomerId;
        if (!stripeCustomerId) {
            const existing = await stripe.customers.list({
                email: body.email,
                limit: 1,
            });
            if (existing.data.length > 0) {
                stripeCustomerId = existing.data[0].id;
            } else {
                const customer = await stripe.customers.create({
                    email: body.email,
                    name: body.name,
                });
                stripeCustomerId = customer.id;
            }
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(body.stripePaymentMethodId, {
            customer: stripeCustomerId,
        });
        await stripe.customers.update(stripeCustomerId, {
            invoice_settings: { default_payment_method: body.stripePaymentMethodId },
        });

        const pm = await stripe.paymentMethods.retrieve(body.stripePaymentMethodId);
        const card: SafeCardInfo | undefined =
            pm.type === "card" && pm.card
                ? {
                    brand: pm.card.brand as CardBrand,
                    last4: pm.card.last4,
                    expMonth: pm.card.exp_month,
                    expYear: pm.card.exp_year,
                }
                : undefined;

        // Prevent duplicate account (Stripe only) - using session
        const existingAccount = await paymentAccountModel.findOne(
            {
                ownerType: body.ownerType,
                ownerId: body.ownerId ?? null,
                purpose: body.purpose,
                provider: PAYMENT_PROVIDER.STRIPE,
                stripeCustomerId,
            },
            null,
            { session }
        );

        let saved: LeanDoc | null;
        const now = new Date().toISOString();

        if (existingAccount) {
            // Update existing account with session
            await paymentAccountModel.updateOne(
                { _id: existingAccount._id },
                {
                    $set: {
                        updatedAt: now,
                        card,
                        stripePaymentMethodId: body.stripePaymentMethodId,
                        stripeConnectedAccountId: body.stripeConnectedAccountId,
                    },
                },
                { session }
            );
            
            saved = await paymentAccountModel
                .findById(existingAccount._id)
                .session(session)
                .lean<LeanDoc>()
                .exec();
        } else {
            // Create new account with session
            const doc: LeanDoc = {
                ownerType: body.ownerType,
                ownerId: body.ownerId ?? null,
                purpose: body.purpose,
                isActive: true,
                isBackup: !!body.isBackup,
                createdAt: now,
                updatedAt: now,
                label: body.label,
                card,
                stripeCustomerId,
                stripePaymentMethodId: body.stripePaymentMethodId,
                stripeConnectedAccountId: body.stripeConnectedAccountId,
            };
            
            // Use create with session
            const [created] = await paymentAccountModel.create([doc], { session });
            saved = await paymentAccountModel
                .findById(created._id)
                .session(session)
                .lean<LeanDoc>()
                .exec();
        }

        if (!saved) {
            throw new ApiError("Failed to fetch saved payment account", 500);
        }

        return normalizeDocToPaymentAccount(saved);
    });

    // Return successful result
    return {
        data: result,
        status: 200
    };
}