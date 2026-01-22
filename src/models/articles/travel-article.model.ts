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
import { slugify } from "@/lib/helpers/slugify";
import { Query } from "mongoose";
import { Schema, Types, Document, Model, ClientSession, FilterQuery, QueryOptions } from "mongoose";

/**
 * Interface for Bangladeshi cuisine/dining recommendations
 */
export interface IFoodRecommendation {
  dishName: string;
  description: string;
  bestPlaceToTry?: string;
  approximatePrice?: string;
  spiceLevel?: FoodRecoSpiceType;
}

/**
 * Interface for local festivals/events in Bangladesh
 */
export interface ILocalFestival {
  name: string;
  description: string;
  timeOfYear: string;
  location: string;
  significance?: string;
}

/**
 * Interface for destination blocks within Bangladesh
 */
export interface IDestinationBlock {
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
  imageAsset?: { title: string, assetId: Types.ObjectId };
}

export interface IRichTextBlock {
  type: ArticleRichTextBlockType;
  text?: string;
  href?: string;
}

export interface IFAQ {
  question: string;
  answer: string;
  category?: FaqCategory;
}

/**
 * Main travel article interface for Bangladesh with soft delete fields
 */
export interface ITravelArticle extends Document {
  _id: Types.ObjectId;
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
  softDeleteById(
    id: Types.ObjectId | string,
    deletedBy?: Types.ObjectId,
    session?: ClientSession
  ): Promise<ITravelArticle | null>;

  restoreById(
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
      ogImage: { type: Schema.Types.ObjectId, ref: "Asset" },
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
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for better query performance
TravelArticleSchema.index({ status: 1, publishedAt: -1 });
TravelArticleSchema.index({ "destinations.division": 1, "destinations.district": 1 });
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

// Enhanced pre-save middleware with uniqueness check
TravelArticleSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('title')) {
    const slugOptions = {
      maxLength: 60,
      locale: 'en',
      fallback: 'article'
    };

    const titleToSlugify = this.title || this.banglaTitle || '';
    const baseSlug = titleToSlugify ? slugify(titleToSlugify, slugOptions) : `article-${Date.now()}`;
    let finalSlug = baseSlug;
    let counter = 1;

    // Get the model from the document's constructor
    const Model = this.constructor as Model<ITravelArticle>;

    while (true) {
      const existing = await Model.findOne({
        slug: finalSlug,
        _id: { $ne: this._id }
      } as FilterQuery<ITravelArticle>);

      if (!existing) {
        break;
      }

      // Append counter to make it unique
      finalSlug = `${baseSlug}-${counter}`;
      counter++;

      // Safety break to prevent infinite loop
      if (counter > 100) {
        finalSlug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    this.slug = finalSlug;
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
 * Soft delete by ID
 */
TravelArticleSchema.statics.softDeleteById = async function (
  id: Types.ObjectId | string,
  deletedBy?: Types.ObjectId,
  session?: ClientSession
): Promise<ITravelArticle | null> {
  const update = {
    $set: {
      status: ARTICLE_STATUS.ARCHIVED,
      deleted: true,
      deletedAt: new Date(),
      ...(deletedBy && { deletedBy }),
    },
  };

  return this.findByIdAndUpdate(id, update, { new: true, session });
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
        status: ARTICLE_STATUS.DRAFT,
        deleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    },
    { new: true, session }
  );
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

export const TravelArticleModel = defineModel<ITravelArticle, ITravelArticleModel>(
  "TravelArticle",
  TravelArticleSchema
);