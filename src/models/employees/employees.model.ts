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
import bcrypt from "bcryptjs";
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
    firstName?: string;
    lastName?: string;
}
const ContactInfoSchema = new Schema<IContactInfo>(
    {
        phone: { type: String, trim: true, maxlength: 20 },
        email: { type: String, trim: true, lowercase: true, match: /.+\@.+\..+/ },
        emergencyContact: { type: EmergencyContactSchema },
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
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
    url: Types.ObjectId;
    uploadedAt: Date;
}
const DocumentSchema = new Schema<IDocument>(
    {
        type: { type: String, trim: true, required: true },
        url: { type: Schema.Types.ObjectId, ref: "Asset", required: true },
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
    userId?: Types.ObjectId; // optional linkage to separate auth User doc
    companyId?: Types.ObjectId;
    role: EmployeeRole;
    subRole: EmployeeRole;
    position?: EmployeePosition;
    status: EmployeeStatus;
    employmentType?: EmploymentType;
    avatar?: Types.ObjectId;

    // Authentication fields
    email: string;
    password: string; // hashed; select: false in schema

    // Denormalized read fields
    fullName?: string;

    failedLoginAttempts: number,
    lastFailedAt: Date,
    lockedUntil: Date,
    lastLogin: Date,

    // Current salary
    salary: number,
    currency: string,
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

    // Methods
    comparePassword(candidate: string): Promise<boolean>;
    safeToJSON(): Partial<Omit<IEmployee, "password">>;
}

interface IEmployeeModel extends Model<IEmployee> {
    findByEmail(email: string): Promise<IEmployee | null>;
    authenticate(email: string, password: string): Promise<IEmployee | null>;
}

/* ------------------------------------------------------------------
   SCHEMA
------------------------------------------------------------------- */

const EmployeeSchema = new Schema<IEmployee>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true },

        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Guide", // ? Guide model is the company model
            validate: {
                validator: function (this: IEmployee, v: Types.ObjectId | undefined) {
                    if (this.role === EMPLOYEE_ROLE.ASSISTANT && !v) return false;
                    if (this.role === EMPLOYEE_ROLE.SUPPORT && v) return false;
                    return true;
                },
                message:
                    "companyId is required for assistants and must be empty for support staff",
            },
            index: true,
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
            index: true,
        },

        status: {
            type: String,
            enum: Object.values(EMPLOYEE_STATUS),
            default: EMPLOYEE_STATUS.ACTIVE,
            index: true,
        },
        employmentType: { type: String, enum: Object.values(EMPLOYMENT_TYPE) },

        avatar: { type: Schema.Types.ObjectId, ref: "Asset" },

        /* Authentication fields */
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /.+\@.+\..+/,
            index: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },

        /* Denormalized for fast reads */
        fullName: { type: String, trim: true, index: true },

        /* Account controls */
        failedLoginAttempts: { type: Number, default: 0 },
        lastFailedAt: Date,
        lockedUntil: Date,
        lastLogin: Date,

        salary: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, maxlength: 3, uppercase: true },
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
   HOOKS & METHODS
------------------------------------------------------------------- */

// Ensure leaving date is after joining and maintain fullName
EmployeeSchema.pre("save", async function (next) {
    // dateOfLeaving validation
    if (this.dateOfLeaving && this.dateOfLeaving < this.dateOfJoining) {
        return next(new Error("dateOfLeaving must be after dateOfJoining"));
    }

    // Maintain denormalized fullName if contactInfo first/last present
    try {
        const first = this.contactInfo?.firstName?.trim();
        const last = this.contactInfo?.lastName?.trim();
        if (first || last) {
            this.fullName = [first, last].filter(Boolean).join(" ");
        } else if (!this.fullName && this.contactInfo?.email) {
            // fallback partial name from email before migration completes
            const local = this.contactInfo.email.split("@")[0];
            this.fullName = local;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        // don't block save for name normalization issues
    }

    // Hash password when it's new or modified
    if (this.isModified("password")) {
        try {
            const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (err) {
            return next(err as Error);
        }
    }

    next();
});

// Instance method to compare password
EmployeeSchema.methods.comparePassword = function (candidate: string) {
    // this.password may be undefined if not selected; callers must select("+password")
    return bcrypt.compare(candidate, this.password as string);
};

// Return sanitized JSON (strip sensitive fields)
EmployeeSchema.methods.safeToJSON = function () {
    const obj = this.toObject({ getters: true, virtuals: false });
    delete obj.password;
    delete obj.__v;
    delete obj.version;
    return obj;
};

// Static helper to find by email (returns with password selected)
EmployeeSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase().trim() }).select("+password");
};

// Static authenticate helper (returns user doc without password on success)
EmployeeSchema.statics.authenticate = async function (
    email: string,
    password: string
) {
    const user = await this.findOne({ email: email.toLowerCase().trim() }).select(
        "+password failedLoginAttempts lockedUntil"
    );
    if (!user) return null;

    // lockedUntil check (simple example)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
        return null;
    }

    const match = await bcrypt.compare(password, user.password as string);
    if (!match) {
        // increment failed attempts (non-blocking)
        try {
            await this.updateOne(
                { _id: user._id },
                { $inc: { failedLoginAttempts: 1 }, $set: { lastFailedAt: new Date() } }
            ).exec();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
            // ignore update errors
        }
        return null;
    }

    // on success reset failed attempts and set lastLogin
    try {
        await this.updateOne(
            { _id: user._id },
            { $set: { failedLoginAttempts: 0, lastLogin: new Date() } }
        ).exec();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
        // ignore update errors
    }

    // return user without password
    return this.findById(user._id).select("-password");
};

/* ------------------------------------------------------------------
   INDEXES — tuned for common queries and fast lookups
------------------------------------------------------------------- */

// Basic compound index for admin queries (partial to exclude deleted)
EmployeeSchema.index(
    { isDeleted: 1 },
    { partialFilterExpression: { isDeleted: false } }
);

// Recent-first index for lists sorted by recency
EmployeeSchema.index({ createdAt: -1 });

// Unique email index already implied by schema; ensure it's built
EmployeeSchema.index({ email: 1 }, { unique: true, background: true });

// Text index for lightweight search across name/position/email
EmployeeSchema.index(
    { fullName: "text", position: "text", "contactInfo.email": "text" },
    { weights: { fullName: 5, "contactInfo.email": 3, position: 2 } }
);

// Index for company-scoped queries (sparse; only created when companyId exists)
EmployeeSchema.index({ companyId: 1, role: 1 }, { partialFilterExpression: { companyId: { $exists: true } } });

// Index for isDeleted + status filters
EmployeeSchema.index({ isDeleted: 1, status: 1 });

/* ------------------------------------------------------------------
   EXPORT
------------------------------------------------------------------- */

export const EmployeeModel: IEmployeeModel =
    (models.employees as IEmployeeModel) ||
    model<IEmployee, IEmployeeModel>("employees", EmployeeSchema);

export default EmployeeModel;
