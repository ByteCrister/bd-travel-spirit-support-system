import { stripe } from "@/config/stripe";
import { ApiError } from "../helpers/withErrorHandler";

/**
 * Verifies that the payment method belongs to the customer and attaches it
 * if not already attached. Also retrieves card details from Stripe if not provided.
 */
export default async function verifyAndAttachPaymentMethod(
  customerId: string,
  paymentMethodId: string,
) {
  // 1. Retrieve payment method from Stripe
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

  if (paymentMethod.customer && paymentMethod.customer !== customerId) {
    throw new ApiError(
      `Payment method ${paymentMethodId} belongs to a different customer`,
      400
    );
  }

  // 2. Attach to customer if not already attached
  if (!paymentMethod.customer) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  // 3. Optionally set as default payment method (adjust as needed)
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // 4. Use card details from Stripe if not provided in request (safer)
  const card = paymentMethod.card;
  if (!card) {
    throw new ApiError(`Payment method ${paymentMethodId} is not a card`, 400);
  }

  return {
    brand: card.brand,
    last4: card.last4,
    expMonth: card.exp_month,
    expYear: card.exp_year,
  };
}