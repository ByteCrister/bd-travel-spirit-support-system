// types/tour/tour-history.types.ts

export interface TourHistoryEngagementDTO {
  viewCount: number;
  likeCount: number;
  shareCount: number;
}

export interface TourHistoryReviewSummaryDTO {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface TourHistoryBookingStatsDTO {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number; // 0-100 percent
  seatsTotal: number;
  seatsBooked: number;
}

export interface TourHistoryPricingDTO {
  baseAmount: number;
  currency: string;
  hasActiveDiscounts: boolean;
  discountCount: number;
}

export interface TourHistoryDepartureDTO {
  date: string | null;   // ISO date string
  seatsTotal: number;
  seatsBooked: number;
  meetingPoint: string | null;
}

export interface TourHistoryOperatingWindowDTO {
  startDate: string;   // ISO date string
  endDate: string;     // ISO date string
}

/**
 * A single analytics run for a tour.
 * There can be multiple of these per tour (one per time the tour is reused/run).
 */
export interface TourAnalyticsRunDTO {
  analyticsId: string;      // _id of the TourAnalytics document
  tourId: string;
  companyId: string;
  uniqueTourCode: string;

  engagement: TourHistoryEngagementDTO;
  bookingStats: TourHistoryBookingStatsDTO;
  reviewSummary: TourHistoryReviewSummaryDTO;
  pricing: TourHistoryPricingDTO;
  departure: TourHistoryDepartureDTO;
  operatingWindow: TourHistoryOperatingWindowDTO | null;

  createdAt: string;   // ISO date string
  lastUpdated: string; // ISO date string (analytics updatedAt)
}

/**
 * Aggregated totals computed across ALL runs of a tour.
 */
export interface TourHistoryAggregateDTO {
  totalRuns: number;
  totalBookingsAllRuns: number;
  totalRevenueAllRuns: number;
  totalViewsAllRuns: number;
  totalLikesAllRuns: number;
  totalSharesAllRuns: number;
  averageOccupancyRate: number;
  overallAverageRating: number;
  totalReviewsAllRuns: number;
}

/**
 * Full DTO returned by GET /api/support/tours/v1/[tourId]/history
 * Contains all individual runs + aggregated totals.
 */
export interface TourHistoryDTO {
  tourId: string;
  aggregate: TourHistoryAggregateDTO;
  runs: TourAnalyticsRunDTO[];
}

/** API response wrapper */
export interface TourHistoryResponse {
  data: TourHistoryDTO;
}
