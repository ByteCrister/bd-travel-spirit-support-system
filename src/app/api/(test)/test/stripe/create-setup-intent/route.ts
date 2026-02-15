import { NextRequest } from "next/server";
import { stripe } from "@/config/stripe";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

/**
 * API: /api/test/stripe/create-setup-intent
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json();

    const customerId =
        typeof body.customerId === "string" ? body.customerId.trim() : "";

    // Field validations
    if (!customerId) {
        throw new ApiError("customerId is required", 400);
    }

    // Stripe customer IDs start with "cus_"
    if (!/^cus_[a-zA-Z0-9]+$/.test(customerId)) {
        throw new ApiError("Invalid Stripe customerId format", 400);
    }

    // Optional: Ensure customer actually exists in Stripe
    try {
        await stripe.customers.retrieve(customerId);
    } catch {
        throw new ApiError("Customer not found in Stripe", 404);
    }

    // 1 Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
    });

    return {
        data: {
            clientSecret: setupIntent.client_secret,
        },
        status: 200,
    };
});