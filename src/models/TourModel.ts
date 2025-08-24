// models/Tour.ts
import { Connection, Schema, model, Document, Types } from "mongoose";

/**
 * =========================
 * ENUM DEFINITIONS
 * =========================
 */
/** Types of travelers this tour is suited for */
export enum TravelType {
    COUPLES = "Couples",
    GROUP_OF_FRIENDS = "Group of friends",
    SOLO_TRAVELERS = "Solo travelers",
    FAMILIES = "Families",
}

/** Publishing status of the tour */
export enum TourStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived",
}

/**
 * =========================
 * SUB‑SCHEMA DEFINITIONS
 * =========================
 */

/** Price tiers (e.g., Standard, Premium) */
const PriceOptionSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "BDT" },
    },
    { _id: false }
);

/** Discount definitions (promo codes, seasonal offers) */
const DiscountSchema = new Schema(
    {
        code: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        percentage: { type: Number, required: true, min: 0, max: 100 },
        validFrom: Date,
        validUntil: Date,
    },
    { _id: false }
);

/** Meeting locations for starting a tour */
const MeetingPointSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        location: {
            address: { type: String, trim: true },
            coordinates: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: { type: [Number], validate: (v: number[]) => v.length === 2 }, // [lng, lat]
            },
        },
        time: Date,
    },
    { _id: false }
);

/** Stops or segments along the tour route */
const RoadMapPointSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        image: { type: Types.ObjectId, ref: "Image" },
        location: {
            address: { type: String, trim: true },
            coordinates: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: { type: [Number], validate: (v: number[]) => v.length === 2 },
            },
        },
    },
    { _id: false }
);

/** Included or excluded items (e.g., "Breakfast", "Tickets") */
const IncludeItemSchema = new Schema(
    {
        label: { type: String, required: true, trim: true },
        included: { type: Boolean, required: true, default: false },
    },
    { _id: false }
);

/** Itinerary breakdown per day */
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

/** FAQ entries */
const FAQSchema = new Schema(
    {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
    },
    { _id: false }
);

/** Seasonal promotional highlights */
const SeasonalHighlightSchema = new Schema(
    {
        season: { type: String, trim: true },
        description: { type: String, trim: true },
        image: { type: Types.ObjectId, ref: "Image" },
    },
    { _id: false }
);

/**
 * =========================
 * MAIN TOUR INTERFACE
 * =========================
 */
export interface ITour extends Document {
    title: string;
    slug: string;
    status: TourStatus;
    highlights: string[];
    description: string;
    includes: { label: string; included: boolean }[];
    importantInfo: string[];
    meetingPoints: Types.Subdocument[];
    activities: string[];
    tags: string[];
    travelTypes: TravelType[];
    priceOptions: Types.Subdocument[];
    discounts: Types.Subdocument[];
    startDate: Date;
    endDate: Date;
    maxGroupSize: number;
    repeatCount: number;
    bookingInfo: { users: Types.ObjectId[] };
    reviews: Types.ObjectId[];
    images: Types.ObjectId[];
    heroImage?: Types.ObjectId;
    gallery?: Types.ObjectId[];
    videoUrls?: string[];
    virtualTourUrl?: string;
    roadMap: Types.Subdocument[];
    itinerary?: Types.Subdocument[];
    packingList?: { item: string; required: boolean; notes?: string }[];
    faqs?: Types.Subdocument[];
    host?: {
        name: string;
        bio: string;
        avatar?: Types.ObjectId;
        languagesSpoken?: string[];
        rating?: number;
    };
    healthAndSafety?: { title: string; description: string }[];
    accessibilityFeatures?: string[];
    seoTitle?: string;
    seoDescription?: string;
    seasonalHighlights?: Types.Subdocument[];
    reports: Types.ObjectId[];
    averageRating: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * =========================
 * MAIN SCHEMA
 * =========================
 */
const TourSchema = new Schema<ITour>(
    {
        // Core identification
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },

        // Publishing status
        status: {
            type: String,
            enum: Object.values(TourStatus),
            default: TourStatus.DRAFT,
        },
        
        // Marketing content
        highlights: [{ type: String, required: true, trim: true }],
        description: { type: String, required: true, trim: true },

        // What's included in the price
        includes: [IncludeItemSchema],
        importantInfo: [{ type: String, trim: true }],

        // Logistics
        meetingPoints: [MeetingPointSchema],
        activities: [{ type: String, trim: true }],
        tags: [{ type: String, trim: true, index: true }],
        travelTypes: [{ type: String, enum: Object.values(TravelType), required: true }], priceOptions: [PriceOptionSchema],
        discounts: [DiscountSchema],

        // Scheduling
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        maxGroupSize: { type: Number, required: true, min: 1 },
        repeatCount: { type: Number, default: 1, min: 1 },

        // Bookings / relationships
        bookingInfo: {
            users: [{ type: Types.ObjectId, ref: "User" }],
        },
        reviews: [{ type: Types.ObjectId, ref: "Review" }],

        // Media
        images: [{ type: Types.ObjectId, ref: "Image" }],
        heroImage: { type: Types.ObjectId, ref: "Image" },
        gallery: [{ type: Types.ObjectId, ref: "Image" }],
        videoUrls: [{ type: String, trim: true }],
        virtualTourUrl: { type: String, trim: true },

        // Detailed structure
        roadMap: [RoadMapPointSchema],
        itinerary: [ItinerarySchema],
        packingList: [
            {
                item: { type: String, trim: true },
                required: { type: Boolean, default: false },
                notes: { type: String, trim: true },
            },
        ],
        faqs: [FAQSchema],
        host: {
            name: { type: String, trim: true },
            bio: { type: String, trim: true },
            avatar: { type: Types.ObjectId, ref: "Image" },
            languagesSpoken: [{ type: String, trim: true }],
            rating: { type: Number, min: 0, max: 5 },
        },
        healthAndSafety: [
            {
                title: { type: String, trim: true },
                description: { type: String, trim: true },
            },
        ],
        accessibilityFeatures: [{ type: String, trim: true }],
        seoTitle: { type: String, trim: true },
        seoDescription: { type: String, trim: true },
        seasonalHighlights: [SeasonalHighlightSchema],

        // Admin / system
        reports: [{ type: Schema.Types.ObjectId, ref: "Report" }],
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
    },
    { timestamps: true }
);

/**
 * =========================
 * INDEXES
 * =========================
 */
TourSchema.index(
    { title: "text", highlights: "text", tags: "text" },
    {
        weights: { title: 5, highlights: 3, tags: 2 }
    });

export const Tour = model<ITour>('Tour', TourSchema);

export const getTourModel = (db: Connection) => {
    return db.models.tour || db.model<ITour>('Tour', TourSchema);
};