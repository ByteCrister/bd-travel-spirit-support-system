// ============================================================
// guide.model.ts
// ------------------------------------------------------------
// Production-grade Guide schema for service providers.
// This model is completely separate from User, with its own
// lifecycle, authentication, and verification process.
// ============================================================

import { Schema, Document, Types, model, models, Query } from "mongoose";
import {
    GUIDE_DOCUMENT_CATEGORY,
    GUIDE_DOCUMENT_TYPE,
    GUIDE_SOCIAL_PLATFORM,
    GUIDE_STATUS,
    
    GuideDocumentCategory,
    GuideDocumentType,
    GuideSocialPlatform,
    GuideStatus,
} from "@/constants/guide.const";

// =========================
// INTERFACES
// =========================

/** Metadata for uploaded verification documents */
export interface IGuideDocument {
    category: GuideDocumentCategory;
    fileType: GuideDocumentType;
    fileName?: string;
    fileUrl: string; // store URL instead of base64 for scalability
    uploadedAt?: Date;
}

/** Main Guide interface */
export interface IGuide extends Document {
    // Core company identity
    companyName: string;
    bio?: string;
    social?: {
        platform: GuideSocialPlatform;
        url: string;
    }[];

    // Owner credentials (separate login for guide owner)
    owner: {
        name: string;
        email: string;
        password?: string; // hashed, optional for OAuth
        phone?: string;
        oauthProvider?: string; // e.g. "google", "facebook"
    };

    // Verification documents
    documents: IGuideDocument[];

    // Verification status
    status: GuideStatus;
    appliedAt?: Date;
    reviewedAt?: Date;
    reviewer?: Types.ObjectId;

    // Suspension lifecycle
    suspension?: {
        reason: string;
        suspendedBy: Types.ObjectId;
        until: Date;
        createdAt: Date;
    };

    // Soft delete
    deletedAt?: Date;

    // Virtuals
    isSuspended?: boolean;
    isActive?: boolean;
}

// =========================
// SCHEMA
// =========================

const GuideSchema = new Schema<IGuide>(
    {
        // Core identity
        companyName: { type: String, required: true, trim: true },
        bio: { type: String, trim: true },

        // Social links
        social: [
            {
                platform: {
                    type: String,
                    enum: Object.values(GUIDE_SOCIAL_PLATFORM),
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                    trim: true,
                    validate: {
                        validator: (v: string) => /^https?:\/\/[^\s$.?#].[^\s]*$/.test(v),
                        message: (props: import("mongoose").ValidatorProps) =>
                            `${props.value} is not a valid URL!`,
                    },
                },
            },
        ],

        // Owner credentials
        owner: {
            name: { type: String, required: true, trim: true },
            email: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                lowercase: true, // normalize for uniqueness
            },
            password: {
                type: String,
                required: function (this: IGuide) {
                    // allow optional password for OAuth
                    return !this.owner?.["oauthProvider"];
                },
            },
            phone: {
                type: String,
                trim: true,
                validate: {
                    validator: function (v: string) {
                        // Accepts +8801XXXXXXXXX or 01XXXXXXXXX
                        return /^(\+8801[3-9]\d{8}|01[3-9]\d{8})$/.test(v);
                    },
                    message: (props: import("mongoose").ValidatorProps) =>
                        `${props.value} is not a valid Bangladeshi phone number!`,
                },
            },
        },

        // Verification documents
        documents: [
            {
                category: {
                    type: String,
                    enum: Object.values(GUIDE_DOCUMENT_CATEGORY),
                    required: true,
                },
                fileType: {
                    type: String,
                    enum: Object.values(GUIDE_DOCUMENT_TYPE),
                    required: true,
                },
                fileName: { type: String, trim: true },
                fileUrl: { type: Schema.Types.ObjectId, ref: "Document" }, // scalable storage
                uploadedAt: { type: Date, default: Date.now },
            },
        ],

        // Verification lifecycle
        status: {
            type: String,
            enum: Object.values(GUIDE_STATUS),
            default: GUIDE_STATUS.PENDING,
        },
        appliedAt: Date,
        reviewedAt: Date,
        reviewer: { type: Schema.Types.ObjectId, ref: "User" },

        // Suspension
        suspension: {
            reason: String,
            suspendedBy: { type: Schema.Types.ObjectId, ref: "User" },
            until: Date,
            createdAt: { type: Date, default: Date.now },
        },

        // Soft delete
        deletedAt: Date,
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                if (ret.owner) {
                    delete ret.owner.password; // hide password in API responses
                }
                return ret;
            },
        },
        toObject: { virtuals: true },
    }
);

// =========================
// VIRTUALS
// =========================

/** Whether the guide is currently suspended */
GuideSchema.virtual("isSuspended").get(function (this: IGuide) {
    return !!(this.suspension?.until && this.suspension.until > new Date());
});

/** Whether the guide is active (not deleted + approved) */
GuideSchema.virtual("isActive").get(function (this: IGuide) {
    return !this.deletedAt && this.status === GUIDE_STATUS.APPROVED;
});

// =========================
// MIDDLEWARE
// =========================

/** Normalize phone numbers before saving */
GuideSchema.pre("save", function (next) {
    if (this.owner?.phone) {
        // Normalize: replace leading 0 with +880
        this.owner.phone = this.owner.phone.replace(/^0/, "+880");
    }
    next();
});

/** Exclude soft-deleted guides from queries by default */
GuideSchema.pre<Query<IGuide, IGuide>>(/^find/, function (next) {
    this.where({ deletedAt: null });
    next();
});

// =========================
// INDEXES
// =========================

// Text search (only one text index allowed per collection)
GuideSchema.index({
    companyName: "text",
    bio: "text",
    "social.url": "text", // index actual URL field
});

// Filtering + sorting
GuideSchema.index({ status: 1, deletedAt: 1 });
GuideSchema.index({ createdAt: -1 });

// =========================
// MODEL FACTORY
// =========================

export const GuideModel = models.Guide || model<IGuide>("Guide", GuideSchema);
