// models/report.model.ts

import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS } from "@/constants/report.const";
import mongoose, {
    Schema,
    model,
    models,
    Document,
    Types,
    Query,
    FilterQuery,
    CallbackWithoutResultAndOptionalError,
} from "mongoose";

////////////////////////////////////////////////////////////////////////////////
// INTERFACE: The shape of a Report document
////////////////////////////////////////////////////////////////////////////////

export interface IReport extends Document {
    reporter: Types.ObjectId;          // Who filed the report
    tour: Types.ObjectId;              // Which Tour is affected
    reason: REPORT_REASON;             // Categorized cause
    message: string;                   // Detailed description
    evidenceImages?: Types.ObjectId[]; // Image references
    evidenceLinks?: string[];          // External proof URLs
    status: REPORT_STATUS;             // Current workflow state
    assignedTo?: Types.ObjectId;       // Admin/User handling it
    priority: REPORT_PRIORITY;         // Triage urgency
    resolutionNotes?: string;          // Internal post-resolution notes
    resolvedAt?: Date;                 // When it was resolved
    reopenedCount: number;             // Times reopened after resolution
    tags?: string[];                   // Internal labels for analytics
    deletedAt?: Date;                  // Soft-delete timestamp

    createdAt: Date;
    updatedAt: Date;

    /** Assigns this report to a user and moves status to IN_REVIEW */
    assignTo(userId: Types.ObjectId): Promise<IReport>;

    /** Marks this report RESOLVED, sets notes & timestamp */
    resolve(notes?: string): Promise<IReport>;

    /** Reopens a resolved/rejected report, increments counter */
    reopen(): Promise<IReport>;
}

////////////////////////////////////////////////////////////////////////////////
// SOFT-DELETE PLUGIN
////////////////////////////////////////////////////////////////////////////////

/**
 * Adds a `deletedAt` field and automatically filters out
 * soft-deleted documents on every `find*` query.
 */
function softDeletePlugin(schema: Schema) {
    schema.add({ deletedAt: { type: Date, default: null, index: true } });

    schema.pre<Query<IReport[], IReport>>(
        /^find/,
        function (this: Query<IReport[], IReport>, next: CallbackWithoutResultAndOptionalError) {
            this.where({ deletedAt: null });
            next();
        }
    );
}

////////////////////////////////////////////////////////////////////////////////
// SCHEMA DEFINITION
////////////////////////////////////////////////////////////////////////////////

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

        message: {
            type: String,
            required: true,
            trim: true,
        },

        evidenceImages: [
            { type: Schema.Types.ObjectId, ref: "Asset" }
        ],

        evidenceLinks: [
            { type: String, trim: true }
        ],

        status: {
            type: String,
            enum: Object.values(REPORT_STATUS),
            default: REPORT_STATUS.OPEN,
            index: true,
        },

        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },

        priority: {
            type: String,
            enum: Object.values(REPORT_PRIORITY),
            default: REPORT_PRIORITY.NORMAL,
            index: true,
        },

        resolutionNotes: { type: String, trim: true },
        resolvedAt: { type: Date },

        reopenedCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        tags: [
            { type: String, trim: true }
        ],
    },
    {
        timestamps: true,               // createdAt & updatedAt
        versionKey: "__v",              // document versioning
        toJSON: { virtuals: true },     // include virtuals in JSON
        toObject: { virtuals: true },   // include virtuals in toObject()
    }
);

// Apply soft-delete behavior
ReportSchema.plugin(softDeletePlugin);

////////////////////////////////////////////////////////////////////////////////
// INDEXES: Optimize lookups & analytics
////////////////////////////////////////////////////////////////////////////////

// One report per user per tour
ReportSchema.index({ tour: 1, reporter: 1 }, { unique: true });

// Prioritized and recent first
ReportSchema.index({ status: 1, priority: -1, createdAt: -1 });

// Reports assigned to a staff member
ReportSchema.index({ assignedTo: 1, status: 1 });

////////////////////////////////////////////////////////////////////////////////
// INSTANCE METHODS: Workflow helpers
////////////////////////////////////////////////////////////////////////////////

/**
 * Assign this report to a user and mark as IN_REVIEW.
 * @param userId  ID of support/admin handling the case
 */
ReportSchema.methods.assignTo = async function (
    this: IReport,
    userId: Types.ObjectId
): Promise<IReport> {
    this.assignedTo = userId;
    this.status = REPORT_STATUS.IN_REVIEW;
    await this.save();
    return this;
};

/**
 * Resolve the report: set notes & timestamp, update status.
 * @param notes  Internal resolution notes
 */
ReportSchema.methods.resolve = async function (
    this: IReport,
    notes?: string
): Promise<IReport> {
    this.status = REPORT_STATUS.RESOLVED;
    this.resolutionNotes = notes;
    this.resolvedAt = new Date();
    await this.save();
    return this;
};

/**
 * Reopen a resolved/rejected report, bump reopen count, reset state.
 */
ReportSchema.methods.reopen = async function (this: IReport): Promise<IReport> {
    this.status = REPORT_STATUS.OPEN;
    this.reopenedCount = (this.reopenedCount || 0) + 1;
    this.resolvedAt = undefined;
    await this.save();
    return this;
};

////////////////////////////////////////////////////////////////////////////////
// STATICS: Pagination helper
////////////////////////////////////////////////////////////////////////////////

interface PaginateResult<T> {
    docs: T[];
    total: number;
    page: number;
    pages: number;
}

/**
 * Returns paginated report documents.
 *
 * @param filter  Mongo filter (e.g., `{ status: REPORT_STATUS.OPEN }`)
 * @param options `{ page, limit }`
 */
ReportSchema.statics.paginate = async function (
    filter: FilterQuery<IReport>,
    options: { page?: number; limit?: number } = {}
): Promise<PaginateResult<IReport>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
        this.find(filter).skip(skip).limit(limit),
        this.countDocuments(filter),
    ]);

    return {
        docs,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

////////////////////////////////////////////////////////////////////////////////
// EXPORT: Safe model factory for hot-reload
////////////////////////////////////////////////////////////////////////////////

export const ReportModel =
    (models.Report as mongoose.Model<IReport>) ||
    model<IReport>("Report", ReportSchema);
