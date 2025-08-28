/**
 * ======================================
 * ENUMS (shared between client & server)
 * ======================================
 */

/** Roles supported by the platform */
export enum USER_ROLE {
    /** Regular user booking tours */
    TRAVELER = "traveler",

    /** Person conducting tours */
    GUIDE = "guide",

    /** Manages schedules, logistics */
    ASSISTANT = "assistant",

    /** Customer support staff */
    SUPPORT = "support",

    /** Platform administrator */
    ADMIN = "admin",
}

/** Account lifecycle states */
export enum ACCOUNT_STATUS {
    /** Account created but not yet verified */
    PENDING = "pending",

    /** Account is active and in good standing */
    ACTIVE = "active",

    /** Temporarily disabled due to violations or inactivity */
    SUSPENDED = "suspended",

    /** Permanently banned from the platform */
    BANNED = "banned",
}

/** Organizer profile verification states */
export enum ORGANIZER_STATUS {
    /** Awaiting admin review */
    PENDING = "pending",

    /** Approved and allowed to create/manage tours */
    APPROVED = "approved",

    /** Rejected after review */
    REJECTED = "rejected",
}

/**
 * ======================================
 * SUB-TYPES (reusable building blocks)
 * ======================================
 */

/** Postal address structure */
export interface Address {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
}

/** Credit/debit card metadata (tokenized, never raw) */
export interface PaymentMethod {
    cardType: string;         // e.g. "Visa"
    last4: string;            // last 4 digits
    expiryMonth: number;      // e.g. 12
    expiryYear: number;       // e.g. 2027
    cardHolder: string;       // cardholder name
    billingAddress: Address;  // associated billing address
}

/** Organizer profile for guides / agencies */
export interface OrganizerProfile {
    companyName?: string;
    bio?: string;
    social?: string; // URL or handle
    documents: {
        name: string;
        url: string;
        uploadedAt?: string; // ISO date string
    }[];
    status: ORGANIZER_STATUS;
    appliedAt?: string;   // ISO date string
    reviewedAt?: string;  // ISO date string
    reviewer?: string;    // userId of reviewer (admin)
    createdAt?: string;   // timestamp from Mongoose
    updatedAt?: string;
}

/** Suspension details if account is restricted */
export interface Suspension {
    reason: string;
    suspendedBy: string; // userId of admin who suspended
    until: string;       // ISO date string
    createdAt: string;   // when suspension was applied
}

/**
 * ======================================
 * MAIN USER TYPE (for client-side use)
 * ======================================
 */
export interface User {
    /** Unique MongoDB ID */
    _id: string;

    /** Full name of the user */
    name: string;

    /** Email address (unique, login identifier) */
    email: string;

    /** Role assigned to the user */
    role: USER_ROLE;

    /** Profile picture URL */
    avatar?: string;

    /** Contact phone number */
    phone?: string;

    /** Optional address details */
    address?: Address;

    /** Date of birth */
    dateOfBirth?: string; // ISO date string

    /** Whether the email is verified */
    isVerified: boolean;

    /** Current account lifecycle state */
    accountStatus: ACCOUNT_STATUS;

    /** Tour IDs the user has booked */
    bookingHistory: string[];

    /** Tour IDs in the cart */
    cart: string[];

    /** Tour IDs in the wishlist */
    wishlist: string[];

    /** Stored payment methods */
    paymentMethods: PaymentMethod[];

    /** User preferences for UI/localization */
    preferences: {
        language: string;
        currency: string;
    };

    /** Number of failed login attempts */
    loginAttempts: number;

    /** Last login timestamp */
    lastLogin?: string;

    /** Whether the account is currently active */
    isActive: boolean;

    /** Soft-delete timestamp (if user is "deleted") */
    deletedAt?: string;

    /** Suspension details if applicable */
    suspension?: Suspension;

    /** Organizer-specific profile */
    organizerProfile?: OrganizerProfile;

    /** IDs of tours created by this user */
    toursCreated?: string[];

    /** Auto-managed timestamps */
    createdAt: string;
    updatedAt: string;
}
