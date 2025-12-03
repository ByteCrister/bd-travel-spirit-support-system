// app/api/payment-accounts/[id]/backup/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import ConnectDB from "@/config/db";
import paymentAccountModel, { IPaymentAccount } from "@/models/payment-account.model";
import {
    PaymentAccount,
    SafeCardInfo,
    ProviderMeta,
} from "@/types/payment-account.type";
import { PAYMENT_PROVIDER, PaymentProvider } from "@/constants/payment.const";
import { Lean } from "@/types/mongoose-lean.types";

/* ---------------------------
   Helpers
--------------------------- */

/**
 * Safely map optional card info
 */
function mapCard(card?: SafeCardInfo | null): SafeCardInfo | undefined {
    if (!card) return undefined;
    return {
        brand: card.brand ?? "unknown",
        last4: card.last4,
        expMonth: card.expMonth,
        expYear: card.expYear,
    };
}

/**
 * Safely map providerMeta
 */
function mapProviderMeta(
    providerMeta?: Lean<IPaymentAccount>["providerMeta"] | null
): ProviderMeta | undefined {
    if (!providerMeta) return undefined;

    if (providerMeta.provider === PAYMENT_PROVIDER.STRIPE) {
        return {
            provider: PAYMENT_PROVIDER.STRIPE,
            meta: {
                ...providerMeta.meta,
                card: mapCard(providerMeta.meta?.card),
            },
        };
    }

    // TODO: Add support for other providers if needed
    return undefined;
}

/**
 * Convert lean document to frontend PaymentAccount
 */
function mapToPaymentAccount(doc: Lean<IPaymentAccount>): PaymentAccount {
    return {
        id: (doc._id as Types.ObjectId).toString(),
        ownerType: doc.ownerType,
        ownerId: doc.ownerId?.toString() ?? null,
        provider: doc.provider as PaymentProvider,
        purpose: doc.purpose,
        isActive: doc.isActive,
        isBackup: doc.isBackup,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        label: doc.label,
        card: mapCard(doc.card),
        providerMeta: mapProviderMeta(doc.providerMeta),
    };
}

/* ---------------------------
   Response helpers
--------------------------- */
function ok<T>(data: T) {
    return { success: true, data };
}

function fail(message: string) {
    return { success: false, error: message };
}

/* ---------------------------
   PATCH handler
--------------------------- */
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await ConnectDB();

        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(fail("Invalid id"), { status: 400 });
        }

        const body = await req.json();
        const isBackup = body?.isBackup;

        if (typeof isBackup !== "boolean") {
            return NextResponse.json(fail("isBackup boolean is required"), { status: 400 });
        }

        const updated = await paymentAccountModel
            .findByIdAndUpdate(
                id,
                { isBackup, updatedAt: new Date() },
                { new: true, runValidators: true }
            )
            .lean<Lean<IPaymentAccount>>()
            .exec();

        if (!updated) {
            return NextResponse.json(fail("Payment account not found"), { status: 404 });
        }

        return NextResponse.json(ok(mapToPaymentAccount(updated)));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to change backup state";
        return NextResponse.json(fail(message), { status: 500 });
    }
}
