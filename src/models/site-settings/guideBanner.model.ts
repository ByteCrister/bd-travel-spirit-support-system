// models/site-settings/guideBanner.model.ts
import { defineModel } from "@/lib/helpers/defineModel";
import restoredSuffix from "@/lib/helpers/restore-suffix";
import { Schema, Model, Types, HydratedDocument } from "mongoose";

export type ObjectId = Types.ObjectId;

export interface IGuideBannerSetting {
    _id?: ObjectId;
    asset: ObjectId;
    alt?: string | null;
    caption?: string | null;
    order?: number;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deleteAt?: Date | null;
}

export type IGuideBanner = HydratedDocument<IGuideBannerSetting>;

export interface GuideBannerSettingModel extends Model<IGuideBannerSetting> {
    upsertByAsset(assetId: ObjectId, payload: Partial<IGuideBannerSetting>): Promise<IGuideBanner>;
    softDeleteById(id: ObjectId | string): Promise<IGuideBanner | null>;
    restoreById(id: ObjectId | string): Promise<IGuideBanner | null>;
}

const GuideBannerSettingSchema = new Schema<IGuideBannerSetting, GuideBannerSettingModel>(
    {
        asset: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
        alt: { type: String, trim: true, maxlength: 250, default: null },
        caption: { type: String, trim: true, maxlength: 500, default: null },
        order: { type: Number, default: 0, index: true },
        active: { type: Boolean, default: true, index: true },
        deleteAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

/**
 * Upsert by asset:
 * - If a document with the given asset exists (including deleted ones), update it.
 * - Otherwise create a new document.
 */
GuideBannerSettingSchema.statics.upsertByAsset = async function (
    assetId: ObjectId,
    payload: Partial<IGuideBannerSetting>
): Promise<IGuideBanner> {
    const existing = await this.findOne({ asset: assetId });

    if (!existing) {
        return this.create({ asset: assetId, ...payload });
    }

    Object.assign(existing, payload);
    await existing.save();
    return existing;
};

/**
 * Soft-delete helper: mark a document as deleted by setting deleteAt and deactivating it.
 */
GuideBannerSettingSchema.statics.softDeleteById = async function (
    id: ObjectId | string
): Promise<IGuideBanner | null> {
    const doc = await this.findById(id);
    if (!doc) return null;
    if (doc.deleteAt) return doc; // already deleted

    doc.deleteAt = new Date();
    doc.active = false;
    await doc.save();
    return doc;
};

/**
 * Restore helper:
 * - If the document is not deleted, returns it unchanged.
 * - If restoring would cause an alt conflict with an existing non-deleted banner,
 *   append a restoredSuffix to the alt and ensure uniqueness by repeating until unique.
 * - If the banner's alt is null and a conflict check is requested, we leave alt as null.
 */
GuideBannerSettingSchema.statics.restoreById = async function (
    id: ObjectId | string
): Promise<IGuideBanner | null> {
    const doc = await this.findById(id);
    if (!doc) return null;
    if (!doc.deleteAt) return doc; // already active

    const Model = this as GuideBannerSettingModel;

    // Only check alt conflicts when alt is non-null and non-empty
    if (doc.alt) {
        let desiredAlt = doc.alt;
        let conflict = await Model.findOne({ alt: desiredAlt, deleteAt: null }).lean();

        // If conflict exists, append restoredSuffix and ensure uniqueness
        while (conflict) {
            desiredAlt = `${desiredAlt}${restoredSuffix()}`;
            conflict = await Model.findOne({ alt: desiredAlt, deleteAt: null }).lean();
        }

        doc.alt = desiredAlt;
    }

    doc.deleteAt = null;
    doc.active = true;
    await doc.save();
    return doc;
};

const GuideBannerSetting = defineModel("GuideBannerSetting", GuideBannerSettingSchema) as GuideBannerSettingModel;

export default GuideBannerSetting;
