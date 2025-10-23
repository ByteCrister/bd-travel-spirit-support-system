// models/tour.model.ts
import {
  AUDIENCE_TYPE,
  CONTENT_CATEGORY,
  TOUR_STATUS,
  DIFFICULTY_LEVEL,
  SEASON,
  TRANSPORT_MODE,
  PAYMENT_METHOD,
  CURRENCY,
  Price,
  Discount,
  CancellationPolicy,
  RefundPolicy,
  Address,
  GeoPoint,
  OperatingWindow,
  Departure,
  Inclusion,
  Exclusion,
  TranslationBlock,
  TourStatus,
  AudienceType,
  ContentCategory,
  Season,
  TransportMode,
  PaymentMethod,
  Currency,
} from "@/constants/tour.const";
import { Schema, model, models, Types, Document } from "mongoose";

interface IAttraction {
  title: string;
  description?: string;
  bestFor?: string;
  insiderTip?: string;
  address?: string;
  openingHours?: string;
  images?: Types.ObjectId[]; // refs to Asset
  coordinates?: GeoPoint;
}

interface IActivity {
  title: string;
  url?: string;
  provider?: string;
  duration?: string; // "3h", "2d 1n"
  price?: Price;
  rating?: number;
}

interface IDestinationBlock {
  city?: string;
  district?: string; // Chattogram, Sylhet, etc.
  country: string; // "Bangladesh"
  region?: string; // Division
  description?: string;
  content?: {
    type: "paragraph" | "link" | "heading";
    text?: string;
    href?: string;
  }[];
  highlights?: string[];
  attractions?: IAttraction[];
  activities?: IActivity[];
  images?: Types.ObjectId[]; // Asset refs
  coordinates?: GeoPoint;
}

export interface ITour extends Document {
  companyId?: Types.ObjectId; // Operator company
  // Identity & SEO
  title: string;
  slug: string;
  status: TourStatus;
  summary: string;
  heroImage?: Types.ObjectId; // Asset
  isFeatured?: boolean;
  gallery?: Types.ObjectId[];
  videos?: string[]; // URLs
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string };

  // Content & structure
  destinations?: IDestinationBlock[];
  itinerary?: {
    dayNumber: number;
    title?: string;
    description?: string;
    images?: Types.ObjectId[];
  }[];
  inclusions?: Inclusion[];
  exclusions?: Exclusion[];
  difficulty?: DIFFICULTY_LEVEL;
  bestSeason?: Season[];
  audience?: AudienceType[];
  categories?: ContentCategory[];
  translations?: TranslationBlock[];

  // Logistics
  mainLocation?: { address?: Address; coordinates?: GeoPoint };
  transportModes?: TransportMode[];
  pickupOptions?: { city?: string; price?: number; currency?: Currency }[];
  meetingPoint?: string;

  // Commerce
  basePrice: Price;
  discounts?: Discount[];
  duration?: { days: number; nights?: number };
  operatingWindows?: OperatingWindow[]; // seasonal windows
  departures?: Departure[]; // specific dated departures
  paymentMethods?: PaymentMethod[];

  // Compliance & partnerships
  operatorId?: Types.ObjectId; // Operator
  guideIds?: Types.ObjectId[]; // Guide[]
  licenseRequired?: boolean;
  ageSuitability?: "all" | "kids" | "adults" | "seniors";
  accessibility?: {
    wheelchair?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
    notes?: string;
  };

  // Policies
  cancellationPolicy?: CancellationPolicy;
  refundPolicy?: RefundPolicy;
  terms?: string; // rich text, or HTML/MD string

  // Engagement
  ratings?: { average: number; count: number };
  wishlistCount?: number;
  popularityScore?: number;
  featured?: boolean;
  trendingUntil?: Date;

  // System
  authorId: Types.ObjectId; // creator
  tags?: string[];
  publishedAt?: Date;
  readingTime?: number;
  wordCount?: number;
  allowComments?: boolean;
  viewCount?: number;
  likeCount?: number;
  shareCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TourSchema = new Schema<ITour>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Guide" },
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
      enum: Object.values(TOUR_STATUS),
      default: TOUR_STATUS.DRAFT,
      index: true,
    },
    summary: { type: String, required: true, trim: true },
    heroImage: { type: Schema.Types.ObjectId, ref: "Asset" },
    isFeatured: { type: Boolean, default: false },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
    videos: [{ type: String, trim: true }],
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      ogImage: { type: String, trim: true },
    },

    destinations: [
      new Schema<IDestinationBlock>(
        {
          city: { type: String, trim: true },
          district: { type: String, trim: true },
          country: { type: String, required: true, trim: true },
          region: { type: String, trim: true },
          description: { type: String, trim: true },
          content: [
            {
              type: {
                type: String,
                enum: ["paragraph", "link", "heading"],
                required: true,
              },
              text: { type: String, trim: true },
              href: { type: String, trim: true },
            },
          ],
          highlights: [{ type: String, trim: true }],
          attractions: [
            new Schema<IAttraction>(
              {
                title: { type: String, required: true, trim: true },
                description: { type: String, trim: true },
                bestFor: { type: String, trim: true },
                insiderTip: { type: String, trim: true },
                address: { type: String, trim: true },
                openingHours: { type: String, trim: true },
                images: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
                coordinates: { lat: Number, lng: Number },
              },
              { _id: false }
            ),
          ],
          activities: [
            new Schema<IActivity>(
              {
                title: { type: String, required: true, trim: true },
                url: { type: String, trim: true },
                provider: { type: String, trim: true },
                duration: { type: String, trim: true },
                price: {
                  amount: { type: Number, min: 0 },
                  currency: { type: String, enum: Object.values(CURRENCY) },
                },
                rating: { type: Number, min: 0, max: 5 },
              },
              { _id: false }
            ),
          ],
          images: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
          coordinates: { lat: Number, lng: Number },
        },
        { _id: false }
      ),
    ],

    itinerary: [
      {
        dayNumber: { type: Number, required: true, min: 1 },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        images: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
      },
    ],
    inclusions: [
      {
        label: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    exclusions: [
      {
        label: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    difficulty: { type: String, enum: Object.values(DIFFICULTY_LEVEL) },
    bestSeason: [{ type: String, enum: Object.values(SEASON) }],
    audience: [
      { type: String, enum: Object.values(AUDIENCE_TYPE), index: true },
    ],
    categories: [
      { type: String, enum: Object.values(CONTENT_CATEGORY), index: true },
    ],
    translations: [
      {
        language: { type: String, required: true, trim: true },
        title: { type: String, trim: true },
        summary: { type: String, trim: true },
        content: [
          {
            type: {
              type: String,
              enum: ["paragraph", "heading", "link"],
              required: true,
            },
            text: { type: String, trim: true },
            href: { type: String, trim: true },
          },
        ],
      },
    ],

    mainLocation: {
      address: {
        line1: { type: String, trim: true },
        line2: { type: String, trim: true },
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        region: { type: String, trim: true },
        country: { type: String, trim: true },
        postalCode: { type: String, trim: true },
      },
      coordinates: { lat: Number, lng: Number },
    },
    transportModes: [{ type: String, enum: Object.values(TRANSPORT_MODE) }],
    pickupOptions: [
      {
        city: { type: String, trim: true },
        price: { type: Number, min: 0 },
        currency: { type: String, enum: Object.values(CURRENCY) },
      },
    ],
    meetingPoint: { type: String, trim: true },

    basePrice: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, enum: Object.values(CURRENCY) },
    },
    discounts: [
      {
        type: {
          type: String,
          enum: ["seasonal", "early_bird", "group", "promo"],
        },
        value: { type: Number, min: 0, max: 100 },
        code: { type: String, trim: true },
        validFrom: { type: Date },
        validUntil: { type: Date },
      },
    ],
    duration: {
      days: { type: Number, min: 0 },
      nights: { type: Number, min: 0 },
    },
    operatingWindows: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        seatsTotal: { type: Number, min: 0 },
        seatsBooked: { type: Number, min: 0 },
      },
    ],
    departures: [
      {
        date: { type: Date, required: true },
        seatsTotal: { type: Number, required: true, min: 0 },
        seatsBooked: { type: Number, default: 0, min: 0 },
        meetingPoint: { type: String, trim: true },
        meetingCoordinates: { lat: Number, lng: Number },
      },
    ],
    paymentMethods: [{ type: String, enum: Object.values(PAYMENT_METHOD) }],

    operatorId: { type: Schema.Types.ObjectId, ref: "Operator", index: true },
    guideIds: [{ type: Schema.Types.ObjectId, ref: "Guide" }],
    licenseRequired: { type: Boolean, default: false },
    ageSuitability: {
      type: String,
      enum: ["all", "kids", "adults", "seniors"],
    },
    accessibility: {
      wheelchair: { type: Boolean, default: false },
      familyFriendly: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      notes: { type: String, trim: true },
    },

    cancellationPolicy: {
      refundable: { type: Boolean, default: true },
      rules: [
        {
          daysBefore: { type: Number, min: 0 },
          refundPercent: { type: Number, min: 0, max: 100 },
        },
      ],
    },
    refundPolicy: {
      method: [{ type: String, enum: Object.values(PAYMENT_METHOD) }],
      processingDays: { type: Number, min: 0 },
    },
    terms: { type: String },

    ratings: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, min: 0, default: 0 },
    },
    wishlistCount: { type: Number, default: 0, min: 0 },
    popularityScore: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    trendingUntil: { type: Date },

    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tags: [{ type: String, trim: true, index: true }],
    publishedAt: { type: Date, index: true },
    readingTime: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    allowComments: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
TourSchema.index({ status: 1, publishedAt: -1 });
TourSchema.index({ slug: 1 });
TourSchema.index({ "destinations.city": 1, "destinations.country": 1 });
TourSchema.index({ categories: 1 });
TourSchema.index({ audience: 1 });
TourSchema.index({ featured: 1, trendingUntil: -1 });

export const TourModel = models.Tour || model<ITour>("Tour", TourSchema);
