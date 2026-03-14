// traveler-tour-interaction.model.ts
import { Schema, Document, Types } from "mongoose";
import { defineModel } from "@/lib/helpers/defineModel";

export interface IUserTourInteraction extends Document {
  user: Types.ObjectId;
  bookingHistory: Types.ObjectId[];
  cart: Types.ObjectId[];
  wishlist: Types.ObjectId[];
  hiddenTours: Types.ObjectId[];
  updatedAt: Date;
}

const UserTourInteractionSchema = new Schema<IUserTourInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bookingHistory: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
    cart: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
    hiddenTours: [{ type: Schema.Types.ObjectId, ref: "Tour" }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserTourInteractionSchema.index({ user: 1, "viewedTours.viewedAt": -1 });
UserTourInteractionSchema.index({ user: 1, "searchHistory.searchedAt": -1 });

export const UserTourInteractionModel = defineModel("UserTourInteraction", UserTourInteractionSchema);