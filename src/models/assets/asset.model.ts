import { defineModel } from "@/lib/helpers/defineModel";
import { ASSET_TYPE, VISIBILITY, AssetType, Visibility } from "@/constants/asset.const";
import {
    Schema,
    Types,
    Model,
    Query,
    ClientSession,
    HydratedDocument,
} from "mongoose";
import AssetFileModel from "./asset-file.model";

/* =========================================================
 * Types
 * ======================================================= */

type Session = ClientSession | undefined;

/* =========================================================
 * Query helpers
 * ======================================================= */
interface AssetQueryHelpers {
    notDeleted(
        this: Query<HydratedDocument<IAsset>[], IAsset, AssetQueryHelpers>
    ): Query<HydratedDocument<IAsset>[], IAsset, AssetQueryHelpers>;
}

/* =========================================================
 * Asset document interface (PLAIN DATA ONLY)
 * ======================================================= */
export interface IAsset {
    file: Types.ObjectId;

    assetType: AssetType;
    title?: string;
    description?: string;
    tags?: string[];

    visibility: Visibility;

    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

/* =========================================================
 * Instance methods
 * ======================================================= */
interface AssetMethods {
    softDelete(session?: Session): Promise<HydratedDocument<IAsset>>;
    restore(session?: Session): Promise<HydratedDocument<IAsset>>;
}

/* =========================================================
 * Asset model interface
 * ======================================================= */
export interface IAssetModel
    extends Model<IAsset, AssetQueryHelpers, AssetMethods> {
    softDeleteById(
        id: Types.ObjectId | string,
        session?: Session
    ): Promise<HydratedDocument<IAsset> | null>;

    restoreById(
        id: Types.ObjectId | string,
        session?: Session
    ): Promise<HydratedDocument<IAsset> | null>;

    softDeleteMany(
        filter: Record<string, unknown>,
        session?: Session
    ): Promise<{ matchedCount: number; modifiedCount: number }>;
}

/* =========================================================
 * Schema
 * ======================================================= */
const AssetSchema = new Schema<
    IAsset,
    IAssetModel,
    AssetMethods,
    AssetQueryHelpers
>(
    {
        file: {
            type: Schema.Types.ObjectId,
            ref: "AssetFile",
            required: true,
            index: true,
        },

        assetType: {
            type: String,
            enum: Object.values(ASSET_TYPE),
            default: ASSET_TYPE.OTHER,
            index: true,
        },

        title: { type: String, trim: true },
        description: { type: String, trim: true },
        tags: [{ type: String, lowercase: true, trim: true }],

        visibility: {
            type: String,
            enum: Object.values(VISIBILITY),
            default: VISIBILITY.PRIVATE,
            index: true,
        },

        deletedAt: { type: Date, default: null },
    },
    { timestamps: true, versionKey: false }
);

/* =========================================================
 * Indexes
 * ======================================================= */
AssetSchema.index({ file: 1, deletedAt: 1 });
AssetSchema.index({ title: "text", description: "text", tags: "text" });

/* =========================================================
 * Query helpers
 * ======================================================= */
AssetSchema.query.notDeleted = function () {
    return this.where({ deletedAt: null });
};

/* =========================================================
 * Hooks
 * ======================================================= */

AssetSchema.pre("save", async function () {
    const session = this.$session();

    if (this.isNew) {
        // New asset, increment ref
        await AssetFileModel.incrementRef(this.file.toString(), session ?? undefined);
    } else if (this.isModified("deletedAt")) {
        // Soft delete / restore
        if (this.deletedAt) {
            await AssetFileModel.decrementRef(this.file.toString(), session ?? undefined);
        } else {
            await AssetFileModel.incrementRef(this.file.toString(), session ?? undefined);
        }
    }
});

/* =========================================================
 * Instance methods
 * ======================================================= */
AssetSchema.methods.softDelete = async function (session?: Session) {
    if (this.deletedAt) return this;

    this.deletedAt = new Date();
    await this.save({ session });
    return this;
};

AssetSchema.methods.restore = async function (session?: Session) {
    if (!this.deletedAt) return this;

    this.deletedAt = null;
    await this.save({ session });
    return this;
};

/* =========================================================
 * Static methods
 * ======================================================= */
AssetSchema.statics.softDeleteById = async function (
    id: Types.ObjectId | string,
    session?: Session
) {
    const asset = await this.findOne({ _id: id, deletedAt: null }).session(session ?? null);
    if (!asset) return null;

    await asset.softDelete(session);
    return asset;
};

AssetSchema.statics.restoreById = async function (
    id: Types.ObjectId | string,
    session?: Session
) {
    const asset = await this.findOne({ _id: id, deletedAt: { $ne: null } }).session(
        session ?? null
    );
    if (!asset) return null;

    await asset.restore(session);
    return asset;
};

AssetSchema.statics.softDeleteMany = async function (
    filter: Record<string, unknown>,
    session?: Session
) {
    const assets = await this.find({ ...filter, deletedAt: null }).session(session ?? null);

    for (const asset of assets) {
        await asset.softDelete(session);
    }

    return {
        matchedCount: assets.length,
        modifiedCount: assets.length,
    };
};

/* =========================================================
 * Export
 * ======================================================= */
export const AssetModel = defineModel<IAsset, IAssetModel>(
    "Asset",
    AssetSchema
);

export default AssetModel;