// app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import ConnectDB from "@/config/db";
import { TransactionModel } from "@/models/transaction.model";

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
        // UPDATED: use proper typing for unknown error and return helpful message
        const message = err instanceof Error ? err.message : "Webhook signature verification failed";
        return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    // Handle events (narrowing by event.type)
    try {
        if (event.type === "payment_intent.succeeded") {
            // event.data.object is typed as Stripe.PaymentIntent for this event
            const pi = event.data.object as Stripe.PaymentIntent; // UPDATED: explicit cast for clarity
            await TransactionModel.findOneAndUpdate(
                { stripePaymentIntentId: pi.id },
                { status: "succeeded" }
            ).exec();
        } else if (event.type === "payment_intent.payment_failed") {
            const pi = event.data.object as Stripe.PaymentIntent; // UPDATED: explicit cast for clarity
            await TransactionModel.findOneAndUpdate(
                { stripePaymentIntentId: pi.id },
                { status: "failed" }
            ).exec();
        } else {
            // Ignore other events by default
        }
    } catch (err: unknown) {
        // UPDATED: handle runtime errors with proper typing
        const message = err instanceof Error ? err.message : "Internal processing error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
