// * models/user.model.ts
import mongoose, { Schema, Document, Types, model } from "mongoose";
import { models } from "mongoose";

/**
 * =========================
 * CONST ENUMS
 * =========================
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
 * =========================
 * SUB‑SCHEMA DEFINITIONS
 * =========================
 */

/** Shared address schema for billing, profile, etc. */
const AddressSchema = new Schema(
    {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        zip: { type: String, trim: true },
    },
    { _id: false }
);

/** Payment method with billing address */
const PaymentMethodSchema = new Schema(
    {
        cardType: { type: String, required: true },
        last4: { type: String, required: true },
        expiryMonth: { type: Number, required: true },
        expiryYear: { type: Number, required: true },
        cardHolder: { type: String, required: true },
        billingAddress: { type: AddressSchema, required: true },
    },
    { _id: false }
);

/** Embedded organizer profile for guides / agencies */
const OrganizerProfileSchema = new Schema(
    {
        companyName: { type: String, trim: true },
        bio: { type: String, trim: true },
        social: { type: String, trim: true }, // could store URL or handle
        documents: [
            {
                name: { type: String, trim: true },
                url: { type: String, trim: true },
                uploadedAt: Date,
            },
        ],
        status: {
            type: String,
            enum: Object.values(ORGANIZER_STATUS),
            default: ORGANIZER_STATUS.PENDING,
        },
        appliedAt: Date,
        reviewedAt: Date,
        reviewer: { type: Schema.Types.ObjectId, ref: "User" }, // admin user who reviewed
    },
    { _id: false, timestamps: true } // timestamps track last update
);

/**
 * =========================
 * MAIN USER INTERFACE
 * =========================
 */
export interface IUser extends Document {
    /** Full name of the user */
    name: string;

    /** Unique email address for login and communication */
    email: string;

    /** Hashed password */
    password: string;

    /** Role-based permissions */
    role: USER_ROLE;

    /** Profile picture URL */
    avatar?: string;

    /** Contact phone number */
    phone?: string;

    /** Optional address details */
    address?: mongoose.InferSchemaType<typeof AddressSchema>;

    /** Date of birth */
    dateOfBirth?: Date;

    /** Whether the email is verified */
    isVerified: boolean;

    /** Current account lifecycle state */
    accountStatus: ACCOUNT_STATUS;

    /** Token for password reset */
    resetPasswordToken?: string;

    /** Expiration date for password reset token */
    resetPasswordExpires?: Date;

    /** Tours already booked */
    bookingHistory: Types.ObjectId[];

    /** Tours in cart */
    cart: Types.ObjectId[];

    /** Tours user might want later */
    wishlist: Types.ObjectId[];

    /** Stored payment methods (tokenized/masked) */
    paymentMethods: mongoose.InferSchemaType<typeof PaymentMethodSchema>[];

    /** User preferences for language and currency */
    preferences: {
        language: string;
        currency: string;
    };

    /** Number of failed login attempts */
    loginAttempts: number;

    /** Last login timestamp */
    lastLogin?: Date;

    /** Whether the account is currently active */
    isActive: boolean;

    /** Suspension details if applicable */
    suspension?: {
        reason: string;
        suspendedBy: Types.ObjectId;
        until: Date;
        createdAt: Date;
    };

    /** Soft-delete timestamp */
    deletedAt?: Date;

    /** Organizer-specific profile */
    organizerProfile?: mongoose.InferSchemaType<typeof OrganizerProfileSchema>;

    /** Tours created by this user (if organizer) */
    toursCreated?: Types.ObjectId[];
}

/**
 * =========================
 * MAIN USER SCHEMA
 * =========================
 */
const UserSchema = new Schema<IUser>(
    {
        // Core identity
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, index: true, trim: true },
        password: { type: String, required: true },

        // Role-based permissions
        role: {
            type: String,
            enum: Object.values(USER_ROLE),
            default: USER_ROLE.TRAVELER,
            required: true,
            index: true,
        },

        // Profile
        avatar: String,
        phone: String,
        address: AddressSchema,
        dateOfBirth: Date,

        // Account status
        isVerified: { type: Boolean, default: false },
        accountStatus: {
            type: String,
            enum: Object.values(ACCOUNT_STATUS),
            default: ACCOUNT_STATUS.PENDING,
        },

        // Password reset flow
        resetPasswordToken: String,
        resetPasswordExpires: Date,

        // Tour interactions
        bookingHistory: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
        cart: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
        wishlist: [{ type: Schema.Types.ObjectId, ref: "Tour" }],

        // Payments
        paymentMethods: { type: [PaymentMethodSchema], default: [] },

        // User preferences
        preferences: {
            language: { type: String, default: "en" },
            currency: { type: String, default: "BDT" },
        },

        // Security & activity tracking
        loginAttempts: { type: Number, default: 0 },
        lastLogin: Date,
        isActive: { type: Boolean, default: true },
        deletedAt: Date, // Soft-delete marker

        // Suspension for violations
        suspension: {
            reason: String,
            suspendedBy: { type: Schema.Types.ObjectId, ref: "User" },
            until: Date,
            createdAt: Date,
        },

        // Organizer data
        organizerProfile: OrganizerProfileSchema,
        toursCreated: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
    },
    { timestamps: true }
);

/**
 * =========================
 * INDEXES FOR PERFORMANCE
 * =========================
 */
// =============================
// TEXT INDEX (one compound index only)
// =============================
UserSchema.index({
    name: "text",
    email: "text",
    phone: "text",
    "address.street": "text",
    "address.city": "text",
    "address.state": "text",
    "address.country": "text",
    "address.zip": "text",
    "organizerProfile.companyName": "text"
});

// =============================
// FILTERING + SORTING INDEXES
// =============================
// For dropdowns, filters, and sorting
UserSchema.index({ role: 1 });
UserSchema.index({ accountStatus: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ isActive: 1 });

// For frequent sorting
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });

// Optional: range queries
UserSchema.index({ dateOfBirth: 1 });


/**
 * =========================
 * MODEL FACTORY
 * =========================
 */
export const UserModel = models.User || model<IUser>("User", UserSchema);
