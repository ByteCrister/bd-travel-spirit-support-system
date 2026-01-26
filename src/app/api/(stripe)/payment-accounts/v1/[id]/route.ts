// api/payment-accounts/v1/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import ConnectDB from "@/config/db";


import {
    PaymentAccount,
    PaymentAccountUpdateDTO,
} from "@/types/stripe-payment-account.type";
import StripePaymentAccountModel, { IStripePaymentAccount } from "@/models/payment-account.model";

function ok<T>(data: T) {
    return { success: true, data };
}
function fail(message: string) {
    return { success: false, error: message };
}

/* ---------------------------------------------
   Convert DB document → frontend PaymentAccount
--------------------------------------------- */
function toPaymentAccount(doc: IStripePaymentAccount): PaymentAccount {
    return {
        id: (doc._id as Types.ObjectId).toString(),
        ownerType: doc.ownerType,
        ownerId: doc.ownerId?.toString() ?? null,

        purpose: doc.purpose,
        isActive: !!doc.isActive,
        isBackup: !!doc.isBackup,

        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),

        label: doc.label ?? undefined,

        // Card is now top-level
        card: doc.card
            ? {
                brand: doc.card.brand,
                last4: doc.card.last4,
                expMonth: doc.card.expMonth,
                expYear: doc.card.expYear,
            }
            : undefined,

        // Stripe fields are all top-level
        stripeCustomerId: doc.stripeCustomerId,
        stripePaymentMethodId: doc.stripePaymentMethodId,

        isDeleted: doc.isDeleted ?? false,
        deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
    };
}

/* ---------------------------------------------
   GET
--------------------------------------------- */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await ConnectDB();
        const { id } = (await params);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(fail("Invalid id"), { status: 400 });
        }

        const doc = await StripePaymentAccountModel.findById(id)
            .lean<IStripePaymentAccount>()
            .exec();

        if (!doc) {
            return NextResponse.json(fail("Payment account not found"), { status: 404 });
        }

        return NextResponse.json(ok(toPaymentAccount(doc)));
    } catch (err) {
        return NextResponse.json(
            fail(err instanceof Error ? err.message : "Failed to fetch payment account"),
            { status: 500 }
        );
    }
}

/* ---------------------------------------------
   PATCH
--------------------------------------------- */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await ConnectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(fail("Invalid id"), { status: 400 });
        }

        const payload = (await req.json()) as PaymentAccountUpdateDTO;

        // Provider is always stripe — user cannot change
        if ("provider" in payload) {
            return NextResponse.json(fail("Changing provider is not allowed"), {
                status: 400,
            });
        }

        const updateDoc: Partial<IStripePaymentAccount> = {
            ...payload,
            ownerId: payload.ownerId ? new Types.ObjectId(payload.ownerId) : undefined,
            updatedAt: new Date(),
        };

        const updated = await StripePaymentAccountModel.findByIdAndUpdate(
            id,
            updateDoc,
            { new: true, runValidators: true }
        )
            .lean<IStripePaymentAccount>()
            .exec();

        if (!updated) {
            return NextResponse.json(fail("Payment account not found"), { status: 404 });
        }

        return NextResponse.json(ok(toPaymentAccount(updated)));
    } catch (err) {
        return NextResponse.json(
            fail(err instanceof Error ? err.message : "Failed to update payment account"),
            { status: 500 }
        );
    }
}

/* ---------------------------------------------
   DELETE — Soft delete
--------------------------------------------- */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await ConnectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(fail("Invalid id"), { status: 400 });
        }

        const deleted = await StripePaymentAccountModel.softDelete(id);

        if (!deleted) {
            return NextResponse.json(fail("Payment account not found"), { status: 404 });
        }

        return NextResponse.json(ok({ success: true }));
    } catch (err) {
        return NextResponse.json(
            fail(err instanceof Error ? err.message : "Failed to delete payment account"),
            { status: 500 }
        );
    }
}
