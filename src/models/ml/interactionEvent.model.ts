import { model, models, Schema, Types } from "mongoose";

// models/interactionEvent.model.ts
export enum INTERACTION_TYPE {
  VIEW_TOUR = "view_tour",
  VIEW_TOUR_DETAILS = "view_tour_details",
  VIEW_ARTICLE = "view_article",
  SEARCH = "search",
  CLICK_RECOMMENDATION = "click_recommendation",
  ADD_WISHLIST = "add_wishlist",
  REMOVE_WISHLIST = "remove_wishlist",
  ADD_CART = "add_cart",
  REMOVE_CART = "remove_cart",
  BOOK_TOUR = "book_tour",
  MARK_HELPFUL_REVIEW = "mark_helpful_review",
  LIKE_ARTICLE = "like_article",
}

export interface IInteractionEvent extends Document {
  user: Types.ObjectId;
  type: INTERACTION_TYPE;
  tour?: Types.ObjectId;
  article?: Types.ObjectId;
  // Milliseconds; capture true dwell/engagement
  dwellMs?: number;
  // For SEARCH: query string + parsed tokens
  searchQuery?: string;
  searchTokens?: string[];
  // Who recommended it, with rank and score
  recommender?: { strategy: string; rank?: number; score?: number };
  // Device/session context
  sessionId?: string;
  userAgent?: string;
  // When
  createdAt: Date;
}

const InteractionEventSchema = new Schema<IInteractionEvent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(INTERACTION_TYPE),
      index: true,
      required: true,
    },
    tour: { type: Schema.Types.ObjectId, ref: "Tour", index: true },
    article: { type: Schema.Types.ObjectId, ref: "TravelArticle", index: true },
    dwellMs: { type: Number, min: 0 },
    searchQuery: { type: String, trim: true },
    searchTokens: [{ type: String, trim: true }],
    recommender: { strategy: String, rank: Number, score: Number },
    sessionId: { type: String, index: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

InteractionEventSchema.index({ user: 1, createdAt: -1 });
InteractionEventSchema.index({ type: 1, createdAt: -1 });
export const InteractionEventModel =
  models.InteractionEvent ||
  model<IInteractionEvent>("InteractionEvent", InteractionEventSchema);
