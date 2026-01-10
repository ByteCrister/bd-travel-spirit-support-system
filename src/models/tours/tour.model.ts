// models/tour.model.ts
import {
  AUDIENCE_TYPE,
  TOUR_CATEGORIES,
  TOUR_STATUS,
  DIFFICULTY_LEVEL,
  SEASON,
  TRANSPORT_MODE,
  PAYMENT_METHOD,
  TourStatus,
  AudienceType,
  TourCategories,
  Season,
  TransportMode,
  PaymentMethod,
  Currency,
  TourDiscount,
  CURRENCY,
  DifficultyLevel,
  AgeSuitability,
  AGE_SUITABILITY,
  TOUR_DISCOUNT,
  ModerationStatus,
  MODERATION_STATUS,
  MealsProvided,
  MEALS_PROVIDED,
  TRAVEL_TYPE,
  TravelType,
  WaterSafety,
  DIVISION,
  DISTRICT,
  ACCOMMODATION_TYPE,
  Division,
  District,
  AccommodationType,
} from "@/constants/tour.const";
import { defineModel } from "@/lib/helpers/defineModel";
import { HydratedDocument, Query } from "mongoose";
import { FilterQuery } from "mongoose";
import { ClientSession } from "mongoose";
import { Schema, Types, Document, Model, UpdateQuery } from "mongoose";
import { HydratedEmployeeDocument } from "../employees/employees.model";

// =============== PRICE & DISCOUNT TYPES ===============
export type IPrice = {
  amount: number; // Base price per person in BDT/USD
  currency: Currency;
};

export type IDiscount = {
  type: TourDiscount;
  value: number; // Percentage 0-100
  code?: string;
  validFrom?: Date;
  validUntil?: Date;
};

// =============== HEALTH & SAFETY TYPES ===============
export type IHealthInfo = {
  vaccinationRequired?: string[];
  malariaRiskAreas?: string[];
  waterSafety?: WaterSafety;
  commonHealthIssues?: string[];
}

export interface IReligiousConsiderations {
  prayerFacilities?: boolean;
  mosqueAccess?: string;
  templeEtiquette?: string[];
  modestDressRequired?: boolean;
  photographyRestrictions?: string[];
}

// =============== POLICY TYPES ===============
export type ICancellationPolicy = {
  refundable: boolean;
  rules: {
    daysBefore: number;
    refundPercent: number; // 0-100
  }[];
};

export type IRefundPolicy = {
  method: PaymentMethod[];
  processingDays: number;
};

// =============== LOGISTICS TYPES ===============
export interface IPackingListItem {
  item: string;
  required: boolean;
  notes?: string;
}

export type IAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  district?: string;
  region?: string;
  postalCode?: string;
};

export type IGeoPoint = {
  lat: number;
  lng: number;
};

export type IOperatingWindow = {
  startDate: Date;
  endDate: Date;
  seatsTotal?: number;
  seatsBooked?: number;
};

export type IDeparture = {
  date: Date;
  seatsTotal: number;
  seatsBooked: number;
  meetingPoint?: string;
  meetingCoordinates?: IGeoPoint;
};

// =============== INCLUSION/EXCLUSION TYPES ===============
export type IInclusion = {
  label: string;
  description?: string;
};

export type IExclusion = {
  label: string;
  description?: string;
};

// =============== TRANSLATION TYPES ===============
export type IAddressTranslationBlock = {
  bn?: {
    title?: string;
    summary?: string;
    description?: string;
  };
  en?: {
    title?: string;
    summary?: string;
    description?: string;
  };
};

// =============== DESTINATION TYPES ===============
export interface IAttraction {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  bestFor?: string;
  insiderTip?: string;
  address?: string;
  openingHours?: string;
  images?: Types.ObjectId[];
  coordinates?: IGeoPoint;
}

interface IActivity {
  title: string;
  url?: string;
  provider?: string;
  duration?: string;
  price?: IPrice;
  rating?: number;
}

export interface IDestinationBlock {
  _id?: Types.ObjectId;
  description?: string;
  highlights?: string[];
  attractions?: IAttraction[];
  activities?: IActivity[];
  images?: Types.ObjectId[];
  coordinates?: IGeoPoint;
}

// =============== MAIN TOUR INTERFACE ===============
export interface ITour extends Document {
  // =============== IDENTITY & BASIC INFO ===============
  companyId: Types.ObjectId; // Tour operator/guide
  title: string;
  slug: string;
  status: TourStatus;
  summary: string;
  heroImage?: Types.ObjectId;
  gallery?: Types.ObjectId[];
  seo?: { metaTitle?: string; metaDescription?: string };

  // =============== BANGLADESH-SPECIFIC FIELDS ===============
  tourType: TravelType;
  division: Division;
  district: District;
  accommodationType?: AccommodationType[];
  guideIncluded: boolean;
  transportIncluded: boolean;

  // Local emergency contacts
  emergencyContacts?: {
    policeNumber?: string;
    ambulanceNumber?: string;
    fireServiceNumber?: string;
  };
  localEmergency?: string;

  // =============== CONTENT & ITINERARY ===============
  destinations?: IDestinationBlock[];
  itinerary?: {
    day: number;
    title?: string;
    description?: string;
    mealsProvided?: MealsProvided[];
    accommodation?: string;
    activities?: string[];
    travelDistance?: string;
    travelMode?: TransportMode;
    estimatedTime?: string;
    importantNotes?: string[];
  }[];
  inclusions?: IInclusion[];
  exclusions?: IExclusion[];
  difficulty: DifficultyLevel;
  bestSeason: Season[];
  audience?: AudienceType[];
  categories?: TourCategories[];
  translations?: IAddressTranslationBlock;

  // =============== LOGISTICS ===============
  mainLocation?: { address?: IAddress; coordinates?: IGeoPoint };
  transportModes?: TransportMode[];
  pickupOptions?: { city?: string; price?: number; currency?: Currency }[];
  meetingPoint?: string;
  packingList?: IPackingListItem[]

  // =============== PRICING & COMMERCE ===============
  basePrice: IPrice;
  discounts?: IDiscount[];
  duration?: { days: number; nights?: number };
  operatingWindows?: IOperatingWindow[];
  departures?: IDeparture[];
  paymentMethods: PaymentMethod[];

  // =============== COMPLIANCE & ACCESSIBILITY ===============
  licenseRequired?: boolean;
  ageSuitability: AgeSuitability;
  accessibility?: {
    wheelchair?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
    notes?: string;
  };

  // =============== POLICIES ===============
  cancellationPolicy?: ICancellationPolicy;
  refundPolicy?: IRefundPolicy;
  terms?: string;

  // =============== ENGAGEMENT & RATINGS ===============
  ratings?: { average: number; count: number };
  wishlistCount: number;
  featured: boolean;

  // =============== MODERATION ===============
  moderationStatus: ModerationStatus;
  rejectionReason?: string;
  completedAt?: Date;
  reApprovalRequestedAt?: Date;

  // =============== SYSTEM FIELDS ===============
  authorId: Types.ObjectId;
  tags?: string[];
  publishedAt?: Date;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// =============== HELPER OPTIONS ===============
export interface SoftDeleteOptions {
  session?: ClientSession;
  deletedBy?: Types.ObjectId;
}

export interface RestoreOptions {
  session?: ClientSession;
  restoredBy?: Types.ObjectId;
}

export interface RejectOptions {
  session?: ClientSession;
  rejectedBy: Types.ObjectId;
  reason?: string;
}

export interface ApproveOptions {
  session?: ClientSession;
  approvedBy: Types.ObjectId;
}

// =============== TOUR MODEL WITH METHODS ===============
export interface ITourModel extends Model<ITour> {
  // Soft delete helpers
  softDeleteById(
    id: string | Types.ObjectId,
    options?: SoftDeleteOptions
  ): Promise<ITour | null>;
  softDeleteMany(
    filter: FilterQuery<ITour>,
    options?: SoftDeleteOptions
  ): Promise<{ deletedCount: number }>;

  // Restore helpers
  restoreById(
    id: string | Types.ObjectId,
    options?: RestoreOptions
  ): Promise<ITour | null>;
  restoreMany(
    filter: FilterQuery<ITour>,
    options?: RestoreOptions
  ): Promise<{ restoredCount: number }>;

  // Moderation helpers
  rejectById(
    id: string | Types.ObjectId,
    options: RejectOptions
  ): Promise<ITour | null>;
  approveById(
    id: string | Types.ObjectId,
    options: ApproveOptions
  ): Promise<ITour | null>;
  requestReapproval(
    id: string | Types.ObjectId,
    requestedBy: Types.ObjectId,
    session?: ClientSession
  ): Promise<ITour | null>;

  // Query helpers
  findActive(session?: ClientSession): Promise<ITour[]>;
  findDeleted(session?: ClientSession): Promise<ITour[]>;
  findPendingApproval(session?: ClientSession): Promise<ITour[]>;
  findRejected(session?: ClientSession): Promise<ITour[]>;
  findApproved(session?: ClientSession): Promise<ITour[]>;
  findOneWithDeleted(
    query: FilterQuery<ITour>,
    session?: ClientSession
  ): Query<HydratedEmployeeDocument | null, ITour>;

  // Status update helpers
  publishById(
    id: string | Types.ObjectId,
    publishedBy: Types.ObjectId,
    session?: ClientSession
  ): Promise<ITour | null>;
  archiveById(
    id: string | Types.ObjectId,
    archivedBy: Types.ObjectId,
    session?: ClientSession
  ): Promise<ITour | null>;

  // Feature helpers
  setFeatured(
    id: string | Types.ObjectId,
    featured: boolean,
    featuredBy: Types.ObjectId,
    session?: ClientSession
  ): Promise<ITour | null>;

  // Departure helpers
  addDeparture(
    id: string | Types.ObjectId,
    departure: Omit<IDeparture, "seatsBooked"> & { seatsBooked?: number },
    session?: ClientSession
  ): Promise<ITour | null>;
  updateDepartureSeats(
    id: string | Types.ObjectId,
    departureId: string | Types.ObjectId,
    seatsBooked: number,
    session?: ClientSession
  ): Promise<ITour | null>;
}

// =============== TOUR SCHEMA ===============
const TourSchema = new Schema<ITour>(
  {
    // =============== IDENTITY & BASIC INFO ===============
    companyId: { type: Schema.Types.ObjectId, required: true, ref: "Guide", index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: Object.values(TOUR_STATUS), default: TOUR_STATUS.DRAFT },
    summary: { type: String, required: true, trim: true },
    heroImage: { type: Schema.Types.ObjectId, ref: "Asset" },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
    },

    // =============== BANGLADESH-SPECIFIC FIELDS ===============
    tourType: { type: String, enum: Object.values(TRAVEL_TYPE), required: true },
    division: { type: String, enum: Object.values(DIVISION), required: true },
    district: { type: String, enum: Object.values(DISTRICT), required: true },
    accommodationType: [{ type: String, enum: Object.values(ACCOMMODATION_TYPE) }],
    guideIncluded: { type: Boolean, default: true, required: true },
    transportIncluded: { type: Boolean, default: true, required: true },
    emergencyContacts: {
      policeNumber: { type: String, trim: true, default: "999" },
      ambulanceNumber: { type: String, trim: true, default: "16263 " },
      fireServiceNumber: { type: String, trim: true, default: "102" },
      localEmergency: { type: String, trim: true },
    },

    // =============== DESTINATIONS ===============
    destinations: [
      new Schema<IDestinationBlock>(
        {
          description: { type: String, trim: true },
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
              { _id: true }
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
                  currency: { type: String, enum: Object.values(CURRENCY), default: CURRENCY.BDT },
                },
                rating: { type: Number, min: 0, max: 5 },
              },
              { _id: false }
            ),
          ],
          images: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
          coordinates: { lat: Number, lng: Number },
        },
        { _id: true }
      ),
    ],

    // =============== ITINERARY ===============
    itinerary: [
      {
        day: { type: Number, required: true, min: 1 },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        mealsProvided: [{ type: String, enum: Object.values(MEALS_PROVIDED) }],
        accommodation: { type: String, trim: true },
        activities: [{ type: String, trim: true }],
        travelDistance: { type: String, trim: true },
        travelMode: { type: String, enum: Object.values(TRANSPORT_MODE) },
        estimatedTime: { type: String, trim: true },
        importantNotes: [{ type: String, trim: true }],
      },
    ],

    // =============== INCLUSIONS/EXCLUSIONS ===============
    inclusions: [{ label: { type: String, trim: true }, description: { type: String, trim: true } }],
    exclusions: [{ label: { type: String, trim: true }, description: { type: String, trim: true } }],

    // =============== CATEGORIZATION ===============
    difficulty: { type: String, enum: Object.values(DIFFICULTY_LEVEL), required: true },
    bestSeason: [{ type: String, enum: Object.values(SEASON), required: true }],
    audience: [{ type: String, enum: Object.values(AUDIENCE_TYPE) }],
    categories: [{ type: String, enum: Object.values(TOUR_CATEGORIES) }],

    // =============== TRANSLATIONS ===============
    translations: {
      bn: {
        title: { type: String, trim: true },
        summary: { type: String, trim: true },
        description: { type: String, trim: true },
      },
      en: {
        title: { type: String, trim: true },
        summary: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    },

    // =============== LOCATION ===============
    mainLocation: {
      address: {
        line1: { type: String, trim: true },
        line2: { type: String, trim: true },
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        region: { type: String, trim: true },
        postalCode: { type: String, trim: true },
      },
      coordinates: { lat: Number, lng: Number },
    },

    // =============== TRANSPORT ===============
    transportModes: [{ type: String, enum: Object.values(TRANSPORT_MODE) }],
    pickupOptions: [
      {
        city: { type: String, trim: true },
        price: { type: Number, min: 0 },
        currency: { type: String, enum: Object.values(CURRENCY) },
      },
    ],
    meetingPoint: { type: String, trim: true },
    packingList: [
      {
        item: { type: String, required: true, trim: true },
        required: { type: Boolean, default: true },
        notes: { type: String, trim: true },
      },
    ],

    // =============== PRICING ===============
    basePrice: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, enum: Object.values(CURRENCY) },
    },
    discounts: [
      {
        type: { type: String, enum: Object.values(TOUR_DISCOUNT) },
        value: { type: Number, min: 0, max: 100 },
        code: { type: String, trim: true },
        validFrom: { type: Date },
        validUntil: { type: Date },
      },
    ],

    // =============== SCHEDULE ===============
    duration: { days: { type: Number, min: 0 }, nights: { type: Number, min: 0 } },
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

    // =============== PAYMENT METHODS ===============
    paymentMethods: [{ type: String, enum: Object.values(PAYMENT_METHOD), required: true }],

    // =============== COMPLIANCE ===============
    licenseRequired: { type: Boolean, default: false },
    ageSuitability: { type: String, enum: Object.values(AGE_SUITABILITY), required: true },
    accessibility: {
      wheelchair: { type: Boolean, default: false },
      familyFriendly: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      notes: { type: String, trim: true },
    },

    // =============== POLICIES ===============
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
      method: [{ type: String, enum: Object.values(PAYMENT_METHOD), required: true }],
      processingDays: { type: Number, min: 0 },
    },
    terms: { type: String },

    // =============== ENGAGEMENT ===============
    ratings: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, min: 0, default: 0 },
    },
    wishlistCount: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },

    // =============== MODERATION ===============
    moderationStatus: { type: String, enum: Object.values(MODERATION_STATUS), default: MODERATION_STATUS.PENDING },
    rejectionReason: { type: String, trim: true },
    completedAt: { type: Date },
    reApprovalRequestedAt: { type: Date },

    // =============== SYSTEM ===============
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tags: [{ type: String, trim: true, index: true }],
    publishedAt: { type: Date, index: true },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    deletedAt: { type: Date, index: true },
  },
  { timestamps: true }
);

// Soft delete many
TourSchema.statics.softDeleteMany = async function (
  filter: FilterQuery<ITour>,
  options?: SoftDeleteOptions
): Promise<{ deletedCount: number }> {
  const update: UpdateQuery<ITour> = {
    $set: {
      deletedAt: new Date(),
      status: TOUR_STATUS.ARCHIVED as TourStatus,
      moderationStatus: undefined
    },
  };

  const result = await this.updateMany(
    { ...filter, deletedAt: null },
    update,
    { session: options?.session }
  );

  return { deletedCount: result.modifiedCount };
};

// Restore by ID
TourSchema.statics.restoreById = async function (
  id: string | Types.ObjectId,
  options?: RestoreOptions
): Promise<ITour | null> {
  const tour = await this.findById(id).session(options?.session ?? null);

  if (!tour) {
    throw new Error("Tour not found");
  }

  if (!tour.deletedAt) {
    throw new Error("Tour is not deleted");
  }

  tour.deletedAt = undefined;
  tour.status = TOUR_STATUS.DRAFT as TourStatus;

  return tour.save({ session: options?.session });
};

// Restore many
TourSchema.statics.restoreMany = async function (
  filter: FilterQuery<ITour>,
  options?: RestoreOptions
): Promise<{ restoredCount: number }> {
  const update: UpdateQuery<ITour> = {
    $unset: { deletedAt: "" },
    $set: {
      status: TOUR_STATUS.DRAFT as TourStatus,
    },
  };

  const result = await this.updateMany(
    { ...filter, deletedAt: { $ne: null } },
    update,
    { session: options?.session }
  );

  return { restoredCount: result.modifiedCount };
};

// Reject by ID
TourSchema.statics.rejectById = async function (
  id: string | Types.ObjectId,
  options: RejectOptions
): Promise<ITour | null> {
  const tour = await this.findById(id).session(options.session ?? null);

  if (!tour) {
    throw new Error("Tour not found");
  }

  tour.moderationStatus = MODERATION_STATUS.DENIED;
  tour.status = TOUR_STATUS.TERMINATED;
  tour.rejectionReason = options.reason;
  tour.updatedAt = new Date();

  return tour.save({ session: options.session });
};

// Approve by ID
TourSchema.statics.approveById = async function (
  id: string | Types.ObjectId,
  options: ApproveOptions
): Promise<ITour | null> {
  const tour = await this.findById(id).session(options.session ?? null);

  if (!tour) {
    throw new Error("Tour not found");
  }

  tour.moderationStatus = MODERATION_STATUS.APPROVED;
  tour.status = TOUR_STATUS.ACTIVE;
  tour.rejectionReason = undefined;
  tour.updatedAt = new Date();

  return tour.save({ session: options.session });
};

// Request re-approval
TourSchema.statics.requestReapproval = async function (
  id: string | Types.ObjectId,
  requestedBy: Types.ObjectId,
  session?: ClientSession
): Promise<ITour | null> {
  const tour = await this.findById(id).session(session ?? null);

  if (!tour) {
    throw new Error("Tour not found");
  }

  tour.moderationStatus = MODERATION_STATUS.PENDING;
  tour.status = TOUR_STATUS.SUBMITTED;
  tour.reApprovalRequestedAt = new Date();
  tour.rejectionReason = undefined;

  return tour.save({ session });
};

// Find active tours (not deleted and status = ACTIVE)
TourSchema.statics.findActive = function (
  session?: ClientSession
): Promise<ITour[]> {
  return this.find({
    deletedAt: null,
    status: TOUR_STATUS.ACTIVE, // Only active tours
  })
    .session(session ?? null)
    .sort({ createdAt: -1 });
};

// Find deleted tours
TourSchema.statics.findDeleted = function (
  session?: ClientSession
): Promise<ITour[]> {
  return this.find({ deletedAt: { $ne: null } })
    .session(session ?? null)
    .sort({ deletedAt: -1 });
};

// Find pending approval
TourSchema.statics.findPendingApproval = function (
  session?: ClientSession
): Promise<ITour[]> {
  return this.find({
    moderationStatus: MODERATION_STATUS.PENDING,
    deletedAt: null,
  })
    .session(session ?? null)
    .sort({ createdAt: -1 });
};

// Find rejected tours
TourSchema.statics.findRejected = function (
  session?: ClientSession
): Promise<ITour[]> {
  return this.find({
    moderationStatus: MODERATION_STATUS.DENIED,
    deletedAt: null,
  })
    .session(session ?? null)
    .sort({ updatedAt: -1 });
};

// Find approved tours
TourSchema.statics.findApproved = async function (session?: ClientSession): Promise<ITour[]> {
  return this.find({
    moderationStatus: MODERATION_STATUS.APPROVED,
    deletedAt: null
  })
    .session(session ?? null)
    .sort({ createdAt: -1 });
};

TourSchema.statics.findOneWithDeleted = function (
  query: FilterQuery<ITour>,
  session?: ClientSession
) {
  return this.findOne({ ...query, deletedAt: { $exists: true } }).session(session ?? null);
};

// =============== SCHEMA HOOKS ===============

// Pre-save hook to ensure unique slug
TourSchema.pre("save", async function (
  this: HydratedDocument<ITour>
) {
  if (!this.isModified("title")) return;

  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug;
  let counter = 1;

  const TourModel = this.constructor as ITourModel;

  while (
    await TourModel.exists({
      slug,
      _id: { $ne: this._id },
    })
  ) {
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
});

// Pre-find hook to exclude deleted documents by default
TourSchema.pre(/^find/, function (
  this: Query<ITour[], ITour>
) {
  const filter: FilterQuery<ITour> = this.getFilter();

  if (filter.deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
});

// =============== INDEXES ===============

TourSchema.index({ status: 1, publishedAt: -1 });
TourSchema.index({ moderationStatus: 1 });
TourSchema.index({ "destinations.city": 1 });
TourSchema.index({ categories: 1 });
TourSchema.index({ audience: 1 });
TourSchema.index({ featured: 1 });

// Additional indexes for performance
TourSchema.index({ deletedAt: 1, status: 1 });
TourSchema.index({ companyId: 1, status: 1 });
TourSchema.index({ authorId: 1, moderationStatus: 1 });
TourSchema.index({ "departures.date": 1 });
TourSchema.index({ "basePrice.amount": 1 });
TourSchema.index({ division: 1, district: 1 }); // For location-based searches
TourSchema.index({ tourType: 1, difficulty: 1 }); // For tour filtering

const TourModel = defineModel<ITour, ITourModel>("Tour", TourSchema);
export default TourModel;