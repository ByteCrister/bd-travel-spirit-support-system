// api/payment-accounts/v1/route.ts
import { NextRequest } from "next/server";
import { PAYMENT_OWNER_TYPE, CardBrand } from "@/constants/payment.const";
import {
    Paginated,
    PaymentAccount,
    SafeCardInfo,
} from "@/types/site-settings/stripe-payment-account.type";
import ConnectDB from "@/config/db";
import paymentAccountModel from "@/models/site-settings/payment-account.model";
import { withTransaction } from "@/lib/helpers/withTransaction";

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

export default async function getPaymentAccounts(req: NextRequest) {
    await ConnectDB();

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.max(
        1,
        Math.min(100, Number(url.searchParams.get("pageSize") ?? 5))
    );
    const skip = (page - 1) * pageSize;

    const ADMIN_FILTER = { ownerType: PAYMENT_OWNER_TYPE.ADMIN };

    // Using withTransaction for read operations ensures data consistency
    const { itemsRaw, total } = await withTransaction(async () => {
        const itemsRaw = await paymentAccountModel
            .find(ADMIN_FILTER)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean<LeanDoc[]>()
            .exec();

        const total = await paymentAccountModel.countDocuments(ADMIN_FILTER);

        return { itemsRaw, total };
    });

    const items = itemsRaw.map(normalizeDocToPaymentAccount);
    const pageData: Paginated<PaymentAccount> = { items, total, page, pageSize };

    return {
        data: pageData,
        status: 200,
    };
}