// tour.types.ts

// UI DTOs aligned with the updated tour model

import {
    PaymentMethod,
    TourDiscount,
    TourStatus,
    TravelType,
    DifficultyLevel,
    AudienceType,
    TourCategories,
    Season,
    Currency,
    AgeSuitability,
    ModerationStatus,
    TranslationContent,
    MealsProvided,
} from "@/constants/tour.const";

/* ----------------------------- Sub Types ----------------------------- */

export interface TourPriceOptionDTO {
    /** optional label for the option (e.g., "Per person", "Private group") */
    name?: string;
    amount: number;
    currency: string;
}

export interface TourDiscountDTO {
    /** discount type (seasonal, early_bird, group, promo) */
    type?: TourDiscount | string;
    /** percentage or numeric value depending on backend usage (0-100) */
    value: number;
    code?: string;
    validFrom?: string;
    validUntil?: string;
    description?: string;
}

export interface GeoPointDTO {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
}

export interface MeetingPointDTO {
    title: string;
    description?: string;
    location?: {
        address?: string;
        coordinates?: GeoPointDTO;
    };
    time?: string;
}

export interface RoadMapPointDTO {
    title: string;
    description?: string;
    imageUrl?: string;
    location?: {
        address?: string;
        coordinates?: GeoPointDTO;
    };
}

export interface IncludeItemDTO {
    label: string;
    included?: boolean;
    description?: string;
}

export interface ItineraryEntryDTO {
    day: number; // starts at 1
    title?: string;
    description?: string;
    mealsProvided?: MealsProvided[];
    accommodation?: string;
    activities?: string[];
    imageUrls?: string[];
}

/* ----------------------------- FAQ DTOs ----------------------------- */

export interface FAQEntryDTO {
    id: string;
    question: string;
    answer?: string;
    isAnswered: boolean;
    order: number;
}

export interface TourFAQDetailDTO extends FAQEntryDTO {
    tourId: string;
    askedBy: string;
    answeredBy?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SeasonalHighlightDTO {
    season?: string;
    description?: string;
    imageUrl?: string;
}

export interface TourHostDTO {
    name?: string;
    bio?: string;
    avatarUrl?: string;
    languagesSpoken?: string[];
    rating?: number; // 0–5
}

export interface HealthAndSafetyNoteDTO {
    title: string;
    description: string;
}

export interface PackingListItemDTO {
    item: string;
    required: boolean;
    notes?: string;
}

/* Cancellation policy now mirrors model's ICancellationPolicy */
export interface CancellationPolicyDTO {
    refundable?: boolean;
    rules?: Array<{
        daysBefore?: number;
        refundPercent?: number; // 0–100
        notes?: string;
    }>;
    freeCancellationUntil?: string;
    notes?: string;
}

/* Age suitability replaced with model's ageSuitability enum */
export interface AgeRestrictionDTO {
    /** use AGE_SUITABILITY values (e.g., "all", "kids", "adults", "seniors") */
    ageSuitability?: AgeSuitability | string;
    minAge?: number;
    maxAge?: number;
}

/* Emergency/local contact */
export interface EmergencyContactDTO {
    phone?: string;
    email?: string;
}

/* ----------------------------- Main DTOs ----------------------------- */

/**
 * Rich tour detail payload designed for direct UI consumption.
 * Fields marked optional reflect optional/nullable model fields.
 */
export interface TourDetailDTO {
    // Identity & system
    id: string;
    title: string;
    slug: string;
    status: TourStatus;
    owner?: string; // company/guide id or name
    companyId?: string;
    authorId?: string;

    // Marketing & content
    highlights?: string[];
    description?: string;
    summary?: string;

    // Inclusions & info
    includes?: IncludeItemDTO[];
    exclusions?: IncludeItemDTO[];
    importantInfo?: string[];

    // Logistics & categorization
    meetingPoints?: MeetingPointDTO[];
    meetingPoint?: string; // legacy single meeting point
    activities?: string[];
    tags?: string[];
    travelTypes?: TravelType[];
    difficulty?: DifficultyLevel;
    category?: string;
    subCategory?: string;
    audience?: AudienceType[]; // from model
    categories?: TourCategories[]; // content categories
    bestSeason?: Season[];
    transportModes?: string[]; // TransportMode values
    pickupOptions?: { city?: string; price?: number; currency?: Currency }[];

    mainLocation?: {
        address?: {
            line1?: string;
            line2?: string;
            city?: string;
            district?: string;
            region?: string;
            country?: string;
            postalCode?: string;
        };
        coordinates?: GeoPointDTO;
    };

    // Pricing & discounts
    /** basePrice mirrors model.basePrice */
    basePrice?: {
        amount: number;
        currency: Currency | string;
    };
    /** legacy priceOptions kept for UI scenarios where multiple options exist */
    priceOptions?: TourPriceOptionDTO[];
    discounts?: TourDiscountDTO[];
    priceSummary?: {
        minAmount: number;
        maxAmount: number;
        currency: string;
    };

    // Schedule & capacity
    startDate?: string;
    endDate?: string;
    bookingDeadline?: string;
    durationDays?: number;
    duration?: { days?: number; nights?: number };
    maxGroupSize?: number;
    repeatCount?: number;

    // Departures & operating windows (model additions)
    operatingWindows?: Array<{
        startDate: string;
        endDate: string;
        seatsTotal?: number;
        seatsBooked?: number;
    }>;
    departures?: Array<{
        id?: string;
        date: string;
        seatsTotal: number;
        seatsBooked?: number;
        meetingPoint?: string;
        meetingCoordinates?: { lat: number; lng: number } | GeoPointDTO;
    }>;

    // Booking summary (UI-friendly)
    booking?: {
        userIds?: string[];
        count?: number;
        isFull?: boolean;
        remaining?: number;
    };

    cancellationPolicy?: CancellationPolicyDTO;
    refundPolicy?: {
        method?: PaymentMethod[];
        processingDays?: number;
    };
    ageRestriction?: AgeRestrictionDTO;
    ageSuitability?: AgeSuitability | string;

    // Relations & moderation
    reviewCount?: number;
    reportCount?: number;
    averageRating?: number;
    ratings?: { average: number; count: number };
    moderationStatus?: ModerationStatus | string;
    rejectionReason?: string;
    completedAt?: string;
    reApprovalRequestedAt?: string;
    deletedAt?: string;

    // Media
    heroImageUrl?: string;
    heroImage?: string; // id
    galleryImageUrls?: string[];
    gallery?: string[]; // ids
    videoUrls?: string[];
    videos?: string[]; // ids
    virtualTourUrl?: string;

    // Structure & extras
    roadMap?: RoadMapPointDTO[];
    itinerary?: ItineraryEntryDTO[];
    packingList?: PackingListItemDTO[];
    faqs?: FAQEntryDTO[];

    // People & policy
    host?: TourHostDTO;
    healthAndSafety?: HealthAndSafetyNoteDTO[];
    accessibilityFeatures?: string[];
    accessibility?: {
        wheelchair?: boolean;
        familyFriendly?: boolean;
        petFriendly?: boolean;
        notes?: string;
    };
    accessibilityRating?: number;
    emergencyContact?: EmergencyContactDTO;

    // Tips & seasonal
    weatherTips?: string[];
    seasonalHighlights?: SeasonalHighlightDTO[];

    // Engagement & content fields
    wishlistCount?: number;
    popularityScore?: number;
    featured?: boolean;
    trendingUntil?: string;
    viewCount?: number;
    likeCount?: number;
    shareCount?: number;
    terms?: string;
    translations?: {
        language: string;
        title?: string;
        summary?: string;
        content?: {
            type: TranslationContent | string;
            text?: string;
            href?: string;
        }[];
    }[];

    // SEO
    seoTitle?: string;
    seoDescription?: string;

    // System
    createdAt?: string;
    updatedAt?: string;
    serverNow?: string;

    // Optional editorial metrics
    readingTime?: number;
    wordCount?: number;
    allowComments?: boolean;
}

/**
 * Lightweight table row for Tours section (aligned with model additions)
 */
export interface TourListItemDTO {
    id: string;
    title: string;
    slug: string;
    status: TourStatus;

    // Schedule
    startDate?: string;
    endDate?: string;
    durationDays?: number;

    // Quality & demand
    averageRating?: number;
    reviewCount?: number;
    reportCount?: number;
    faqCount?: number;
    bookingCount?: number;
    maxGroupSize?: number;
    isFull?: boolean;

    // Categorization
    tags?: string[];
    travelTypes?: TravelType[];
    category?: string;
    subCategory?: string;
    categories?: TourCategories[];
    audience?: AudienceType[];

    // Pricing summary
    priceSummary?: {
        minAmount: number;
        maxAmount: number;
        currency: string;
    };

    // Discount helper
    activeDiscountPercentage?: number;

    // Media
    heroImageId?: string;
    isFeatured?: boolean;

    // Engagement
    wishlistCount?: number;
    popularityScore?: number;
    featured?: boolean;
    trendingUntil?: string;
    viewCount?: number;
    likeCount?: number;
    shareCount?: number;

    // Visibility & ops
    visibility?: "public" | "private" | "archived";
    lastBookingDate?: string;
    bookingTrend?: "increasing" | "stable" | "decreasing";

    // Row timestamps
    createdAt?: string;
    updatedAt?: string;

    // Moderation & soft-delete
    moderationStatus?: ModerationStatus | string;
    deletedAt?: string;
    authorId?: string;
    companyId?: string;
}

/**
 * Optional table column hints for builder UIs.
 */
export type TourTableColumns =
    | "title"
    | "status"
    | "startDate"
    | "endDate"
    | "durationDays"
    | "averageRating"
    | "bookingCount"
    | "reviewCount"
    | "reportCount"
    | "maxGroupSize"
    | "isFull"
    | "priceSummary"
    | "activeDiscountPercentage"
    | "tags"
    | "category"
    | "visibility"
    | "isFeatured";

// --- Allowed sortable keys for TourListItemDTO ---
export type SortableTourKeys =
    | "title"
    | "status"
    | "startDate"
    | "endDate"
    | "durationDays"
    | "averageRating"
    | "bookingCount"
    | "maxGroupSize"
    | "createdAt"
    | "updatedAt";
