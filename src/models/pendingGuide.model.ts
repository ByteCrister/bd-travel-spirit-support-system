// models/pendingGuide.model.ts
import mongoose, { Schema, Document, model, models } from "mongoose";
import {
    GUIDE_DOCUMENT_CATEGORY,
    GUIDE_DOCUMENT_TYPE,
    GUIDE_STATUS,
    GuideDocumentCategory,
    GuideDocumentType,
    GuideStatus,
} from "@/constants/guide.const";

/** ===============================
 * TYPES
 * =============================== */

/** Address type */
export interface PendingGuideAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
}

/** Organizer document type */
export interface PendingGuideDocument {
    category: GuideDocumentCategory;
    fileType: GuideDocumentType;
    fileName?: string;
    fileUrl: Schema.Types.ObjectId;
    uploadedAt: Date;
}

/** Main pending organizer interface */
export interface IPendingGuide extends Document {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    address?: PendingGuideAddress;
    companyName: string;
    bio?: string;
    social?: string;
    documents: PendingGuideDocument[];
    status: GuideStatus;
    appliedAt: Date;
    reviewComment?: string;
    reviewer?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
}

/** ===============================
 * SCHEMAS
 * =============================== */

/** Address schema */
const AddressSchema = new Schema<PendingGuideAddress>(
    {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        zip: { type: String, trim: true },
    },
    { _id: false }
);

/** Document schema */
const DocumentSchema = new Schema<PendingGuideDocument>(
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
        fileUrl: { type: Schema.Types.ObjectId, ref: "Asset" },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

/** Pending organizer schema */
const PendingGuideSchema = new Schema<IPendingGuide>(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
        avatar: { type: String, trim: true },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: (v: string) => /^(\+8801[3-9]\d{8}|01[3-9]\d{8})$/.test(v),
                message: "Invalid phone number format",
            },
            set: (v: string) => {
                if (!v) return v;
                // Normalize: if number starts with 0, replace with +880
                if (v.startsWith("01")) {
                    return "+88" + v;
                }
                return v;
            },
        },
        address: AddressSchema,
        companyName: { type: String, required: true, trim: true },
        bio: { type: String, trim: true },
        social: { type: String, trim: true },
        documents: {
            type: [DocumentSchema],
            required: true,
            validate: [
                (val: PendingGuideDocument[]) => val.length > 0,
                "At least one document is required",
            ],
        },
        status: {
            type: String,
            enum: Object.values(GUIDE_STATUS),
            default: GUIDE_STATUS.PENDING,
        },
        appliedAt: { type: Date, default: Date.now },
        reviewComment: { type: String, trim: true },
        reviewer: { type: Schema.Types.ObjectId, ref: "User" },
        reviewedAt: Date,
    },
    { timestamps: true }
);

/** ===============================
 * INDEXES
 * =============================== */
PendingGuideSchema.index({ status: 1 });
PendingGuideSchema.index({ appliedAt: -1 });
PendingGuideSchema.index({ email: 1 });
PendingGuideSchema.index({ companyName: 1 });

/** ===============================
 * MODEL EXPORT
 * =============================== */
export const PendingGuideModel =
    models.PendingGuide ||
    model<IPendingGuide>("PendingGuide", PendingGuideSchema);
