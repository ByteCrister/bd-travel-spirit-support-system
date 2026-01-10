// tour.types.ts
import {
    Division,
    District,
    TravelType,
    DifficultyLevel,
    AudienceType,
    TourCategories,
    TourStatus,
    ModerationStatus,
    AgeSuitability,
    PaymentMethod,
    Currency,
    TransportMode,
    Season,
    AccommodationType,
    TourDiscount,
    MealsProvided,
} from "@/constants/tour.const";

/* =============== SUB TYPES (Mirroring Model Structure) =============== */

// =============== PRICE & DISCOUNT TYPES ===============
export interface PriceDTO {
    amount: number;
    currency: Currency;
}

export interface DiscountDTO {
    type: TourDiscount;
    value: number;
    code?: string;
    validFrom?: string;
    validUntil?: string;
}

// =============== DESTINATION & ATTRACTION TYPES ===============
export interface GeoPointDTO {
    lat: number;
    lng: number;
}

export interface AttractionDTO {
    id?: string;
    title: string;
    description?: string;
    bestFor?: string;
    insiderTip?: string;
    address?: string;
    openingHours?: string;
    imageIds?: { id: string; url: string }[];
    coordinates?: GeoPointDTO;
}

export interface ActivityDTO {
    title: string;
    url?: string;
    provider?: string;
    duration?: string;
    price?: PriceDTO;
    rating?: number;
}

export interface DestinationBlockDTO {
    id?: string;
    description?: string;
    highlights?: string[];
    attractions?: AttractionDTO[];
    activities?: ActivityDTO[];
    imageIds?: { id: string; url: string }[];
    coordinates?: GeoPointDTO;
}

// =============== ITINERARY TYPES ===============
export interface ItineraryEntryDTO {
    day: number;
    title?: string;
    description?: string;
    mealsProvided?: MealsProvided[];//
    accommodation?: string;
    activities?: string[];
    travelDistance?: string;
    travelMode?: TransportMode;//
    estimatedTime?: string;
    importantNotes?: string[];
}

// =============== INCLUSION/EXCLUSION TYPES ===============
export interface InclusionDTO {
    label: string;
    description?: string;
}

export interface ExclusionDTO {
    label: string;
    description?: string;
}

// =============== LOGISTICS TYPES ===============
export interface PackingListItemDTO {
    item: string;
    required: boolean;
    notes?: string;
}

export interface AddressDTO {
    line1?: string;
    line2?: string;
    city?: string;
    district?: string;
    region?: string;
    postalCode?: string;
}

// =============== SCHEDULE TYPES ===============
export interface OperatingWindowDTO {
    startDate: string;
    endDate: string;
    seatsTotal?: number;
    seatsBooked?: number;
}

export interface DepartureDTO {
    date: string;
    seatsTotal: number;
    seatsBooked: number;
    meetingPoint?: string;
    meetingCoordinates?: GeoPointDTO;
}

// =============== POLICY TYPES ===============
export interface CancellationRuleDTO {
    daysBefore: number;
    refundPercent: number;
}

export interface CancellationPolicyDTO {
    refundable: boolean;
    rules: CancellationRuleDTO[];
}

export interface RefundPolicyDTO {
    method: PaymentMethod[];
    processingDays: number;
}

// =============== TRANSLATION TYPES ===============
export interface TranslationBlockDTO {
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
}

// =============== ACCESSIBILITY TYPES ===============
export interface AccessibilityDTO {
    wheelchair?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
    notes?: string;
}

// =============== EMERGENCY CONTACTS ===============
export interface EmergencyContactsDTO {
    policeNumber?: string;
    ambulanceNumber?: string;
    fireServiceNumber?: string;
    localEmergency?: string;
}

/* =============== MAIN TOUR DTO =============== */

/**
 * Complete tour detail DTO aligned with the MongoDB model
 * All fields directly map to the ITour interface
 */
export interface TourDetailDTO {
    // =============== IDENTITY & BASIC INFO ===============
    id: string;
    title: string;
    slug: string;
    status: TourStatus;
    summary: string;
    heroImage?: string; // Actual cloudinary asset urls using Asset model ID
    gallery?: string[]; // Actual cloudinary asset urls using Asset model ID
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
    };

    // =============== BANGLADESH-SPECIFIC FIELDS ===============
    tourType: TravelType;
    division: Division;
    district: District;
    accommodationType?: AccommodationType[];
    guideIncluded: boolean;
    transportIncluded: boolean;
    emergencyContacts?: EmergencyContactsDTO;

    // =============== CONTENT & ITINERARY ===============
    destinations?: DestinationBlockDTO[];
    itinerary?: ItineraryEntryDTO[];
    inclusions?: InclusionDTO[];
    exclusions?: ExclusionDTO[];
    difficulty: DifficultyLevel;
    bestSeason: Season[];
    audience?: AudienceType[];
    categories?: TourCategories[];
    translations?: TranslationBlockDTO;

    // =============== LOGISTICS ===============
    mainLocation?: {
        address?: AddressDTO;
        coordinates?: GeoPointDTO;
    };
    transportModes?: TransportMode[];
    pickupOptions?: {
        city?: string;
        price?: number;
        currency?: Currency;
    }[];
    meetingPoint?: string;
    packingList?: PackingListItemDTO[];

    // =============== PRICING & COMMERCE ===============
    basePrice: PriceDTO;
    discounts?: DiscountDTO[];
    duration?: {
        days: number;
        nights?: number;
    };
    operatingWindows?: OperatingWindowDTO[];
    departures?: DepartureDTO[];
    paymentMethods: PaymentMethod[];

    // =============== COMPLIANCE & ACCESSIBILITY ===============
    licenseRequired?: boolean;
    ageSuitability: AgeSuitability;
    accessibility?: AccessibilityDTO;

    // =============== POLICIES ===============
    cancellationPolicy?: CancellationPolicyDTO;
    refundPolicy?: RefundPolicyDTO;
    terms?: string;

    // =============== ENGAGEMENT & RATINGS ===============
    ratings?: {
        average: number;
        count: number;
    };
    wishlistCount: number;
    featured: boolean;

    // =============== MODERATION ===============
    moderationStatus: ModerationStatus;
    rejectionReason?: string;
    completedAt?: string;
    reApprovalRequestedAt?: string;

    // =============== SYSTEM FIELDS ===============
    companyId: string;
    authorId: string;
    tags?: string[];
    publishedAt?: string;
    viewCount: number;
    likeCount: number;
    shareCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;

    // =============== COMPUTED/UI-ONLY FIELDS (Not in model) ===============
    // These are calculated or derived for UI convenience
    priceSummary?: {
        minAmount: number;
        maxAmount: number;
        currency: string;
        discountedAmount?: number;
    };
    bookingSummary?: {
        totalSeats: number;
        bookedSeats: number;
        availableSeats: number;
        isFull: boolean;
        occupancyPercentage: number;
    };
    nextDeparture?: string;
    isUpcoming?: boolean;
    isExpired?: boolean;
    hasActiveDiscount?: boolean;
}

/* =============== LIGHTWEIGHT LIST DTO =============== */

/**
 * Lightweight tour list item for tables and listings
 */
export interface TourListItemDTO {
    id: string;
    title: string;
    slug: string;
    status: TourStatus;
    summary: string;
    heroImage?: string;

    // Basic info
    tourType: TravelType;
    division: Division;
    district: District;
    difficulty: DifficultyLevel;

    // Pricing
    basePrice: PriceDTO;
    hasActiveDiscount?: boolean;
    activeDiscountValue?: number;

    // Schedule
    duration?: {
        days: number;
        nights?: number;
    };
    nextDeparture?: string;

    // Stats
    ratings?: {
        average: number;
        count: number;
    };
    wishlistCount: number;
    viewCount: number;
    likeCount: number;
    shareCount: number;

    // Moderation
    moderationStatus: ModerationStatus;
    featured: boolean;

    // System
    companyId: string;
    authorId: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;

    // Computed fields
    isUpcoming?: boolean;
    isExpired?: boolean;
    occupancyPercentage?: number;
}

/* =============== UTILITY TYPES =============== */

/**
 * Tour filter options for search and listings
 */
export interface TourFilterOptions {
    search?: string;
    division?: Division[];
    district?: District[];
    tourType?: TravelType[];
    difficulty?: DifficultyLevel[];
    status?: TourStatus[];
    moderationStatus?: ModerationStatus[];
}

/**
 * KPI cards for the overview dashboard.
 * Simple, additive metrics—avoid expensive recomputation on each render.
 */
export interface CompanyKpisDTO {
    totalTours: number;
    openReports: number;
    publishedTours: number;
    totalBookings: number; // sum of bookingInfo.users.length across tours
    avgTourRating: number; // average of tour.averageRating (simple mean)
}

/**
 * Tour sort options
 */
export type TourSortOption =
    | "title"
    | "createdAt"
    | "updatedAt"
    | "publishedAt"
    | "basePrice.amount"
    | "ratings.average"
    | "wishlistCount"
    | "viewCount"
    | "nextDeparture";

/**
 * Tour table columns for admin panel
 */
export type TourTableColumn =
    | "select"
    | "title"
    | "status"
    | "moderationStatus"
    | "tourType"
    | "division"
    | "district"
    | "difficulty"
    | "basePrice"
    | "ratings"
    | "wishlistCount"
    | "viewCount"
    | "featured"
    | "publishedAt"
    | "createdAt"
    | "actions";

// --- Allowed sortable keys for TourListItemDTO "Company -> Tours -> Filter bar" ---
export type SortableTourKeys =
    | "title"
    | "status"
    | "startDate"
    | "endDate"
    | "durationDays"
    | "averageRating"
    | "bookingCount"
    | "createdAt"
    | "updatedAt";