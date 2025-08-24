// models/Image.ts
import { Schema, model, Document, Types, Connection } from "mongoose";

/**
 * =================================
 * INTERFACE — IMAGE DOCUMENT SHAPE
 * =================================
 */
export interface IImage extends Document {
    /** Direct link or Base64-encoded data for the image */
    data: string;

    /** MIME type (e.g., "image/jpeg", "image/png") */
    contentType: string;

    /** Short description for accessibility (screen readers, SEO) */
    altText: string;

    /** Optional caption shown under the image in UI */
    caption?: string;

    /** Keyword tags for filtering and search (e.g., ["sunset", "beach"]) */
    tags?: string[];

    /** Reference to the user who uploaded this image */
    uploadedBy: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * ==================
 * IMAGE SCHEMA
 * ==================
 */
const ImageSchema = new Schema<IImage>(
    {
        /**
         * Image source.
         * Can store Base64 data or an external CDN URL.
         * We only validate Base64 if it starts with `data:`.
         */
        data: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (v: string) => {
                    if (v.startsWith("data:")) {
                        return /^data:\w+\/[a-zA-Z\-\+]+;base64,/.test(v);
                    }
                    return true; // Allow URLs without Base64 check
                },
                message: (props) =>
                    `${props.value} is not a valid Base64 data URI or image URL!`,
            },
        },

        /** Standard MIME type */
        contentType: { type: String, required: true, trim: true },

        /** For accessibility and SEO */
        altText: { type: String, required: true, trim: true },

        /** Optional caption shown in galleries */
        caption: { type: String, trim: true },

        /** Searchable keywords */
        tags: [{ type: String, lowercase: true, trim: true, index: true }],

        /** Who uploaded the image */
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

/**
 * ==================
 * INDEXES
 * ==================
 * Tag + uploadedBy combo is useful for quickly finding images
 * uploaded by a specific user within a tag category.
 */
ImageSchema.index({ uploadedBy: 1, tags: 1 });

/**
 * ==================
 * MODEL FACTORY
 * ==================
 * Ensures safe model reuse across hot-reloads & multiple connections.
 */
export const getImageModel = (db: Connection) =>
    db.models.Image || db.model<IImage>("Image", ImageSchema);

/** Default export for single connection usage */
export const Image = model<IImage>("Image", ImageSchema);
