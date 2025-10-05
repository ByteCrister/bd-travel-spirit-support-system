// reviews.dto.ts
// DTOs for the reviews page: /companies/[companyId]/reviews
// Includes table rows and a detailed view for moderation workflows.

import { TRAVEL_TYPE } from "@/constants/tour.const";

/**
 * Table row for Reviews section.
 * Focus: moderation state, rating, helpfulness, and trip context.
 */
interface BaseReviewDTO {
    id: string;
    tourId: string;
    userId: string;

    rating: number;
    title?: string;

    tripType?: TRAVEL_TYPE;
    travelDate?: string;

    isVerified: boolean;
    isApproved: boolean;
    helpfulCount: number;

    createdAt: string;
    updatedAt: string;
}

export interface ReviewDetailDTO extends BaseReviewDTO {
    comment: string;
    imageIds?: string[];
}


/**
 * Optional table column hints for Reviews.
 */
export type ReviewTableColumns =
    | "rating"
    | "title"
    | "commentExcerpt"
    | "tripType"
    | "isVerified"
    | "isApproved"
    | "helpfulCount"
    | "createdAt";