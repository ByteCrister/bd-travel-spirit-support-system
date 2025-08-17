// models/Review.ts
import { Schema, model, Document, Types, Connection } from "mongoose";

/**
 * =========================
 * ENUMS
 * =========================
 */

/** Trip type for review context — helps future guests relate */
export type TripType =
    | "Solo"
    | "Couple"
    | "Family"
    | "Friends"
    | "Business";

/**
 * =========================
 * INTERFACE
 * =========================
 */
export interface IReview extends Document {
    tour: Types.ObjectId;             // Reference to the Tour
    user: Types.ObjectId;             // Reference to the User
    rating: number;                   // 1–5 scale
    title?: string;                   // Optional review headline
    comment: string;                   // Detailed textual feedback
    images: Types.ObjectId[];         // Uploaded review images
    tripType?: TripType;              // Context: what kind of traveler wrote this
    travelDate?: Date;                // When the trip took place
    isVerified: boolean;              // True if user booked through the platform
    isApproved: boolean;              // Moderation: approved for public display
    helpfulCount: number;             // Number of “helpful” votes
    createdAt: Date;
    updatedAt: Date;
}

/**
 * =========================
 * SCHEMA
 * =========================
 */
const ReviewSchema = new Schema<IReview>(
    {
        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            index: true,
        },
        title: { type: String, trim: true },
        comment: { type: String, required: true, trim: true },
        images: [{ type: Schema.Types.ObjectId, ref: "Image" }],
        tripType: {
            type: String,
            enum: ["Solo", "Couple", "Family", "Friends", "Business"],
        },
        travelDate: Date,
        isVerified: { type: Boolean, default: false, index: true },
        isApproved: { type: Boolean, default: true, index: true },
        helpfulCount: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);

/**
 * =========================
 * INDEXES
 * =========================
 */
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // One review per user per tour
ReviewSchema.index({ tour: 1, rating: -1 });                 // Fast rating-based sort
ReviewSchema.index({ tour: 1, helpfulCount: -1 });           // Sort by most helpful
ReviewSchema.index({ isApproved: 1, createdAt: -1 });        // Filter & paginate public reviews

/**
 * =========================
 * MODEL FACTORY
 * =========================
 * Safe for hot-reload dev environments and multi-DB connections.
 */
export const getReviewModel = (db: Connection) =>
    db.models.Review || db.model<IReview>("Review", ReviewSchema);

export const Review = model<IReview>("Review", ReviewSchema);
