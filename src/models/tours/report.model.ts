// models/report.model.ts

import {
    REPORT_PRIORITY,
    REPORT_REASON,
    REPORT_STATUS,
    ReportPriority,
    ReportReason,
    ReportStatus,
} from "@/constants/report.const";
import { defineModel } from "@/lib/helpers/defineModel";
import {
    Schema,
    Types,
    Query,
    FilterQuery,
    CallbackWithoutResultAndOptionalError,
    Model,
    ClientSession,
    HydratedDocument,
} from "mongoose";

////////////////////////////////////////////////////////////////////////////////
// INTERFACE: The shape of a Report document (plain data, no Document methods)
////////////////////////////////////////////////////////////////////////////////

export interface IReport {
    _id?: Types.ObjectId;
    reporter: Types.ObjectId;          // Who filed the report
    tour: Types.ObjectId;              // Which Tour is affected
    reason: ReportReason;              // Categorized cause
    message: string;                   // Detailed description
    evidenceImages?: Types.ObjectId[]; // Image references to Assets model
    evidenceLinks?: string[];          // External proof URLs
    status: ReportStatus;              // Current workflow state
    priority: ReportPriority;          // Triage urgency
    resolutionNotes?: string;          // Internal post-resolution notes
    rejectionNotes?: string;           // Notes for why report was rejected
    resolvedAt?: Date;                 // When it was resolved
    rejectedAt?: Date;                 // When it was rejected
    rejectedBy?: Types.ObjectId;       // Who rejected the report
    resolvedBy?: Types.ObjectId;       // Who resolved the report
    reopenedCount: number;             // Times reopened after resolution
    tags?: string[];                   // Internal labels for analytics
    deletedAt?: Date | null;           // Soft-delete timestamp

    createdAt: Date;
    updatedAt: Date;
}

////////////////////////////////////////////////////////////////////////////////
// INSTANCE METHODS INTERFACE
////////////////////////////////////////////////////////////////////////////////

interface IReportMethods {
    /** Marks this report RESOLVED, sets notes & timestamp */
    resolve(notes?: string, options?: {
        session?: ClientSession;
        resolvedBy?: Types.ObjectId;
    }): Promise<HydratedReportDocument>;

    /** Marks this report REJECTED, sets notes & timestamp */
    reject(notes?: string, options?: {
        session?: ClientSession;
        rejectedBy?: Types.ObjectId;
    }): Promise<HydratedReportDocument>;

    /** Reopens a resolved/rejected report, increments counter */
    reopen(options?: {
        session?: ClientSession;
        notes?: string; // Optional reopening notes
    }): Promise<HydratedReportDocument>;

    /** Soft-delete this report */
    softDelete(options?: { session?: ClientSession }): Promise<HydratedReportDocument>;

    /** Restore a soft-deleted report */
    restore(options?: { session?: ClientSession }): Promise<HydratedReportDocument>;
}

////////////////////////////////////////////////////////////////////////////////
// QUERY HELPERS: Custom query methods for soft-delete functionality
////////////////////////////////////////////////////////////////////////////////

interface ReportQueryHelpers {
    includeDeleted<T extends Query<unknown, IReport, ReportQueryHelpers>>(
        this: T
    ): T;

    onlyDeleted<T extends Query<unknown, IReport, ReportQueryHelpers>>(
        this: T
    ): T;

    withSession<T extends Query<unknown, IReport, ReportQueryHelpers>>(
        this: T,
        session: ClientSession
    ): T;
}

////////////////////////////////////////////////////////////////////////////////
// INTERFACE: Extended Report Model with static methods
////////////////////////////////////////////////////////////////////////////////

export interface IReportModel extends Model<IReport, ReportQueryHelpers, IReportMethods> {
    /** Pagination helper */
    paginate(
        filter: FilterQuery<IReport>,
        options?: {
            page?: number;
            limit?: number;
            session?: ClientSession;
            includeDeleted?: boolean;
            onlyDeleted?: boolean;
        }
    ): Promise<PaginateResult<HydratedReportDocument>>;

    /** Bulk resolve multiple reports by their IDs */
    bulkResolve(
        reportIds: Types.ObjectId[] | string[],
        notes?: string,
        options?: {
            session?: ClientSession;
            resolvedBy?: Types.ObjectId;
        }
    ): Promise<{
        modifiedCount: number;
        resolvedReports: IReport[];
        failedIds: string[];
    }>;

    /** Bulk reject multiple reports by their IDs */
    bulkReject(
        reportIds: Types.ObjectId[] | string[],
        notes?: string,
        options?: {
            session?: ClientSession;
            rejectedBy?: Types.ObjectId;
        }
    ): Promise<{
        modifiedCount: number;
        rejectedReports: IReport[];
        failedIds: string[];
    }>;

    /** Find only soft-deleted documents */
    findDeleted(
        filter?: FilterQuery<IReport>,
        options?: { session?: ClientSession }
    ): Query<HydratedReportDocument[], IReport, ReportQueryHelpers>;

    /** Find only non-deleted documents */
    findActive(
        filter?: FilterQuery<IReport>,
        options?: { session?: ClientSession }
    ): Query<HydratedReportDocument[], IReport, ReportQueryHelpers>;

    /** Soft delete by ID */
    softDeleteById(
        id: Types.ObjectId | string,
        options?: { session?: ClientSession }
    ): Promise<HydratedReportDocument | null>;

    /** Restore soft-deleted document by ID */
    restoreById(
        id: Types.ObjectId | string,
        options?: { session?: ClientSession }
    ): Promise<HydratedReportDocument | null>;

    /** Hard delete by ID (permanently remove) */
    hardDeleteById(
        id: Types.ObjectId | string,
        options?: { session?: ClientSession }
    ): Promise<HydratedReportDocument | null>;

    /** Count all documents including deleted */
    countAll(
        filter?: FilterQuery<IReport>,
        options?: { session?: ClientSession }
    ): Query<number, IReport, ReportQueryHelpers>;

    /** Count only deleted documents */
    countDeleted(
        filter?: FilterQuery<IReport>,
        options?: { session?: ClientSession }
    ): Query<number, IReport, ReportQueryHelpers>;

    /** Count only active documents */
    countActive(
        filter?: FilterQuery<IReport>,
        options?: { session?: ClientSession }
    ): Query<number, IReport, ReportQueryHelpers>;
}

////////////////////////////////////////////////////////////////////////////////
// HELPER TYPES
////////////////////////////////////////////////////////////////////////////////

export type HydratedReportDocument = HydratedDocument<IReport, IReportMethods>;

////////////////////////////////////////////////////////////////////////////////
// PAGINATION RESULT INTERFACE
////////////////////////////////////////////////////////////////////////////////

interface PaginateResult<T> {
    docs: T[];
    total: number;
    page: number;
    pages: number;
}

////////////////////////////////////////////////////////////////////////////////
// ENHANCED SOFT-DELETE PLUGIN
////////////////////////////////////////////////////////////////////////////////

/**
 * Enhanced soft-delete plugin with query helpers and session support
 */
function enhancedSoftDeletePlugin(
    schema: Schema<IReport, IReportModel, IReportMethods, ReportQueryHelpers>
) {
    // Add deletedAt field
    schema.add({
        deletedAt: {
            type: Date,
            default: null,
            index: true
        },
    });

    // Pre-find hook to filter out deleted documents by default
    schema.pre<Query<IReport[], IReport>>(
        /^find/,
        function (this: Query<IReport[], IReport>, next: CallbackWithoutResultAndOptionalError) {
            // Skip if explicitly including deleted documents
            const options = this.getOptions() as { includeDeleted?: boolean; onlyDeleted?: boolean };
            if (options.includeDeleted) {
                return next();
            }

            // Only filter if not explicitly searching for deleted
            if (!options.onlyDeleted) {
                this.where({ deletedAt: null });
            }
            next();
        }
    );

    // Pre-count hook to filter out deleted documents by default
    schema.pre<Query<number, IReport>>(
        'countDocuments',
        function (this: Query<number, IReport>, next: CallbackWithoutResultAndOptionalError) {
            // Skip if explicitly including deleted documents
            const options = this.getOptions() as { includeDeleted?: boolean; onlyDeleted?: boolean };
            if (options.includeDeleted) {
                return next();
            }

            // Only filter if not explicitly counting deleted
            if (!options.onlyDeleted) {
                this.where({ deletedAt: null });
            }
            next();
        }
    );

    // Add query helpers - using type assertion to extend query interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (schema.query as any).includeDeleted = function <T extends Query<unknown, IReport, ReportQueryHelpers>>(this: T): T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.setOptions({ includeDeleted: true } as any) as T;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (schema.query as any).onlyDeleted = function <T extends Query<unknown, IReport, ReportQueryHelpers>>(this: T): T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.setOptions({ onlyDeleted: true } as any).where({ deletedAt: { $ne: null } }) as T;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (schema.query as any).withSession = function <T extends Query<unknown, IReport, ReportQueryHelpers>>(
        this: T,
        session: ClientSession
    ): T {
        return this.session(session) as T;
    };

    // Add static methods
    schema.statics.findDeleted = function (
        filter: FilterQuery<IReport> = {},
        options: { session?: ClientSession } = {}
    ) {
        let query = this.find(filter);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = (query as any).onlyDeleted();
        if (options.session) {
            query = query.session(options.session);
        }
        return query as Query<HydratedReportDocument[], IReport, ReportQueryHelpers>;
    };

    schema.statics.findActive = function (
        filter: FilterQuery<IReport> = {},
        options: { session?: ClientSession } = {}
    ) {
        let query = this.find(filter);
        query = query.where({ deletedAt: null });
        if (options.session) {
            query = query.session(options.session);
        }
        return query as Query<HydratedReportDocument[], IReport, ReportQueryHelpers>;
    };

    schema.statics.softDeleteById = async function (
        id: Types.ObjectId | string,
        options: { session?: ClientSession } = {}
    ) {
        return this.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { deletedAt: new Date() },
            { new: true, session: options.session }
        ) as Promise<HydratedReportDocument | null>;
    };

    schema.statics.restoreById = async function (
        id: Types.ObjectId | string,
        options: { session?: ClientSession } = {}
    ) {
        return this.findOneAndUpdate(
            { _id: id, deletedAt: { $ne: null } },
            { deletedAt: null },
            { new: true, session: options.session }
        ) as Promise<HydratedReportDocument | null>;
    };

    schema.statics.hardDeleteById = async function (
        id: Types.ObjectId | string,
        options: { session?: ClientSession } = {}
    ) {
        return this.findByIdAndDelete(id, { session: options.session }) as Promise<HydratedReportDocument | null>;
    };

    schema.statics.countAll = function (
        filter: FilterQuery<IReport> = {},
        options: { session?: ClientSession } = {}
    ) {
        let query = this.countDocuments(filter) as Query<number, IReport, ReportQueryHelpers>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = (query as any).includeDeleted();
        if (options.session) {
            query = query.session(options.session);
        }
        return query;
    };

    schema.statics.countDeleted = function (
        filter: FilterQuery<IReport> = {},
        options: { session?: ClientSession } = {}
    ) {
        const modifiedFilter = { ...filter, deletedAt: { $ne: null } };
        let query = this.countDocuments(modifiedFilter) as Query<number, IReport, ReportQueryHelpers>;
        if (options.session) {
            query = query.session(options.session);
        }
        return query;
    };

    schema.statics.countActive = function (
        filter: FilterQuery<IReport> = {},
        options: { session?: ClientSession } = {}
    ) {
        const modifiedFilter = { ...filter, deletedAt: null };
        let query = this.countDocuments(modifiedFilter) as Query<number, IReport, ReportQueryHelpers>;
        if (options.session) {
            query = query.session(options.session);
        }
        return query;
    };
}

////////////////////////////////////////////////////////////////////////////////
// SCHEMA DEFINITION
////////////////////////////////////////////////////////////////////////////////

const ReportSchema = new Schema<IReport, IReportModel, IReportMethods, ReportQueryHelpers>(
    {
        reporter: {
            type: Schema.Types.ObjectId,
            ref: "Traveler",
            required: true,
        },

        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
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
            { type: Schema.Types.ObjectId, ref: "Asset" },
        ],

        evidenceLinks: [
            { type: String, trim: true },
        ],

        status: {
            type: String,
            enum: Object.values(REPORT_STATUS),
            default: REPORT_STATUS.OPEN,
        },

        priority: {
            type: String,
            enum: Object.values(REPORT_PRIORITY),
            default: REPORT_PRIORITY.NORMAL,
        },

        resolutionNotes: {
            type: String,
            trim: true
        },
        rejectionNotes: {
            type: String,
            trim: true
        },
        resolvedAt: { type: Date },
        rejectedAt: { type: Date },
        resolvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        rejectedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        reopenedCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        tags: [
            { type: String, trim: true },
        ],
    },
    {
        timestamps: true,
        versionKey: "__v",
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Apply enhanced soft-delete behavior
ReportSchema.plugin(enhancedSoftDeletePlugin);

////////////////////////////////////////////////////////////////////////////////
// INDEXES: Optimize lookups & analytics
////////////////////////////////////////////////////////////////////////////////

// One report per user per tour (only for non-deleted)
ReportSchema.index({ tour: 1, reporter: 1 }, {
    unique: true,
    partialFilterExpression: { deletedAt: null }
});

// Prioritized and recent first
ReportSchema.index(
    { status: 1, priority: -1, createdAt: -1 },
    { partialFilterExpression: { deletedAt: null } }
);

// Index for status-specific queries
ReportSchema.index(
    { status: 1 },
    { partialFilterExpression: { deletedAt: null } }
);

////////////////////////////////////////////////////////////////////////////////
// INSTANCE METHODS: Workflow & Lifecycle helpers with session support
////////////////////////////////////////////////////////////////////////////////

/**
 * Resolve the report: set notes & timestamp, update status.
 */
ReportSchema.methods.resolve = async function (
    this: HydratedReportDocument,
    notes?: string,
    options: {
        session?: ClientSession;
        resolvedBy?: Types.ObjectId;
    } = {}
): Promise<HydratedReportDocument> {
    // Clear rejection fields if previously rejected
    this.rejectionNotes = undefined;
    this.rejectedAt = undefined;
    this.rejectedBy = undefined;

    // Set resolution fields
    this.status = REPORT_STATUS.RESOLVED;
    this.resolutionNotes = notes;
    this.resolvedAt = new Date();

    if (options.resolvedBy) {
        this.resolvedBy = options.resolvedBy;
    }

    await this.save({ session: options.session });
    return this;
};

/**
 * Reject the report: set rejection notes & timestamp, update status.
 */
ReportSchema.methods.reject = async function (
    this: HydratedReportDocument,
    notes?: string,
    options: {
        session?: ClientSession;
        rejectedBy?: Types.ObjectId;
    } = {}
): Promise<HydratedReportDocument> {
    // Clear resolution fields if previously resolved
    this.resolutionNotes = undefined;
    this.resolvedAt = undefined;
    this.resolvedBy = undefined;

    // Set rejection fields
    this.status = REPORT_STATUS.REJECTED;
    this.rejectionNotes = notes;
    this.rejectedAt = new Date();

    if (options.rejectedBy) {
        this.rejectedBy = options.rejectedBy;
    }

    await this.save({ session: options.session });
    return this;
};

/**
 * Reopen a resolved/rejected report.
 */
ReportSchema.methods.reopen = async function (
    this: HydratedReportDocument,
    options: {
        session?: ClientSession;
        notes?: string;
    } = {}
): Promise<HydratedReportDocument> {
    // Only allow reopening from RESOLVED or REJECTED status
    if (![REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED].includes(this.status as REPORT_STATUS)) {
        throw new Error(`Cannot reopen a report with status: ${this.status}`);
    }

    // Clear resolution/rejection fields
    this.status = REPORT_STATUS.OPEN;
    this.reopenedCount = (this.reopenedCount || 0) + 1;

    // Clear all resolution/rejection data
    this.resolutionNotes = undefined;
    this.rejectionNotes = undefined;
    this.resolvedAt = undefined;
    this.rejectedAt = undefined;
    this.resolvedBy = undefined;
    this.rejectedBy = undefined;

    // Optional: Add reopening notes to resolutionNotes field
    if (options.notes) {
        this.resolutionNotes = `Reopened: ${options.notes}`;
    }

    await this.save({ session: options.session });
    return this;
};

/**
 * Soft-delete this report.
 */
ReportSchema.methods.softDelete = async function (
    this: HydratedReportDocument,
    options: { session?: ClientSession } = {}
): Promise<HydratedReportDocument> {
    if (!this.deletedAt) {
        this.deletedAt = new Date();
        await this.save({ session: options.session });
    }
    return this;
};

/**
 * Restore a soft-deleted report.
 */
ReportSchema.methods.restore = async function (
    this: HydratedReportDocument,
    options: { session?: ClientSession } = {}
): Promise<HydratedReportDocument> {
    if (this.deletedAt) {
        this.deletedAt = null;
        await this.save({ session: options.session });
    }
    return this;
};

////////////////////////////////////////////////////////////////////////////////
// STATICS: Pagination helper with session support
////////////////////////////////////////////////////////////////////////////////

ReportSchema.statics.paginate = async function (
    filter: FilterQuery<IReport> = {},
    options: {
        page?: number;
        limit?: number;
        session?: ClientSession;
        includeDeleted?: boolean;
        onlyDeleted?: boolean;
    } = {}
): Promise<PaginateResult<HydratedReportDocument>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    // -----------------------------
    // Build base find query
    // -----------------------------
    let query = this.find(filter);

    if (options.session) {
        query = query.session(options.session);
    }

    // IMPORTANT: onlyDeleted must win
    if (options.onlyDeleted) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = (query as any).onlyDeleted();
    } else if (options.includeDeleted) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = (query as any).includeDeleted();
    }

    // -----------------------------
    // Build count query
    // -----------------------------
    let countQuery = this.countDocuments(filter);

    if (options.session) {
        countQuery = countQuery.session(options.session);
    }

    // Use the SAME logic as find()
    if (options.onlyDeleted) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        countQuery = (countQuery as any).onlyDeleted();
    } else if (options.includeDeleted) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        countQuery = (countQuery as any).includeDeleted();
    }

    // -----------------------------
    // Execute
    // -----------------------------
    const [docs, total] = await Promise.all([
        query.skip(skip).limit(limit).exec(),
        countQuery.exec(),
    ]);

    return {
        docs: docs as HydratedReportDocument[],
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

/**
 * Bulk resolve multiple reports by their IDs.
 */
ReportSchema.statics.bulkResolve = async function (
    reportIds: Types.ObjectId[] | string[],
    notes?: string,
    options: {
        session?: ClientSession;
        resolvedBy?: Types.ObjectId;
    } = {}
): Promise<{
    modifiedCount: number;
    resolvedReports: IReport[];
    failedIds: string[];
}> {
    const session = options?.session;
    const resolvedBy = options?.resolvedBy;

    // Convert string IDs to ObjectId if necessary
    const objectIds = reportIds.map(id => typeof id === 'string' ? new Types.ObjectId(id) : id);

    // Find all reports by IDs (only non-deleted ones, because of the soft delete plugin)
    const reports = await this.find({ _id: { $in: objectIds } }).session(session || null);

    const failedIds: string[] = [];
    const resolvedReports: IReport[] = [];

    // Update each report individually to trigger instance methods and validation
    const updatePromises = reports.map(async (report) => {
        try {
            if (typeof report.resolve === 'function') {
                await report.resolve(notes, { session, resolvedBy });
                resolvedReports.push(report.toObject());
            } else {
                failedIds.push(report._id.toString());
            }
        } catch (error) {
            console.error(`Failed to resolve report ${report._id}:`, error);
            failedIds.push(report._id.toString());
        }
    });

    await Promise.all(updatePromises);

    return {
        modifiedCount: resolvedReports.length,
        resolvedReports,
        failedIds
    };
};

/**
 * Bulk reject multiple reports by their IDs.
 */
ReportSchema.statics.bulkReject = async function (
    reportIds: Types.ObjectId[] | string[],
    notes?: string,
    options: {
        session?: ClientSession;
        rejectedBy?: Types.ObjectId;
    } = {}
): Promise<{
    modifiedCount: number;
    rejectedReports: IReport[];
    failedIds: string[];
}> {
    const session = options?.session;
    const rejectedBy = options?.rejectedBy;

    // Convert string IDs to ObjectId if necessary
    const objectIds = reportIds.map(id => typeof id === 'string' ? new Types.ObjectId(id) : id);

    // Find all reports by IDs (only non-deleted ones, because of the soft delete plugin)
    const reports = await this.find({ _id: { $in: objectIds } }).session(session || null);

    const failedIds: string[] = [];
    const rejectedReports: IReport[] = [];

    // Update each report individually to trigger instance methods and validation
    const updatePromises = reports.map(async (report) => {
        try {
            if (typeof report.reject === 'function') {
                await report.reject(notes, { session, rejectedBy });
                rejectedReports.push(report.toObject());
            } else {
                failedIds.push(report._id.toString());
            }
        } catch (error) {
            console.error(`Failed to reject report ${report._id}:`, error);
            failedIds.push(report._id.toString());
        }
    });

    await Promise.all(updatePromises);

    return {
        modifiedCount: rejectedReports.length,
        rejectedReports,
        failedIds
    };
};

////////////////////////////////////////////////////////////////////////////////
// VIRTUAL FIELDS
////////////////////////////////////////////////////////////////////////////////

// Virtual for checking if document is deleted
ReportSchema.virtual('isDeleted').get(function (this: HydratedReportDocument) {
    return this.deletedAt !== null && this.deletedAt !== undefined;
});

// Virtual for checking if document is active
ReportSchema.virtual('isActive').get(function (this: HydratedReportDocument) {
    return this.deletedAt === null || this.deletedAt === undefined;
});

// Virtual for checking if report is resolved
ReportSchema.virtual('isResolved').get(function (this: HydratedReportDocument) {
    return this.status === REPORT_STATUS.RESOLVED;
});

// Virtual for checking if report is rejected
ReportSchema.virtual('isRejected').get(function (this: HydratedReportDocument) {
    return this.status === REPORT_STATUS.REJECTED;
});

// Virtual for checking if report is open
ReportSchema.virtual('isOpen').get(function (this: HydratedReportDocument) {
    return this.status === REPORT_STATUS.OPEN;
});

// Virtual for checking if report is under review
ReportSchema.virtual('isUnderReview').get(function (this: HydratedReportDocument) {
    return this.status === REPORT_STATUS.IN_REVIEW;
});

// Virtual for formatted status display
ReportSchema.virtual('statusDisplay').get(function (this: HydratedReportDocument) {
    const statusMap: Record<ReportStatus, string> = {
        [REPORT_STATUS.OPEN]: 'Open',
        [REPORT_STATUS.IN_REVIEW]: 'Under Review',
        [REPORT_STATUS.RESOLVED]: 'Resolved',
        [REPORT_STATUS.REJECTED]: 'Rejected',
    };
    return statusMap[this.status] || this.status;
});

////////////////////////////////////////////////////////////////////////////////
// PRE-SAVE HOOKS
////////////////////////////////////////////////////////////////////////////////

// Auto-update timestamps based on status changes
ReportSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        const now = new Date();

        if (this.status === REPORT_STATUS.RESOLVED && !this.resolvedAt) {
            this.resolvedAt = now;
        } else if (this.status === REPORT_STATUS.REJECTED && !this.rejectedAt) {
            this.rejectedAt = now;
        } else if ([REPORT_STATUS.OPEN, REPORT_STATUS.IN_REVIEW].includes(this.status as REPORT_STATUS)) {
            // Clear timestamps when reopening
            this.resolvedAt = undefined;
            this.rejectedAt = undefined;
        }
    }
    next();
});

////////////////////////////////////////////////////////////////////////////////
// EXPORT: Safe model factory for hot-reload
////////////////////////////////////////////////////////////////////////////////

export const ReportModel = defineModel<IReport, IReportModel>("Report", ReportSchema as Schema<IReport, IReportModel>);