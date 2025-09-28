import { TRIP_TYPE } from "../constants/review.const";

/**
 * Review DTO for frontend
 */
export interface ReviewDTO {
    id: string;
    tourId: string;
    userId: string;

    rating: number;          // 1–5
    title?: string;
    comment: string;

    images: string[];
    tripType?: TRIP_TYPE;
    travelDate?: string;

    isVerified: boolean;
    isApproved: boolean;
    helpfulCount: number;

    createdAt: string;
    updatedAt: string;
}
