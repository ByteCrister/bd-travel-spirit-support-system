// app/api/payment-accounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CardBrand, PAYMENT_OWNER_TYPE, PAYMENT_PROVIDER } from "@/constants/payment.const";
import {
    ApiResponse,
    CreateStripePaymentMethodDTO,
    Paginated,
    PaymentAccount,
    SafeCardInfo,
    ProviderMeta,
} from "@/types/payment-account.type";
import ConnectDB from "@/config/db";
import paymentAccountModel from "@/models/payment-account.model";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2025-11-17.clover" }) : null;

function ok<T>(data: T): ApiResponse<T> {
    return { success: true, data };
}
function fail(message: string): ApiResponse<null> {
    return { success: false, error: message };
}

type MongoId = { toString(): string };

/**
 * Lean document shape returned by mongoose .lean()
 * - Partial<PaymentAccount> covers most frontend fields
 * - _id may be an ObjectId-like with toString() or a string
 * - createdAt/updatedAt may be Date or string
 * - card/providerMeta may be provider-specific shapes
 */
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

    providerMeta?: ProviderMeta;
};

/** Convert a mongoose lean doc to frontend PaymentAccount shape */
function normalizeDocToPaymentAccount(doc: LeanDoc): PaymentAccount {
    if (!doc) throw new Error("No document to normalize");

    const id =
        typeof doc._id === "string"
            ? doc._id
            : doc._id && typeof doc._id.toString === "function"
                ? doc._id.toString() : "";

    const createdAtRaw: Date | string | undefined = doc.createdAt;

    const createdAt =
        createdAtRaw instanceof Date
            ? createdAtRaw.toISOString()
            : String(createdAtRaw ?? new Date().toISOString());

    const updatedAtRaw: Date | string | undefined = doc.updatedAt;

    const updatedAt =
        updatedAtRaw instanceof Date
            ? updatedAtRaw.toISOString()
            : String(updatedAtRaw ?? new Date().toISOString());


    const providerMeta = (doc.providerMeta as ProviderMeta) ?? undefined;

    const card: SafeCardInfo | undefined = doc.card
        ? {
            brand: (doc.card.brand as SafeCardInfo["brand"]) ?? ("unknown" as SafeCardInfo["brand"]),
            last4: doc.card.last4 ?? undefined,
            expMonth: (doc.card.expMonth ?? doc.card.exp_month) as number | undefined,
            expYear: (doc.card.expYear ?? doc.card.exp_year) as number | undefined,
        }
        : undefined;

    return {
        id,
        ownerType: doc.ownerType as PaymentAccount["ownerType"],
        ownerId: doc.ownerId ?? null,
        provider: doc.provider as PaymentAccount["provider"],
        purpose: doc.purpose as PaymentAccount["purpose"],
        isActive: !!doc.isActive,
        isBackup: !!doc.isBackup,
        createdAt,
        updatedAt,
        label: doc.label ?? undefined,
        card,
        providerMeta,
    } as PaymentAccount;
}

export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const url = new URL(req.url);
        const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
        const pageSize = Math.max(
            1,
            Math.min(100, Number(url.searchParams.get("pageSize") ?? 5))
        );

        const skip = (page - 1) * pageSize;

        // ADMIN ONLY FILTER
        const ADMIN_FILTER = {
            ownerType: PAYMENT_OWNER_TYPE.ADMIN,
        };

        // FORCE ARRAY TYPE
        const itemsRaw = await paymentAccountModel
            .find(ADMIN_FILTER)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean<LeanDoc[]>()
            .exec();

        const total = await paymentAccountModel.countDocuments(ADMIN_FILTER);

        const items = itemsRaw.map((d) =>
            normalizeDocToPaymentAccount(d)
        );

        const pageData: Paginated<PaymentAccount> = {
            items,
            total,
            page,
            pageSize,
        };

        return NextResponse.json(ok(pageData));
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch admin payment accounts";
        return NextResponse.json(fail(message), { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = (await req.json()) as CreateStripePaymentMethodDTO;

        /* ---------------------------------------------------------
           1. Validation
        --------------------------------------------------------- */
        if (!body.ownerType) return NextResponse.json(fail("ownerType is required"), { status: 400 });
        if (!body.purpose) return NextResponse.json(fail("purpose is required"), { status: 400 });
        if (body.provider !== PAYMENT_PROVIDER.STRIPE)
            return NextResponse.json(fail("Only Stripe provider supported"), { status: 400 });

        if (!body.email) return NextResponse.json(fail("email is required"), { status: 400 });
        if (!body.name) return NextResponse.json(fail("name is required"), { status: 400 });

        if (!body.stripePaymentMethodId)
            return NextResponse.json(
                fail("stripePaymentMethodId is required — send from client using Stripe.js"),
                { status: 400 }
            );

        if (!stripe)
            return NextResponse.json(fail("Stripe is not configured on this server"), { status: 500 });


        /* ---------------------------------------------------------
           2. Get or Create Stripe Customer by email
        --------------------------------------------------------- */

        let stripeCustomerId: string | undefined = undefined;

        // Try to find existing
        const existing = await stripe.customers.list({
            email: body.email,
            limit: 1,
        });

        if (existing.data.length > 0) {
            stripeCustomerId = existing.data[0].id;
        } else {
            // Create new
            const customer = await stripe.customers.create({
                email: body.email,
                name: body.name,
            });
            stripeCustomerId = customer.id;
        }


        /* ---------------------------------------------------------
           3. Attach the Payment Method to this customer
        --------------------------------------------------------- */

        await stripe.paymentMethods.attach(body.stripePaymentMethodId, {
            customer: stripeCustomerId,
        });

        // Make card default (optional but recommended)
        await stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
                default_payment_method: body.stripePaymentMethodId,
            },
        });

        // Retrieve card details
        const pm = await stripe.paymentMethods.retrieve(body.stripePaymentMethodId);

        const cardSafe: SafeCardInfo | undefined =
            pm.type === "card" && pm.card
                ? {
                    brand: pm.card.brand as CardBrand,
                    last4: pm.card.last4,
                    expMonth: pm.card.exp_month,
                    expYear: pm.card.exp_year,
                }
                : undefined;


        /* ---------------------------------------------------------
           4. Prevent duplicate accounts
           (Same owner + same purpose + same stripe customer)
        --------------------------------------------------------- */

        const existingAccount = await paymentAccountModel.findOne({
            ownerType: body.ownerType,
            ownerId: body.ownerId ?? null,
            purpose: body.purpose,
            provider: PAYMENT_PROVIDER.STRIPE,
            "providerMeta.meta.stripeCustomerId": stripeCustomerId,
        });

        let saved: LeanDoc | null = null;

        if (existingAccount) {
            // Update existing
            await existingAccount.updateOne({
                updatedAt: new Date().toISOString(),
                card: cardSafe,
                providerMeta: {
                    provider: PAYMENT_PROVIDER.STRIPE,
                    meta: {
                        stripeCustomerId,
                        stripePaymentMethodId: body.stripePaymentMethodId,
                        card: cardSafe,
                    },
                },
            });

            saved = await paymentAccountModel
                .findById(existingAccount._id)
                .lean<LeanDoc>()
                .exec();

        } else {
            /* ---------------------------------------------------------
               5. Create Fresh Payment Account Document
            --------------------------------------------------------- */
            const now = new Date().toISOString();

            const doc: LeanDoc = {
                ownerType: body.ownerType,
                ownerId: body.ownerId ?? null,
                provider: PAYMENT_PROVIDER.STRIPE,
                purpose: body.purpose,
                isActive: true,
                isBackup: !!body.isBackup,
                createdAt: now,
                updatedAt: now,
                label: body.label,
                card: cardSafe,
                providerMeta: {
                    provider: PAYMENT_PROVIDER.STRIPE,
                    meta: {
                        stripeCustomerId,
                        stripePaymentMethodId: body.stripePaymentMethodId,
                        card: cardSafe,
                    },
                },
            };

            const created = await paymentAccountModel.create(doc);
            saved = await paymentAccountModel
                .findById(created._id)
                .lean<LeanDoc>()
                .exec();
        }

        if (!saved)
            return NextResponse.json(fail("Failed to fetch saved payment account"), { status: 500 });

        const normalized = normalizeDocToPaymentAccount(saved as LeanDoc);

        return NextResponse.json(ok(normalized));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create payment account";
        return NextResponse.json(fail(message), { status: 500 });
    }
}