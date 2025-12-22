// models/site-settings/socialLink.model.ts
import { Schema, Model, Types, models, model } from "mongoose";

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
}


export interface SocialLinkSettingModel extends Model<ISocialLinkSetting> {
    normalizeAndAssignOrder(links: ISocialLinkSetting[]): ISocialLinkSetting[];
}

const SocialLinkSettingSchema = new Schema<ISocialLinkSetting>(
    {
        key: { type: String, required: true },
        label: { type: String },
        icon: { type: String },
        url: { type: String, required: true },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

/**
 * Utility: same normalization logic as original SiteSettings model.
 * - Deactivate duplicate URLs (only first active remains active)
 * - Sort by order then createdAt
 * - Reassign order sequentially starting from 1
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

const SocialLinkSetting =
    (models.SocialLinkSetting as SocialLinkSettingModel) ||
    model<ISocialLinkSetting, SocialLinkSettingModel>("SocialLinkSetting", SocialLinkSettingSchema);

export default SocialLinkSetting;
