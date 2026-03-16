// types/traveler.types.ts

import { ReportPriority, ReportStatus } from "@/constants/report.const";
import { BookingPaymentStatus, BookingStatus } from "@/constants/tour-booking.const";
import { ModerationStatus } from "@/constants/tour.const";
import { AccountStatus } from "@/constants/user.const";

// ----------------------------------------------------------------------
// Reusable types based on traveler.model.ts
// ----------------------------------------------------------------------

export interface TravelerAddress {
    house?: string;
    road?: string;
    area?: string;
    village?: string;
    ward?: string;
    union?: string;
    upazila?: string;
    district: string;
    division: string;
    postOffice?: string;
    postalCode?: string; // 4-digit string
    country: string; // default 'Bangladesh', immutable
}

export interface TravelerSuspension {
    reason: string;
    suspendedBy: string; // User ID
    until: string; // ISO date
    createdAt: string; // ISO date
}

export interface TravelerGeoPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

// ----------------------------------------------------------------------
// Traveler list statistics (global counts, independent of filters)
// ----------------------------------------------------------------------
export interface TravelerListStats {
  totalTravelers: number;      // total number of travelers in the system
  activeCount: number;         // accountStatus = 'active'
  suspendedCount: number;      // accountStatus = 'suspended' (or has suspension)
  lockedCount: number;         // lockUntil exists and is in the future
  verifiedCount: number;       // isVerified = true
  unverifiedCount: number;     // isVerified = false
  deletedCount?: number;       // if soft-deleted travelers are included
}

// ----------------------------------------------------------------------
// Traveler list item (for tables)
// ----------------------------------------------------------------------
export interface TravelerListItem {
    _id: string;
    userId: string; // from User
    name: string;   // from Traveler
    email: string;  // from User
    role: string;
    accountStatus: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    // optionally include avatarUrl, phone, etc.
    avatarUrl?: string;
    phone?: string;
}

// ----------------------------------------------------------------------
// Traveler list response (paginated data + global stats)
// ----------------------------------------------------------------------
export interface TravelerListResponse extends PaginatedResponse<TravelerListItem> {
  stats: TravelerListStats;
}

// ----------------------------------------------------------------------
// Full traveler detail (merges User + Traveler)
// ----------------------------------------------------------------------
export interface TravelerDetail {
    // User fields
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;

    // Traveler fields
    avatarUrl?: string;
    phone?: string;
    address?: TravelerAddress; // you can refine this based on AddressSchema
    dateOfBirth?: string;
    location?: TravelerGeoPoint;
    isVerified: boolean;
    accountStatus: string;
    loginAttempts: number;
    lastLogin?: string;
    lockUntil?: string;
    suspension?: TravelerSuspension;
    deletedAt?: string;
    // virtuals
    isLocked?: boolean;
    isSuspended?: boolean;
    isActive?: boolean;
}

// ----------------------------------------------------------------------
// Filter parameters for traveler list
// ----------------------------------------------------------------------
export interface TravelerFilter {
    page?: number;
    limit?: number;
    search?: string;          // name, email
    accountStatus?: AccountStatus[];
    isVerified?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// ----------------------------------------------------------------------
// Generic paginated response
// ----------------------------------------------------------------------
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ----------------------------------------------------------------------
// Tab data types (based on your models)
// ----------------------------------------------------------------------

// Booking (from IBooking, plus maybe populated tour info)
export interface TravelerBooking {
    _id: string;
    bookingReference: string;
    tour: {
        _id: string;
        title: string;
        uniqueTourCode: string;
    };
    totalParticipants: number;
    totalPaid: number;
    status: BookingStatus; // BookingStatus
    paymentStatus: BookingPaymentStatus;
    bookedAt: string;
    cancellation?: {
        cancelledAt?: string;
        reason?: string;
        refundAmount?: number;
    };
}

// Review (from IReview)
export interface TravelerReview {
    _id: string;
    tour: {
        _id: string;
        title: string;
    };
    rating: number;
    title?: string;
    comment: string;
    createdAt: string;
    isApproved: boolean;
    helpfulCount: number;
}

// Report (from IReport)
export interface TravelerReport {
    _id: string;
    tour: {
        _id: string;
        title: string;
    };
    reason: string;
    message: string;
    status: ReportStatus;
    priority: ReportPriority;
    createdAt: string;
    resolvedAt?: string;
}

// FAQ (from ITourFAQ)
export interface TravelerFAQ {
    _id: string;
    tour: {
        _id: string;
        title: string;
    };
    question: string;
    answer?: string;
    status: ModerationStatus;
    createdAt: string;
    answeredAt?: string;
    likeCount: number;
    dislikeCount: number;
}

// Like/Interaction (from IUserTourInteraction likedTours)
export interface TravelerLikedTour {
    tour: {
        _id: string;
        title: string;
        uniqueTourCode: string;
    };
    likedAt: string;
}

// Share
export interface TravelerSharedTour {
    tour: {
        _id: string;
        title: string;
        uniqueTourCode: string;
    };
    sharedAt: string;
    platform?: string;
}

// Viewed Tour
export interface TravelerViewedTour {
    tour: {
        _id: string;
        title: string;
        uniqueTourCode: string;
    };
    viewedAt: string;
    durationSeconds?: number;
}

// Viewed Article
export interface TravelerViewedArticle {
    article: {
        _id: string;
        title: string;
        slug: string;
    };
    viewedAt: string;
    durationSeconds?: number;
}

// Cancellation (derived from Booking with status 'cancelled')
export type TravelerCancellation = TravelerBooking; // same shape, but status='cancelled'

// ----------------------------------------------------------------------
// Traveler tab names
// ----------------------------------------------------------------------

export type TravelerTabName =
    | 'bookings'
    | 'reviews'
    | 'reports'
    | 'faqs'
    | 'likedTours'
    | 'sharedTours'
    | 'viewedTours'
    | 'viewedArticles'
    | 'cancellations';

export type TravelerTabMap = {
    bookings: TravelerBooking;
    reviews: TravelerReview;
    reports: TravelerReport;
    faqs: TravelerFAQ;
    likedTours: TravelerLikedTour;
    sharedTours: TravelerSharedTour;
    viewedTours: TravelerViewedTour;
    viewedArticles: TravelerViewedArticle;
    cancellations: TravelerCancellation;
};

// ----------------------------------------------------------------------
// Helper type for cache entries
// ----------------------------------------------------------------------
export interface CacheEntry<T> {
    data: T;
    timestamp: number; // Date.now()
}

// TTL in milliseconds (e.g., 5 minutes)
export const CACHE_TTL = 5 * 60 * 1000;