import { model, models, Schema, Types } from "mongoose";

// models/contentEmbedding.model.ts
export enum CONTENT_KIND {
  TOUR = "tour",
  ARTICLE = "article",
}
export interface IContentEmbedding extends Document {
  kind: CONTENT_KIND;
  refId: Types.ObjectId; // Tour or TravelArticle
  dim: number;
  vector: number[]; // normalized
  // Optional: fields used to generate it (audit/debug)
  source: { model: string; version: string };
  updatedAt: Date;
}
const ContentEmbeddingSchema = new Schema<IContentEmbedding>(
  {
    kind: {
      type: String,
      enum: Object.values(CONTENT_KIND),
      index: true,
      required: true,
    },
    refId: { type: Schema.Types.ObjectId, required: true, index: true },
    dim: { type: Number, required: true },
    vector: [{ type: Number, required: true }],
    source: { model: { type: String }, version: { type: String } },
  },
  { timestamps: true, versionKey: false }
);
ContentEmbeddingSchema.index({ kind: 1, refId: 1 }, { unique: true });
export const ContentEmbeddingModel =
  models.ContentEmbedding ||
  model<IContentEmbedding>("ContentEmbedding", ContentEmbeddingSchema);
