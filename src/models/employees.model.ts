import {
    EMPLOYEE_POSITIONS,
    EMPLOYEE_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYEE_SUB_ROLE,
    EmployeePosition,
    EmployeeRole,
    EmployeeStatus,
    EMPLOYMENT_TYPE,
    EmploymentType,
} from "@/constants/employee.const";
import { Schema, Document, Types, models, model, Model } from "mongoose";

/* ------------------------------------------------------------------
   SUB-SCHEMAS
------------------------------------------------------------------- */

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

export interface IShift {
    startTime: string;
    endTime: string;
    days: string[];
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

/** Salary history */
export interface ISalaryHistory {
    amount: number;
    currency: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    reason?: string;
}
const SalaryHistorySchema = new Schema<ISalaryHistory>(
    {
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, maxlength: 3, uppercase: true },
        effectiveFrom: { type: Date, required: true },
        effectiveTo: Date,
        reason: { type: String, trim: true },
    },
    { _id: false }
);

/** Position history */
export interface IPositionHistory {
    position: string;
    department: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
}
const PositionHistorySchema = new Schema<IPositionHistory>(
    {
        position: {
            type: String,
            enum: Object.values(EMPLOYEE_POSITIONS).flat(),
            required: true,
        },
        effectiveFrom: { type: Date, required: true },
        effectiveTo: Date,
    },
    { _id: false }
);

/* ------------------------------------------------------------------
   MAIN INTERFACE
------------------------------------------------------------------- */

export interface IEmployee extends Document {
    userId: Types.ObjectId; // login identity
    companyId?: Types.ObjectId; // required if role=assistant
    role: EmployeeRole;
    subRole: EmployeeRole;
    position?: EmployeePosition;
    status: EmployeeStatus;
    employmentType?: EmploymentType;
    department?: string;
    avatar?: Types.ObjectId; // reference to Asset

    salaryHistory: ISalaryHistory[];
    positionHistory: IPositionHistory[];

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

/* ------------------------------------------------------------------
   SCHEMA
------------------------------------------------------------------- */

const EmployeeSchema = new Schema<IEmployee>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            validate: {
                validator: function (this: IEmployee, v: Types.ObjectId | undefined) {
                    if (this.role === EMPLOYEE_ROLE.ASSISTANT && !v) return false;
                    if (this.role === EMPLOYEE_ROLE.SUPPORT && v) return false;
                    return true;
                },
                message:
                    "companyId is required for assistants and must be empty for support staff",
            },
        },

        role: {
            type: String,
            enum: Object.values(EMPLOYEE_ROLE),
            required: true,
            index: true,
        },
        subRole: {
            type: String,
            enum: Object.values(EMPLOYEE_SUB_ROLE),
            required: true,
            index: true,
        },
        position: {
            type: String,
            enum: Object.values(EMPLOYEE_POSITIONS).flat(),
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(EMPLOYEE_STATUS),
            default: EMPLOYEE_STATUS.ACTIVE,
            index: true,
        },
        employmentType: { type: String, enum: Object.values(EMPLOYMENT_TYPE) },
        department: { type: String, trim: true, maxlength: 100, index: true },

        avatar: { type: Schema.Types.ObjectId, ref: "Asset" },

        salaryHistory: { type: [SalaryHistorySchema], default: [] },
        positionHistory: { type: [PositionHistorySchema], default: [] },

        dateOfJoining: { type: Date, default: Date.now },
        dateOfLeaving: Date,

        contactInfo: { type: ContactInfoSchema, required: true },
        permissions: { type: [String], default: [] },

        shifts: { type: [ShiftSchema], default: [] },
        performance: { type: PerformanceSchema, default: {} },
        documents: { type: [DocumentSchema], default: [] },

        notes: { type: String, trim: true, maxlength: 2000 },
        audit: { type: AuditSchema, required: true },

        isDeleted: { type: Boolean, default: false, index: true },
    },
    {
        timestamps: true,
        strict: true,
        versionKey: "version",
        optimisticConcurrency: true,
        collection: "employees",
    }
);

/* ------------------------------------------------------------------
   HOOKS & INDEXES
------------------------------------------------------------------- */

// Ensure leaving date is after joining
EmployeeSchema.pre("save", function (next) {
    if (this.dateOfLeaving && this.dateOfLeaving < this.dateOfJoining) {
        return next(new Error("dateOfLeaving must be after dateOfJoining"));
    }
    next();
});

// Compound index for admin queries
EmployeeSchema.index({ status: 1, department: 1, isDeleted: 1 });

/* ------------------------------------------------------------------
   EXPORT
------------------------------------------------------------------- */

export const EmployeeModel: Model<IEmployee> =
    (models.employees as Model<IEmployee>) ||
    model<IEmployee>("employees", EmployeeSchema);
