// models/siteSettings.ts
import { PLACEMENT, PlacementType } from "@/constants/advertising.const";
import { Schema, Model, Types, models, model } from "mongoose";
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

export interface LocationEntry {
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

export interface EnumValue {
    key: string;
    label: string;
    value: string | number;
    active: boolean;
    description?: string | null;
}

export interface EnumGroup {
    name: string;
    description?: string | null;
    values: EnumValue[];
}

/* -------------------------
   GuideBanner
------------------------- */

export interface GuideBanner {
    asset: ObjectId;
    alt?: string | null;
    caption?: string | null;
    order?: number;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

/* -------------------------
   Main document interface
------------------------- */

export interface SiteSettingsDoc {
    _id?: ObjectId;
    advertising: AdvertisingConfig;
    guideSubscriptions: SubscriptionTier[];
    socialLinks: SocialLink[];
    locations: LocationEntry[];
    enums: EnumGroup[];
    guideBanners?: GuideBanner[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type ISiteSettings = HydratedDocument<SiteSettingsDoc>;

export interface SiteSettingsModel extends Model<ISiteSettings> {
    upsertSingleton(
        payload: Partial<SiteSettingsDoc>
    ): Promise<ISiteSettings>;
}

/* -------------------------
   Schemas
------------------------- */

const EnumValueSchema = new Schema<EnumValue>(
    {
        key: { type: String, required: true },
        label: { type: String, required: true },
        value: { type: String, required: true },
        active: { type: Boolean, default: true, index: true },
        description: { type: String, default: null },
    },
    { _id: false }
);

const EnumGroupSchema = new Schema<EnumGroup>(
    {
        name: { type: String, required: true },
        description: { type: String, default: null },
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
        price: { type: Number, required: true },
        currency: { type: String, default: "USD" },
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
        icon: { type: String },
        url: { type: String, required: true },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
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
            coordinates: { type: [Number], default: [0, 0] },
        },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

LocationSchema.index({ location: "2dsphere" });

const GuideBannerSchema = new Schema<GuideBanner>(
    {
        asset: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
        alt: { type: String, trim: true, maxlength: 250, default: null },
        caption: { type: String, trim: true, maxlength: 500, default: null },
        order: { type: Number, default: 0, index: true },
        active: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

/* -------------------------
   Main schema
------------------------- */

const SiteSettingsSchema = new Schema<ISiteSettings, SiteSettingsModel>(
    {
        advertising: { type: AdvertisingConfigSchema, default: () => ({}) },
        guideSubscriptions: { type: [SubscriptionTierSchema], default: [] },
        socialLinks: { type: [SocialLinkSchema], default: [] },
        locations: { type: [LocationSchema], default: [] },
        enums: { type: [EnumGroupSchema], default: [] },
        guideBanners: { type: [GuideBannerSchema], default: [] },
    },
    { timestamps: true }
);

/* -------------------------
   Statics
------------------------- */

SiteSettingsSchema.statics.upsertSingleton = async function (
    payload: Partial<SiteSettingsDoc>
): Promise<ISiteSettings> {
    let existing = await this.findOne();
    if (!existing) {
        return this.create(payload);
    }

    Object.assign(existing, payload);

    if (payload.socialLinks) existing.markModified("socialLinks");
    if (payload.locations) existing.markModified("locations");
    if (payload.guideBanners) existing.markModified("guideBanners");

    await existing.save();
    existing = await this.findOne();
    return existing!;
};


SiteSettingsSchema.pre("save", function (next) {
    if (this.isModified("socialLinks") && Array.isArray(this.socialLinks)) {
        this.socialLinks = normalizeSocialLinks(this.socialLinks);
    }
    next();
});

/* -------------------------
   Model
------------------------- */

const SiteSettings: SiteSettingsModel =
    (models.SiteSettings as SiteSettingsModel) ||
    model<ISiteSettings, SiteSettingsModel>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;

function normalizeSocialLinks(socialLinks: SocialLink[]): SocialLink[] {
    // Deactivate duplicates: same URL only one active
    const seenUrls = new Map<string, boolean>();
    socialLinks = socialLinks.map((s) => {
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

    // Sort by order first, then by creation date to stabilize order
    socialLinks.sort((a, b) => (Number(a.order ?? 0) - Number(b.order ?? 0)) || ((a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)));

    // Reassign order sequentially starting from 1
    return socialLinks.map((s, idx) => ({ ...s, order: idx + 1 }));
}