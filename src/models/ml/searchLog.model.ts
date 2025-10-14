import { model, models, Schema, Types } from "mongoose";

// models/searchLog.model.ts
export interface ISearchLog extends Document {
  user?: Types.ObjectId;
  query: string;
  tokens?: string[];
  // Parsed intent (e.g., beach, family-friendly) and geos
  intents?: string[];
  locations?: string[];
  resultCount?: number;
  clickedTourIds?: Types.ObjectId[];
  createdAt: Date;
}
const SearchLogSchema = new Schema<ISearchLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    query: { type: String, required: true, trim: true },
    tokens: [{ type: String, trim: true }],
    intents: [{ type: String, trim: true }],
    locations: [{ type: String, trim: true }],
    resultCount: { type: Number, default: 0 },
    clickedTourIds: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);
SearchLogSchema.index({ query: "text", intents: 1, createdAt: -1 });
export const SearchLogModel =
  models.SearchLog || model<ISearchLog>("SearchLog", SearchLogSchema);
