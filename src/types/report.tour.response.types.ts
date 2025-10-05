// report.tour.response.types.ts
import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS } from "@/constants/report.const";
import { ReportAttachment, ReportTimelineEntry, SubmissionContext, UserSummary, TourSummary } from "./report.types";

/**
 * Aggregate metrics and small charts data for a tour-level reports header/card.
 * Designed to give an admin an immediate sense of volume, trends and triage pressure.
 */
export interface TourReportSummaryDTO {
    tourId: string;
    tour?: TourSummary | null;
    total: number;
    open: number;
    inReview: number;
    resolved: number;
    reopened: number;
    byPriority: {
        high: number;
        normal: number;
        low: number;
        [key: string]: number;
    };
    byReason: Record<REPORT_REASON | string, number>;
    createdAtRange: {
        earliest?: string; // ISO
        latest?: string; // ISO
    };
    lastUpdatedAt?: string; // ISO
}

/**
 * Compact table row for the tour reports list shown in the admin UI.
 * Keeps fields small to optimize rendering in virtualized tables.
 */
export interface TourReportListItemDTO {
    id: string;
    reporterId: string;
    reporterName?: string;
    reporterAvatarUrl?: string;
    tourId: string;
    tourTitle?: string;
    reason: REPORT_REASON;
    messageExcerpt?: string;
    status: REPORT_STATUS;
    priority: REPORT_PRIORITY;
    assignedToId?: string | null;
    assignedToName?: string | null;
    reopenedCount: number;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    lastActivityAt?: string; // ISO
    flags?: string[]; // e.g., ["safety", "escalated"]
    evidenceCount?: number;
}

/**
 * Full detail displayed in drawer/modal for a report scoped to a tour.
 * Combines model-derived fields, submission context, attachments and immutable timeline.
 */
export interface TourReportDetail {
    id: string;
    // relations
    reporterId: string;
    reporter?: UserSummary | null;
    tourId: string;
    tour?: TourSummary | null;

    // content
    reason: REPORT_REASON;
    message: string;
    messageHtml?: string;

    // evidence
    evidenceImages?: ReportAttachment[]; // image attachments with metadata
    evidenceFiles?: ReportAttachment[]; // non-image attachments
    evidenceLinks?: string[];

    // submission metadata (when/how/where)
    submittedAt: string; // ISO (maps model.createdAt)
    submissionContext?: SubmissionContext;

    // workflow / triage
    status: REPORT_STATUS;
    priority: REPORT_PRIORITY;
    assignedToId?: string | null;
    assignedTo?: UserSummary | null;
    reopenedCount: number;
    escalationLevel?: number;

    // resolution
    resolutionNotes?: string | null;
    resolutionSummary?: string | null;
    resolvedAt?: string | null;
    resolutionCode?: string | null;

    // tags / flags / deletion
    tags?: string[];
    flags?: string[]; // UI-driven flags (e.g., "safety", "legal")
    deletedAt?: string | null;
    deletedById?: string | null;

    // timeline / audit
    timeline: ReportTimelineEntry[];

    // convenience
    lastActivityAt?: string | null; // ISO
    lastActorId?: string | null;
    lastActorName?: string | null;

    // system stamps
    createdAt: string;
    updatedAt: string;
}

/**
 * UI action states and per-item optimistic metadata used by admin components.
 */
export type TourReportAction =
    | "assign"
    | "unassign"
    | "set_priority"
    | "change_status"
    | "add_note"
    | "resolve"
    | "reopen"
    | "delete";

export interface TourReportItemState {
    id: string;
    isLoading?: boolean;
    lastAction?: TourReportAction;
    lastError?: string | null;
    optimistic?: Partial<TourReportListItemDTO | TourReportDetail>;
}

/**
 * Main API payload for paginated tour reviews endpoint
 * matches the fetchReviews implementation which expects docs, total, page, pages
 */
export interface TourReportsResponseDTO {
    docs: TourReportListItemDTO[]; // paginated list field name used by the backend in fetchReviews
    total: number;
    page: number;
    pages: number;
}

/**
 * Final wrapped HTTP response
 */
export interface GetTourReportsResponse {
    data: TourReportsResponseDTO;
}