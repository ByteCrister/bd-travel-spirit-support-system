import { USER_ROLE } from "./user.const";

// Payment ownership should be domain-specific
export enum PAYMENT_OWNER_TYPE {
    ADMIN = USER_ROLE.ADMIN,
    GUIDE = USER_ROLE.GUIDE,
    TRAVELER = USER_ROLE.TRAVELER,
}
export type PaymentOwnerType = `${PAYMENT_OWNER_TYPE}`;

// Multi-gateway ready (Bangladesh + Global)
export enum PAYMENT_PROVIDER {
    STRIPE = "stripe",
    SSLCOMMERZ = "sslcommerz",
    PAYPAL = "paypal",
    BANK = "bank", // manual bank settlement if ever needed
}
export type PaymentProvider = `${PAYMENT_PROVIDER}`;

// Payment accounts are separated based on the business transaction flow.
//
// Flow:
// 1. When a guide creates a tour and makes it public for booking,
//    customer payments are collected into the BLOCK_ACCOUNT first.
//
// 2. When a customer books a tour:
//    - 100% of the booking amount is held in the BLOCK_ACCOUNT.
//
// 3. After the tour is successfully completed:
//    - 15% of the total amount is transferred to the admin TRANSACTION_ACCOUNT
//      as platform commission.
//    - 85% of the total amount is transferred to the tour guide account
//      as guide earnings.
//
// This separation ensures secure payment holding, dispute handling,
// and controlled payout processing.

export enum PAYMENT_PURPOSE {
    // Temporary holding account for customer tour booking payments.
    // Funds remain locked here until the tour completion process is verified.
    BLOCK_ACCOUNT = "block_account",

    // Admin/platform transaction account.
    // Receives platform commission after successful tour completion.
    TRANSACTION_ACCOUNT = "transaction_account",
}
export type PaymentPurpose = `${PAYMENT_PURPOSE}`;

// Card brand with fallback safety
export enum CARD_BRAND {
    VISA = "visa",
    MASTERCARD = "mastercard",
    AMEX = "amex",
    DISCOVER = "discover",
    DINERS = "diners",
    JCB = "jcb",
    UNIONPAY = "unionpay",
    UNKNOWN = "unknown",
}
export type CardBrand = `${CARD_BRAND}`;