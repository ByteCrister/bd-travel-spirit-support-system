// * models/user.model.ts
import {
  GUIDE_DOCUMENT_CATEGORY,
  GUIDE_DOCUMENT_TYPE,
  GUIDE_STATUS,
} from "@/constants/guide.const";
import { ACCOUNT_STATUS, USER_ROLE } from "@/constants/user.const";
import mongoose, { Schema, Document, Types, model } from "mongoose";
import { models } from "mongoose";

export interface OrganizerDocument {
  category: GUIDE_DOCUMENT_CATEGORY;
  base64Content: string;
  fileType: GUIDE_DOCUMENT_TYPE;
  fileName?: string;
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
    // Prefer storing only PSP token + brand + last4 + expiry (no PAN)
    token: { type: String, required: true }, // PSP token/id
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
    documents: {
      type: [
        {
          category: {
            type: String,
            enum: Object.values(GUIDE_DOCUMENT_CATEGORY),
            required: true,
          },
          base64Content: { type: String, required: true }, // full base64 string
          fileType: {
            type: String,
            enum: Object.values(GUIDE_DOCUMENT_TYPE),
            required: true,
          },
          fileName: { type: String, trim: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      validate: [
        (
          val: {
            category: GUIDE_DOCUMENT_CATEGORY;
            base64Content: string;
            fileType: GUIDE_DOCUMENT_TYPE;
            fileName?: string;
            uploadedAt: Date;
          }[]
        ) => val.length > 0,
        "At least one verification document is required",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(GUIDE_STATUS),
      default: GUIDE_STATUS.PENDING,
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
  password?: string;

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
    recommendationWeights: Record<string, number>;
  };

  hiddenTours: Types.ObjectId[];
  preferredTravelDates: { start: Date; end: Date }[];

  /** Number of failed login attempts */
  loginAttempts: number;

  /** Last login timestamp */
  lastLogin?: Date;

  lockUntil?: Date;

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

  // virtuals
  isLocked?: boolean;
  isSuspended?: boolean;
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
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
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
      recommendationWeights: {
        type: Map,
        of: Number,
        default: {},
      },
    },

    hiddenTours: [{ type: Schema.Types.ObjectId, ref: "Tour" }],

    preferredTravelDates: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
      },
    ],

    // Security & activity tracking
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: Date,

    // Soft delete and suspension
    deletedAt: Date,
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
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Concrete document type (mongoose model instances)
export type IUserDoc = IUser & mongoose.Document;

// Virtuals
UserSchema.virtual("isLocked").get(function (this: IUserDoc) {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

UserSchema.virtual("isSuspended").get(function (this: IUserDoc) {
  return !!(this.suspension?.until && this.suspension.until > new Date());
});

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
  "organizerProfile.companyName": "text",
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
export const UserModel = models.User || model<IUserDoc>("User", UserSchema);
