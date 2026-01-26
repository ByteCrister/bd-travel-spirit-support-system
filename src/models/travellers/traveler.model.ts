// traveler.model.ts
import { DISTRICT, DIVISION } from "@/constants/tour.const";
import { ACCOUNT_STATUS, AccountStatus } from "@/constants/user.const";
import { defineModel } from "@/lib/helpers/defineModel";
import mongoose, { Schema, Document, Types, Query } from "mongoose";

/**
 * ============================================
 * Bangladesh-specific Address Schema
 * ============================================
 */
const AddressSchema = new Schema(
  {
    // Street-level details
    house: { type: String, trim: true },          // House / Flat / Holding No
    road: { type: String, trim: true },           // Road / Street
    area: { type: String, trim: true },           // Area / Locality

    // Administrative hierarchy
    village: { type: String, trim: true },        // Rural
    ward: { type: String, trim: true },           // City corporation
    union: { type: String, trim: true },          // Rural union
    upazila: { type: String, trim: true },        // Sub-district
    district: {
      type: String,
      enum: Object.values(DISTRICT),
      required: true,
    },
    division: {
      type: String,
      enum: Object.values(DIVISION),
      required: true,
    },

    // Postal info
    postOffice: { type: String, trim: true },
    postalCode: {
      type: String,
      match: /^[0-9]{4}$/, // Bangladesh postal code (4 digits)
    },

    country: {
      type: String,
      default: "Bangladesh",
      immutable: true,
    },
  },
  { _id: false }
);

/**
 * ============================================
 * Traveler Interface
 * ============================================
 */
export interface ITraveler extends Document {
  user: Types.ObjectId;

  // Profile
  name: string;
  avatar?: Types.ObjectId;
  phone?: string;
  address?: mongoose.InferSchemaType<typeof AddressSchema>;
  dateOfBirth?: Date;

  // Geo location (for maps / nearby search)
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };

  // Account status
  isVerified: boolean;
  accountStatus: AccountStatus;

  // Security
  loginAttempts: number;
  lastLogin?: Date;
  lockUntil?: Date;

  // Moderation
  suspension?: {
    reason: string;
    suspendedBy: Types.ObjectId;
    until: Date;
    createdAt: Date;
  };

  // Soft delete
  deletedAt?: Date;

  // Virtuals
  isLocked?: boolean;
  isSuspended?: boolean;
  isActive?: boolean;
}

/**
 * ============================================
 * Traveler Schema
 * ============================================
 */
const TravelerSchema = new Schema<ITraveler>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Core profile
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
    },
    phone: {
      type: String,
      trim: true,
    },
    address: AddressSchema,
    dateOfBirth: Date,

    // GeoJSON location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: "Location coordinates must be [longitude, latitude]",
        },
      },
    },

    // Account state
    isVerified: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.PENDING,
    },

    // Security
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    lastLogin: Date,

    // Soft delete & suspension
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
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

/**
 * ============================================
 * Virtuals
 * ============================================
 */
TravelerSchema.virtual("isLocked").get(function (this: ITraveler) {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

TravelerSchema.virtual("isSuspended").get(function (this: ITraveler) {
  return !!(this.suspension?.until && this.suspension.until > new Date());
});

TravelerSchema.virtual("isActive").get(function (this: ITraveler) {
  return !this.deletedAt && this.accountStatus === ACCOUNT_STATUS.ACTIVE;
});

/**
 * ============================================
 * Query Middleware
 * ============================================
 */
// Exclude soft-deleted travelers by default
TravelerSchema.pre<Query<ITravelerDoc, ITraveler>>(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

/**
 * ============================================
 * Indexes
 * ============================================
 */
// Text search (Bangladesh-aware)
TravelerSchema.index({
  name: "text",
  phone: "text",
  "address.area": "text",
  "address.upazila": "text",
  "address.district": "text",
  "address.division": "text",
});

// Filtering & sorting
TravelerSchema.index({ accountStatus: 1, isVerified: 1 });
TravelerSchema.index({ createdAt: -1 });
TravelerSchema.index({ lastLogin: -1 });
TravelerSchema.index({ dateOfBirth: 1 });

// Geo queries
TravelerSchema.index({ location: "2dsphere" });

/**
 * ============================================
 * Model Export
 * ============================================
 */
export type ITravelerDoc = ITraveler & mongoose.Document;
export const TravelerModel = defineModel("Traveler", TravelerSchema);