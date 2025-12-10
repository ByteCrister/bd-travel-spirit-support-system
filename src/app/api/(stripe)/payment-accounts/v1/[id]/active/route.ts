// app/api/payment-accounts/[id]/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import ConnectDB from "@/config/db";
import StripePaymentAccountModel, { IStripePaymentAccount } from "@/models/payment-account.model";
import { PaymentAccount, SafeCardInfo } from "@/types/stripe-payment-account.type";
import { Lean } from "@/types/mongoose-lean.types";

/* ---------------------------
   Helpers
--------------------------- */

/**
 * Safely map optional card info
 */
function mapCard(card?: SafeCardInfo | null) {
    if (!card) return undefined;
    return {
        brand: card.brand ?? "unknown",
        last4: card.last4,
        expMonth: card.expMonth,
        expYear: card.expYear,
    };
}

/**
 * Convert lean document to frontend PaymentAccount
 */
function mapToPaymentAccount(doc: Lean<IStripePaymentAccount>): PaymentAccount {
    return {
        id: (doc._id as Types.ObjectId).toString(),
        ownerType: doc.ownerType,
        ownerId: doc.ownerId?.toString() ?? null,
        purpose: doc.purpose,
        isActive: doc.isActive,
        isBackup: doc.isBackup,
        label: doc.label,
        stripeCustomerId: doc.stripeCustomerId,
        stripePaymentMethodId: doc.stripePaymentMethodId,
        card: mapCard(doc.card),
        isDeleted: doc.isDeleted,
        deletedAt: doc.deletedAt?.toISOString() ?? null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
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
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await ConnectDB();

        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(fail("Invalid id"), { status: 400 });
        }

        const body: { isActive?: boolean } = await req.json();
        if (typeof body.isActive !== "boolean") {
            return NextResponse.json(fail("isActive boolean is required"), { status: 400 });
        }

        const updated = await StripePaymentAccountModel.findByIdAndUpdate(
            id,
            { isActive: body.isActive, updatedAt: new Date() },
            { new: true, runValidators: true }
        )
            .lean<Lean<IStripePaymentAccount>>()
            .exec();

        if (!updated) {
            return NextResponse.json(fail("Payment account not found"), { status: 404 });
        }

        return NextResponse.json(ok(mapToPaymentAccount(updated)));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to change active state";
        return NextResponse.json(fail(message), { status: 500 });
    }
}
