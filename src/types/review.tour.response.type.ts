import { TRAVEL_TYPE } from "@/constants/tour.const";

/**
 * Minimal info about the user who wrote a review
 */
export interface ReviewUserDTO {
    id: string;
    name: string;
    avatar?: string;
}

/**
 * Review item used in list responses (lighter than full ReviewDTO if needed)
 */
export interface ReviewListItemDTO {
    id: string;
    tourId: string;
    user: ReviewUserDTO;
    rating: number;
    title?: string;
    comment?: string;
    tripType?: TRAVEL_TYPE;
    travelDate?: string;
    isVerified: boolean;
    isApproved: boolean;
    helpfulCount: number;
    createdAt: string;
}

/**
 * A single full review for a tour
 */
export interface ReviewDTO {
    id: string;
    tourId: string;
    user: ReviewUserDTO;
    rating: number;
    title: string;
    comment: string;
    tripType?: TRAVEL_TYPE;
    travelDate?: string;
    isVerified: boolean;
    isApproved: boolean;
    helpfulCount: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Aggregated summary information for a tour’s reviews
 */
export interface ReviewSummaryDTO {
    totalReviews: number;
    averageRating: number;
    verifiedCount: number;
    ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

/**
 * Main API payload for paginated tour reviews endpoint
 * matches the fetchReviews implementation which expects docs, total, page, pages
 */
export interface TourReviewsResponseDTO {
    companyId: string;
    tourId: string;
    summary: ReviewSummaryDTO;
    docs: ReviewListItemDTO[]; // paginated list field name used by the backend in fetchReviews
    total: number;
    page: number;
    pages: number;
}

/**
 * Final wrapped HTTP response
 */
export interface GetTourReviewsResponse {
    success: boolean;
    data: TourReviewsResponseDTO;
}
