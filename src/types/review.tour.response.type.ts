// review.tour.response.type.ts

import { TRAVEL_TYPE } from "@/constants/tour.const";

/**
 * Minimal info about an employee replying to a review
 */
export interface ReviewReplyEmployeeDTO {
    id: string;
    name: string;
    avatar?: string; // optional, if you want to show employee avatar
}

/**
 * Single reply object attached to a review
 */
export interface ReviewReplyDTO {
    id: string; // reply id (_id)
    employee: ReviewReplyEmployeeDTO;
    message: string;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

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
    rating: number; // 1-5
    title?: string;
    comment?: string;
    images?: string[]; // asset ids
    tripType?: TRAVEL_TYPE;
    travelDate?: string; // ISO date string
    isVerified: boolean;
    isApproved: boolean;
    helpfulCount: number;
    createdAt: string;

    replies?: ReviewReplyDTO[];
}

/**
 * A single full review for a tour
 */
export interface ReviewDTO {
    id: string;
    tourId: string;
    user: ReviewUserDTO;
    rating: number;
    title?: string;
    comment: string;
    images?: string[]; // asset ids
    tripType?: TRAVEL_TYPE;
    travelDate?: string; // ISO date string
    isVerified: boolean;
    isApproved: boolean;
    helpfulCount: number;
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;

    replies?: ReviewReplyDTO[];
}

/**
 * Aggregated summary information for a tour's reviews
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
