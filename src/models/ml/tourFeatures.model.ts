import { model, models, Schema, Types } from "mongoose";

// models/tourFeatures.model.ts
export interface ITourFeatures extends Document {
  tour: Types.ObjectId;
  // Signals used for “popular” computation
  signals: {
    views: number;
    detailViews: number;
    wishlistAdds: number;
    cartAdds: number;
    bookings: number;
    shares: number;
    avgDwellMs: number;
    reviewCount: number;
    avgRating: number;
  };
  // Decay-aware popularity (e.g., exponential time decay)
  popularityScore: number; // stored for fast sort
  // Content metadata normalized for embeddings
  tags?: string[];
  categories?: string[];
  audiences?: string[];
  embedding?: number[]; // content embedding
  updatedAt: Date;
}
const TourFeaturesSchema = new Schema<ITourFeatures>(
  {
    tour: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      unique: true,
      index: true,
      required: true,
    },
    signals: {
      views: { type: Number, default: 0 },
      detailViews: { type: Number, default: 0 },
      wishlistAdds: { type: Number, default: 0 },
      cartAdds: { type: Number, default: 0 },
      bookings: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      avgDwellMs: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 },
    },
    popularityScore: { type: Number, default: 0, index: true },
    tags: [{ type: String, trim: true }],
    categories: [{ type: String, trim: true }],
    audiences: [{ type: String, trim: true }],
    embedding: [{ type: Number }],
  },
  { timestamps: true, versionKey: false }
);
TourFeaturesSchema.index({ popularityScore: -1, "signals.bookings": -1 });
export const TourFeaturesModel =
  models.TourFeatures ||
  model<ITourFeatures>("TourFeatures", TourFeaturesSchema);
