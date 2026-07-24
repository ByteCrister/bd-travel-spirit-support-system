// traveler-tour-interaction.model.ts
import { Schema, Document, Types } from "mongoose";
import { defineModel } from "@/lib/helpers/defineModel";

export interface ITourInteractionItem {
  tour: Types.ObjectId;
  addedAt: Date;
}

export interface IViewedTourItem {
  tour: Types.ObjectId;
  viewCount: number;
  lastViewedAt: Date;
}

export interface IUserTourInteraction extends Document {
  user: Types.ObjectId;
  bookingHistory: ITourInteractionItem[];
  wishlist: ITourInteractionItem[];
  sharedTours: ITourInteractionItem[];
  likedTours: ITourInteractionItem[];
  viewedTours: IViewedTourItem[];
  createdAt: Date;
  updatedAt: Date;
}

const InteractionItemSchema = new Schema(
  {
    tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ViewedTourItemSchema = new Schema(
  {
    tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
    viewCount: { type: Number, default: 1 },
    lastViewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserTourInteractionSchema = new Schema<IUserTourInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bookingHistory: [InteractionItemSchema],
    wishlist: [InteractionItemSchema],
    sharedTours: [InteractionItemSchema],
    likedTours: [InteractionItemSchema],
    viewedTours: [ViewedTourItemSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Optimize queries when retrieving recent interactions for a user
UserTourInteractionSchema.index({ user: 1, "bookingHistory.addedAt": -1 });
UserTourInteractionSchema.index({ user: 1, "wishlist.addedAt": -1 });
UserTourInteractionSchema.index({ user: 1, "likedTours.addedAt": -1 });
UserTourInteractionSchema.index({ user: 1, "viewedTours.lastViewedAt": -1 });

const UserTourInteractionModel = defineModel("UserTourInteraction", UserTourInteractionSchema);
export default UserTourInteractionModel;