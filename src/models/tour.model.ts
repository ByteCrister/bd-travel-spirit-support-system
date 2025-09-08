// models/tour.model.ts

import mongoose, { Schema, model, models, Document, Query, FilterQuery, Types } from "mongoose";
import slugify from "slugify";

////////////////////////////////////////////////////////////////////////////////
// ENUMS: Domain-specific constants
////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////
// SUB-SCHEMAS: Reusable pieces of the main schema
////////////////////////////////////////////////////////////////////////////////

/** Price tier (e.g., Standard, Premium) */
const PriceOptionSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, default: "BDT", trim: true },
    },
    { _id: false }
);

/** Discount code and its validity window */
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

/** GeoJSON Point for mapping */
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

/** Handy include/exclude list */
const IncludeItemSchema = new Schema(
    {
        label: { type: String, required: true, trim: true },
        included: { type: Boolean, required: true, default: false },
    },
    { _id: false }
);

/** Daily itinerary breakdown */
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

/** Frequently asked questions */
const FAQSchema = new Schema(
    {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
    },
    { _id: false }
);

/** Seasonal highlight for promotions */
const SeasonalHighlightSchema = new Schema(
    {
        season: { type: String, trim: true },
        description: { type: String, trim: true },
        image: { type: Types.ObjectId, ref: "Image" },
    },
    { _id: false }
);

////////////////////////////////////////////////////////////////////////////////
// SOFT-DELETE PLUGIN: Adds deletedAt and filters out deleted docs by default
////////////////////////////////////////////////////////////////////////////////

function softDeletePlugin(schema: Schema) {
    // Add deletedAt field
    schema.add({ deletedAt: { type: Date, default: null } });

    // Exclude soft-deleted docs on all find queries
    schema.pre<Query<ITour[], ITour>>(/^find/, function (next) {
        this.where({ deletedAt: null });
        next();
    });
}

////////////////////////////////////////////////////////////////////////////////
// MAIN INTERFACE: TypeScript type for Tour documents
////////////////////////////////////////////////////////////////////////////////

export interface ITour extends Document {
    title: string;
    slug: string;
    status: TourStatus;
    highlights: string[];
    description: string;
    includes: Types.Subdocument[];
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
    deletedAt?: Date;

    // Virtuals
    durationDays: number;

    // Instance methods
    isFull(): boolean;
}

////////////////////////////////////////////////////////////////////////////////
// SCHEMA: Define fields, validations, indexes, hooks, virtuals, and methods
////////////////////////////////////////////////////////////////////////////////

const TourSchema = new Schema<ITour>(
    {
        // Core metadata
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        status: { type: String, enum: Object.values(TourStatus), default: TourStatus.DRAFT },

        // Marketing content
        highlights: [{ type: String, required: true, trim: true }],
        description: { type: String, required: true, trim: true },

        // Inclusions & info
        includes: [IncludeItemSchema],
        importantInfo: [{ type: String, trim: true }],

        // Logistics & categorization
        meetingPoints: [MeetingPointSchema],
        activities: [{ type: String, trim: true }],
        tags: [{ type: String, trim: true, index: true }],
        travelTypes: [{ type: String, enum: Object.values(TravelType), required: true }],

        // Pricing
        priceOptions: [PriceOptionSchema],
        discounts: [DiscountSchema],

        // Schedule
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        maxGroupSize: { type: Number, required: true, min: 1 },
        repeatCount: { type: Number, default: 1, min: 1 },

        // Relationships
        bookingInfo: { users: [{ type: Types.ObjectId, ref: "User" }] },
        reviews: [{ type: Types.ObjectId, ref: "Review" }],

        // Media assets
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
        healthAndSafety: [{ title: String, description: String }],
        accessibilityFeatures: [{ type: String, trim: true }],
        seoTitle: { type: String, trim: true },
        seoDescription: { type: String, trim: true },
        seasonalHighlights: [SeasonalHighlightSchema],

        // Admin / system fields
        reports: [{ type: Schema.Types.ObjectId, ref: "Report" }],
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        versionKey: "__v",
    }
);

// Apply the soft-delete plugin
TourSchema.plugin(softDeletePlugin);

////////////////////////////////////////////////////////////////////////////////
// HOOKS: Pre-save / Pre-validate logic
////////////////////////////////////////////////////////////////////////////////

// Generate or normalize slug before validation
TourSchema.pre<ITour>("validate", function (next) {
    if (!this.slug && this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    // Ensure startDate is before endDate
    if (this.startDate >= this.endDate) {
        return next(new Error("startDate must be earlier than endDate"));
    }

    next();
});

////////////////////////////////////////////////////////////////////////////////
// INDEXES: Optimize query patterns and text search
////////////////////////////////////////////////////////////////////////////////

// Case-insensitive unique slug
TourSchema.index(
    { slug: 1 },
    { unique: true, collation: { locale: "en", strength: 2 } }
);

// Text search on key marketing fields
TourSchema.index(
    { title: "text", highlights: "text", tags: "text" },
    { weights: { title: 5, highlights: 3, tags: 2 } }
);

// Geo-queries on meetingPoints
MeetingPointSchema.index({ "location": "2dsphere" });

////////////////////////////////////////////////////////////////////////////////
// VIRTUALS: Computed properties not stored in MongoDB
////////////////////////////////////////////////////////////////////////////////

/** Duration of the tour in full days */
TourSchema.virtual("durationDays").get(function (this: ITour) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / msPerDay);
});

////////////////////////////////////////////////////////////////////////////////
// METHODS: Instance-level helpers
////////////////////////////////////////////////////////////////////////////////

/** Checks if the tour has reached its maxGroupSize */
TourSchema.methods.isFull = function (this: ITour) {
    return this.bookingInfo.users.length >= this.maxGroupSize;
};

////////////////////////////////////////////////////////////////////////////////
// STATICS: Model-level helpers
////////////////////////////////////////////////////////////////////////////////

/**
 * Paginates query results.
 *
 * @param filter  MongoDB filter object
 * @param options Pagination settings
 * @returns        docs array, total count, current page, total pages
 */
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

    return {
        docs,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

////////////////////////////////////////////////////////////////////////////////
// EXPORT: Use existing model if already compiled (hot-reload safe)
////////////////////////////////////////////////////////////////////////////////

export const TourModel =
    (models.Tour as mongoose.Model<ITour>) ||
    model<ITour>("Tour", TourSchema);
