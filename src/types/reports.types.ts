// reports.dto.ts
// DTOs for the reports page: /companies/[companyId]/reports
// Includes table rows and a detailed view with workflow helpers.

/**
 * Report workflow state. Mirrors REPORT_STATUS in the model.
 */
export type ReportStatusDTO = "open" | "in_review" | "resolved" | "rejected";

/**
 * Report reasons. Mirrors REPORT_REASON in the model.
 */
export type ReportReasonDTO =
    | "false_description"
    | "late_pickup"
    | "safety_issue"
    | "unprofessional_guide"
    | "billing_problem"
    | "other";

/**
 * Report priority levels. Mirrors REPORT_PRIORITY in the model.
 */
export type ReportPriorityDTO = "low" | "normal" | "high" | "urgent";


/**
 * Table row for Reports section.
 * Focus: workflow state, triage details, and linkage.
 */
export interface ReportListItemDTO {
    id: string;
    reporterId: string;
    tourId: string;

    reason: ReportReasonDTO;
    messageExcerpt: string;

    status: ReportStatusDTO;
    assignedToId?: string;
    priority: ReportPriorityDTO;

    resolvedAt?: string;
    reopenedCount: number;

    createdAt: string;
    updatedAt: string;
}

/**
 * Full report detail for drawer/modal interactions.
 */
export interface ReportDetailDTO {
    id: string;
    reporterId: string;
    tourId: string;

    reason: ReportReasonDTO;
    message: string;

    evidenceImages?: string[];
    evidenceLinks?: string[];

    status: ReportStatusDTO;
    assignedToId?: string;
    priority: ReportPriorityDTO;

    resolutionNotes?: string;
    resolvedAt?: string;
    reopenedCount: number;

    tags?: string[];

    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

/**
 * Optional table column hints for Reports.
 */
export type ReportTableColumns =
    | "reason"
    | "status"
    | "priority"
    | "assignedToId"
    | "reopenedCount"
    | "createdAt";
