// models/employee.model.ts
import { Schema, Document, Types, models, model } from "mongoose";

/* ------------------------------------------------------------------
   ENUM CONSTANTS — Single source of truth for roles, statuses, types
-------------------------------------------------------------------*/
export const EMPLOYEE_ROLE = {
    ASSISTANT: "assistant",
    SUPPORT: "support",
} as const;

export const EMPLOYEE_STATUS = {
    ACTIVE: "active",
    ON_LEAVE: "onLeave",
    SUSPENDED: "suspended",
    TERMINATED: "terminated",
} as const;

export const EMPLOYMENT_TYPE = {
    FULL_TIME: "full_time",
    PART_TIME: "part_time",
    CONTRACT: "contract",
    INTERN: "intern",
} as const;

/* ------------------------------------------------------------------
   DERIVED TYPES — Automatically match constant values
-------------------------------------------------------------------*/
export type EmployeeRole = typeof EMPLOYEE_ROLE[keyof typeof EMPLOYEE_ROLE];
export type EmployeeStatus = typeof EMPLOYEE_STATUS[keyof typeof EMPLOYEE_STATUS];
export type EmploymentType = typeof EMPLOYMENT_TYPE[keyof typeof EMPLOYMENT_TYPE];

/* ------------------------------------------------------------------
   INTERFACE — Strongly typed employee document
-------------------------------------------------------------------*/
export interface IEmployee extends Document {
    /** Linked User profile (must exist in `User` collection) */
    userId: Types.ObjectId;

    /** Optional supervisor/host reference (links to another user) */
    hostId?: Types.ObjectId;

    /** Core role category — determines primary responsibilities & permissions */
    role: EmployeeRole;

    /** Public-facing job title or designation (e.g., "Senior Developer") */
    position?: string;

    /** Current employment state — used for HR workflows & filtering */
    status: EmployeeStatus;

    /** Employment category — affects benefits, payroll, and scheduling */
    employmentType?: EmploymentType;

    /** Department or team name (e.g., "Engineering", "HR") */
    department?: string;

    /** Base salary amount (numeric, without currency symbol) */
    salary?: number;

    /** ISO 4217 currency code for salary (e.g., "USD", "EUR") */
    salaryCurrency?: string;

    /** Official joining date — used for tenure, benefits, and probation tracking */
    dateOfJoining: Date;

    /** Optional last working date — set when employee leaves */
    dateOfLeaving?: Date;

    /** Contact details for direct communication and emergencies */
    contactInfo: {
        /** Primary phone number */
        phone?: string;

        /** Work or personal email address */
        email?: string;

        /** Emergency contact details — used only in urgent situations */
        emergencyContact?: {
            /** Full name of emergency contact person */
            name: string;

            /** Phone number of emergency contact */
            phone: string;

            /** Relationship to employee (e.g., "Spouse", "Parent") */
            relation: string;
        };
    };

    /** List of granted permissions (feature/action-level access control) */
    permissions: string[];

    /** Work shift schedules — supports multiple shifts per employee */
    shifts?: {
        /** Shift start time in HH:mm format */
        startTime: string;

        /** Shift end time in HH:mm format */
        endTime: string;

        /** Days of the week this shift applies to (e.g., ["Mon", "Wed"]) */
        days: string[];
    }[];

    /** Performance tracking & review history */
    performance: {
        /** Numeric rating (1–5) from latest review */
        rating?: number;

        /** Date of last performance review */
        lastReview?: Date;

        /** Reviewer feedback or performance notes */
        feedback?: string;
    };

    /** Uploaded HR or legal documents related to the employee */
    documents?: {
        /** Document type (e.g., "ID Proof", "Contract") */
        type: string;

        /** Public or internal file URL */
        url: string;

        /** Date when the document was uploaded */
        uploadedAt: Date;
    }[];

    /** Optional internal notes — visible only to HR/admins */
    notes?: string;

    /** Audit trail for record creation and updates */
    audit: {
        /** User who created this record */
        createdBy: Types.ObjectId;

        /** User who last updated this record */
        updatedBy: Types.ObjectId;
    };

    /** Soft delete flag — true if employee is archived but not removed from DB */
    isDeleted?: boolean;

    /** Auto-managed timestamp for record creation */
    createdAt: Date;

    /** Auto-managed timestamp for last record update */
    updatedAt: Date;
}

/* ------------------------------------------------------------------
   SCHEMA — Mongoose schema with enums from constants
-------------------------------------------------------------------*/
const EmployeeSchema = new Schema<IEmployee>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        hostId: { type: Schema.Types.ObjectId, ref: "User", index: true },

        role: {
            type: String,
            enum: Object.values(EMPLOYEE_ROLE),
            required: true,
            index: true,
        },

        position: { type: String, trim: true, maxlength: 100 },

        status: {
            type: String,
            enum: Object.values(EMPLOYEE_STATUS),
            default: EMPLOYEE_STATUS.ACTIVE,
            index: true,
        },

        employmentType: {
            type: String,
            enum: Object.values(EMPLOYMENT_TYPE),
        },

        department: { type: String, trim: true, maxlength: 100 },
        salary: { type: Number, default: 0, min: 0 },
        salaryCurrency: { type: String, trim: true, maxlength: 3, uppercase: true },

        dateOfJoining: { type: Date, default: Date.now },
        dateOfLeaving: { type: Date },

        contactInfo: {
            phone: { type: String, trim: true, maxlength: 20 },
            email: { type: String, trim: true, lowercase: true, match: /.+\@.+\..+/ },
            emergencyContact: {
                name: { type: String, trim: true },
                phone: { type: String, trim: true, maxlength: 20 },
                relation: { type: String, trim: true },
            },
        },

        permissions: { type: [String], default: [] },

        shifts: [
            {
                startTime: { type: String, trim: true },
                endTime: { type: String, trim: true },
                days: [{ type: String, trim: true }],
            },
        ],

        performance: {
            rating: { type: Number, min: 1, max: 5 },
            lastReview: Date,
            feedback: { type: String, trim: true },
        },

        documents: [
            {
                type: { type: String, trim: true },
                url: { type: String, trim: true, match: /^https?:\/\//i },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],

        notes: { type: String, trim: true },

        audit: {
            createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
            updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        },

        isDeleted: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

// Compound index for common admin filters
EmployeeSchema.index({ hostId: 1, status: 1 });

/* ------------------------------------------------------------------
   MODEL FACTORY — Supports multi-connection setups
-------------------------------------------------------------------*/
export const EmployeeModel = models.employees || model<IEmployee>("employees", EmployeeSchema);
