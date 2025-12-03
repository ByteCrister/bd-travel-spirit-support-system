// app/api/payment-accounts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import ConnectDB from "@/config/db";
import paymentAccountModel, { IPaymentAccount } from "@/models/payment-account.model";
import { PaymentAccount, PaymentAccountUpdateDTO } from "@/types/payment-account.type";

function ok<T>(data: T) {
    return { success: true, data };
}
function fail(message: string) {
    return { success: false, error: message };
}

/**
 * Convert Mongoose lean document to frontend PaymentAccount type
 */
function toPaymentAccount(doc: IPaymentAccount): PaymentAccount {
    return {
        id: (doc._id as Types.ObjectId).toString(),
        ownerType: doc.ownerType,
        ownerId: doc.ownerId?.toString() ?? null,
        provider: doc.provider,
        purpose: doc.purpose,
        isActive: doc.isActive,
        isBackup: doc.isBackup,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        label: doc.label,
        card: doc.card
            ? {
                brand: doc.card.brand ?? "unknown", // default if undefined
                last4: doc.card.last4,
                expMonth: doc.card.expMonth,
                expYear: doc.card.expYear,
            }
            : undefined,
        providerMeta: doc.providerMeta ? { ...doc.providerMeta } : undefined,
    };
}

/* ---------------------------------------------
   GET Handler
--------------------------------------------- */
export async function GET(req: NextRequest, context: { params: { id: string } }) {
    try {
        await ConnectDB();
        const { id } = context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(fail("Invalid id"), { status: 400 });
        }

        const doc = await paymentAccountModel.findById(id).lean<IPaymentAccount>().exec();
        if (!doc) return NextResponse.json(fail("Payment account not found"), { status: 404 });

        return NextResponse.json(ok(toPaymentAccount(doc)));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch payment account";
        return NextResponse.json(fail(message), { status: 500 });
    }
}

/* ---------------------------------------------
   PATCH Handler
--------------------------------------------- */
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
    try {
        await ConnectDB();
        const { id } = context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(fail("Invalid id"), { status: 400 });
        }

        const payload = (await req.json()) as PaymentAccountUpdateDTO;

        // Prevent provider change
        if ("provider" in payload) {
            return NextResponse.json(fail("Changing provider is not allowed"), { status: 400 });
        }

        // Update timestamp
        const updatedPayload = {
            ...payload,
            updatedAt: new Date(),
        };

        const updatedDoc = await paymentAccountModel
            .findByIdAndUpdate(id, updatedPayload, { new: true, runValidators: true })
            .lean<IPaymentAccount>()
            .exec();

        if (!updatedDoc) return NextResponse.json(fail("Payment account not found"), { status: 404 });

        return NextResponse.json(ok(toPaymentAccount(updatedDoc)));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update payment account";
        return NextResponse.json(fail(message), { status: 500 });
    }
}

/* ---------------------------------------------
   DELETE Handler
--------------------------------------------- */
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        await ConnectDB();
        const { id } = context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(fail("Invalid id"), { status: 400 });
        }

        const deletedDoc = await paymentAccountModel.findByIdAndDelete(id).lean<IPaymentAccount>().exec();
        if (!deletedDoc) return NextResponse.json(fail("Payment account not found"), { status: 404 });

        return NextResponse.json(ok({ success: true }));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete payment account";
        return NextResponse.json(fail(message), { status: 500 });
    }
}