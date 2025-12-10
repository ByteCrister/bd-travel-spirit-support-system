// api/payment-accounts/v1/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PAYMENT_OWNER_TYPE, PAYMENT_PROVIDER, CardBrand } from "@/constants/payment.const";
import {
    ApiResponse,
    CreateStripePaymentMethodDTO,
    Paginated,
    PaymentAccount,
    SafeCardInfo,
} from "@/types/stripe-payment-account.type";
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

// helper type guard (add near top of file)
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

export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const url = new URL(req.url);
        const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
        const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") ?? 5)));
        const skip = (page - 1) * pageSize;

        const ADMIN_FILTER = { ownerType: PAYMENT_OWNER_TYPE.ADMIN };

        const itemsRaw = await paymentAccountModel
            .find(ADMIN_FILTER)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean<LeanDoc[]>()
            .exec();

        const total = await paymentAccountModel.countDocuments(ADMIN_FILTER);
        const items = itemsRaw.map(normalizeDocToPaymentAccount);

        const pageData: Paginated<PaymentAccount> = { items, total, page, pageSize };
        return NextResponse.json(ok(pageData));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch admin payment accounts";
        return NextResponse.json(fail(message), { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = (await req.json()) as CreateStripePaymentMethodDTO;

        if (!body.ownerType) return NextResponse.json(fail("ownerType is required"), { status: 400 });
        if (!body.purpose) return NextResponse.json(fail("purpose is required"), { status: 400 });
        if (!body.email) return NextResponse.json(fail("email is required"), { status: 400 });
        if (!body.name) return NextResponse.json(fail("name is required"), { status: 400 });
        if (!body.stripeCustomerId && !body.stripePaymentMethodId)
            return NextResponse.json(fail("stripeCustomerId and stripePaymentMethodId are required"), { status: 400 });

        if (!stripe) return NextResponse.json(fail("Stripe is not configured on this server"), { status: 500 });

        // Try to find or create Stripe customer
        let stripeCustomerId = body.stripeCustomerId;
        if (!stripeCustomerId) {
            const existing = await stripe.customers.list({ email: body.email, limit: 1 });
            if (existing.data.length > 0) {
                stripeCustomerId = existing.data[0].id;
            } else {
                const customer = await stripe.customers.create({ email: body.email, name: body.name });
                stripeCustomerId = customer.id;
            }
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(body.stripePaymentMethodId, { customer: stripeCustomerId });
        await stripe.customers.update(stripeCustomerId, { invoice_settings: { default_payment_method: body.stripePaymentMethodId } });

        const pm = await stripe.paymentMethods.retrieve(body.stripePaymentMethodId);
        const card: SafeCardInfo | undefined = pm.type === "card" && pm.card
            ? { brand: pm.card.brand as CardBrand, last4: pm.card.last4, expMonth: pm.card.exp_month, expYear: pm.card.exp_year }
            : undefined;

        // Prevent duplicate account (Stripe only)
        const existingAccount = await paymentAccountModel.findOne({
            ownerType: body.ownerType,
            ownerId: body.ownerId ?? null,
            purpose: body.purpose,
            provider: PAYMENT_PROVIDER.STRIPE,
            stripeCustomerId,
        });

        let saved;
        const now = new Date().toISOString();

        if (existingAccount) {
            await existingAccount.updateOne({ updatedAt: now, card, stripePaymentMethodId: body.stripePaymentMethodId, stripeConnectedAccountId: body.stripeConnectedAccountId });
            saved = await paymentAccountModel.findById(existingAccount._id).lean<LeanDoc>().exec();
        } else {
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
            const created = await paymentAccountModel.create(doc);
            saved = await paymentAccountModel.findById(created._id).lean<LeanDoc>().exec();
        }

        if (!saved) return NextResponse.json(fail("Failed to fetch saved payment account"), { status: 500 });
        return NextResponse.json(ok(normalizeDocToPaymentAccount(saved)));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create payment account";
        return NextResponse.json(fail(message), { status: 500 });
    }
}
