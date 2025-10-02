// reviews.dto.ts
// DTOs for the reviews page: /companies/[companyId]/reviews
// Includes table rows and a detailed view for moderation workflows.

import { TripTypeDTO } from "./tour.types";

/**
 * Table row for Reviews section.
 * Focus: moderation state, rating, helpfulness, and trip context.
 */
export interface ReviewListItemDTO {
    id: string;
    tourId: string;
    userId: string;

    rating: number; // 1–5
    title?: string;
    commentExcerpt: string;

    tripType?: string; // TripTypeDTO
    travelDate?: string;

    isVerified: boolean;
    isApproved: boolean;
    helpfulCount: number;

    createdAt: string;
    updatedAt: string;
}
/**
 * Full review detail for moderation and contextual decisions.
 */
export interface ReviewDetailDTO {
    id: string;
    tourId: string;
    userId: string;

    rating: number; // 1–5
    title?: string;
    comment: string;

    imageIds?: string[];

    tripType?: TripTypeDTO;
    travelDate?: string;

    isVerified: boolean;
    isApproved: boolean;
    helpfulCount: number;

    createdAt: string;
    updatedAt: string;
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