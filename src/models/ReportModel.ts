// models/Report.ts
import { Schema, model, Document, Types, Connection } from "mongoose";

/**
 * =========================
 * ENUMS
 * =========================
 */

/** Possible states in the report lifecycle */
export type ReportStatus = "open" | "in_review" | "resolved" | "rejected";

/** Categories for standardizing report reasons (helps analytics) */
export type ReportReason =
    | "false_description"
    | "late_pickup"
    | "safety_issue"
    | "unprofessional_guide"
    | "billing_problem"
    | "other";

/**
 * =========================
 * INTERFACE
 * =========================
 */
export interface IReport extends Document {
    reporter: Types.ObjectId;         // Who filed the report (User)
    tour: Types.ObjectId;              // Tour being reported
    reason: ReportReason;              // Categorical reason
    message: string;                   // Detailed complaint
    evidenceImages?: Types.ObjectId[]; // Optional evidence images
    evidenceLinks?: string[];          // Links to supporting files/videos
    status: ReportStatus;              // Workflow stage
    assignedTo?: Types.ObjectId;       // Support/admin handling it
    priority: "low" | "normal" | "high" | "urgent"; // For triage ordering
    resolutionNotes?: string;          // Internal notes after resolution
    resolvedAt?: Date;                  // Timestamp of resolution
    reopenedCount?: number;             // Track if re-opened after closure
    tags?: string[];                    // For internal categorization/analytics
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
            ref: "users",
            required: true,
            index: true, // speeds up user-specific report lookups
        },
        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
            index: true,
        },
        reason: {
            type: String,
            enum: [
                "false_description",
                "late_pickup",
                "safety_issue",
                "unprofessional_guide",
                "billing_problem",
                "other",
            ],
            required: true,
            index: true,
        },
        message: { type: String, required: true, trim: true },
        evidenceImages: [{ type: Schema.Types.ObjectId, ref: "Image" }],
        evidenceLinks: [{ type: String, trim: true }],
        status: {
            type: String,
            enum: ["open", "in_review", "resolved", "rejected"],
            default: "open",
            index: true,
        },
        assignedTo: { type: Schema.Types.ObjectId, ref: "users", index: true },
        priority: {
            type: String,
            enum: ["low", "normal", "high", "urgent"],
            default: "normal",
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
 * These support:
 * - Dashboard queries for open/urgent reports
 * - Quick filtering by assigned staff
 */
ReportSchema.index({ status: 1, priority: -1, createdAt: -1 });
ReportSchema.index({ assignedTo: 1, status: 1 });

/**
 * =========================
 * MODEL FACTORY
 * =========================
 */
export const getReportModel = (db: Connection) =>
    db.models.Report || db.model<IReport>("Report", ReportSchema);

export const Report = model<IReport>("Report", ReportSchema);
