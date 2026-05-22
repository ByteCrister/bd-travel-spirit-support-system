// traveler-tour-interaction.model.ts
import { Schema, Document, Types, Model } from "mongoose";
import { defineModel } from "@/lib/helpers/defineModel";

// =============== SUBDOCUMENT INTERFACES ===============

export interface IBookingHistoryItem {
  tour: Types.ObjectId;
  uniqueTourCode: string;        // denormalized for quick access
  bookedAt: Date;
  bookingId?: Types.ObjectId;    // optional reference to the actual booking
}

export interface ICartItem {
  tour: Types.ObjectId;
  uniqueTourCode: string;
  addedAt: Date;
}

export interface IWishlistItem {
  tour: Types.ObjectId;
  uniqueTourCode: string;
  addedAt: Date;
}

export interface IHiddenTourItem {
  tour: Types.ObjectId;
  uniqueTourCode: string;
  addedAt: Date;
}

export interface ILikedTourItem {
  tour: Types.ObjectId;
  uniqueTourCode: string;
  likedAt: Date;
}

export interface ISharedTourItem {
  tour: Types.ObjectId;
  uniqueTourCode: string;
  sharedAt: Date;
  platform?: string; // e.g., 'facebook', 'twitter', 'copy-link'
}

export interface IViewedTourItem {
  tour: Types.ObjectId;
  uniqueTourCode: string;
  viewedAt: Date;
  durationSeconds?: number; // time spent on the tour page
}

export interface IViewedArticleItem {
  article: Types.ObjectId;
  viewedAt: Date;
  durationSeconds?: number;
}

// =============== MAIN INTERFACE ===============

export interface IUserTourInteraction extends Document {
  user: Types.ObjectId;
  bookingHistory: IBookingHistoryItem[];
  cart: ICartItem[];
  wishlist: IWishlistItem[];
  hiddenTours: IHiddenTourItem[];
  likedTours: ILikedTourItem[];
  sharedTours: ISharedTourItem[];
  viewedTours: IViewedTourItem[];
  viewedArticles: IViewedArticleItem[];
  createdAt: Date;
  updatedAt: Date;
}

// =============== SCHEMA DEFINITION ===============

const UserTourInteractionSchema = new Schema<IUserTourInteraction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    bookingHistory: [
      {
        tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
        uniqueTourCode: { type: String, required: true, trim: true },
        bookedAt: { type: Date, default: Date.now },
        bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
        _id: false,
      },
    ],

    cart: [
      {
        tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
        uniqueTourCode: { type: String, required: true, trim: true },
        addedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],

    wishlist: [
      {
        tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
        uniqueTourCode: { type: String, required: true, trim: true },
        addedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],

    hiddenTours: [
      {
        tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
        uniqueTourCode: { type: String, required: true, trim: true },
        addedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],

    likedTours: [
      {
        tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
        uniqueTourCode: { type: String, required: true, trim: true },
        likedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],

    sharedTours: [
      {
        tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
        uniqueTourCode: { type: String, required: true, trim: true },
        sharedAt: { type: Date, default: Date.now },
        platform: { type: String, trim: true },
        _id: false,
      },
    ],

    viewedTours: [
      {
        tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
        uniqueTourCode: { type: String, required: true, trim: true },
        viewedAt: { type: Date, default: Date.now },
        durationSeconds: { type: Number, min: 0 },
        _id: false,
      },
    ],

    viewedArticles: [
      {
        article: { type: Schema.Types.ObjectId, ref: "Article", required: true },
        viewedAt: { type: Date, default: Date.now },
        durationSeconds: { type: Number, min: 0 },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// =============== INDEXES ===============

// For quickly finding a user's recent interactions
UserTourInteractionSchema.index({ "viewedTours.viewedAt": -1 });
UserTourInteractionSchema.index({ "viewedArticles.viewedAt": -1 });
UserTourInteractionSchema.index({ "likedTours.likedAt": -1 });
UserTourInteractionSchema.index({ "sharedTours.sharedAt": -1 });

// For finding which users interacted with a specific tour/article (by ID)
UserTourInteractionSchema.index({ "bookingHistory.tour": 1 });
UserTourInteractionSchema.index({ "cart.tour": 1 });
UserTourInteractionSchema.index({ "wishlist.tour": 1 });
UserTourInteractionSchema.index({ "hiddenTours.tour": 1 });
UserTourInteractionSchema.index({ "likedTours.tour": 1 });
UserTourInteractionSchema.index({ "sharedTours.tour": 1 });
UserTourInteractionSchema.index({ "viewedTours.tour": 1 });
UserTourInteractionSchema.index({ "viewedArticles.article": 1 });

// Indexes for denormalized uniqueTourCode lookups
UserTourInteractionSchema.index({ "bookingHistory.uniqueTourCode": 1 });
UserTourInteractionSchema.index({ "cart.uniqueTourCode": 1 });
UserTourInteractionSchema.index({ "wishlist.uniqueTourCode": 1 });
UserTourInteractionSchema.index({ "hiddenTours.uniqueTourCode": 1 });
UserTourInteractionSchema.index({ "likedTours.uniqueTourCode": 1 });
UserTourInteractionSchema.index({ "sharedTours.uniqueTourCode": 1 });
UserTourInteractionSchema.index({ "viewedTours.uniqueTourCode": 1 });

// =============== EXPORT ===============

export const UserTourInteractionModel = defineModel<IUserTourInteraction, Model<IUserTourInteraction>>(
  "UserTourInteraction",
  UserTourInteractionSchema
);