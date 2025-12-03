// types/payment-account.type.ts
// Production-grade, minimal, and Zustand-friendly types for payment accounts.
// Trimmed to avoid duplication and sensitive data; provider-specific data lives in providerMeta.

import {
    CardBrand,
    PAYMENT_PROVIDER,
    PaymentOwnerType,
    PaymentProvider,
    PaymentPurpose,
} from "@/constants/payment.const";

/**
 * Verification status for bank/connected accounts
 */
export type VerificationStatus = "unverified" | "pending" | "verified" | "failed";

/* ---------------------------
   Core domain types
   --------------------------- */

/** Minimal safe card info (non-sensitive) */
export type SafeCardInfo = {
    brand?: CardBrand;
    last4?: string; // masked last 4 digits
    expMonth?: number;
    expYear?: number;
};

/** Common fields for all payment accounts (frontend shape) */
export type PaymentAccountBase = {
    id: string; // DB id (stringified ObjectId)
    ownerType: PaymentOwnerType;
    ownerId?: string | null;
    provider: PaymentProvider;
    purpose: PaymentPurpose;
    isActive: boolean;
    isBackup: boolean;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    label?: string; // optional human-friendly label for admin UI
};

// Stripe bank metadata (stable identifier + fingerprint)
export type StripeBankMeta = {
    externalBankId?: string;           // Stripe bank account id (e.g., ba_...)
    externalBankFingerprint?: string;  // Stripe fingerprint to dedupe
    bankToken?: string;                // token used to create/link (client-provided)
    last4?: string;                    // masked last 4 of account number
    bankName?: string;
    country?: string;
    currency?: string;
    linkedAt?: string | null;          // when linked in Stripe
    isLinked?: boolean;                // convenience flag
    verificationStatus?: VerificationStatus;
    verifiedAt?: string | null;
    verificationErrors?: string[] | null;
};

/* ---------------------------
   Provider-specific payloads (tokenized / masked only)
   --------------------------- */

/** Stripe-specific metadata (tokenized) */
export type StripeMeta = {
    // Token/IDs returned by Stripe; do not store raw card PAN
    stripeCustomerId?: string;
    stripePaymentMethodId?: string;
    stripeConnectedAccountId?: string; // for Connect / payouts
    stripeExternalBankId?: string; // token/id referencing bank on Stripe
    // minimal display info
    card?: SafeCardInfo;
    // verification
    bank?: StripeBankMeta;
    verificationStatus?: VerificationStatus;
    verifiedAt?: string | null;
    verificationErrors?: string[] | null;
};

/** Bank account details (admin adds bank for payouts) - tokenized/masked */
// export type BankMeta = {
//     // Prefer provider token (e.g., Stripe bank token, Plaid token)
//     bankToken?: string;
//     // Display-only fields (masked or non-sensitive)
//     bankName?: string;
//     country?: string; // ISO country code
//     currency?: string; // ISO currency code
//     accountHolderNameMasked?: string; // masked or initials only; avoid storing full PII
//     accountHolderType?: "individual" | "company";
//     last4?: string; // last 4 digits of account number (masked)
//     routingNumberMasked?: string | null; // masked routing if applicable

//     verificationStatus?: VerificationStatus;
//     verifiedAt?: string | null;
//     verificationErrors?: string[] | null;
// };

/** Minimal metadata for other providers (extensible) */
// export type PaypalMeta = {
//     paypalAccountId?: string;
//     email?: string;
//     verificationStatus?: VerificationStatus;
// };

// export type SslcommerzMeta = {
//     sslcommerzAccountId?: string;
//     merchantName?: string;
//     verificationStatus?: VerificationStatus;
// };

/** Provider metadata container (keeps provider-specific details grouped) */
export type ProviderMeta =
    | { provider: PAYMENT_PROVIDER.STRIPE; meta: StripeMeta }
// | { provider: PAYMENT_PROVIDER.BANK; meta: BankMeta }
// | { provider: PAYMENT_PROVIDER.PAYPAL; meta?: PaypalMeta }
// | { provider: PAYMENT_PROVIDER.SSLCOMMERZ; meta?: SslcommerzMeta };

/* ---------------------------
   Full PaymentAccount type (frontend)
   --------------------------- */

export type PaymentAccount = PaymentAccountBase & {
    // provider-specific typed metadata
    providerMeta?: ProviderMeta;
    // safe card display info for any provider that supports cards (duplicate of StripeMeta.card if Stripe)
    card?: SafeCardInfo;
};

/* ---------------------------
   Create / Update DTOs (frontend -> API)
   --------------------------- */

/** Common create fields */
export type PaymentAccountCreateBase = {
    ownerType: PaymentOwnerType;
    ownerId?: string | null;
    purpose: PaymentPurpose;
    isBackup?: boolean;
    label?: string;
};

/** Create DTO for adding a bank (admin dashboard)
 *  Prefer sending a provider token (bankToken). Avoid sending raw account numbers.
 */
// export type CreateBankAccountDTO = PaymentAccountCreateBase & {
//     provider: PAYMENT_PROVIDER.BANK;
//     bankToken?: string; // tokenized bank reference from client/provider
//     bankName?: string;
//     country?: string;
//     currency?: string;
//     accountHolderNameMasked?: string;
//     accountHolderType?: "individual" | "company";
//     last4?: string;
// };

/** Create DTO for adding a Stripe payment method */
export type CreateStripePaymentMethodDTO = PaymentAccountCreateBase & {
    provider: PAYMENT_PROVIDER.STRIPE;
    email: string;
    name: string;
    stripeCustomerId?: string;
    stripePaymentMethodId?: string;
    card?: SafeCardInfo;
};

/** Generic update DTO (partial; server validates provider-specific requirements) */
export type PaymentAccountUpdateDTO = Partial<
    // | CreateBankAccountDTO
    | CreateStripePaymentMethodDTO
> & {
    isActive?: boolean;
    isBackup?: boolean;
    label?: string | null;
};

/* ---------------------------
   API response types (Zustand-friendly)
   --------------------------- */

/** Standard API wrapper used by frontend */
export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string | null;
};

/** Paginated list response */
export type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
};

/** Responses used by the UI / Zustand store */
export type PaymentAccountResponse = ApiResponse<PaymentAccount>;
export type PaymentAccountListResponse = ApiResponse<Paginated<PaymentAccount>>;

/* ---------------------------
   Zustand store types
   --------------------------- */

/** Normalized dictionary for fast lookup */
export type PaymentAccountMap = Record<string, PaymentAccount>;

/** Async status */
export type AsyncStatus = "idle" | "loading" | "success" | "error";

/** Zustand store state */
export type PaymentAccountState = {
    byId: PaymentAccountMap;
    allIds: string[]; // ordered by createdAt desc by default
    listTotal: number;
    page: number;
    pageSize: number;
    fetchStatus: AsyncStatus;
    createStatus: AsyncStatus;
    updateStatus: AsyncStatus;
    deleteStatus: AsyncStatus;
    error?: string | null;
};

/** Zustand store actions (signatures only) */
export type PaymentAccountActions = {
    fetchList: (page?: number, pageSize?: number) => Promise<void>;
    fetchById: (id: string) => Promise<void>;
    // createBankAccount: (payload: CreateBankAccountDTO) => Promise<PaymentAccount | null>;
    createStripePaymentMethod: (payload: CreateStripePaymentMethodDTO) => Promise<PaymentAccount | null>;
    updateAccount: (id: string, payload: PaymentAccountUpdateDTO) => Promise<PaymentAccount | null>;
    deleteAccount: (id: string) => Promise<boolean>;
    setActive: (id: string, active: boolean) => Promise<PaymentAccount | null>;
    setBackup: (id: string, isBackup: boolean) => Promise<PaymentAccount | null>;
    clearError: () => void;

    // Private/internal helpers
    _mergePage: (pageData: Paginated<PaymentAccount>) => void;
    _upsertOne: (account: PaymentAccount) => void;
    _removeOne: (id: string) => void;
};

/* ---------------------------
   Utility / validation helpers (types only)
   --------------------------- */

/** Minimal shape returned by server when validation fails */
export type ValidationError = {
    field?: string;
    message: string;
};

/** Create response that may include validation errors */
export type CreateAccountErrorResponse = ApiResponse<null> & {
    validationErrors?: ValidationError[];
};