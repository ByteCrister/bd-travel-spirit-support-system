// models/tourFAQVote.model.ts
import { Schema, model, models, Document, Types } from "mongoose";

export type FAQ_VOTE_TYPE = "like" | "dislike";

export interface ITourFAQVote extends Document {
  faqId: Types.ObjectId;
  userId: Types.ObjectId;
  type: FAQ_VOTE_TYPE;
  createdAt: Date;
  updatedAt: Date;
}

const TourFAQVoteSchema = new Schema<ITourFAQVote>(
  {
    faqId: {
      type: Schema.Types.ObjectId,
      ref: "TourFAQ",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["like", "dislike"], required: true },
  },
  { timestamps: true, versionKey: false }
);

// Enforce one vote per user per FAQ
TourFAQVoteSchema.index({ faqId: 1, userId: 1 }, { unique: true });

export const TourFAQVoteModel =
  models.TourFAQVote || model<ITourFAQVote>("TourFAQVote", TourFAQVoteSchema);
