// models/siteSettings.ts
import { PLACEMENT, PlacementType } from "@/constants/advertising.const";
import mongoose, { Schema, Model, Types, models, model } from "mongoose";
import type { HydratedDocument } from "mongoose";

/* -------------------------
   Shared ObjectId type
   ------------------------- */
export type ObjectId = Types.ObjectId;

/* -------------------------
   Sub interfaces
   ------------------------- */

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

/* -------------------------
   New: GuideBanner types
   ------------------------- */

export interface GuideBanner {
    asset: ObjectId; // reference to Asset._id
    alt?: string | null; // alt text for accessibility
    caption?: string | null; // optional caption
    order?: number; // ordering for presentation (lower = earlier)
    active?: boolean; // toggle visibility
    createdAt?: Date;
    updatedAt?: Date;
}

/* -------------------------
   ChangeLog entry
   ------------------------- */

export interface ChangeLogEntry {
    version: number;
    note?: string;
    editedBy?: ObjectId;
    editedAt: Date;
}

/* -------------------------
   Main document interface
   ------------------------- */

export interface SiteSettingsDoc {
    _id?: ObjectId;
    version: number;
    advertising: AdvertisingConfig;
    guideSubscriptions: SubscriptionTier[];
    socialLinks: SocialLink[];
    locations: LocationEntry[];
    enums: EnumGroup[];
    guideBanners?: GuideBanner[]; // NEW field
    changeLog?: ChangeLogEntry[];
    createdAt?: Date;
    updatedAt?: Date;
}

/* Hydrated document & model types */
export type ISiteSettings = HydratedDocument<SiteSettingsDoc>;

export interface SiteSettingsModel extends Model<ISiteSettings> {
    upsertSingleton(
        payload: Partial<SiteSettingsDoc>,
        editorId?: ObjectId,
        note?: string
    ): Promise<ISiteSettings>;
}

/* -------------------------
   Sub-schemas
   ------------------------- */

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
        placement: {
            type: String,
            enum: Object.values(PLACEMENT),
            required: true,
        },
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
    },
    { _id: false }
);

LocationSchema.index({ location: "2dsphere" });

const ChangeLogEntrySchema = new Schema<ChangeLogEntry>(
    {
        version: { type: Number, required: true },
        note: { type: String },
        editedBy: { type: Schema.Types.ObjectId, ref: "employees" },
        editedAt: { type: Date, required: true, default: () => new Date() },
    },
    { _id: false }
);

/* -------------------------
   New: GuideBanner schema
   ------------------------- */

/*
 - store lightweight embedded entries referencing Asset documents by ObjectId
 - keep fields small; use array for ordering and simple toggles
 - index asset reference for fast lookups when checking references prior to deletion
*/
const GuideBannerSchema = new Schema<GuideBanner>(
    {
        asset: {
            type: Schema.Types.ObjectId,
            ref: "Asset",
            required: true,
            index: true,
        },
        alt: { type: String, trim: true, maxlength: 250, default: null },
        caption: { type: String, trim: true, maxlength: 500, default: null },
        order: { type: Number, default: 0, index: true },
        active: { type: Boolean, default: true, index: true },
    },
    { _id: false }
);

/* -------------------------
   Main schema
   ------------------------- */

const SiteSettingsSchema = new Schema<ISiteSettings, SiteSettingsModel>(
    {
        _id: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
        },
        version: { type: Number, default: 1, required: true },
        advertising: { type: AdvertisingConfigSchema, default: () => ({}) },
        guideSubscriptions: { type: [SubscriptionTierSchema], default: [] },
        socialLinks: { type: [SocialLinkSchema], default: [] }, // footer part
        locations: { type: [LocationSchema], default: [] }, // footer part
        enums: { type: [EnumGroupSchema], default: [] },
        guideBanners: { type: [GuideBannerSchema], default: [] },
        changeLog: { type: [ChangeLogEntrySchema], default: [] },
    },
    { timestamps: true }
);

/* -------------------------
   Indexes
   ------------------------- */

// Keep most recent version fast to query
SiteSettingsSchema.index({ version: -1 });

// If you query active banners frequently, this compound index helps
SiteSettingsSchema.index({ "guideBanners.active": 1, "guideBanners.order": 1 });

/* -------------------------
   Statics
   ------------------------- */

SiteSettingsSchema.statics.upsertSingleton = async function (
    payload: Partial<ISiteSettings>,
    editorId?: ObjectId,
    note?: string
): Promise<ISiteSettings> {
    const now = new Date();
    const current = await this.findOne().sort({ version: -1 });
    const nextVersion = (current?.version ?? 0) + 1;
    const changeLogEntry: ChangeLogEntry = {
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

/* -------------------------
   Model
   ------------------------- */

const SiteSettings: SiteSettingsModel =
    (models.SiteSettings as SiteSettingsModel) ||
    model<ISiteSettings, SiteSettingsModel>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
