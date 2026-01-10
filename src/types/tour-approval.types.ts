// types/tour-approval.types.ts

import { TourDetailDTO, TourFilterOptions, TourListItemDTO } from "./tour.types";
import { ApiResponse } from "./api.types";
import { MODERATION_STATUS } from "@/constants/tour.const";

// Tour approval action types
export type TourApprovalAction = MODERATION_STATUS.APPROVED | MODERATION_STATUS.DENIED | MODERATION_STATUS.SUSPENDED;

// Tour approval request payload
export interface TourApprovalRequest {
    action: TourApprovalAction;
    reason?: string;
    suspensionDuration?: number; // in days
}

// Tour approval response
export interface TourApprovalResponse {
    success: boolean;
    message: string;
    tour: TourDetailDTO;
    updatedAt: Date;
}

// Tour statistics for super admin dashboard
export interface TourApprovalStats {
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    total: number;
}

// Paginated tour approval list
export interface TourApprovalList {
    tours: TourListItemDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: TourApprovalStats;
}

// Zustand store state
export interface TourApprovalStoreState {
    // State
    tours: TourListItemDTO[];
    selectedTour: TourDetailDTO | null;
    filters: TourFilterOptions;
    isLoading: boolean;
    isProcessing: boolean;
    error: string | null;
    stats: TourApprovalStats;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };

    // Actions
    fetchTours: (filters?: Partial<TourFilterOptions>, page?: number, limit?: number) => Promise<void>;
    fetchTourById: (tourId: string, skipCache?: boolean) => Promise<void>;
    approveTour: (tourId: string, reason?: string) => Promise<ApiResponse<TourApprovalResponse>>;
    rejectTour: (tourId: string, reason: string) => Promise<ApiResponse<TourApprovalResponse>>;
    setFilters: (filters: Partial<TourFilterOptions>) => void;
    clearFilters: () => void;
    setSelectedTour: (tour: TourDetailDTO | null) => void;
    clearError: () => void;
}