// types/company.types.ts

// -------------------------------
// Query params and sorting types
// -------------------------------

/** Sortable fields for the company table. Keep this aligned with UI columns and backend support. */
export const COMPANY_SORT_FIELDS = {
    NAME: "name",
    RATING: "averageRating",
    REVIEWS: "reviewsCount",
    EMPLOYEES: "employeesCount",
    TOURS: "toursCount",
    CREATED: "createdAt",
} as const;

export type CompanySortBy = typeof COMPANY_SORT_FIELDS[keyof typeof COMPANY_SORT_FIELDS];


/** Sort direction. */
export type SortDir = "asc" | "desc";

/** Query params used by table controls. */
export interface CompanyQueryParams {
    /** Free-text search across company name, host email/name, and tags. */
    search?: string;
    /** Field to sort by. */
    sortBy?: CompanySortBy;
    /** Sort direction. */
    sortDir?: SortDir;
    /** Page number (1-based). */
    page?: number;
    /** Page size (recommended small default for compact dashboard). */
    limit?: number;
}

// -------------------------------
// Core DTOs (UI-facing contracts)
// -------------------------------

/** Minimal host identity for display and drilldown. */
export interface HostSummaryDTO {
    /** Host user id (the organizer account acting as the company). */
    id: string;
    /** Host display name. */
    name: string;
    /** Host email. */
    email: string;
    /** Optional avatar URL. */
    avatar?: string | null;
    /** Organizer company name from profile. */
    companyName: string;
    /** Created at timestamp for the host. */
    createdAt: string; // ISO
}

/** Aggregated company metrics for the table. */
export interface CompanyMetricsDTO {
    /** Number of employees linked to this host/company. */
    employeesCount: number;
    /** Number of tours created by this host/company. */
    toursCount: number;
    /** Total reviews across those tours (optional metric for richer dashboards). */
    reviewsCount: number;
    /** Average rating across all tours (weighted average). */
    averageRating: number;
}

/** One row in the company table — identity + metrics + UI helpers. */
export interface CompanyRowDTO {
    /** Stable id for the company (host user id). */
    id: string;
    /** Human-friendly company name (prefer guideProfile.companyName, fallback to host name). */
    name: string;
    /** Host summary. */
    host: HostSummaryDTO;
    /** Aggregated metrics. */
    metrics: CompanyMetricsDTO;
    /** Latest activity timestamps useful for sorting and auditing. */
    timestamps: {
        /** Last login attempt of the host (if any). */
        lastLogin?: string | null;
        /** Host createdAt. */
        createdAt: string;
        /** Host updatedAt (if available). */
        updatedAt?: string | null;
    };
    /** Optional tags/badges that can be rendered as chips. */
    tags?: string[];
}

/** Response envelope for paginated companies. */
export interface CompanyListResponseDTO {
    /** Current page of rows. */
    rows: CompanyRowDTO[];
    /** Total count for pagination. */
    total: number;
    /** Current page. */
    page: number;
    /** Total pages. */
    pages: number;
}

/** Summaries for dashboard stats tiles. */
export interface CompanyDashboardStatsDTO {
    /** How many companies exist (hosts with organizer profile). */
    totalCompanies: number;
    /** Total employees across all companies. */
    totalEmployees: number;
    /** Total tours across all companies. */
    totalTours: number;
}
