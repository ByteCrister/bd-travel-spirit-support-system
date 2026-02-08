// ------------------ User Types -------------------

import { ForgotPasswordStatus } from "@/constants/guide-forgot-password.const";

export interface UserBasicInfo {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
}

export interface UserWithRole extends UserBasicInfo {
    role?: string;
    isActive?: boolean;
}

// --------------- Password Request Types -----------------


export interface PasswordRequestUserInfo {
    guideId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
}

export interface PasswordRequestReviewerInfo {
    reviewedById: string | null;
    reviewerName: string | null;
    reviewerEmail: string | null;
    reviewerAvatarUrl: string | null;
}

export interface PasswordRequestBase {
    id: string;
    reason: string;
    status: ForgotPasswordStatus;
    rejectionReason: string | null;
    expiresAt: Date | string;
    emailSentAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface PasswordRequestDto extends PasswordRequestBase {
    user: PasswordRequestUserInfo;
    reviewer: PasswordRequestReviewerInfo | null;
}

export interface PasswordRequestResponse {
    id: string;
    user: PasswordRequestUserInfo;
    reviewer: PasswordRequestReviewerInfo | null;
    reason: string;
    status: ForgotPasswordStatus;
    rejectionReason: string | null;
    expiresAt: string;
    emailSentAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// API Response Types

export interface PasswordRequestStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    pendingPercentage: number;
    approvalRate: number;
    averageResponseTime: number; // in hours
}

// ------------------- Filter Types -------------------

export type SortOrder = 'asc' | 'desc';

export interface SortOption {
    field: 'createdAt' | 'updatedAt' | 'expiresAt' | 'user.name' | 'user.email' | 'status';
    order: SortOrder;
}

export interface FilterOptions {
    search: string;
    status: ForgotPasswordStatus | 'ALL';
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
}

export interface PaginationParams {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationParams;
    stats?: PasswordRequestStats;
}

// ------------------ Cache Types ---------------------

export interface CacheMetadata {
    timestamp: number;
    ttl: number; // Time to live in milliseconds
    etag?: string;
    version?: string;
    queryKey?: string; // For identifying specific queries
}

export interface CachedData<T> {
    data: T;
    metadata: CacheMetadata;
}

export interface CacheConfig {
    [key: string]: {
        ttl: number; // milliseconds
        staleWhileRevalidate?: boolean;
        version?: string;
        maxSize?: number;
    };
}

// Query key generator for caching
export interface QueryParams {
    page: number;
    limit: number;
    search: string;
    status: ForgotPasswordStatus | 'ALL';
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
    queryKey: string;
    etag?: string;
}

export interface CacheStore {
    requests: Map<string, CacheEntry<PaginatedResponse<PasswordRequestDto>>>;
    stats: CacheEntry<PasswordRequestStats> | null;
    details: Map<string, CacheEntry<PasswordRequestDto>>;
    lastInvalidated: number;
}

export interface PasswordRequestFilters {
    search: string;
    status: ForgotPasswordStatus | 'ALL';
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    sortBy: SortOption;
}

export interface PasswordRequestStoreState {
    // Data
    requests: PasswordRequestDto[];
    selectedRequest: PasswordRequestDto | null;
    stats: PasswordRequestStats | null;

    // UI State
    filters: PasswordRequestFilters;
    pagination: PaginationParams;

    // Loading States
    isLoading: boolean;
    isFetching: boolean;
    isUpdating: boolean;

    // Cache Management
    cache: CacheStore;

    // Errors
    error: string | null;
}

export interface PasswordRequestStoreActions {
    // Data Operations
    fetchRequests: (forceRefresh?: boolean) => Promise<void>;
    fetchRequestById: (id: string) => Promise<void>;
    fetchStats: (forceRefresh?: boolean) => Promise<void>;

    // CRUD Operations
    approveRequest: (requestId: string, newPass: string, sendEmail: boolean) => Promise<void>;
    rejectRequest: (requestId: string, reason: string) => Promise<void>;

    // Filter & Pagination
    setFilters: (filters: Partial<PasswordRequestFilters>) => void;
    resetFilters: () => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;

    // Cache Management
    invalidateCache: (key?: 'requests' | 'stats' | 'details' | 'all') => void;
    clearCache: () => void;
    updateCacheEntry: (request: PasswordRequestDto) => void;

    // UI Operations
    selectRequest: (request: PasswordRequestDto | null) => void;
    clearError: () => void;
}

export type PasswordRequestStore = PasswordRequestStoreState & PasswordRequestStoreActions;