import { Schema, model, models, Document, Types } from "mongoose";

export enum IMAGE_VARIANT {
    THUMB = "thumb",
    SM = "sm",
    MD = "md",
    LG = "lg",
    WEBP = "webp",
    AVIF = "avif",
}

// Moderation status for uploaded images
export enum MODERATION_STATUS {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}

// Image visibility / access level
export enum VISIBILITY {
    PRIVATE = "private",   // Only uploader (and authorized users) can view
    UNLISTED = "unlisted", // Accessible via direct link, not indexed
    PUBLIC = "public",     // Fully public
}

// License / usage rights for uploaded images
export enum LICENSE {
    ALL_RIGHTS_RESERVED = "all_rights_reserved",
    CC_BY = "cc-by",
    CC_BY_SA = "cc-by-sa",
    CC0 = "cc0",
    OTHER = "other",
}

// Storage providers supported by the system
export enum STORAGE_PROVIDER {
    S3 = "s3",
    GCS = "gcs",
    LOCAL = "local",
    CLOUDINARY = "cloudinary",
}


/**
 * Image document interface
 * Represents all metadata + ownership info for uploaded images
 */
export interface IImage extends Document {
    // Storage & identity
    storageProvider: STORAGE_PROVIDER;
    objectKey: string;           // e.g., bucket/key or Cloudinary public_id
    publicUrl: string;           // CDN-backed, https only
    contentType: string;         // Verified server-side (image/jpeg, etc.)
    fileSize: number;            // Size in bytes
    checksum: string;            // sha256 hex digest for deduplication

    // Semantics & display
    altText: string;             // Required for accessibility (max 160 chars)
    caption?: string;            // Optional image caption
    tags?: string[];             // Searchable tags (max 20)

    // Derived metadata
    width: number;
    height: number;
    aspectRatio: number;         // width / height
    orientation?: "landscape" | "portrait" | "square";
    dominantColor?: string;      // Hex string (e.g. "#aabbcc")
    blurhash?: string;           // Compact blur representation
    focalPoint?: { x: number; y: number }; // 0..1 coordinates

    // Variants (renditions for responsive delivery)
    variants?: {
        label: IMAGE_VARIANT;
        url: string;
        width: number;
        height: number;
        contentType: string;
        fileSize?: number;
    }[];

    // Safety & moderation
    moderationStatus: MODERATION_STATUS;
    flags?: {
        nsfw?: boolean;
        violence?: boolean;
        spoof?: boolean;
    };
    reviewedAt?: Date;
    reviewedBy?: Types.ObjectId;

    // Licensing & attribution
    exifStripped: boolean;
    license?: LICENSE;
    attribution?: string;

    // Ownership & access
    uploadedBy: Types.ObjectId;
    visibility: VISIBILITY;

    // Lifecycle
    deletedAt?: Date;

    // Auto timestamps
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Image schema definition
 * Includes validation, indexes, and computed fields
 */
const ImageSchema = new Schema<IImage>(
    {
        // Storage
        storageProvider: { type: String, enum: Object.values(STORAGE_PROVIDER), required: true },
        objectKey: { type: String, required: true, trim: true },
        publicUrl: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (v: string) => /^https:\/\/[^\s]+$/.test(v),
                message: "publicUrl must be a valid https URL.",
            },
            index: true,
        },
        contentType: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (v: string) => /^image\/(jpeg|png|gif|webp|avif|svg\+xml)$/.test(v),
                message: "Unsupported image content type.",
            },
            index: true,
        },
        fileSize: { type: Number, required: true, min: 1, max: 15 * 1024 * 1024 }, // 15 MB max
        checksum: { type: String, required: true, trim: true },

        // Semantics
        altText: { type: String, required: true, trim: true, maxlength: 160 },
        caption: { type: String, trim: true, maxlength: 300 },
        tags: {
            type: [{ type: String, lowercase: true, trim: true }],
            validate: {
                validator: (arr: string[]) => !arr || (arr.length <= 20 && arr.every(t => t.length <= 32)),
                message: "Too many tags or tag too long.",
            },
            index: true,
        },

        // Derived metadata
        width: { type: Number, required: true, min: 1 },
        height: { type: Number, required: true, min: 1 },
        aspectRatio: { type: Number, required: true, min: 0 },
        orientation: { type: String, enum: ["landscape", "portrait", "square"] },
        dominantColor: { type: String, trim: true },
        blurhash: { type: String, trim: true },
        focalPoint: {
            x: { type: Number, min: 0, max: 1 },
            y: { type: Number, min: 0, max: 1 },
        },

        // Variants
        variants: [
            {
                label: { type: String, enum: Object.values(IMAGE_VARIANT), required: true },
                url: {
                    type: String,
                    trim: true,
                    validate: {
                        validator: (v: string) => !v || /^https:\/\/[^\s]+$/.test(v),
                        message: "Variant URL must be https.",
                    },
                },
                width: { type: Number, min: 1 },
                height: { type: Number, min: 1 },
                contentType: { type: String, trim: true },
                fileSize: { type: Number, min: 1 },
                _id: false,
            },
        ],

        // Moderation
        moderationStatus: {
            type: String,
            enum: Object.values(MODERATION_STATUS),
            default: MODERATION_STATUS.PENDING,
            index: true,
        },
        flags: {
            nsfw: { type: Boolean, default: false },
            violence: { type: Boolean, default: false },
            spoof: { type: Boolean, default: false },
        },
        reviewedAt: Date,
        reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },

        // License
        exifStripped: { type: Boolean, default: true },
        license: { type: String, enum: Object.values(LICENSE), default: LICENSE.ALL_RIGHTS_RESERVED },
        attribution: { type: String, trim: true, maxlength: 200 },

        // Ownership
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        visibility: { type: String, enum: Object.values(VISIBILITY), default: VISIBILITY.PUBLIC, index: true },

        // Lifecycle
        deletedAt: { type: Date },
    },
    { timestamps: true, versionKey: false }
);

/**
 * Pre-validate hook to compute aspect ratio & orientation
 */
ImageSchema.pre("validate", function (next) {
    if (this.width && this.height) {
        this.aspectRatio = this.width / this.height;
        if (!this.orientation) {
            this.orientation =
                this.width === this.height ? "square" : this.width > this.height ? "landscape" : "portrait";
        }
    }
    next();
});

// Indexes for performance
ImageSchema.index({ uploadedBy: 1, createdAt: -1 });
ImageSchema.index({ tags: 1, createdAt: -1 });
ImageSchema.index(
    { checksum: 1 },
    { unique: true, partialFilterExpression: { deletedAt: { $eq: null } } }
);
// Full-text search for alt/caption with weights
ImageSchema.index(
    { altText: "text", caption: "text" },
    { weights: { altText: 5, caption: 2 } }
);

// Factory
export const ImageModel = models.Image || model<IImage>("Image", ImageSchema);
