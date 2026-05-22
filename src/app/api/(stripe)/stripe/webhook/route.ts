// app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import ConnectDB from "@/config/db";
import { TransactionModel } from "@/models/payments/transaction.model";
import { TRANSACTION_STATUS } from "@/constants/transaction.const";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
});

export async function POST(req: NextRequest) {
    await ConnectDB();

    const sig = req.headers.get("stripe-signature") ?? "";
    const body = await req.text();

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Webhook signature verification failed";
        return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const pi = event.data.object as Stripe.PaymentIntent;
                await TransactionModel.findOneAndUpdate(
                    { stripePaymentIntentId: pi.id },
                    { status: TRANSACTION_STATUS.SUCCEEDED }
                ).exec();
                break;
            }
            case "payment_intent.payment_failed": {
                const pi = event.data.object as Stripe.PaymentIntent;
                await TransactionModel.findOneAndUpdate(
                    { stripePaymentIntentId: pi.id },
                    { status: TRANSACTION_STATUS.FAILED }
                ).exec();
                break;
            }
            default:
                console.log(`Ignored Stripe event type: ${event.type}`);
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal processing error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}