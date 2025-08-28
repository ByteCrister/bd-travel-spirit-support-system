// models/report.model.ts
import { Schema, model, Document, Types, models } from "mongoose";

/**
 * =========================
 * ENUMS
 * =========================
 */

/**
 * Possible states in the report lifecycle.
 * Helps track workflow from creation to resolution.
 */
export enum REPORT_STATUS {
    OPEN = "open",             // Newly created, awaiting review
    IN_REVIEW = "in_review",   // Being investigated by support/admin
    RESOLVED = "resolved",     // Issue addressed and closed
    REJECTED = "rejected",     // Report dismissed as invalid/unfounded
}

/**
 * Categories for standardizing report reasons.
 * Useful for analytics, filtering, and consistent classification.
 */
export enum REPORT_REASON {
    FALSE_DESCRIPTION = "false_description",       // Listing info was inaccurate
    LATE_PICKUP = "late_pickup",                   // Pickup was delayed
    SAFETY_ISSUE = "safety_issue",                 // Safety concern raised
    UNPROFESSIONAL_GUIDE = "unprofessional_guide", // Guide behavior issue
    BILLING_PROBLEM = "billing_problem",           // Payment or billing dispute
    OTHER = "other",                               // Miscellaneous reason
}

/**
 * Priority levels for triaging reports.
 * Determines urgency for handling.
 */
export enum ReportPriority {
    LOW = "low",       // Can be addressed later
    NORMAL = "normal", // Standard handling
    HIGH = "high",     // Needs prompt attention
    URGENT = "urgent", // Requires immediate action
}

/**
 * =========================
 * INTERFACE
 * =========================
 */
export interface IReport extends Document {
    reporter: Types.ObjectId;         // Who filed the report (User)
    tour: Types.ObjectId;              // Tour being reported
    reason: REPORT_REASON;              // Categorical reason
    message: string;                   // Detailed complaint
    evidenceImages?: Types.ObjectId[]; // Optional evidence images
    evidenceLinks?: string[];          // Links to supporting files/videos
    status: REPORT_STATUS;              // Workflow stage
    assignedTo?: Types.ObjectId;       // Support/admin handling it
    priority: ReportPriority;          // For triage ordering
    resolutionNotes?: string;          // Internal notes after resolution
    resolvedAt?: Date;                 // Timestamp of resolution
    reopenedCount?: number;            // Track if re-opened after closure
    tags?: string[];                   // For internal categorization/analytics
    createdAt: Date;
    updatedAt: Date;
}

/**
 * =========================
 * SCHEMA
 * =========================
 */
const ReportSchema = new Schema<IReport>(
    {
        reporter: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
            index: true,
        },
        reason: {
            type: String,
            enum: Object.values(REPORT_REASON),
            required: true,
            index: true,
        },
        message: { type: String, required: true, trim: true },
        evidenceImages: [{ type: Schema.Types.ObjectId, ref: "Image" }],
        evidenceLinks: [{ type: String, trim: true }],
        status: {
            type: String,
            enum: Object.values(REPORT_STATUS),
            default: REPORT_STATUS.OPEN,
            index: true,
        },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User", index: true },
        priority: {
            type: String,
            enum: Object.values(ReportPriority),
            default: ReportPriority.NORMAL,
            index: true,
        },
        resolutionNotes: { type: String, trim: true },
        resolvedAt: Date,
        reopenedCount: { type: Number, default: 0, min: 0 },
        tags: [{ type: String, trim: true }],
    },
    { timestamps: true }
);

/**
 * =========================
 * INDEXES
 * =========================
 */
ReportSchema.index({ status: 1, priority: -1, createdAt: -1 });
ReportSchema.index({ assignedTo: 1, status: 1 });

/**
 * =========================
 * MODEL FACTORY
 * =========================
 */
export const ReportModel = models.Report || model<IReport>("Report", ReportSchema);