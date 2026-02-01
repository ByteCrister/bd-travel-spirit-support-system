// types/tour-detail-faqs.types.ts

import { ModerationStatus } from "@/constants/tour.const";

/**
 * Lightweight user info for FAQ context
 */
export interface FAQUserDTO {
    id: string;
    name: string;
    avatarUrl?: string;
}

/**
 * Report entry for a FAQ
 */
export interface FAQReportDTO {
    reportedBy: FAQUserDTO;
    reason?: string;
    customReason?: string;
    explanation?: string;
    createdAt: string;
}

/**
 * Vote entry (like/dislike)
 */
export interface FAQVoteDTO {
    userId: string;
    type: "like" | "dislike";
    createdAt: string;
}

/**
 * Full FAQ detail for UI
 */
export interface TourFAQDTO {
    id: string;
    tourId: string;

    question: string;
    answer?: string;

    askedBy: FAQUserDTO;
    answeredBy?: FAQUserDTO;

    status: ModerationStatus;
    order: number;
    isActive: boolean;

    likes: number;
    dislikes: number;
    userVote?: "like" | "dislike"; // current user’s vote if available

    reports: FAQReportDTO[];

    createdAt: string;
    updatedAt: string;
    answeredAt?: string;
    editedAt?: string;
}

/**
 * Paginated FAQ response
 */
export interface GetTourFaqsResponse {
    docs: TourFAQDTO[];
    total: number;
    page: number;
    pages: number;
}