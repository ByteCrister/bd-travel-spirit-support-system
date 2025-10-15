import { TOUR_STATUS, TRAVEL_TYPE } from "@/constants/tour.const";

/* ----------------------------- Sub Types ----------------------------- */

/**
 * Pricing option (normalized from PriceOptionSchema).
 */
export interface TourPriceOptionDTO {
    name: string;
    amount: number;
    currency: string;
}

/**
 * Discount configuration.
 * `isActive` can be computed on the frontend using validFrom/validUntil vs serverNow.
 */
export interface TourDiscountDTO {
    code: string;
    description?: string;
    percentage: number; // 0–100
    validFrom?: string;
    validUntil?: string;
}

/**
 * GeoJSON point ([longitude, latitude]) with fixed type "Point".
 */
export interface GeoPointDTO {
    type: "Point";
    coordinates: [number, number];
}

/**
 * Meetup instructions and location.
 */
export interface MeetingPointDTO {
    title: string;
    description?: string;
    location: {
        address?: string;
        coordinates: GeoPointDTO;
    };
    time: string;
}

/**
 * Route waypoint displayed as part of the tour roadmap.
 */
export interface RoadMapPointDTO {
    title: string;
    description?: string;
    imageId?: string;
    location: {
        address?: string;
        coordinates: GeoPointDTO;
    };
}

/**
 * Inclusion/Exclusion item.
 */
export interface IncludeItemDTO {
    label: string;
    included: boolean;
}

/**
 * Day-by-day itinerary entry.
 */
export interface ItineraryEntryDTO {
    day: number; // starts at 1
    title: string;
    description?: string;
    mealsProvided?: Array<"Breakfast" | "Lunch" | "Dinner">;
    accommodation?: string;
    activities?: string[];
    imageIds?: string[];
}

/* ----------------------------- FAQ DTOs ----------------------------- */

/**
 * Lightweight FAQ entry for embedding in tours.
 */
export interface FAQEntryDTO {
    id: string;
    question: string;
    answer?: string;
    isAnswered: boolean;
    order: number;
}

/**
 * Full FAQ detail (for management/admin views).
 */
export interface TourFAQDetailDTO extends FAQEntryDTO {
    tourId: string;
    askedBy: string;
    answeredBy?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Seasonal highlight used in marketing.
 */
export interface SeasonalHighlightDTO {
    season?: string;
    description?: string;
    imageId?: string;
}

/**
 * Host/guide info card.
 */
export interface TourHostDTO {
    name?: string;
    bio?: string;
    avatarId?: string;
    languagesSpoken?: string[];
    rating?: number; // 0–5
}

/**
 * Health and safety notice.
 */
export interface HealthAndSafetyNoteDTO {
    title: string;
    description: string;
}

/**
 * Packing list item.
 */
export interface PackingListItemDTO {
    item: string;
    required: boolean;
    notes?: string;
}

/**
 * Cancellation policy for bookings.
 */
export interface CancellationPolicyDTO {
    freeCancellationUntil?: string; // ISO date
    refundPercentage?: number; // 0–100
    notes?: string;
}

/**
 * Age restriction for participants.
 */
export interface AgeRestrictionDTO {
    minAge?: number;
    maxAge?: number;
}

/**
 * Emergency/local contact.
 */
export interface EmergencyContactDTO {
    phone?: string;
    email?: string;
}

/* ----------------------------- Main DTOs ----------------------------- */

/**
 * Rich tour detail payload designed for direct UI consumption.
 */
export interface TourDetailDTO {
    // Identity
    id: string;
    title: string;
    slug: string;
    status: TOUR_STATUS;
    owner?: string;

    // Marketing
    highlights: string[];
    description: string;

    // Inclusions & info
    includes: IncludeItemDTO[];
    importantInfo: string[];

    // Logistics & categorization
    meetingPoints: MeetingPointDTO[];
    activities: string[];
    tags: string[];
    travelTypes: TRAVEL_TYPE[];
    difficulty?: "easy" | "moderate" | "challenging"; // aligned with schema
    category?: string;
    subCategory?: string;

    // Pricing & discounts
    priceOptions: TourPriceOptionDTO[];
    discounts: TourDiscountDTO[];
    priceSummary?: {
        minAmount: number;
        maxAmount: number;
        currency: string;
    };

    // Schedule & capacity
    startDate: string;
    endDate: string;
    bookingDeadline?: string;
    durationDays: number;
    maxGroupSize: number;
    repeatCount: number;

    // Booking summary
    booking: {
        userIds: string[];
        count: number;
        isFull: boolean;
        remaining: number;
    };
    cancellationPolicy?: CancellationPolicyDTO;
    ageRestriction?: AgeRestrictionDTO;

    // Relations
    reviewCount: number;
    reportCount: number;
    averageRating: number;

    // Media
    imageIds: string[];
    heroImageId?: string;
    galleryImageIds?: string[];
    videoUrls?: string[];
    virtualTourUrl?: string;

    // Structure & extras
    roadMap: RoadMapPointDTO[];
    itinerary?: ItineraryEntryDTO[];
    packingList?: PackingListItemDTO[];
    faqs?: FAQEntryDTO[];

    // People & policy
    host?: TourHostDTO;
    healthAndSafety?: HealthAndSafetyNoteDTO[];
    accessibilityFeatures?: string[];
    accessibilityRating?: number;
    emergencyContact?: EmergencyContactDTO;

    // Tips & seasonal
    weatherTips?: string[];
    seasonalHighlights?: SeasonalHighlightDTO[];

    // SEO
    seoTitle?: string;
    seoDescription?: string;

    // System
    createdAt: string;
    updatedAt: string;
    serverNow: string;
}

/**
 * Table row for Tours section (lightweight view).
 */
export interface TourListItemDTO {
    id: string;
    title: string;
    slug: string;
    status: TOUR_STATUS;

    // Schedule
    startDate: string;
    endDate: string;
    durationDays: number;

    // Quality & demand
    averageRating: number;
    reviewCount: number;
    reportCount: number;
    bookingCount: number;
    maxGroupSize: number;
    isFull: boolean;

    // Categorization
    tags: string[];
    travelTypes: TRAVEL_TYPE[];
    category?: string;
    subCategory?: string;

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

    // Visibility & ops
    visibility?: "public" | "private" | "archived";
    lastBookingDate?: string;
    bookingTrend?: "increasing" | "stable" | "decreasing";

    // Row timestamps
    createdAt: string;
    updatedAt: string;
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
