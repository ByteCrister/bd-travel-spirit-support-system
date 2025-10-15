////////////////////////////////////////////////////////////////////////////////
// ENUMS: Domain-specific constants
////////////////////////////////////////////////////////////////////////////////

/**
 * Types of travelers this tour is suited for
 */
export enum TRAVEL_TYPE {
  COUPLES = "Couples",
  GROUP_OF_FRIENDS = "Group of friends",
  SOLO = "Solo",
  FAMILIES = "Families",
  BUSINESS = "Business",
  ADVENTURE_SEEKERS = "Adventure Seekers",
  DESTINATION_GUIDE = "destination_guide",
  BEACHES = "beaches",
  FOOD_DRINK = "food_drink",
  CULTURE_HISTORY = "culture_history",
}

/**
 * Publishing status of the tour
 */
export enum TOUR_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// constants/tour.const.ts
export enum AUDIENCE_TYPE {
  COUPLES = "couples",
  FAMILIES = "families",
  SOLO = "solo",
  SENIORS = "seniors",
  GROUPS = "groups",
  BUSINESS = "business",
  ADVENTURE = "adventure",
}

export enum CONTENT_CATEGORY {
  BEACHES = "beaches",
  CULTURE_HISTORY = "culture_history",
  FOOD_DRINK = "food_drink",
  NATURE = "nature",
  WILDLIFE = "wildlife",
  CITY = "city",
  RELIGIOUS = "religious",
  HERITAGE = "heritage",
  CRUISE = "cruise",
}

export enum MODERATION_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum DIFFICULTY_LEVEL {
  EASY = "easy",
  MODERATE = "moderate",
  CHALLENGING = "challenging",
}

export enum SEASON {
  SUMMER = "summer",
  WINTER = "winter",
  MONSOON = "monsoon",
  YEAR_ROUND = "year_round",
}

export enum TRANSPORT_MODE {
  BUS = "bus",
  TRAIN = "train",
  DOMESTIC_FLIGHT = "domestic_flight",
  BOAT = "boat",
  PRIVATE_CAR = "private_car",
  RIDE_SHARE = "ride_share",
}

export enum PAYMENT_METHOD {
  BKASH = "bkash",
  NAGAD = "nagad",
  CARD = "card",
  STRIPE = "stripe",
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
}

export enum CURRENCY {
  BDT = "BDT",
  USD = "USD",
  INR = "INR",
}

export type Price = {
  amount: number; // base price per person/unit
  currency: CURRENCY;
};

export type Discount = {
  type: "seasonal" | "early_bird" | "group" | "promo";
  value: number; // percentage 0-100
  code?: string;
  validFrom?: Date;
  validUntil?: Date;
};

export type CancellationPolicy = {
  refundable: boolean;
  rules: {
    daysBefore: number;
    refundPercent: number; // 0-100
  }[];
};

export type RefundPolicy = {
  method: PAYMENT_METHOD[];
  processingDays: number; // typical processing time
};

export type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  district?: string; // e.g., Sylhet, Chattogram
  region?: string; // e.g., division
  country: string; // "Bangladesh"
  postalCode?: string;
};

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type OperatingWindow = {
  startDate: Date;
  endDate: Date;
  seatsTotal?: number; // capacity across window if not per departure
  seatsBooked?: number;
};

export type Departure = {
  date: Date;
  seatsTotal: number;
  seatsBooked: number;
  meetingPoint?: string;
  meetingCoordinates?: GeoPoint;
};

export type Inclusion = {
  label: string; // e.g., "Breakfast"
  description?: string;
};

export type Exclusion = {
  label: string; // e.g., "Personal expenses"
  description?: string;
};

export type TranslationBlock = {
  language: string; // e.g., "bn", "en"
  title?: string;
  summary?: string;
  content?: {
    type: "paragraph" | "heading" | "link";
    text?: string;
    href?: string;
  }[];
};
