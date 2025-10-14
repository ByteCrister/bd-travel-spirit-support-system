import { model, models, Schema, Types } from "mongoose";

// models/recoFeedback.model.ts
export enum FEEDBACK_TYPE {
  LIKE = "like",
  DISLIKE = "dislike",
  HIDE = "hide",
}
export interface IRecoFeedback extends Document {
  user: Types.ObjectId;
  tour: Types.ObjectId;
  variant?: string; // AB test variant / strategy name
  feedback: FEEDBACK_TYPE;
  createdAt: Date;
}
const RecoFeedbackSchema = new Schema<IRecoFeedback>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      index: true,
      required: true,
    },
    variant: { type: String, trim: true },
    feedback: {
      type: String,
      enum: Object.values(FEEDBACK_TYPE),
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);
RecoFeedbackSchema.index({ user: 1, tour: 1 }, { unique: true });
export const RecoFeedbackModel =
  models.RecoFeedback ||
  model<IRecoFeedback>("RecoFeedback", RecoFeedbackSchema);
