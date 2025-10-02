// company.overview.types.ts
// DTOs for the overview page: /companies/[companyId]
// Tables: Tours, Employees, Reports, Reviews + KPI cards.

/**
 * KPI cards for the overview dashboard.
 * Simple, additive metrics—avoid expensive recomputation on each render.
 */
export interface CompanyKpisDTO {
    totalTours: number;
    totalEmployees: number;
    openReports: number;
    publishedTours: number;
    totalBookings: number; // sum of bookingInfo.users.length across tours
    avgTourRating: number; // average of tour.averageRating (simple mean)
}

/**
 * Aggregated payload for /companies/[companyId].
 */
export interface CompanyOverviewDTO {
    companyId: string;
    companyName?: string; // organizerProfile.companyName (if available)

    kpis: CompanyKpisDTO;
    // Server timestamp used for discount activation and SLA clocks
    serverNow: string;
}

/**
 * API envelope for overview endpoint.
 */
export interface CompanyOverviewResponse {
    data: CompanyOverviewDTO;
}
