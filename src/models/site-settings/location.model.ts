// models/site-settings/location.model.ts
import { Schema, Model, Types, models, model, HydratedDocument } from "mongoose";

export type ObjectId = Types.ObjectId;

export interface ILocationEntry {
    _id?: ObjectId;
    key: string;
    country: string;
    region?: string;
    city?: string;
    slug?: string;
    lat: number;
    lng: number;
    active: boolean;
    location?: {
        type: "Point";
        coordinates: [number, number];
    };
    createdAt?: Date;
    updatedAt?: Date;
}

// Hydrated doc type — correct & simple
export type ILocationSettingEntry = HydratedDocument<ILocationEntry>;

// Custom model interface
export interface LocationSettingModel extends Model<ILocationEntry> {
    upsertByKey(payload: Partial<ILocationEntry>): Promise<ILocationSettingEntry>;
}

const LocationSettingSchema = new Schema<ILocationEntry, LocationSettingModel>(
    {
        key: { type: String, required: true },
        country: { type: String, required: true },
        region: { type: String },
        city: { type: String },
        slug: { type: String },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        location: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: [0, 0] },
        },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

LocationSettingSchema.index({ location: "2dsphere" });

LocationSettingSchema.statics.upsertByKey = async function (
    payload: Partial<ILocationEntry>
): Promise<ILocationSettingEntry> {
    if (!payload.key) throw new Error("key is required for upsertByKey");

    const existing = await this.findOne({ key: payload.key });

    if (!existing) return this.create(payload);

    Object.assign(existing, payload);
    await existing.save();
    return existing;
};

const LocationSetting =
    (models.LocationSetting as LocationSettingModel) ||
    model<ILocationEntry, LocationSettingModel>("LocationSetting", LocationSettingSchema);

export default LocationSetting;
