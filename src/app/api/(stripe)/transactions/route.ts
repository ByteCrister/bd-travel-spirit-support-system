// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ConnectDB from "@/config/db";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import { TransactionModel } from "@/models/payments/transaction.model";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
});

export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const { paymentAccountId, amount, currency, description } = body;

        if (!mongoose.Types.ObjectId.isValid(paymentAccountId)) {
            return NextResponse.json({ success: false, error: "Invalid paymentAccountId" }, { status: 400 });
        }
        if (!amount || !currency) {
            return NextResponse.json({ success: false, error: "Amount and currency are required" }, { status: 400 });
        }

        const account = await StripePaymentAccountModel.findById(paymentAccountId).lean();
        if (!account) return NextResponse.json({ success: false, error: "Payment account not found" }, { status: 404 });

        // Create & confirm PaymentIntent immediately
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer: account.stripeCustomerId,
            payment_method: account.stripePaymentMethodId,
            off_session: true,
            confirm: true, // immediate confirmation
        });

        // If payment is not succeeded, throw error
        if (paymentIntent.status !== "succeeded") {
            return NextResponse.json({ success: false, error: "Payment failed" }, { status: 402 });
        }

        // Record transaction in DB only if succeeded
        const transaction = await TransactionModel.create({
            paymentAccountId,
            stripePaymentIntentId: paymentIntent.id,
            amount,
            currency,
            status: "succeeded",
            description,
        });

        return NextResponse.json({ success: true, data: transaction });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Payment failed";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}