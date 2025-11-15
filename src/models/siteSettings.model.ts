import { PlacementType } from "@/constants/advertising.const";
import mongoose, { Schema, Model, Types, models, model } from "mongoose";
import type { HydratedDocument } from "mongoose";

export type ObjectId = Types.ObjectId;

/* ----------- Sub Interfaces ----------- */

export interface AdvertisingPrice {
    placement: PlacementType;
    price: number;
    currency: string;
    defaultDurationDays?: number;
    allowedDurationsDays?: number[];
    active: boolean;
}

export interface AdvertisingConfig {
    pricing: AdvertisingPrice[];
    notes?: string;
}

export interface SubscriptionTier {
    key: string;
    title: string;
    price: number;
    currency: string;
    billingCycleDays: number[];
    perks?: string[];
    active: boolean;
}

export interface SocialLink {
    key: string;
    label?: string;
    url: string;
    active: boolean;
    order?: number;
}

export interface LocationEntry {
    key: string; // unique identifier or slug
    country: string;
    region?: string;
    city?: string;
    slug?: string;
    lat: number; // required
    lng: number; // required
    active: boolean;
    metadata?: Record<string, unknown>;
    location?: {
        // optional GeoJSON for geospatial queries
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    };
}

export interface EnumValue {
    key: string;
    label?: string;
    value: string | number;
    description?: string;
}

export interface EnumGroup {
    name: string;
    description?: string;
    values: EnumValue[];
}

/* ----------- Main Doc Interface ----------- */

export interface SiteSettingsDoc {
    _id?: ObjectId;
    version: number;
    advertising: AdvertisingConfig;
    guideSubscriptions: SubscriptionTier[];
    socialLinks: SocialLink[];
    locations: LocationEntry[];
    enums: EnumGroup[];
    changeLog?: {
        version: number;
        note?: string;
        editedBy?: ObjectId;
        editedAt: Date;
    }[];
    createdAt?: Date;
    updatedAt?: Date;
}

/* ----------- Hydrated Document Type ----------- */

export type ISiteSettings = HydratedDocument<SiteSettingsDoc>;

/* ----------- Model Interface with Statics ----------- */

export interface SiteSettingsModel extends Model<ISiteSettings> {
    upsertSingleton(
        payload: Partial<SiteSettingsDoc>,
        editorId?: ObjectId,
        note?: string
    ): Promise<ISiteSettings>;
}

/* ----------- Sub Schemas ----------- */

const EnumValueSchema = new Schema<EnumValue>(
    {
        key: { type: String, required: true },
        label: { type: String },
        value: { type: Schema.Types.Mixed, required: true },
        description: { type: String },
    },
    { _id: false }
);

const EnumGroupSchema = new Schema<EnumGroup>(
    {
        name: { type: String, required: true },
        description: { type: String },
        values: { type: [EnumValueSchema], default: [] },
    },
    { _id: false }
);

const AdvertisingPriceSchema = new Schema<AdvertisingPrice>(
    {
        placement: { type: String, required: true, index: true },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, default: "USD" },
        defaultDurationDays: { type: Number },
        allowedDurationsDays: { type: [Number], default: [] },
        active: { type: Boolean, default: true },
    },
    { _id: false }
);

const AdvertisingConfigSchema = new Schema<AdvertisingConfig>(
    {
        pricing: { type: [AdvertisingPriceSchema], default: [] },
        notes: { type: String },
    },
    { _id: false }
);

const SubscriptionTierSchema = new Schema<SubscriptionTier>(
    {
        key: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        billingCycleDays: { type: [Number], default: [] },
        perks: { type: [String], default: [] },
        active: { type: Boolean, default: true },
    },
    { _id: false }
);

const SocialLinkSchema = new Schema<SocialLink>(
    {
        key: { type: String, required: true },
        label: { type: String },
        url: { type: String, required: true },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const LocationSchema = new Schema<LocationEntry>(
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
            coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
        },
        active: { type: Boolean, default: true },
        metadata: { type: Schema.Types.Mixed },
    },
    { _id: false }
);
LocationSchema.index({ location: "2dsphere" });

const ChangeLogEntrySchema = new Schema(
    {
        version: { type: Number, required: true },
        note: { type: String },
        editedBy: { type: Schema.Types.ObjectId, ref: "employees" },
        editedAt: { type: Date, required: true, default: () => new Date() },
    },
    { _id: false }
);

/* ----------- Main Schema ----------- */

const SiteSettingsSchema = new Schema<ISiteSettings, SiteSettingsModel>(
    {
        _id: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
        },
        version: { type: Number, default: 1, required: true },
        advertising: { type: AdvertisingConfigSchema, default: () => ({}) },
        guideSubscriptions: { type: [SubscriptionTierSchema], default: [] },
        socialLinks: { type: [SocialLinkSchema], default: [] },
        locations: { type: [LocationSchema], default: [] },
        enums: { type: [EnumGroupSchema], default: [] },
        changeLog: { type: [ChangeLogEntrySchema], default: [] },
    },
    { timestamps: true }
);

/* ----------- Index ----------- */
SiteSettingsSchema.index({ version: -1 });

/* ----------- Static Method ----------- */
SiteSettingsSchema.statics.upsertSingleton = async function (
    payload: Partial<ISiteSettings>,
    editorId?: ObjectId,
    note?: string
): Promise<ISiteSettings> {
    const now = new Date();
    const current = await this.findOne().sort({ version: -1 });
    const nextVersion = (current?.version ?? 0) + 1;

    const changeLogEntry = {
        version: nextVersion,
        note,
        editedBy: editorId,
        editedAt: now,
    };

    const doc = await this.findOneAndUpdate(
        { _id: current?._id ?? undefined },
        {
            $set: { ...payload, version: nextVersion },
            $push: { changeLog: changeLogEntry },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return doc!;
};

/* ----------- Model ----------- */
const SiteSettings: SiteSettingsModel =
    (models.SiteSettings as SiteSettingsModel) ||
    model<ISiteSettings, SiteSettingsModel>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
