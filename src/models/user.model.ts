// ============================================
// user.model.ts
// Production-grade User schema with lifecycle,
// security, and extensibility considerations.
// ============================================

import { ACCOUNT_STATUS, AccountStatus, USER_ROLE, UserRole } from "@/constants/user.const";
import mongoose, {
  Schema,
  Document,
  Types,
  model,
  models,
  Query,
} from "mongoose";

/**
 * =========================
 * SUB‑DOCUMENT INTERFACES
 * =========================
 */

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
    // Store only PSP token + metadata (never raw PAN)
    token: { type: String, required: true }, // PSP token/id
    cardType: { type: String, required: true },
    last4: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true },
    cardHolder: { type: String, required: true },
    billingAddress: { type: AddressSchema, required: true },
    isDefault: { type: Boolean, default: false }, // NEW: mark default card
  },
  { _id: false }
);

/**
 * =========================
 * MAIN USER INTERFACE
 * =========================
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // optional for OAuth users
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: mongoose.InferSchemaType<typeof AddressSchema>;
  dateOfBirth?: Date;
  isVerified: boolean;
  accountStatus: AccountStatus;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  bookingHistory: Types.ObjectId[];
  cart: Types.ObjectId[];
  wishlist: Types.ObjectId[];
  paymentMethods: mongoose.InferSchemaType<typeof PaymentMethodSchema>[];
  preferences: {
    language: string;
    currency: string;
    recommendationWeights: Record<string, number>;
  };
  hiddenTours: Types.ObjectId[];
  preferredTravelDates: { start: Date; end: Date }[];
  loginAttempts: number;
  lastLogin?: Date;
  lockUntil?: Date;
  suspension?: {
    reason: string;
    suspendedBy: Types.ObjectId;
    until: Date;
    createdAt: Date;
  };
  deletedAt?: Date;

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
      lowercase: true, // NEW: normalize emails
    },
    password: {
      type: String,
      // Allow null for OAuth users
      required: function (this: IUser) {
        return this.role === USER_ROLE.TRAVELER;
      },
    },

    // Role-based permissions
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.TRAVELER,
      required: true,
      index: true,
    },

    // Profile
    avatar: { type: Schema.Types.ObjectId, ref: "Asset" },
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
      createdAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // Strip sensitive fields
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

/**
 * =========================
 * VIRTUALS
 * =========================
 */
UserSchema.virtual("isLocked").get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

UserSchema.virtual("isSuspended").get(function (this: IUser) {
  return !!(this.suspension?.until && this.suspension.until > new Date());
});

UserSchema.virtual("isActive").get(function (this: IUser) {
  return !this.deletedAt && this.accountStatus === ACCOUNT_STATUS.ACTIVE;
});

/**
 * =========================
 * QUERY MIDDLEWARE
 * =========================
 */

// Exclude soft-deleted users by default
UserSchema.pre<Query<IUserDoc, IUser>>(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

/**
 * =========================
 * INDEXES FOR PERFORMANCE
 * =========================
 */
// Text search (only one text index allowed per collection)
UserSchema.index({
  name: "text",
  email: "text",
  phone: "text",
  "address.city": "text",
});

// Filtering + sorting
UserSchema.index({ role: 1, accountStatus: 1, isVerified: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });
UserSchema.index({ dateOfBirth: 1 });

/**
 * =========================
 * MODEL FACTORY
 * =========================
 */
export type IUserDoc = IUser & mongoose.Document;
export const UserModel = models.User || model<IUserDoc>("User", UserSchema);
