// models/tour.model.ts

import { TOUR_STATUS, TRAVEL_TYPE } from "@/constants/tour.const";
import mongoose, { Schema, model, models, Document, Query, FilterQuery, Types } from "mongoose";
import slugify from "slugify";

////////////////////////////////////////////////////////////////////////////////
// INTERFACES: Reusable structures
////////////////////////////////////////////////////////////////////////////////

/** Emergency/local contact for tour emergencies */
export interface EmergencyContact {
    phone?: string;
    email?: string;
}

/** Age restriction for participants */
export interface AgeRestriction {
    minAge?: number;
    maxAge?: number;
}

/** Cancellation policy for bookings */
export interface CancellationPolicy {
    freeCancellationUntil?: string; // ISO date string
    refundPercentage?: number; // 0–100
    notes?: string;
}

////////////////////////////////////////////////////////////////////////////////
// SUB-SCHEMAS: Reusable pieces for main schema
////////////////////////////////////////////////////////////////////////////////

/** Price tier (Standard, Premium, VIP) */
const PriceOptionSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, default: "BDT", trim: true },
    },
    { _id: false }
);

/** Discount codes with validity */
const DiscountSchema = new Schema(
    {
        code: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        percentage: { type: Number, required: true, min: 0, max: 100 },
        validFrom: { type: Date },
        validUntil: { type: Date },
    },
    { _id: false }
);

/** GeoJSON Point for maps */
const GeoPointSchema = new Schema(
    {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (arr: number[]) => arr.length === 2,
                message: "Coordinates must be [lng, lat]",
            },
        },
    },
    { _id: false }
);

/** Starting meetup details */
const MeetingPointSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        location: {
            address: { type: String, trim: true },
            coordinates: { type: GeoPointSchema, required: true },
        },
        time: { type: Date, required: true },
    },
    { _id: false }
);

/** Stops along the route */
const RoadMapPointSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        image: { type: Types.ObjectId, ref: "Image" },
        location: {
            address: { type: String, trim: true },
            coordinates: { type: GeoPointSchema, required: true },
        },
    },
    { _id: false }
);

/** Include/exclude checklist items */
const IncludeItemSchema = new Schema(
    {
        label: { type: String, required: true, trim: true },
        included: { type: Boolean, required: true, default: false },
    },
    { _id: false }
);

/** Daily itinerary details */
const ItinerarySchema = new Schema(
    {
        day: { type: Number, required: true, min: 1 },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        mealsProvided: [{ type: String, enum: ["Breakfast", "Lunch", "Dinner"] }],
        accommodation: { type: String, trim: true },
        activities: [{ type: String, trim: true }],
        images: [{ type: Types.ObjectId, ref: "Image" }],
    },
    { _id: false }
);

/** Seasonal highlights for promotions */
const SeasonalHighlightSchema = new Schema(
    {
        season: { type: String, trim: true },
        description: { type: String, trim: true },
        image: { type: Types.ObjectId, ref: "Image" },
    },
    { _id: false }
);

////////////////////////////////////////////////////////////////////////////////
// SOFT-DELETE PLUGIN: Adds deletedAt and filters out deleted docs
////////////////////////////////////////////////////////////////////////////////

function softDeletePlugin(schema: Schema) {
    schema.add({ deletedAt: { type: Date, default: null } });

    schema.pre<Query<ITour[], ITour>>(/^find/, function (next) {
        this.where({ deletedAt: null });
        next();
    });
}

////////////////////////////////////////////////////////////////////////////////
// MAIN INTERFACE: TypeScript type for Tour documents
////////////////////////////////////////////////////////////////////////////////

export interface ITour extends Document {
    // Core metadata
    title: string;
    slug: string;
    status: TOUR_STATUS;
    highlights: string[];
    description: string;

    // Inclusions & info
    includes: Types.Subdocument[];
    importantInfo: string[];
    packingList?: { item: string; required: boolean; notes?: string }[];

    // Logistics & categorization
    meetingPoints: Types.Subdocument[];
    roadMap: Types.Subdocument[];
    itinerary?: Types.Subdocument[];
    activities: string[];
    tags: string[];
    travelTypes: TRAVEL_TYPE[];
    accessibilityFeatures?: string[];

    // Pricing & discounts
    priceOptions: Types.Subdocument[];
    discounts: Types.Subdocument[];

    // Schedule & capacity
    startDate: Date;
    endDate: Date;
    maxGroupSize: number;
    minGroupSize?: number;
    repeatCount: number;
    bookingInfo: { users: Types.ObjectId[] };
    bookingDeadline?: string; // ISO or human-readable string

    // Compliance & restrictions
    cancellationPolicy?: CancellationPolicy;
    ageRestriction?: AgeRestriction;
    emergencyContact?: EmergencyContact;
    requiredDocuments?: string[];
    insuranceProvided?: boolean;

    // Host / guide info
    host?: {
        name: string;
        bio: string;
        avatar?: Types.ObjectId;
        languagesSpoken?: string[];
        rating?: number;
    };

    // Media
    images: Types.ObjectId[];
    heroImage?: Types.ObjectId;
    gallery?: Types.ObjectId[];
    videoUrls?: string[];
    virtualTourUrl?: string;

    // Customer experience
    healthAndSafety?: { title: string; description: string }[];
    difficultyLevel?: "easy" | "moderate" | "challenging";
    childPolicy?: string;
    languageOptions?: string[];

    // Marketing & SEO
    seoTitle?: string;
    seoDescription?: string;
    seasonalHighlights?: Types.Subdocument[];
    featured?: boolean;
    earlyBirdDiscount?: number;
    lastMinuteDeal?: number;
    popularityScore?: number;

    // System
    averageRating: number;
    viewCount?: number;
    wishlistCount?: number;
    shareCount?: number;
    lastBookedAt?: Date;
    lastViewedAt?: Date;
    owner?: Types.ObjectId;
    deletedAt?: Date;

    // Virtuals
    durationDays: number;

    // Instance methods
    isFull(): boolean;
}

////////////////////////////////////////////////////////////////////////////////
// SCHEMA: Fields, validations, indexes, hooks, virtuals
////////////////////////////////////////////////////////////////////////////////

const TourSchema = new Schema<ITour>(
    {
        // Core metadata
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        status: { type: String, enum: Object.values(TOUR_STATUS), default: TOUR_STATUS.DRAFT },

        // Marketing content
        highlights: [{ type: String, required: true, trim: true }],
        description: { type: String, required: true, trim: true },

        // Inclusions & info
        includes: [IncludeItemSchema],
        importantInfo: [{ type: String, trim: true }],
        packingList: [
            { item: String, required: { type: Boolean, default: false }, notes: String },
        ],

        // Logistics & categorization
        meetingPoints: [MeetingPointSchema],
        roadMap: [RoadMapPointSchema],
        itinerary: [ItinerarySchema],
        activities: [{ type: String, trim: true }],
        tags: [{ type: String, trim: true, index: true }],
        travelTypes: [{ type: String, enum: Object.values(TRAVEL_TYPE), required: true }],
        accessibilityFeatures: [{ type: String, trim: true }],

        // Pricing & discounts
        priceOptions: [PriceOptionSchema],
        discounts: [DiscountSchema],

        // Schedule & capacity
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        maxGroupSize: { type: Number, required: true, min: 1 },
        minGroupSize: { type: Number, min: 1 },
        repeatCount: { type: Number, default: 1, min: 1 },
        bookingInfo: { users: [{ type: Types.ObjectId, ref: "User" }] },
        bookingDeadline: { type: String },

        // Compliance & restrictions
        cancellationPolicy: { type: Object },
        ageRestriction: { type: Object },
        emergencyContact: { type: Object },
        requiredDocuments: [{ type: String }],
        insuranceProvided: { type: Boolean, default: false },

        // Host / guide info
        host: {
            name: { type: String, trim: true },
            bio: { type: String, trim: true },
            avatar: { type: Types.ObjectId, ref: "Image" },
            languagesSpoken: [{ type: String, trim: true }],
            rating: { type: Number, min: 0, max: 5 },
        },

        // Media
        images: [{ type: Types.ObjectId, ref: "Image" }],
        heroImage: { type: Types.ObjectId, ref: "Image" },
        gallery: [{ type: Types.ObjectId, ref: "Image" }],
        videoUrls: [{ type: String, trim: true }],
        virtualTourUrl: { type: String, trim: true },

        // Customer experience
        healthAndSafety: [{ title: String, description: String }],
        difficultyLevel: { type: String, enum: ["easy", "moderate", "challenging"] },
        childPolicy: { type: String },
        languageOptions: [{ type: String }],

        // Marketing & SEO
        seoTitle: { type: String, trim: true },
        seoDescription: { type: String, trim: true },
        seasonalHighlights: [SeasonalHighlightSchema],
        featured: { type: Boolean, default: false },
        earlyBirdDiscount: { type: Number, min: 0, max: 100 },
        lastMinuteDeal: { type: Number, min: 0, max: 100 },
        popularityScore: { type: Number, default: 0 },

        // System fields, (images, reviews and reports have separate models)
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        viewCount: { type: Number, default: 0 },
        wishlistCount: { type: Number, default: 0 },
        shareCount: { type: Number, default: 0 },
        lastBookedAt: { type: Date },
        lastViewedAt: { type: Date },
        owner: { type: Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        versionKey: "__v",
    }
);

// Apply soft-delete plugin
TourSchema.plugin(softDeletePlugin);

////////////////////////////////////////////////////////////////////////////////
// HOOKS: Pre-validate
////////////////////////////////////////////////////////////////////////////////

TourSchema.pre<ITour>("validate", function (next) {
    // Auto-generate slug from title if missing
    if (!this.slug && this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    // Ensure startDate < endDate
    if (this.startDate >= this.endDate) {
        return next(new Error("startDate must be earlier than endDate"));
    }

    next();
});

////////////////////////////////////////////////////////////////////////////////
// INDEXES
////////////////////////////////////////////////////////////////////////////////

TourSchema.index({ slug: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
TourSchema.index({ title: "text", highlights: "text", tags: "text" }, { weights: { title: 5, highlights: 3, tags: 2 } });
MeetingPointSchema.index({ "location": "2dsphere" });

////////////////////////////////////////////////////////////////////////////////
// VIRTUALS
////////////////////////////////////////////////////////////////////////////////

TourSchema.virtual("durationDays").get(function (this: ITour) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / msPerDay);
});

////////////////////////////////////////////////////////////////////////////////
// METHODS
////////////////////////////////////////////////////////////////////////////////

TourSchema.methods.isFull = function (this: ITour) {
    return this.bookingInfo.users.length >= this.maxGroupSize;
};

////////////////////////////////////////////////////////////////////////////////
// STATICS
////////////////////////////////////////////////////////////////////////////////

TourSchema.statics.paginate = async function (
    filter: FilterQuery<ITour> = {},
    options: { page?: number; limit?: number } = {}
) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
        this.find(filter).skip(skip).limit(limit),
        this.countDocuments(filter),
    ]);

    return { docs, total, page, pages: Math.ceil(total / limit) };
};

////////////////////////////////////////////////////////////////////////////////
// EXPORT
////////////////////////////////////////////////////////////////////////////////

export const TourModel =
    (models.Tour as mongoose.Model<ITour>) || model<ITour>("Tour", TourSchema);
