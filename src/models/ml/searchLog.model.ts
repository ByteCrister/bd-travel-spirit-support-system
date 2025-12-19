import { model, models, Schema, Types } from "mongoose";

export interface ISearchLog extends Document {
  user?: Types.ObjectId;
  query: string;
  clickedTourIds: Types.ObjectId[]; // Tours user actually clicked
  createdAt: Date;
}

const SearchLogSchema = new Schema<ISearchLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Traveler", index: true },
    query: { type: String, required: true, trim: true },
    clickedTourIds: [{
      type: Schema.Types.ObjectId,
      ref: "Tour",
      default: []
    }],
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

// Simpler index - just for querying recent searches
SearchLogSchema.index({ user: 1, createdAt: -1 });

export const SearchLogModel =
  models.SearchLog || model<ISearchLog>("SearchLog", SearchLogSchema);