// models/tour-analytics.model.ts
import { Schema, Types, Document, Model } from "mongoose";
import { defineModel } from "@/lib/helpers/defineModel";
import {
    CURRENCY,
    TOUR_DISCOUNT_TYPE,
    TOUR_DISCOUNT,
    Currency,
    TourDiscountType,
    TourDiscount,
} from "@/constants/tour.const";

// =============== LOCAL TYPE DEFINITIONS (mirroring tour.model) ===============

export interface IPrice {
    amount: number;
    currency: Currency;
}

export interface IDiscount {
    type: TourDiscountType;
    discount: TourDiscount;
    value: number; // Percentage 0-100
    code?: string;
    validFrom?: Date;
    validUntil?: Date;
}

export interface IGeoPoint {
    lat: number;
    lng: number;
}

export interface IOperatingWindow {
    startDate: Date;
    endDate: Date;
    seatsTotal?: number;
    seatsBooked?: number;
}

export interface IDeparture {
    date: Date;
    seatsTotal: number;
    seatsBooked: number;
    meetingPoint?: string;
    meetingCoordinates?: IGeoPoint;
}

// =============== MAIN ANALYTICS INTERFACE ===============

export interface ITourAnalytics extends Document {
    tourId: Types.ObjectId;           // reference to the main Tour
    companyId: Types.ObjectId;
    uniqueTourCode: string;            // denormalized from Tour

    // Booking & revenue stats
    seatsTotal: number;
    seatsBooked: number;
    totalBookings: number;            // number of booking records
    totalRevenue: number;             // total revenue in BDT/USD
    occupancyRate: number;            // seatsBooked / seatsTotal

    // Pricing & schedule (denormalized)
    basePrice: IPrice;
    discounts?: IDiscount[];
    operatingWindows?: IOperatingWindow[];
    departures?: IDeparture[];

    // Engagement
    viewCount: number;
    likeCount: number;
    shareCount: number;

    // Reviews
    reviewCount: number;
    averageRating: number;

    // Optional meta for later analytics
    createdAt: Date;
    updatedAt: Date;
}

// =============== SCHEMA DEFINITION ===============

const TourAnalyticsSchema = new Schema<ITourAnalytics>(
    {
        tourId: { type: Schema.Types.ObjectId, ref: "Tour", required: true, index: true },
        companyId: { type: Schema.Types.ObjectId, required: true, index: true },
        uniqueTourCode: { type: String, required: true, index: true },

        // Booking & revenue stats
        seatsTotal: { type: Number, default: 0 },
        seatsBooked: { type: Number, default: 0 },
        totalBookings: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        occupancyRate: { type: Number, default: 0 },

        // Pricing & schedule
        basePrice: {
            amount: { type: Number, required: true, min: 0 },
            currency: { type: String, required: true, enum: Object.values(CURRENCY) },
        },
        discounts: [
            {
                type: { type: String, enum: Object.values(TOUR_DISCOUNT_TYPE) },
                discount: { type: String, enum: Object.values(TOUR_DISCOUNT) },
                value: { type: Number, required: true, min: 0 },
                code: { type: String, trim: true },
                validFrom: { type: Date },
                validUntil: { type: Date },
            },
        ],
        operatingWindows: [
            {
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true },
                seatsTotal: { type: Number, min: 0 },
                seatsBooked: { type: Number, min: 0 },
            },
        ],
        departures: [
            {
                date: { type: Date, required: true },
                seatsTotal: { type: Number, required: true, min: 0 },
                seatsBooked: { type: Number, default: 0, min: 0 },
                meetingPoint: { type: String, trim: true },
                meetingCoordinates: {
                    lat: { type: Number },
                    lng: { type: Number },
                },
            },
        ],

        // Engagement
        viewCount: { type: Number, default: 0 },
        likeCount: { type: Number, default: 0 },
        shareCount: { type: Number, default: 0 },

        // Reviews
        reviewCount: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Indexes for fast lookup
TourAnalyticsSchema.index({ tourId: 1, companyId: 1 });
TourAnalyticsSchema.index({ uniqueTourCode: 1 });
TourAnalyticsSchema.index({ "basePrice.currency": 1 });
TourAnalyticsSchema.index({ "departures.date": 1 });

// Export the model using your universal wrapper
const TourAnalyticsModel = defineModel<ITourAnalytics, Model<ITourAnalytics>>(
    "TourAnalytics",
    TourAnalyticsSchema
);

export default TourAnalyticsModel;