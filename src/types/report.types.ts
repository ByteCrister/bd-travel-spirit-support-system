import { REPORT_STATUS, REPORT_REASON, REPORT_PRIORITY } from "../constants/report.const";

/**
 * Report DTO for frontend
 */
export interface ReportDTO {
    id: string;
    reporterId: string;
    tourId: string;

    reason: REPORT_REASON;
    message: string;

    evidenceImages?: string[];
    evidenceLinks?: string[];

    status: REPORT_STATUS;
    priority: REPORT_PRIORITY;

    assignedTo?: string;
    resolutionNotes?: string;
    resolvedAt?: string;

    reopenedCount: number;
    tags?: string[];

    createdAt: string;
    updatedAt: string;
}
