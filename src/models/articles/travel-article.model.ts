// models/travelArticle.model.ts
import {
  ARTICLE_RICH_TEXT_BLOCK_TYPE,
  ARTICLE_STATUS,
  ARTICLE_TYPE,
  ArticleRichTextBlockType,
  ArticleStatus,
  ArticleType,
  FAQ_CATEGORY,
  FaqCategory,
  FOOD_RECO_SPICE_TYPE,
  FoodRecoSpiceType
} from "@/constants/article.const";
import {
  DISTRICT,
  District,
  DIVISION,
  Division,
  TOUR_CATEGORIES,
  TourCategories
} from "@/constants/tour.const";
import { defineModel } from "@/lib/helpers/defineModel";
import { Query } from "mongoose";
import { Schema, Types, Document, Model, ClientSession, FilterQuery, QueryOptions } from "mongoose";

/**
 * Interface for Bangladeshi cuisine/dining recommendations
 */
interface IFoodRecommendation {
  dishName: string;
  description: string;
  bestPlaceToTry?: string;
  approximatePrice?: string;
  spiceLevel?: FoodRecoSpiceType;
}

/**
 * Interface for local festivals/events in Bangladesh
 */
interface ILocalFestival {
  name: string;
  description: string;
  timeOfYear: string;
  location: string;
  significance?: string;
}

/**
 * Interface for destination blocks within Bangladesh
 */
interface IDestinationBlock {
  _id: Types.ObjectId;
  division: Division;
  district: District;
  area?: string;
  description: string;
  content: IRichTextBlock[];
  highlights?: string[];
  foodRecommendations?: IFoodRecommendation[];
  localFestivals?: ILocalFestival[];
  localTips?: string[];
  transportOptions?: string[];
  accommodationTips?: string[];
  coordinates?: { lat: number; lng: number };
  imageAssets?: { title: string, assetId: Types.ObjectId };
}

interface IRichTextBlock {
  type: ArticleRichTextBlockType;
  text?: string;
  href?: string;
}

interface IFAQ {
  question: string;
  answer: string;
  category?: FaqCategory;
}

/**
 * Main travel article interface for Bangladesh with soft delete fields
 */
export interface ITravelArticle extends Document {
  title: string;
  banglaTitle?: string;
  slug: string;
  status: ArticleStatus;
  articleType: ArticleType;
  author: Types.ObjectId;
  authorBio?: string;
  summary: string;
  heroImage: Types.ObjectId;
  destinations?: IDestinationBlock[];
  categories?: TourCategories[];
  tags?: string[];
  publishedAt?: Date;
  readingTime?: number;
  wordCount?: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage?: string;
  };
  faqs?: IFAQ[];
  contentEmbeddingId?: Types.ObjectId;
  topicTags?: string[];
  viewCount: number;
  likeCount: number;
  shareCount: number;
  allowComments: boolean;

  // Soft delete fields
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Static methods interface for the model
 */
export interface ITravelArticleModel extends Model<ITravelArticle> {
  // Find methods including deleted
  findWithDeleted(
    filter?: FilterQuery<ITravelArticle>,
    options?: QueryOptions,
    session?: ClientSession
  ): Promise<ITravelArticle[]>;

  findOneWithDeleted(
    filter: FilterQuery<ITravelArticle>,
    options?: QueryOptions,
    session?: ClientSession
  ): Promise<ITravelArticle | null>;

  findByIdWithDeleted(
    id: Types.ObjectId | string,
    options?: QueryOptions,
    session?: ClientSession
  ): Promise<ITravelArticle | null>;

  // Soft delete methods
  softDelete(
    filter: FilterQuery<ITravelArticle>,
    deletedBy?: Types.ObjectId,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }>;

  softDeleteById(
    id: Types.ObjectId | string,
    deletedBy?: Types.ObjectId,
    session?: ClientSession
  ): Promise<ITravelArticle | null>;

  // Restore methods
  restore(
    filter: FilterQuery<ITravelArticle>,
    session?: ClientSession
  ): Promise<{ modifiedCount: number }>;

  restoreById(
    id: Types.ObjectId | string,
    session?: ClientSession
  ): Promise<ITravelArticle | null>;

  // Permanent delete methods (hard delete)
  hardDelete(
    filter: FilterQuery<ITravelArticle>,
    session?: ClientSession
  ): Promise<{ deletedCount: number }>;

  hardDeleteById(
    id: Types.ObjectId | string,
    session?: ClientSession
  ): Promise<ITravelArticle | null>;

  // Count methods
  countWithDeleted(
    filter?: FilterQuery<ITravelArticle>,
    session?: ClientSession
  ): Promise<number>;

  countDeleted(
    filter?: FilterQuery<ITravelArticle>,
    session?: ClientSession
  ): Promise<number>;

  countActive(
    filter?: FilterQuery<ITravelArticle>,
    session?: ClientSession
  ): Promise<number>;
}

const TravelArticleSchema = new Schema<ITravelArticle, ITravelArticleModel>(
  {
    title: { type: String, required: true, trim: true },
    banglaTitle: { type: String, trim: true },
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
    heroImage: { type: Schema.Types.ObjectId, ref: "Asset", required: true },

    destinations: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          auto: true,
        },
        division: { type: String, enum: Object.values(DIVISION), required: true, trim: true, index: true },
        district: { type: String, enum: Object.values(DISTRICT), required: true, trim: true, index: true },
        area: { type: String, trim: true },
        description: { type: String, required: true },
        content: [
          {
            type: {
              type: String,
              enum: Object.values(ARTICLE_RICH_TEXT_BLOCK_TYPE),
              required: true,
            },
            text: { type: String },
            href: { type: String },
          },
        ],
        highlights: [{ type: String, trim: true }],
        foodRecommendations: [
          {
            dishName: { type: String, required: true },
            description: { type: String, required: true },
            bestPlaceToTry: { type: String },
            approximatePrice: { type: String },
            spiceLevel: {
              type: String,
              enum: Object.values(FOOD_RECO_SPICE_TYPE)
            },
          },
        ],
        localFestivals: [
          {
            name: { type: String, required: true },
            description: { type: String, required: true },
            timeOfYear: { type: String, required: true },
            location: { type: String, required: true },
            significance: { type: String },
          },
        ],
        localTips: [{ type: String, trim: true }],
        transportOptions: [{ type: String, trim: true }],
        accommodationTips: [{ type: String, trim: true }],
        coordinates: {
          lat: {
            type: Number,
            min: -90,
            max: 90,
          },
          lng: {
            type: Number,
            min: -180,
            max: 180,
          },
        },
        imageAsset:
        {
          title: { type: String, required: true, trim: true },
          assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true }
        }
        ,
      },
    ],

    categories: [{ type: String, enum: Object.values(TOUR_CATEGORIES), trim: true, index: true }],
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
        answer: { type: String, required: true },
        category: {
          type: String,
          enum: Object.values(FAQ_CATEGORY),
        },
      },
    ],
    contentEmbeddingId: {
      type: Schema.Types.ObjectId,
      ref: "ContentEmbedding",
      index: true,
    },
    topicTags: [{ type: String, trim: true, index: true }],
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    allowComments: { type: Boolean, default: true },

    // Soft delete fields
    deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for better query performance
TravelArticleSchema.index({ status: 1, publishedAt: -1 });
TravelArticleSchema.index({ slug: 1 });
TravelArticleSchema.index({ "destinations.division": 1, "destinations.district": 1 });
TravelArticleSchema.index({ categories: 1 });
TravelArticleSchema.index({ tags: 1 });
TravelArticleSchema.index({ deleted: 1, status: 1, publishedAt: -1 });
TravelArticleSchema.index({ deleted: 1, slug: 1 });

// Query middleware to filter out deleted documents by default
TravelArticleSchema.pre(/^find/, function (this: Query<ITravelArticle[], ITravelArticle>, next) {
  const filter = this.getFilter();
  if (filter.deleted === undefined) {
    this.where({ deleted: false });
  }
  next();
});

// Static Methods Implementation

/**
 * Find documents including deleted ones
 */
TravelArticleSchema.statics.findWithDeleted = async function (
  filter: FilterQuery<ITravelArticle> = {},
  options: QueryOptions = {},
  session?: ClientSession
): Promise<ITravelArticle[]> {
  return this.find(filter, null, { ...options, session });
};

/**
 * Find one document including deleted ones
 */
TravelArticleSchema.statics.findOneWithDeleted = async function (
  filter: FilterQuery<ITravelArticle>,
  options: QueryOptions = {},
  session?: ClientSession
): Promise<ITravelArticle | null> {
  return this.findOne(filter, null, { ...options, session });
};

/**
 * Find by ID including deleted ones
 */
TravelArticleSchema.statics.findByIdWithDeleted = async function (
  id: Types.ObjectId | string,
  options: QueryOptions = {},
  session?: ClientSession
): Promise<ITravelArticle | null> {
  return this.findOne({ _id: id }, null, { ...options, session });
};

/**
 * Soft delete multiple documents
 */
TravelArticleSchema.statics.softDelete = async function (
  filter: FilterQuery<ITravelArticle>,
  deletedBy?: Types.ObjectId,
  session?: ClientSession
): Promise<{ modifiedCount: number }> {
  const update = {
    $set: {
      deleted: true,
      deletedAt: new Date(),
      ...(deletedBy && { deletedBy }),
    },
  };

  const result = await this.updateMany(filter, update, { session });
  return { modifiedCount: result.modifiedCount };
};

/**
 * Soft delete by ID
 */
TravelArticleSchema.statics.softDeleteById = async function (
  id: Types.ObjectId | string,
  deletedBy?: Types.ObjectId,
  session?: ClientSession
): Promise<ITravelArticle | null> {
  const update = {
    $set: {
      deleted: true,
      deletedAt: new Date(),
      ...(deletedBy && { deletedBy }),
    },
  };

  return this.findByIdAndUpdate(id, update, { new: true, session });
};

/**
 * Restore multiple soft-deleted documents
 */
TravelArticleSchema.statics.restore = async function (
  filter: FilterQuery<ITravelArticle>,
  session?: ClientSession
): Promise<{ modifiedCount: number }> {
  const update = {
    $set: {
      deleted: false,
      deletedAt: null,
      deletedBy: null,
    },
  };

  const result = await this.updateMany(
    { ...filter, deleted: true },
    update,
    { session }
  );

  return { modifiedCount: result.modifiedCount };
};

/**
 * Restore by ID
 */
TravelArticleSchema.statics.restoreById = async function (
  id: Types.ObjectId | string,
  session?: ClientSession
): Promise<ITravelArticle | null> {
  return this.findByIdAndUpdate(
    id,
    {
      $set: {
        deleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    },
    { new: true, session }
  );
};

/**
 * Hard delete (permanent delete) multiple documents
 */
TravelArticleSchema.statics.hardDelete = async function (
  filter: FilterQuery<ITravelArticle>,
  session?: ClientSession
): Promise<{ deletedCount: number }> {
  const result = await this.deleteMany(filter, { session });
  return { deletedCount: result.deletedCount };
};

/**
 * Hard delete by ID
 */
TravelArticleSchema.statics.hardDeleteById = async function (
  id: Types.ObjectId | string,
  session?: ClientSession
): Promise<ITravelArticle | null> {
  return this.findByIdAndDelete(id, { session });
};

/**
 * Count documents including deleted ones
 */
TravelArticleSchema.statics.countWithDeleted = async function (
  filter: FilterQuery<ITravelArticle> = {},
  session?: ClientSession
): Promise<number> {
  return this.countDocuments(filter, { session });
};

/**
 * Count only deleted documents
 */
TravelArticleSchema.statics.countDeleted = async function (
  filter: FilterQuery<ITravelArticle> = {},
  session?: ClientSession
): Promise<number> {
  return this.countDocuments({ ...filter, deleted: true }, { session });
};

/**
 * Count only active (non-deleted) documents
 */
TravelArticleSchema.statics.countActive = async function (
  filter: FilterQuery<ITravelArticle> = {},
  session?: ClientSession
): Promise<number> {
  return this.countDocuments({ ...filter, deleted: false }, { session });
};

// Instance Methods

/**
 * Soft delete instance method
 */
TravelArticleSchema.methods.softDelete = async function (
  deletedBy?: Types.ObjectId,
  session?: ClientSession
): Promise<ITravelArticle> {
  this.deleted = true;
  this.deletedAt = new Date();
  if (deletedBy) {
    this.deletedBy = deletedBy;
  }
  return this.save({ session });
};

/**
 * Restore instance method
 */
TravelArticleSchema.methods.restore = async function (
  session?: ClientSession
): Promise<ITravelArticle> {
  this.deleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save({ session });
};

export const TravelArticleModel = defineModel<ITravelArticle, ITravelArticleModel>(
  "TravelArticle",
  TravelArticleSchema
);