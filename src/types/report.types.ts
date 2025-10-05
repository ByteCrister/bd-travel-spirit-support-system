// report.types.ts
import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS } from "@/constants/report.const";
import { USER_ROLE } from "@/constants/user.const";

/**
 * Lightweight user summary to avoid extra client joins
 */
export interface UserSummary {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    role?: USER_ROLE;
}

/**
 * Lightweight tour summary to provide context without full tour payload
 */
export interface TourSummary {
    id: string;
    title?: string;
    slug?: string;
    providerId?: string;
}

/**
 * Attachment/evidence metadata (Image documents referenced by evidenceImages)
 */
export interface ReportAttachment {
    id: string;
    url?: string;
    filename?: string;
    mimeType?: string;
    sizeBytes?: number;
    uploadedAt?: string; // ISO
    uploadedById?: string;
    caption?: string;
    isPrimary?: boolean;
}

/**
 * Submission context captured from request / client
 */
export interface SubmissionContext {
    channel?: "web" | "mobile" | "email" | "phone" | string;
    userAgent?: string;
    ipAddress?: string;
    geolocation?: {
        lat?: number;
        lng?: number;
        accuracyMeters?: number;
        placeDescription?: string;
    };
    device?: {
        type?: "desktop" | "mobile" | "tablet" | string;
        os?: string;
        osVersion?: string;
        appVersion?: string;
    };
    language?: string;
    originatingUrl?: string;
}

/**
 * Immutable timeline entry for audit / activity feed driven from model methods and events
 */
export type TimelineEntryType =
    | "created"
    | "assigned"
    | "status_changed"
    | "resolved"
    | "reopened"
    | "comment"
    | "note"
    | "evidence_added"
    | "evidence_removed"
    | "tag_changed"
    | "deleted"
    | "system"
    | string;

export interface ReportTimelineEntry {
    id: string;
    type: TimelineEntryType;
    actorId?: string | null;
    actor?: UserSummary | null;
    message?: string;
    metadata?: Record<string, unknown>;
    attachments?: ReportAttachment[];
    fromStatus?: REPORT_STATUS;
    toStatus?: REPORT_STATUS;
    fromPriority?: REPORT_PRIORITY;
    toPriority?: REPORT_PRIORITY;
    fromAssigneeId?: string | null;
    toAssigneeId?: string | null;
    createdAt: string; // ISO
}

/**
 * Full report DTO mapping the Mongoose model into a transport-friendly shape.
 * Designed for drawer/modal with complete context: who, when, how, evidence, workflow, and timeline.
 */
export interface ReportDetailDTO {
    // primary identifiers
    id: string; // report._id
    reporterId: string; // ref ObjectId -> string
    reporter?: UserSummary | null;
    tourId: string; // ref ObjectId -> string
    tour?: TourSummary | null;

    // core content
    reason: REPORT_REASON;
    message: string;
    messageHtml?: string;

    // evidence
    evidenceImages?: ReportAttachment[]; // images referenced by evidenceImages
    evidenceLinks?: string[]; // string[] from model

    // workflow / triage
    status: REPORT_STATUS;
    priority: REPORT_PRIORITY;
    assignedToId?: string | null; // ref ObjectId -> string | null
    assignedTo?: UserSummary | null;
    reopenedCount: number;
    escalationLevel?: number;

    // resolution
    resolutionNotes?: string | null;
    resolvedAt?: string | null;

    // tags & soft-delete
    tags?: string[];
    deletedAt?: string | null;
    deletedById?: string | null;

    // submission metadata (when/how/where)
    submittedAt: string; // maps model.createdAt
    submissionContext?: SubmissionContext;

    // timeline & audit trail
    timeline: ReportTimelineEntry[];

    // convenience / derived fields
    resolutionSummary?: string | null;
    lastActivityAt?: string | null;
    lastActorId?: string | null;
    lastActorName?: string | null;

    // system stamps
    createdAt: string;
    updatedAt: string;
}

/**
 * Minimal list item optimized for table rows (derived from full detail)
 */
export interface ReportListItemDTO {
    id: string;
    reporterId: string;
    reporterName?: string;
    tourId: string;
    tourTitle?: string;
    reason: REPORT_REASON;
    messageExcerpt?: string;
    status: REPORT_STATUS;
    priority: REPORT_PRIORITY;
    assignedToId?: string | null;
    assignedToName?: string | null;
    reopenedCount: number;
    createdAt: string;
    updatedAt: string;
    lastActivityAt?: string;
}

/**
 * Payloads for mutations reflecting model instance methods and common UI actions
 */
export interface AssignReportPayload {
    id: string;
    assignedToId: string | null;
}

export interface ResolveReportPayload {
    id: string;
    resolutionNotes?: string;
    resolvedAt?: string; // optional override, ISO
}

export interface ReopenReportPayload {
    id: string;
}

/**
 * Paginated response for tour-scoped or global report lists
 */
export interface PaginateResult<T> {
    docs: T[];
    total: number;
    page: number;
    pages: number;
}

/**
 * Response shape returned by server when mapping Mongoose IReport -> ReportDetailDTO
 * Use server mappers to convert ObjectId -> string and Date -> ISO string
 */
export interface ReportMapperOptions {
    includeReporter?: boolean;
    includeAssignee?: boolean;
    includeTour?: boolean;
    includeAttachments?: boolean;
    includeSubmissionContext?: boolean;
}
