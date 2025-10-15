import { Schema, Document, Types, model, models } from "mongoose";
import {
    GUIDE_DOCUMENT_CATEGORY,
    GUIDE_DOCUMENT_TYPE,
    GUIDE_SOCIAL_PLATFORM,
    GUIDE_STATUS,
} from "@/constants/guide.const";

// =========================
// INTERFACES
// =========================

export interface IGuideDocument {
    category: GUIDE_DOCUMENT_CATEGORY;
    base64Content: string;
    fileType: GUIDE_DOCUMENT_TYPE;
    fileName?: string;
    uploadedAt?: Date;
}

export interface IGuide extends Document {
    // Core company identity
    companyName: string;
    bio?: string;
    social?: {
        platform: GUIDE_SOCIAL_PLATFORM;
        url: string;
    }[];

    // Owner credentials (separate login for guide owner)
    owner: {
        name: string;
        email: string;
        password?: string; // hashed, optional so we can safely delete in toJSON
        phone?: string;
    };

    // Verification documents
    documents: IGuideDocument[];

    // Verification status
    status: GUIDE_STATUS;
    appliedAt?: Date;
    reviewedAt?: Date;
    reviewer?: Types.ObjectId;

    // Suspension (same as User)
    suspension?: {
        reason: string;
        suspendedBy: Types.ObjectId;
        until: Date;
        createdAt: Date;
    };

    // Soft delete
    deletedAt?: Date;

    // Tours created by this guide
    toursCreated?: Types.ObjectId[];

    // Virtuals
    isSuspended?: boolean;
}

// =========================
// SCHEMA
// =========================

const GuideSchema = new Schema<IGuide>(
    {
        companyName: { type: String, required: true, trim: true },
        bio: { type: String, trim: true },
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

        owner: {
            name: { type: String, required: true, trim: true },
            email: { type: String, required: true, unique: true, trim: true },
            password: { type: String, required: true }, // hashed
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

        documents: [
            {
                category: {
                    type: String,
                    enum: Object.values(GUIDE_DOCUMENT_CATEGORY),
                    required: true,
                },
                base64Content: { type: String, required: true },
                fileType: {
                    type: String,
                    enum: Object.values(GUIDE_DOCUMENT_TYPE),
                    required: true,
                },
                fileName: { type: String, trim: true },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],

        status: {
            type: String,
            enum: Object.values(GUIDE_STATUS),
            default: GUIDE_STATUS.PENDING,
        },

        appliedAt: Date,
        reviewedAt: Date,
        reviewer: { type: Schema.Types.ObjectId, ref: "User" },

        suspension: {
            reason: String,
            suspendedBy: { type: Schema.Types.ObjectId, ref: "User" },
            until: Date,
            createdAt: Date,
        },

        deletedAt: Date,

        toursCreated: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
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

GuideSchema.virtual("isSuspended").get(function (this: IGuide) {
    return !!(this.suspension?.until && this.suspension.until > new Date());
});

GuideSchema.pre("save", function (next) {
    if (this.owner?.phone) {
        // Normalize: if starts with 0, replace with +880
        if (this.owner.phone.startsWith("0")) {
            this.owner.phone = "+88" + this.owner.phone;
        }
    }
    next();
});

// =========================
// INDEXES
// =========================

GuideSchema.index({ companyName: "text", bio: "text", social: "text" });
GuideSchema.index({ status: 1 });
GuideSchema.index({ createdAt: -1 });

// =========================
// MODEL FACTORY
// =========================

export const GuideModel = models.Guide || model<IGuide>("Guide", GuideSchema);
