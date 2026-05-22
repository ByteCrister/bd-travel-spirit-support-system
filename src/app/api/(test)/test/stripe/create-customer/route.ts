import { NextRequest } from "next/server";
import { stripe } from "@/config/stripe";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/test/stripe/create-customer
 * Creates a Stripe customer.
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json();

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    // Field validations
    const errors: Record<string, string> = {};

    if (!email) {
        errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
        errors.email = "Invalid email format";
    }

    if (!name) {
        errors.name = "Name is required";
    } else if (name.length < 2) {
        errors.name = "Name must be at least 2 characters long";
    } else if (name.length > 100) {
        errors.name = "Name must be less than 100 characters";
    }

    if (Object.keys(errors).length > 0) {
        throw new ApiError(`Validation failed: ${JSON.stringify(errors)}`, 400);
    }

    // Create customer in Stripe
    const customer = await stripe.customers.create({
        email,
        name,
    });

    return {
        data: {
            customerId: customer.id,
        },
    };
});