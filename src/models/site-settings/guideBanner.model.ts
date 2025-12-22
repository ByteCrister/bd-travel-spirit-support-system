// models/site-settings/guideBanner.model.ts
import { defineModel } from "@/lib/helpers/defineModel";
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
}

export type IGuideBanner = HydratedDocument<IGuideBannerSetting>;

export interface GuideBannerSettingModel extends Model<IGuideBannerSetting> {
    upsertByAsset(assetId: ObjectId, payload: Partial<IGuideBannerSetting>): Promise<IGuideBanner>;
}

const GuideBannerSettingSchema = new Schema<IGuideBannerSetting, GuideBannerSettingModel>(
    {
        asset: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
        alt: { type: String, trim: true, maxlength: 250, default: null },
        caption: { type: String, trim: true, maxlength: 500, default: null },
        order: { type: Number, default: 0, index: true },
        active: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

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

const GuideBannerSetting = defineModel("GuideBannerSetting", GuideBannerSettingSchema);

export default GuideBannerSetting;