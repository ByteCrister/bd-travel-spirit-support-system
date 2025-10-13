// models/travelArticle.model.ts
import { model, models, Schema, Types, Document } from "mongoose";

/**
 * Enum for article publication status
 */
export enum ARTICLE_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

/**
 * Enum for high-level travel categories
 */
export enum TRAVEL_CATEGORY {
  DESTINATION_GUIDE = "destination_guide",
  BEACHES = "beaches",
  FOOD_DRINK = "food_drink",
  CULTURE_HISTORY = "culture_history",
  ADVENTURE = "adventure",
  FAMILY = "family",
  ROMANTIC = "romantic",
}

/**
 * Enum for article type (single vs multi-destination, etc.)
 */
export enum ARTICLE_TYPE {
  SINGLE_DESTINATION = "single_destination",
  MULTI_DESTINATION = "multi_destination",
  GENERAL_TIPS = "general_tips",
}

/**
 * Interface for structured activities
 */
interface IActivity {
  title: string;
  url?: string;
  provider?: string;
  duration?: string;
  price?: string;
  rating?: number;
}

/**
 * Interface for structured attractions
 */
interface IAttraction {
  title: string;
  description: string;
  bestFor?: string;
  insiderTip?: string;
  address?: string;
  openingHours?: string;
  images: string[];
  coordinates?: { lat: number; lng: number };
}

/**
 * Interface for destination blocks (multi-destination articles)
 */
interface IDestinationBlock {
  city: string;
  country: string;
  region?: string;
  description: string;
  content: IRichTextBlock[];
  highlights?: string[];
  attractions?: IAttraction[];
  activities?: IActivity[];
  images?: string[];
}

/**
 * Interface for FAQs
 */
interface IFAQ {
  question: string;
  answer: string;
}

interface IRichTextBlock {
  type: "paragraph" | "link" | "heading";
  text?: string;
  href?: string;
}

/**
 * Main travel article interface
 */
export interface ITravelArticle extends Document {
  title: string;
  slug: string;
  status: ARTICLE_STATUS;
  articleType: ARTICLE_TYPE;
  author: Types.ObjectId;
  authorBio?: string;
  summary: string;
  heroImage: string;
  destinations?: IDestinationBlock[]; // replaces single `destination`
  categories?: TRAVEL_CATEGORY[];
  tags?: string[];
  publishedAt?: Date;
  readingTime?: number;
  wordCount?: number;
  seo: { metaTitle: string; metaDescription: string; ogImage?: string };
  faqs?: IFAQ[];
  viewCount: number;
  likeCount: number;
  shareCount: number;
  allowComments: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TravelArticleSchema = new Schema<ITravelArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ARTICLE_STATUS),
      default: ARTICLE_STATUS.DRAFT,
      index: true,
    },
    articleType: {
      type: String,
      enum: Object.values(ARTICLE_TYPE),
      required: true,
      index: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorBio: { type: String, trim: true },
    summary: { type: String, required: true, trim: true },
    heroImage: { type: String, required: true },

    destinations: [
      {
        city: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        region: { type: String, trim: true },
        description: { type: String, required: true },
        content: [
          {
            type: {
              type: String,
              enum: ["paragraph", "link", "heading"],
              required: true,
            },
            text: { type: String },
            href: { type: String },
          },
        ],
        highlights: [{ type: String, trim: true }],
        attractions: [
          {
            title: { type: String, required: true, trim: true },
            description: { type: String, required: true },
            bestFor: { type: String, trim: true },
            insiderTip: { type: String, trim: true },
            address: { type: String, trim: true },
            openingHours: { type: String, trim: true },
            images: [{ type: Schema.Types.ObjectId, ref: "Image" }], // ref to Image model
            coordinates: { lat: Number, lng: Number },
          },
        ],
        activities: [
          {
            title: { type: String, required: true },
            url: { type: String },
            provider: { type: String },
            duration: { type: String },
            price: { type: String },
            rating: { type: Number },
          },
        ],
        images: [{ type: Schema.Types.ObjectId, ref: "Image" }], // ref to Image model
      },
    ],

    categories: [
      { type: String, enum: Object.values(TRAVEL_CATEGORY), index: true },
    ],
    tags: [{ type: String, trim: true, index: true }],
    publishedAt: { type: Date, index: true },
    readingTime: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },

    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      ogImage: { type: String, trim: true },
    },
    faqs: [
      {
        question: { type: String, required: true },
        askedBy: { type: String, default: "User" },
        answer: { type: String, required: true },
        answeredBy: { type: String, default: "User" },
      },
    ],
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    allowComments: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TravelArticleSchema.index({ status: 1, publishedAt: -1 });
TravelArticleSchema.index({ slug: 1 });
TravelArticleSchema.index({
  "destinations.city": 1,
  "destinations.country": 1,
});

export const TravelArticleModel =
  models.TravelArticle ||
  model<ITravelArticle>("TravelArticle", TravelArticleSchema);
