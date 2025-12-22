import {
    EMPLOYEE_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    EmployeeRole,
    EmployeeStatus,
    EmploymentType,
} from "@/constants/employee.const";
import { defineModel } from "@/lib/helpers/defineModel";

import { DayOfWeek } from "@/types/employee.types";
import { Schema, Document, Types } from "mongoose";

/* =========================================================
   PAYROLL SYSTEM (AUTO + MANUAL + FAILURE TRACKING)
========================================================= */

export enum PAYROLL_STATUS {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
}

export interface IPayrollRecord {
    year: number;              // 2025
    month: number;             // 1–12
    amount: number;
    currency: string;

    status: PAYROLL_STATUS;

    attemptedAt?: Date;        // Cron or manual attempt time
    paidAt?: Date;             // When payment actually succeeded

    failureReason?: string;   // If failed
    transactionRef?: string;  // Bank / Stripe / Mobile Wallet reference
    paidBy?: Types.ObjectId;  // Owner/Admin user ID (manual payment)
}

const PayrollSchema = new Schema<IPayrollRecord>(
    {
        year: { type: Number, required: true },
        month: { type: Number, required: true, min: 1, max: 12 },

        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, maxlength: 3, uppercase: true },

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
    EMERGENCY & CONTACT SUB-SCHEMAS
========================================================= */

export interface IEmergencyContact {
    name: string;
    phone: string;
    relation: string;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
    {
        name: { type: String, trim: true, required: true },

        phone: {
            type: String,
            trim: true,
            maxlength: 20,
            required: true,
            match: [/^(?:\+?88)?01[3-9]\d{8}$/, "Invalid Bangladesh phone"],
        },

        relation: { type: String, trim: true, required: true },
    },
    { _id: false }
);

export interface IContactInfo {
    phone: string;
    email?: string;
    emergencyContact?: IEmergencyContact;
    firstName?: string;
    lastName?: string;
}

const ContactInfoSchema = new Schema<IContactInfo>(
    {
        phone: {
            type: String,
            trim: true,
            required: true,
            match: [/^(?:\+?88)?01[3-9]\d{8}$/, "Invalid Bangladesh phone"],
        },

        email: { type: String, trim: true, lowercase: true },

        emergencyContact: EmergencyContactSchema,

        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
    },
    { _id: false }
);

/* =========================================================
   SHIFT SCHEDULING
========================================================= */

export interface IShift {
    startTime: string; // HH:mm
    endTime: string;
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
   DOCUMENT STORAGE (NID, CONTRACT, ETC.)
========================================================= */

export interface IDocument {
    type: string;
    url: Types.ObjectId;
    uploadedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
    {
        type: { type: String, required: true },
        url: { type: Schema.Types.ObjectId, ref: "Asset", required: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

/* =========================================================
   SALARY
========================================================= */

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
        currency: { type: String, required: true, uppercase: true },
        effectiveFrom: { type: Date, required: true },
        effectiveTo: Date,
        reason: String,
    },
    { _id: false }
);

/* =========================================================
   MAIN EMPLOYEE INTERFACE
========================================================= */

export interface IEmployee extends Document {
    user: Types.ObjectId;
    companyId?: Types.ObjectId;

    role: EmployeeRole;

    status: EmployeeStatus;
    employmentType?: EmploymentType;

    avatar?: Types.ObjectId;
    fullName?: string;

    salary: number;
    currency: string;
    salaryHistory: ISalaryHistory[];

    payroll: IPayrollRecord[];

    dateOfJoining: Date;
    dateOfLeaving?: Date;

    contactInfo: IContactInfo;

    shifts?: IShift[];
    documents?: IDocument[];

    notes?: string;
    isDeleted: boolean;
    lastLogin: Date;

    createdAt: Date;
    updatedAt: Date;
}


const EmployeeSchema = new Schema<IEmployee>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },

        companyId: { type: Schema.Types.ObjectId, ref: "Guide", index: true },

        role: { type: String, enum: Object.values(EMPLOYEE_ROLE), required: true },

        status: {
            type: String,
            enum: Object.values(EMPLOYEE_STATUS),
            default: EMPLOYEE_STATUS.ACTIVE,
            index: true,
        },

        employmentType: { type: String, enum: Object.values(EMPLOYMENT_TYPE) },

        avatar: { type: Schema.Types.ObjectId, ref: "Asset" },

        fullName: { type: String, trim: true, index: true },

        /* FINANCIAL CORE */
        salary: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, uppercase: true },

        salaryHistory: { type: [SalaryHistorySchema], default: [] },

        payroll: { type: [PayrollSchema], default: [] },

        dateOfJoining: { type: Date, default: Date.now },
        dateOfLeaving: Date,

        contactInfo: { type: ContactInfoSchema, required: true },

        shifts: { type: [ShiftSchema], default: [] },

        documents: { type: [DocumentSchema], default: [] },

        notes: { type: String, trim: true, maxlength: 2000 },

        isDeleted: { type: Boolean, default: false, index: true },

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


// Maintain fullName automatically
EmployeeSchema.pre("save", function (next) {
    const first = this.contactInfo?.firstName?.trim();
    const last = this.contactInfo?.lastName?.trim();

    if (first || last) {
        this.fullName = [first, last].filter(Boolean).join(" ");
    }

    if (this.dateOfLeaving && this.dateOfLeaving < this.dateOfJoining) {
        return next(new Error("dateOfLeaving must be after joining date"));
    }

    next();
});

/* =========================================================
   INDEXES FOR SPEED
========================================================= */

EmployeeSchema.index({ isDeleted: 1 });
EmployeeSchema.index({ createdAt: -1 });

EmployeeSchema.index(
    { fullName: "text", "contactInfo.email": "text" },
    { weights: { fullName: 5, "contactInfo.email": 3, } }
);

// Payroll query optimization
EmployeeSchema.index({
    "payroll.year": 1,
    "payroll.month": 1,
    "payroll.status": 1,
});


const EmployeeModel = defineModel("Employees", EmployeeSchema);

export default EmployeeModel;