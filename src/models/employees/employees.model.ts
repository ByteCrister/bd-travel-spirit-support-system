import { Schema, Document, Types, Model, FilterQuery, Query } from "mongoose";

import {
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    EmployeeStatus,
    EmploymentType,
} from "@/constants/employee.const";

import { Currency } from "@/constants/tour.const";
import { DayOfWeek } from "@/types/employee.types";
import { defineModel } from "@/lib/helpers/defineModel";
import { ClientSession } from "mongoose";

/* =========================================================
   PAYROLL
========================================================= */

enum PAYROLL_STATUS {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
}

type PayrollStatus = `${PAYROLL_STATUS}`

export interface IPayrollRecord {
    year: number;                  // e.g. 2025
    month: number;                 // 1 - 12
    amount: number;
    currency: Currency;

    status: PayrollStatus;

    attemptedAt?: Date;
    paidAt?: Date;

    failureReason?: string;
    transactionRef?: string;
    paidBy?: Types.ObjectId;        // Admin / Owner
}

const PayrollSchema = new Schema<IPayrollRecord>(
    {
        year: { type: Number, required: true },
        month: { type: Number, required: true, min: 1, max: 12 },

        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, uppercase: true },

        status: {
            type: String,
            enum: Object.values(PAYROLL_STATUS),
            default: PAYROLL_STATUS.PENDING,
            index: true,
        },

        attemptedAt: Date,
        paidAt: Date,

        failureReason: { type: String, trim: true },
        transactionRef: { type: String, trim: true },

        paidBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { _id: false }
);

/* =========================================================
   CONTACT & EMERGENCY
========================================================= */

export interface IEmergencyContact {
    name: string;
    phone: string;
    relation: string;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
    {
        name: { type: String, required: true, trim: true },

        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^(?:\+?88)?01[3-9]\d{8}$/, "Invalid Bangladesh phone"],
        },

        relation: { type: String, required: true, trim: true },
    },
    { _id: false }
);

export interface IContactInfo {
    phone: string;
    email?: string;
    emergencyContact?: IEmergencyContact;
}

const ContactInfoSchema = new Schema<IContactInfo>(
    {
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^(?:\+?88)?01[3-9]\d{8}$/, "Invalid Bangladesh phone"],
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        emergencyContact: EmergencyContactSchema,
    },
    { _id: false }
);

/* =========================================================
   SHIFT SCHEDULING
========================================================= */

export interface IShift {
    startTime: string;      // HH:mm
    endTime: string;        // HH:mm
    days: DayOfWeek[];
}

const ShiftSchema = new Schema<IShift>(
    {
        startTime: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        endTime: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        days: [
            {
                type: String,
                enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                required: true,
            },
        ],
    },
    { _id: false }
);

/* =========================================================
   DOCUMENTS
========================================================= */

export interface IEmployeeDocument {
    type: string;                   // NID, CONTRACT, CERTIFICATE
    asset: Types.ObjectId;          // Asset reference
    uploadedAt: Date;
}

const EmployeeDocumentSchema = new Schema<IEmployeeDocument>(
    {
        type: { type: String, required: true },
        asset: { type: Schema.Types.ObjectId, ref: "Asset", required: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

/* =========================================================
   SALARY HISTORY
========================================================= */

export interface ISalaryHistory {
    amount: number;
    currency: Currency;
    effectiveFrom: Date;
    effectiveTo?: Date;
    reason?: string;
}

const SalaryHistorySchema = new Schema<ISalaryHistory>(
    {
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, uppercase: true },

        effectiveFrom: { type: Date, required: true },
        effectiveTo: Date,

        reason: { type: String, trim: true },
    },
    { _id: false }
);

/* =========================================================
   EMPLOYEE (ROOT) - Instance Methods Interface
========================================================= */

export interface IEmployeeMethods {
    isDeleted(): boolean;
}

/* =========================================================
   STATIC METHODS INTERFACE
========================================================= */

export interface IEmployeeModel
    extends Model<IEmployee, unknown, IEmployeeMethods> {

    softDeleteById(
        id: Types.ObjectId,
        session: ClientSession,
        reason?: string,
        deletedBy?: Types.ObjectId
    ): Promise<HydratedEmployeeDocument | null>;

    restoreById(
        id: Types.ObjectId,
        session: ClientSession,
    ): Promise<HydratedEmployeeDocument | null>;

    findDeleted(
        session?: ClientSession
    ): Promise<HydratedEmployeeDocument[]>;

    findOneWithDeleted(
        query: FilterQuery<IEmployee>,
        session?: ClientSession
    ): Query<HydratedEmployeeDocument | null, IEmployee>;
}

/* =========================================================
   MAIN EMPLOYEE INTERFACE
========================================================= */

export interface IEmployee extends Document {
    user: Types.ObjectId;
    companyId?: Types.ObjectId;

    status: EmployeeStatus;
    employmentType?: EmploymentType;

    avatar?: Types.ObjectId;

    salary: number;
    currency: Currency;
    salaryHistory: ISalaryHistory[];

    payroll: IPayrollRecord[];

    dateOfJoining: Date;
    dateOfLeaving?: Date;

    contactInfo: IContactInfo;

    shifts: IShift[];
    documents: IEmployeeDocument[];

    notes?: string;

    // Soft delete fields
    deletedAt?: Date;
    deletedBy?: Types.ObjectId;
    deleteReason?: string;

    lastLogin?: Date;

    createdAt: Date;
    updatedAt: Date;
}

/* =========================================================
   HELPER TYPES
========================================================= */

export type HydratedEmployeeDocument = IEmployee & IEmployeeMethods;

/* =========================================================
   EMPLOYEE SCHEMA
========================================================= */

const EmployeeSchema = new Schema<IEmployee, IEmployeeModel, IEmployeeMethods>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Guide",
            index: true,
        },

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

        avatar: { type: Schema.Types.ObjectId, ref: "Asset" },

        /* FINANCIAL */
        salary: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, uppercase: true },

        salaryHistory: {
            type: [SalaryHistorySchema],
            default: [],
        },

        payroll: {
            type: [PayrollSchema],
            default: [],
        },

        dateOfJoining: { type: Date, default: Date.now },
        dateOfLeaving: Date,

        contactInfo: {
            type: ContactInfoSchema,
            required: true,
        },

        shifts: {
            type: [ShiftSchema],
            default: [],
        },

        documents: {
            type: [EmployeeDocumentSchema],
            default: [],
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 2000,
        },

        // Soft delete fields
        deletedAt: {
            type: Date,
        },

        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        deleteReason: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        lastLogin: Date,
    },
    {
        timestamps: true,
        strict: true,
        versionKey: "version",
        optimisticConcurrency: true,
        collection: "employees",
    }
);

/* =========================================================
   PRE-FIND MIDDLEWARE TO EXCLUDE DELETED DOCUMENTS
========================================================= */

// Apply to all find queries (find, findOne, findById, etc.)
EmployeeSchema.pre(/^find/, function (
    this: Query<unknown, IEmployee>,
    next
) {
    const query = this.getQuery() as { deletedAt?: unknown };

    // If deletedAt is explicitly specified, do nothing
    if (query.deletedAt !== undefined) {
        return next();
    }

    // Otherwise exclude soft-deleted docs
    this.where({ deletedAt: null });

    next();
});

EmployeeSchema.methods.isDeleted = function (): boolean {
    return Boolean(this.deletedAt);
};

/* =========================================================
   STATIC METHODS (ONLY SOFT DELETE & RESTORE RELATED)
========================================================= */

// Soft Delete & Restore static methods
EmployeeSchema.statics.softDeleteById = async function (
    id: Types.ObjectId,
    session: ClientSession,
    reason?: string,
    deletedBy?: Types.ObjectId
): Promise<HydratedEmployeeDocument | null> {

    return this.findOneAndUpdate(
        {
            _id: id,
            deletedAt: null, // ensure not already deleted
        },
        {
            $set: {
                deletedAt: new Date(),
                deleteReason: reason,
                deletedBy,
                status: EMPLOYEE_STATUS.TERMINATED,
            },
        },
        {
            new: true,          // return updated document
            session,            // attach transaction
        }
    ).exec();
};

EmployeeSchema.statics.restoreById = async function (
    id: Types.ObjectId,
    session: ClientSession,
): Promise<HydratedEmployeeDocument | null> {

    return this.findOneAndUpdate(
        {
            _id: id,
            deletedAt: { $ne: null }, // only restore deleted docs
        },
        {
            $unset: {
                deletedAt: 1,
                deleteReason: 1,
                deletedBy: 1,
            },
            $set: {
                status: EMPLOYEE_STATUS.ACTIVE,
            },
        },
        {
            new: true,   // return restored document
            session,     // transaction-safe
        }
    ).exec();
};

EmployeeSchema.statics.findDeleted = function (
    session?: ClientSession
): Promise<HydratedEmployeeDocument[]> {

    return this
        .find({ deletedAt: { $ne: null } })
        .session(session ?? null)
        .exec();
};

EmployeeSchema.statics.findOneWithDeleted = function (
  query: FilterQuery<IEmployee>,
  session?: ClientSession
) {
  return this.findOne(query).session(session ?? null);
};

/* =========================================================
   VALIDATIONS
========================================================= */

EmployeeSchema.pre("save", function (next) {
    if (this.dateOfLeaving && this.dateOfLeaving < this.dateOfJoining) {
        return next(
            new Error("dateOfLeaving must be after dateOfJoining")
        );
    }

    // Prevent modifying soft-deleted documents
    if (this.isDeleted && this.isDeleted() && this.isModified() && !this.isModified('deletedAt')) {
        return next(
            new Error("Cannot modify a soft-deleted employee. Restore it first.")
        );
    }

    next();
});

/* =========================================================
   INDEXES
========================================================= */

EmployeeSchema.index({ createdAt: -1 });
EmployeeSchema.index({ "contactInfo.email": "text" }, {
    weights: { "contactInfo.email": 3 }
});
EmployeeSchema.index({
    "payroll.year": 1,
    "payroll.month": 1,
    "payroll.status": 1,
});
EmployeeSchema.index({ companyId: 1, status: 1 });
EmployeeSchema.index({ deletedAt: 1 });

/* =========================================================
   MODEL EXPORT
========================================================= */

const EmployeeModel = defineModel<IEmployee, IEmployeeModel>("Employee", EmployeeSchema);

export default EmployeeModel;