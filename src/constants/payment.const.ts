import { USER_ROLE } from "./user.const";

// Payment ownership should be domain-specific
export enum PAYMENT_OWNER_TYPE {
    ADMIN = USER_ROLE.ADMIN,
    GUIDE = USER_ROLE.GUIDE,
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

// Business-purpose driven (excellent design)
export enum PAYMENT_PURPOSE {
    TOUR_BOOKING = "tour_booking",
    EMPLOYEE_WAGES = "employee_wages",
    SUBSCRIPTION = "subscription",
    REFUND = "refund",
}
export type PaymentPurpose = `${PAYMENT_PURPOSE}`;

// Card brand with fallback safety
export enum CARD_BRAND {
    VISA = "visa",
    MASTERCARD = "mastercard",
    AMEX = "amex",
    UNIONPAY = "unionpay",
    UNKNOWN = "unknown", // very important fallback
}
export type CardBrand = `${CARD_BRAND}`;