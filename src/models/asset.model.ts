// models/asset.model.ts
import {
    ASSET_TYPE,
    AssetType,
    STORAGE_PROVIDER,
    StorageProvider,
    VISIBILITY,
    Visibility,
} from "@/constants/asset.const";
import { defineModel } from "@/lib/helpers/defineModel";
import { Types, Schema, Document, Model, Query } from "mongoose";
import type { UpdateResult } from "mongodb";

/**
 * Query helpers interface for typed .notDeleted()
 */
interface AssetQueryHelpers {
    notDeleted(this: Query<IAsset[], IAsset, AssetQueryHelpers>): Query<IAsset[], IAsset, AssetQueryHelpers>;
}

/**
 * Asset document interface (includes instance helpers)
 */
export interface IAsset extends Document {
    storageProvider: StorageProvider;
    objectKey: string;
    publicUrl: string;
    contentType: string;
    fileSize: number;
    checksum: string;

    assetType: AssetType;

    title?: string;
    description?: string;
    tags?: string[];

    visibility: Visibility;

    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    // Instance helpers
    softDelete(): Promise<IAsset>;
    restore(): Promise<IAsset>;
}

/**
 * Extended model interface (statics)
 */
export interface IAssetModel extends Model<IAsset, AssetQueryHelpers> {
    softDeleteById(id: Types.ObjectId | string): Promise<IAsset | null>;
    restoreById(id: Types.ObjectId | string): Promise<IAsset | null>;
    softDeleteMany(filter: Record<string, unknown>): Promise<{ matchedCount: number; modifiedCount: number }>;
    restoreMany(filter: Record<string, unknown>): Promise<{ matchedCount: number; modifiedCount: number }>;
    findNotDeleted(filter?: Record<string, unknown>): Query<IAsset[], IAsset, AssetQueryHelpers>;
    findDeleted(filter?: Record<string, unknown>): Query<IAsset[], IAsset, AssetQueryHelpers>;
}

export type AssetRef = Types.ObjectId | Pick<IAsset, "publicUrl">;

const AssetSchema = new Schema<IAsset, IAssetModel, Record<string, never>, AssetQueryHelpers>(
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

        visibility: { type: String, enum: Object.values(VISIBILITY), default: VISIBILITY.PRIVATE, index: true },

        deletedAt: { type: Date, default: null },
    },
    { timestamps: true, versionKey: false }
);

// Deduplication index (only for non-deleted docs)
AssetSchema.index({ checksum: 1 }, { unique: true, partialFilterExpression: { deletedAt: { $eq: null } } });

// Text search on metadata
AssetSchema.index({ title: "text", description: "text", tags: "text" });

/**
 * Query helper: exclude soft-deleted documents
 */
AssetSchema.query.notDeleted = function (this: Query<IAsset[], IAsset, AssetQueryHelpers>) {
    return this.where({ deletedAt: null });
};

/**
 * Instance methods
 */
AssetSchema.methods.softDelete = async function (this: IAsset): Promise<IAsset> {
    if (this.deletedAt) return this;
    this.deletedAt = new Date();
    await this.save();
    return this;
};

AssetSchema.methods.restore = async function (this: IAsset): Promise<IAsset> {
    if (!this.deletedAt) return this;
    this.deletedAt = null;
    await this.save();
    return this;
};

/**
 * Static methods
 */
AssetSchema.statics.softDeleteById = async function (this: IAssetModel, id: Types.ObjectId | string) {
    const now = new Date();
    const res = await this.findOneAndUpdate(
        { _id: id, deletedAt: { $eq: null } },
        { $set: { deletedAt: now } },
        { new: true }
    ).exec();
    return res;
};

AssetSchema.statics.restoreById = async function (this: IAssetModel, id: Types.ObjectId | string) {
    const res = await this.findOneAndUpdate(
        { _id: id, deletedAt: { $ne: null } },
        { $set: { deletedAt: null } },
        { new: true }
    ).exec();
    return res;
};

AssetSchema.statics.softDeleteMany = async function (this: IAssetModel, filter: Record<string, unknown>) {
    const now = new Date();
    const res: UpdateResult = await this.updateMany({ ...filter, deletedAt: { $eq: null } }, { $set: { deletedAt: now } }).exec();
    const matchedCount = res.matchedCount ?? 0;
    const modifiedCount = res.modifiedCount ?? 0;
    return { matchedCount, modifiedCount };
};

AssetSchema.statics.restoreMany = async function (this: IAssetModel, filter: Record<string, unknown>) {
    const res: UpdateResult = await this.updateMany({ ...filter, deletedAt: { $ne: null } }, { $set: { deletedAt: null } }).exec();
    const matchedCount = res.matchedCount ?? 0;
    const modifiedCount = res.modifiedCount ?? 0;
    return { matchedCount, modifiedCount };
};

AssetSchema.statics.findNotDeleted = function (this: IAssetModel, filter: Record<string, unknown> = {}) {
    return this.find({ ...filter, deletedAt: { $eq: null } }) as Query<IAsset[], IAsset, AssetQueryHelpers>;
};

AssetSchema.statics.findDeleted = function (this: IAssetModel, filter: Record<string, unknown> = {}) {
    return this.find({ ...filter, deletedAt: { $ne: null } }) as Query<IAsset[], IAsset, AssetQueryHelpers>;
};

/**
 * Export model (cast to extended model interface)
 *
 * `defineModel` is expected to return a Mongoose Model. Cast to IAssetModel for TypeScript.
 */
export const AssetModel = defineModel("Asset", AssetSchema) as unknown as IAssetModel;
export default AssetModel;