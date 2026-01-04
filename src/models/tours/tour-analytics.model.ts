// models/tour-analytics.model.ts
import { Schema, Types, Document } from "mongoose";
import { defineModel } from "@/lib/helpers/defineModel";

export interface ITourAnalytics extends Document {
    tourId: Types.ObjectId;           // reference to the main Tour
    companyId: Types.ObjectId;

    // Booking & revenue stats
    seatsTotal: number;
    seatsBooked: number;
    totalBookings: number;            // number of booking records
    totalRevenue: number;             // total revenue in BDT/USD
    occupancyRate: number;            // seatsBooked / seatsTotal

    // Reviews
    reviewCount: number;
    averageRating: number;

    // Optional meta for later analytics
    createdAt: Date;
    updatedAt: Date;
}

const TourAnalyticsSchema = new Schema<ITourAnalytics>(
    {
        tourId: { type: Schema.Types.ObjectId, ref: "Tour", required: true, index: true },
        companyId: { type: Schema.Types.ObjectId, required: true, index: true },

        seatsTotal: { type: Number, default: 0 },
        seatsBooked: { type: Number, default: 0 },
        totalBookings: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        occupancyRate: { type: Number, default: 0 },

        reviewCount: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Index for fast lookup by tour/company
TourAnalyticsSchema.index({ tourId: 1, companyId: 1 });

// Export the model using your universal wrapper
const TourAnalyticsModel = defineModel(
    "TourAnalytics",
    TourAnalyticsSchema
);
export default TourAnalyticsModel;