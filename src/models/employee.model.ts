import { UpdateQuery } from "mongoose";
import { FilterQuery } from "mongoose";
import { Query } from "mongoose";
import {
    Schema,
    Document,
    Types,
    models,
    model,
    Model,
} from "mongoose";

/* ------------------------------------------------------------------
   ENUM CONSTANTS — Single source of truth for roles, statuses, types
------------------------------------------------------------------- */

/**
 * Core job roles determining base permissions.
 */
export const EMPLOYEE_ROLE = {
    ASSISTANT: "assistant",
    SUPPORT: "support",
} as const;

/**
 * Sub-categories of each role (support/assistant).
 */
export const EMPLOYEE_SUB_ROLE = {
    PRODUCT: "product",
    ORDER: "order",
    SUPPORT: "support", // generic support staff
    MARKETING: "marketing",
    FINANCE: "finance",
    ANALYTICS: "analytics",
    HR: "hr",
} as const;

/**
 * Lifecycle states for employee HR workflows.
 */
export const EMPLOYEE_STATUS = {
    ACTIVE: "active",
    ON_LEAVE: "onLeave",
    SUSPENDED: "suspended",
    TERMINATED: "terminated",
} as const;

/**
 * Contract types affecting payroll and benefits.
 */
export const EMPLOYMENT_TYPE = {
    FULL_TIME: "full_time",
    PART_TIME: "part_time",
    CONTRACT: "contract",
    INTERN: "intern",
} as const;

export const EMPLOYEE_POSITIONS = {
    finance: ["Junior Accountant", "Senior Accountant", "Finance Manager"],
    hr: ["HR Executive", "HR Manager", "Recruiter"],
    marketing: ["SEO Specialist", "Marketing Executive", "Campaign Manager"],
    product: ["Catalog Executive", "Inventory Specialist"],
    order: ["Order Associate", "Warehouse Manager"],
    analytics: ["Data Analyst", "Business Analyst"],
    customer: ["Customer Care Executive", "Customer Support Lead"],
    technical: ["Tech Support Executive", "Escalation Engineer"],
} as const;

/* ------------------------------------------------------------------
   DERIVED TYPES — Automatically match constant values
------------------------------------------------------------------- */

export type EmployeeRole = typeof EMPLOYEE_ROLE[keyof typeof EMPLOYEE_ROLE];
export type EmployeeSubRole = typeof EMPLOYEE_SUB_ROLE[keyof typeof EMPLOYEE_SUB_ROLE];
export type EmployeePosition = (typeof EMPLOYEE_POSITIONS)[keyof typeof EMPLOYEE_POSITIONS][number];
export type EmployeeStatus = typeof EMPLOYEE_STATUS[keyof typeof EMPLOYEE_STATUS];
export type EmploymentType = typeof EMPLOYMENT_TYPE[keyof typeof EMPLOYMENT_TYPE];

/* ------------------------------------------------------------------
   PLUGIN: Soft Delete (no `any`)
------------------------------------------------------------------- */
function softDeletePlugin<T extends Document, M extends Model<T>>(schema: Schema<T, M>) {
    function autoFilter(this: Query<T[], T>) {
        if (!this.getQuery().includeDeleted) {
            this.where({ isDeleted: false });
        }
    }
    schema.pre("find", autoFilter);
    schema.pre("findOne", autoFilter);
    schema.pre("countDocuments", autoFilter);

    // instance method
    schema.method("softDelete", function (this: T & { isDeleted: boolean }) {
        this.isDeleted = true;
        return this.save();
    });

    // statics
    schema.static(
        "restore",
        function (this: M, id: Types.ObjectId): Promise<T | null> {
            return this.findByIdAndUpdate(
                id,
                { isDeleted: false } as UpdateQuery<T>,
                { new: true }
            ).exec();
        }
    );

    schema.static(
        "findDeleted",
        function (
            this: M,
            filter: FilterQuery<T> = {}
        ): Query<T[], T> {
            return this.find({ ...filter, isDeleted: true });
        }
    );
}

/* ------------------------------------------------------------------
   PLUGIN: Pagination (no `any`)
------------------------------------------------------------------- */
interface PaginateOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
}
interface PaginateResult<T> {
    docs: T[];
    total: number;
    page: number;
    pages: number;
}

function paginatePlugin<
    T extends Document,
    M extends Model<T>
>(schema: Schema<T, M>) {
    schema.static(
        "paginate",
        async function (
            this: M,
            filter: FilterQuery<T> = {},
            opts: PaginateOptions = {}
        ): Promise<PaginateResult<T>> {
            const page = Math.max(1, opts.page ?? 1);
            const limit = Math.max(1, opts.limit ?? 10);
            const skip = (page - 1) * limit;
            const sort = opts.sort ?? { createdAt: -1 };

            const [docs, total] = await Promise.all([
                this.find(filter).sort(sort).skip(skip).limit(limit),
                this.countDocuments(filter),
            ]);

            return {
                docs,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        }
    );
}

/* ------------------------------------------------------------------
   SUB-SCHEMAS & INTERFACES — granular typing & validation
------------------------------------------------------------------- */

/**
 * Emergency contact details for urgent situations.
 */
export interface IEmergencyContact {
    name: string;
    phone: string;
    relation: string;
}
const EmergencyContactSchema = new Schema<IEmergencyContact>(
    {
        name: { type: String, trim: true, required: true },
        phone: { type: String, trim: true, maxlength: 20, required: true },
        relation: { type: String, trim: true, required: true },
    },
    { _id: false }
);

/**
 * Direct contact avenues for the employee.
 */
export interface IContactInfo {
    phone?: string;
    email?: string;
    emergencyContact?: IEmergencyContact;
}
const ContactInfoSchema = new Schema<IContactInfo>(
    {
        phone: { type: String, trim: true, maxlength: 20 },
        email: { type: String, trim: true, lowercase: true, match: /.+\@.+\..+/ },
        emergencyContact: { type: EmergencyContactSchema },
    },
    { _id: false }
);

/**
 * A single shift entry.
 */
export interface IShift {
    startTime: string;
    endTime: string;
    days: string[];
}
const ShiftSchema = new Schema<IShift>(
    {
        startTime: { type: String, trim: true, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
        endTime: { type: String, trim: true, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
        days: [{ type: String, trim: true, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], required: true }],
    },
    { _id: false }
);

/**
 * Historical performance data.
 */
export interface IPerformance {
    rating?: number;
    lastReview?: Date;
    feedback?: string;
}
const PerformanceSchema = new Schema<IPerformance>(
    {
        rating: { type: Number, min: 1, max: 5 },
        lastReview: Date,
        feedback: { type: String, trim: true, maxlength: 2000 },
    },
    { _id: false }
);

/**
 * Uploaded HR or legal documents.
 */
export interface IDocument {
    type: string;
    url: string;
    uploadedAt: Date;
}
const DocumentSchema = new Schema<IDocument>(
    {
        type: { type: String, trim: true, required: true },
        url: { type: String, trim: true, match: /^https?:\/\//i, required: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

/**
 * Audit trail metadata for creation & updates.
 */
export interface IAudit {
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
}
const AuditSchema = new Schema<IAudit>(
    {
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { _id: false }
);

/* ------------------------------------------------------------------
   MAIN INTERFACE & SCHEMA — employee record definition
------------------------------------------------------------------- */

/**
 * Employee document stored in MongoDB.
 */
export interface IEmployee extends Document {
    userId: Types.ObjectId;
    hostId?: Types.ObjectId;
    role: EmployeeRole;
    subRole: EmployeeRole;
    position?: EmployeePosition;
    status: EmployeeStatus;
    employmentType?: EmploymentType;
    department?: string;
    salary?: number;
    salaryCurrency?: string;
    dateOfJoining: Date;
    dateOfLeaving?: Date;
    contactInfo: IContactInfo;
    permissions: string[];
    shifts?: IShift[];
    performance: IPerformance;
    documents?: IDocument[];
    notes?: string;
    audit: IAudit;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true, unique: true },
        hostId: { type: Schema.Types.ObjectId, ref: "User", index: true },

        role: { type: String, enum: Object.values(EMPLOYEE_ROLE), required: true, index: true },
        subRole: { type: String, enum: Object.values(EMPLOYEE_SUB_ROLE), required: true, index: true },
        position: {
            type: String,
            enum: Object.values(EMPLOYEE_POSITIONS).flat(),
            required: true,
        },
        status: { type: String, enum: Object.values(EMPLOYEE_STATUS), default: EMPLOYEE_STATUS.ACTIVE, index: true },
        employmentType: { type: String, enum: Object.values(EMPLOYMENT_TYPE) },
        department: { type: String, trim: true, maxlength: 100, index: true },
        salary: { type: Number, default: 0, min: 0 },
        salaryCurrency: { type: String, trim: true, maxlength: 3, uppercase: true },

        dateOfJoining: { type: Date, default: Date.now },
        dateOfLeaving: Date,

        contactInfo: { type: ContactInfoSchema, required: true },
        permissions: { type: [String], default: [] },

        shifts: { type: [ShiftSchema], default: [] },
        performance: { type: PerformanceSchema, default: {} },
        documents: { type: [DocumentSchema], default: [] },

        notes: { type: String, trim: true, maxlength: 2000 },
        audit: { type: AuditSchema, required: true },

        // `isDeleted` is added by softDeletePlugin too, but we declare it here for TS clarity
        isDeleted: { type: Boolean, default: false, index: true },
    },
    {
        timestamps: true,          // auto-manage `createdAt` & `updatedAt`
        strict: true,          // remove extraneous fields
        versionKey: "version",     // rename `__v` → `version`
        optimisticConcurrency: true,          // prevent silent overwrites
        collection: "employees",   // explicit collection name
    }
);

// Compound index for frequent admin queries on status & department
EmployeeSchema.index({ status: 1, department: 1, isDeleted: 1 });

/* ------------------------------------------------------------------
   APPLY CUSTOM PLUGINS & HOOKS
------------------------------------------------------------------- */

EmployeeSchema.plugin(softDeletePlugin);
EmployeeSchema.plugin(paginatePlugin);

/**
 * Ensure `dateOfLeaving` (if set) is after `dateOfJoining`.
 */
EmployeeSchema.pre("save", function (next) {
    if (this.dateOfLeaving && this.dateOfLeaving < this.dateOfJoining) {
        return next(new Error("dateOfLeaving must be after dateOfJoining"));
    }
    next();
});

/* ------------------------------------------------------------------
   EXPORT MODEL
------------------------------------------------------------------- */

export const EmployeeModel: Model<IEmployee> =
    (models.employees as Model<IEmployee>) ||
    model<IEmployee>("employees", EmployeeSchema);
