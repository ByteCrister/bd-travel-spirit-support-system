// models/pendingOrganizer.model.ts
import mongoose, { Schema, Document, model, models } from "mongoose";
import { ORGANIZER_STATUS } from "./user.model";

/** ===============================
 * TYPES
 * =============================== */

// Supported file types
export enum OrganizerDocumentType {
    IMAGE = 'image',
    PDF = 'pdf',
    DOCX = 'docx',
}

// Document categories
export enum OrganizerDocumentCategory {
    GOVERNMENT_ID = 'government_id',
    BUSINESS_LICENSE = 'business_license',
    PROFESSIONAL_PHOTO = 'professional_photo',
    CERTIFICATION = 'certification',
}

/** Address type */
export interface PendingOrganizerAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
}

/** Organizer document type */
export interface PendingOrganizerDocument {
    category: OrganizerDocumentCategory;
    base64Content: string;
    fileType: OrganizerDocumentType;
    fileName?: string;
    uploadedAt: Date;
}

/** Main pending organizer interface */
export interface IPendingOrganizer extends Document {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    address?: PendingOrganizerAddress;
    companyName: string;
    bio?: string;
    social?: string;
    documents: PendingOrganizerDocument[];
    status: ORGANIZER_STATUS;
    appliedAt: Date;
    reviewer?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
}

/** ===============================
 * SCHEMAS
 * =============================== */

/** Address schema */
const AddressSchema = new Schema<PendingOrganizerAddress>(
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
const DocumentSchema = new Schema<PendingOrganizerDocument>(
    {
        category: { type: String, enum: Object.values(OrganizerDocumentCategory), required: true },
        base64Content: { type: String, required: true },
        fileType: { type: String, enum: Object.values(OrganizerDocumentType), required: true },
        fileName: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

/** Pending organizer schema */
const PendingOrganizerSchema = new Schema<IPendingOrganizer>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        avatar: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: AddressSchema,
        companyName: { type: String, required: true, trim: true },
        bio: { type: String, trim: true },
        social: { type: String, trim: true },
        documents: {
            type: [DocumentSchema],
            required: true,
            validate: [
                (val: PendingOrganizerDocument[]) => val.length > 0,
                "At least one document is required",
            ],
        },
        status: { type: String, enum: Object.values(ORGANIZER_STATUS), default: ORGANIZER_STATUS.PENDING },
        appliedAt: { type: Date, default: Date.now },
        reviewer: { type: Schema.Types.ObjectId, ref: "User" },
        reviewedAt: Date,
    },
    { timestamps: true }
);

/** ===============================
 * INDEXES
 * =============================== */
PendingOrganizerSchema.index({ status: 1 });
PendingOrganizerSchema.index({ appliedAt: -1 });

/** ===============================
 * MODEL EXPORT
 * =============================== */
export const PendingOrganizerModel =
    models.PendingOrganizer || model<IPendingOrganizer>("PendingOrganizer", PendingOrganizerSchema);
