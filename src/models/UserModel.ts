import mongoose, { Schema, Document, Connection, Types } from "mongoose";

/**
 * =========================
 * ENUMS & TYPE ALIASES
 * =========================
 */

// Roles supported by Bandaldegi
export type UserRole =
    | "traveler"     // Regular user booking tours
    | "guide"        // Person conducting tours
    | "assistant"  // Manages schedules, logistics
    | "support"      // Customer support staff
    | "admin";       // Platform administrator

// Account lifecycle states
export type AccountStatus = "pending" | "active" | "suspended" | "banned";

// Organizer profile verification states
export type OrganizerStatus = "pending" | "approved" | "rejected";

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
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        appliedAt: Date,
        reviewedAt: Date,
        reviewer: { type: Schema.Types.ObjectId, ref: "users" }, // admin user who reviewed
    },
    { _id: false, timestamps: true } // timestamps track last update
);

/**
 * =========================
 * MAIN USER INTERFACE
 * =========================
 */
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    roles: UserRole[];
    avatar?: string;
    phone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
    };
    dateOfBirth?: Date;
    isVerified: boolean;
    accountStatus: AccountStatus;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;

    // Tour-related references
    bookingHistory: Types.ObjectId[]; // Tours already booked
    cart: Types.ObjectId[];           // Tours in cart
    wishlist: Types.ObjectId[];       // Tours user might want later

    // Payment storage (tokenized or masked, never full card info)
    paymentMethods: {
        cardType: string;
        last4: string;
        expiryMonth: number;
        expiryYear: number;
        cardHolder: string;
        billingAddress: {
            street: string;
            city: string;
            state: string;
            country: string;
            zip: string;
        };
    }[];

    // Personalization
    preferences: {
        language: string;
        currency: string;
    };

    // Login tracking & moderation
    loginAttempts: number;
    lastLogin?: Date;
    isActive: boolean;
    suspension?: {
        reason: string;
        suspendedBy: Types.ObjectId;
        until: Date;
        createdAt: Date;
    };
    deletedAt?: Date;

    // Organizer-specific data
    organizerProfile?: mongoose.InferSchemaType<typeof OrganizerProfileSchema>;
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
        roles: {
            type: [String],
            enum: ["traveler", "guide", "assistant", "support", "admin"],
            default: ["traveler"],
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
            enum: ["pending", "active", "suspended", "banned"],
            default: "pending",
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
            suspendedBy: { type: Schema.Types.ObjectId, ref: "users" },
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
UserSchema.index({ roles: 1 });
UserSchema.index({ "organizerProfile.status": 1 });

/**
 * =========================
 * MODEL FACTORY
 * =========================
 * Ensures we don't re‑register the model when
 * hot‑reloading in dev or using multiple connections.
 */
export const getUserModel = (db: Connection) =>
    db.models.users || db.model<IUser>("users", UserSchema);
