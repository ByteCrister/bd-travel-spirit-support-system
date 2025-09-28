import { TOUR_STATUS, TRAVEL_TYPE } from "@/constants/tour.const";

/**
 * Tour DTO for frontend
 */
export interface TourDTO {
    id: string;
    title: string;
    slug: string;
    status: TOUR_STATUS;

    highlights: string[];
    description: string;

    startDate: string;
    endDate: string;
    durationDays: number;

    priceOptions: {
        name: string;
        amount: number;
        currency: string;
    }[];

    maxGroupSize: number;
    repeatCount: number;

    activities: string[];
    tags: string[];
    travelTypes: TRAVEL_TYPE[];

    heroImage?: string;
    gallery?: string[];
    videoUrls?: string[];
    virtualTourUrl?: string;

    averageRating: number;
    createdAt: string;
    updatedAt: string;
}
