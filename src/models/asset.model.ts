import { ASSET_TYPE, AssetType, MODERATION_STATUS, ModerationStatus, STORAGE_PROVIDER, StorageProvider, VISIBILITY, Visibility } from "@/constants/asset.const";
import { Schema, model, models, Document, Types } from "mongoose";


export interface IAsset extends Document {
    storageProvider: StorageProvider;
    objectKey: string;       // e.g., bucket/key or provider ID
    publicUrl: string;       // https URL to the file
    contentType: string;     // MIME type (image/jpeg, application/pdf, video/mp4, etc.)
    fileSize: number;        // in bytes
    checksum: string;        // sha256 for deduplication

    // Classification
    assetType: AssetType;

    // Optional metadata
    title?: string;
    description?: string;
    tags?: string[];

    // Ownership & access
    uploadedBy: Types.ObjectId;
    visibility: Visibility;

    // Moderation
    moderationStatus: ModerationStatus;
    reviewedAt?: Date;
    reviewedBy?: Types.ObjectId;

    // Lifecycle
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
    {
        storageProvider: {
            type: String,
            enum: Object.values(STORAGE_PROVIDER),
            required: true,
        },
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
        contentType: { type: String, required: true, trim: true },
        fileSize: { type: Number, required: true, min: 1, max: 500 * 1024 * 1024 }, // 500 MB max
        checksum: { type: String, required: true, trim: true },

        assetType: {
            type: String,
            enum: Object.values(ASSET_TYPE),
            default: ASSET_TYPE.OTHER,
            index: true,
        },

        title: { type: String, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        tags: [{ type: String, lowercase: true, trim: true }],

        uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        visibility: { type: String, enum: Object.values(VISIBILITY), default: VISIBILITY.PRIVATE, index: true },

        moderationStatus: {
            type: String,
            enum: Object.values(MODERATION_STATUS),
            default: MODERATION_STATUS.PENDING,
            index: true,
        },
        reviewedAt: Date,
        reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },

        deletedAt: Date,
    },
    { timestamps: true, versionKey: false }
);

// Deduplication index
AssetSchema.index(
    { checksum: 1 },
    { unique: true, partialFilterExpression: { deletedAt: { $eq: null } } }
);

// Text search on metadata
AssetSchema.index({ title: "text", description: "text", tags: "text" });

export const AssetModel = models.Asset || model<IAsset>("Asset", AssetSchema);
