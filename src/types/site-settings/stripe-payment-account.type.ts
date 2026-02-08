// types/stripe-payment-account.type.ts
import { CardBrand, PaymentOwnerType, PaymentPurpose } from "@/constants/payment.const";

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
    ownerId?: string | null; // ObjectId serialized to string or null
    purpose: PaymentPurpose;
    isActive: boolean;
    isBackup: boolean;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    label?: string;
};

/* ---------------------------
   Full PaymentAccount type (frontend)
--------------------------- */

export type PaymentAccount = PaymentAccountBase & {
    stripeCustomerId: string; // top-level (DB required)
    stripePaymentMethodId: string; // top-level (DB required)
    stripeConnectedAccountId?: string;
    card?: SafeCardInfo;
    isDeleted?: boolean;
    deletedAt?: string | null;
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

/** Create DTO for adding a Stripe payment method */
export type CreateStripePaymentMethodDTO = PaymentAccountCreateBase & {
    email: string;
    name: string;
    stripeCustomerId: string; // REQUIRED
    stripePaymentMethodId: string; // REQUIRED
    stripeConnectedAccountId?: string;
    card?: SafeCardInfo;
};

/** Generic update DTO (partial; server validates provider-specific requirements) */
export type PaymentAccountUpdateDTO = Partial<CreateStripePaymentMethodDTO> & {
    isActive?: boolean;
    isBackup?: boolean;
    label?: string | null;
};

/* ---------------------------
   API response types (Zustand-friendly)
--------------------------- */

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string | null;
};

export type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
};

export type PaymentAccountResponse = ApiResponse<PaymentAccount>;
export type PaymentAccountListResponse = ApiResponse<Paginated<PaymentAccount>>;

/* ---------------------------
   Zustand store types
--------------------------- */

export type PaymentAccountMap = Record<string, PaymentAccount>;

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type PaymentAccountState = {
    byId: PaymentAccountMap;
    allIds: string[];
    listTotal: number;
    page: number;
    pageSize: number;
    fetchStatus: AsyncStatus;
    createStatus: AsyncStatus;
    updateStatus: AsyncStatus;
    deleteStatus: AsyncStatus;
    error?: string | null;
};

export type PaymentAccountActions = {
    fetchList: (page?: number, pageSize?: number) => Promise<void>;
    fetchById: (id: string) => Promise<void>;
    createStripePaymentMethod: (payload: CreateStripePaymentMethodDTO) => Promise<PaymentAccount | null>;
    updateAccount: (id: string, payload: PaymentAccountUpdateDTO) => Promise<PaymentAccount | null>;
    deleteAccount: (id: string) => Promise<boolean>;
    setActive: (id: string, active: boolean) => Promise<PaymentAccount | null>;
    setBackup: (id: string, isBackup: boolean) => Promise<PaymentAccount | null>;
    clearError: () => void;
    _mergePage: (pageData: Paginated<PaymentAccount>) => void;
    _upsertOne: (account: PaymentAccount) => void;
    _removeOne: (id: string) => void;
};

/* ---------------------------
   Utility / validation helpers (types only)
--------------------------- */

export type ValidationError = {
    field?: string;
    message: string;
};

export type CreateAccountErrorResponse = ApiResponse<null> & {
    validationErrors?: ValidationError[];
};
