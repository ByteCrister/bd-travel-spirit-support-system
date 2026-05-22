// validators/site-settings/payment-account-setting.validator.ts
import * as yup from "yup";
import { PAYMENT_OWNER_TYPE, PAYMENT_PURPOSE, CARD_BRAND } from "@/constants/payment.const";

export const createPaymentAccountSchema = yup.object({
    ownerType: yup
        .string()
        .oneOf(Object.values(PAYMENT_OWNER_TYPE))
        .required("Owner type is required"),
    purpose: yup
        .string()
        .oneOf(Object.values(PAYMENT_PURPOSE))
        .required("Purpose is required"),
    label: yup.string().optional(),
    isBackup: yup.boolean().default(false),
    email: yup.string().email("Invalid email").required("Email is required"),
    name: yup.string().required("Name is required"),
    stripeCustomerId: yup.string().required("Stripe customer ID is required"),
    stripePaymentMethodId: yup.string().required("Payment method ID is required"),
    stripeConnectedAccountId: yup.string().optional(),
    card: yup
        .object({
            brand: yup.string().oneOf(Object.values(CARD_BRAND)).optional(),
            last4: yup.string().length(4, "Must be exactly 4 digits").optional(),
            expMonth: yup
                .number()
                .typeError("Must be a number")
                .min(1, "Month must be between 1 and 12")
                .max(12, "Month must be between 1 and 12")
                .optional(),
            expYear: yup
                .number()
                .typeError("Must be a number")
                .min(2023, "Year must be 2023 or later")
                .max(2100, "Year must be 2100 or earlier")
                .optional(),
        })
        .optional(),
});

export const updatePaymentAccountSchema = yup.object({
    label: yup.string().optional(),
    isBackup: yup.boolean().required(),
});