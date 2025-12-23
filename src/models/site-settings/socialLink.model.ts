// models/site-settings/socialLink.model.ts
import { defineModel } from "@/lib/helpers/defineModel";
import restoredSuffix from "@/lib/helpers/restore-suffix";
import { Schema, Model, Types } from "mongoose";

export type ObjectId = Types.ObjectId;

export interface ISocialLinkSetting {
    _id?: ObjectId;
    key: string;
    label?: string;
    icon: string;
    url: string;
    active: boolean;
    order?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deleteAt?: Date | null;
}

export interface SocialLinkSettingModel extends Model<ISocialLinkSetting> {
    normalizeAndAssignOrder(links: ISocialLinkSetting[]): ISocialLinkSetting[];
    softDeleteById(id: ObjectId | string): Promise<ISocialLinkSetting | null>;
    restoreById(id: ObjectId | string): Promise<ISocialLinkSetting | null>;
}

const SocialLinkSettingSchema = new Schema<ISocialLinkSetting>(
    {
        key: { type: String, required: true },
        label: { type: String },
        icon: { type: String },
        url: { type: String, required: true },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        deleteAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

/**
 * Utility: same normalization logic as original SiteSettings model.
 * - Deactivate duplicate URLs (only first active remains active)
 * - Sort by order then createdAt
 * - Reassign order sequentially starting from 1
 *
 * Note: This utility operates on the provided array of links. If you pass
 * in a list that includes deleted items, handle them before calling this helper.
 */
SocialLinkSettingSchema.statics.normalizeAndAssignOrder = function (
    links: ISocialLinkSetting[]
): ISocialLinkSetting[] {
    const seenUrls = new Map<string, boolean>();
    links = links.map((s) => {
        if (s.active) {
            if (seenUrls.has(s.url)) {
                return { ...s, active: false };
            } else {
                seenUrls.set(s.url, true);
                return s;
            }
        }
        return s;
    });

    links.sort(
        (a, b) =>
            (Number(a.order ?? 0) - Number(b.order ?? 0)) ||
            ((a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0))
    );

    return links.map((s, idx) => ({ ...s, order: idx + 1 }));
};

/**
 * Soft-delete helper: mark a document as deleted by setting deleteAt and deactivating it.
 */
SocialLinkSettingSchema.statics.softDeleteById = async function (
    id: ObjectId | string
): Promise<ISocialLinkSetting | null> {
    const doc = await this.findById(id);
    if (!doc) return null;
    if (doc.deleteAt) return doc; // already deleted

    doc.deleteAt = new Date();
    doc.active = false;
    await doc.save();
    return doc.toObject ? doc.toObject() : doc;
};

/**
 * Restore helper:
 * - If the document is not deleted, returns it unchanged.
 * - If restoring would cause a key conflict with an existing non-deleted doc,
 *   append a restoredSuffix and ensure uniqueness by repeating until unique.
 */
SocialLinkSettingSchema.statics.restoreById = async function (
    id: ObjectId | string
): Promise<ISocialLinkSetting | null> {
    const doc = await this.findById(id);
    if (!doc) return null;
    if (!doc.deleteAt) return doc.toObject ? doc.toObject() : doc; // already active

    // Check for key conflict with non-deleted documents
    const Model = this as SocialLinkSettingModel;
    let desiredKey = doc.key;
    let conflict = await Model.findOne({ key: desiredKey, deleteAt: null }).lean();

    // If conflict exists, append restoredSuffix and ensure uniqueness
    while (conflict) {
        desiredKey = `${desiredKey}${restoredSuffix()}`;
        conflict = await Model.findOne({ key: desiredKey, deleteAt: null }).lean();
    }

    doc.key = desiredKey;
    doc.deleteAt = null;
    doc.active = true;
    await doc.save();
    return doc.toObject ? doc.toObject() : doc;
};

const SocialLinkSetting = defineModel("SocialLinkSetting", SocialLinkSettingSchema) as SocialLinkSettingModel;

export default SocialLinkSetting;