// models/Employee.ts
import { Schema, Document, Types, Connection } from "mongoose";

export type EmployeeRole = "coordinator" | "support" | "manager";
export type EmployeeStatus = "active" | "onLeave" | "suspended" | "terminated";
export type EmploymentType = "full_time" | "part_time" | "contract" | "intern";

export interface IEmployee extends Document {
    userId: Types.ObjectId;                       // Linked User profile
    hostId?: Types.ObjectId;                      // Optional supervisor/host
    role: EmployeeRole;                           // Core role category
    position?: string;                            // Display title
    status: EmployeeStatus;                       // Current employment state
    employmentType?: EmploymentType;              // Employment category
    department?: string;                          // Department/Team name
    salary?: number;                              // Numeric amount
    salaryCurrency?: string;                      // ISO currency code, e.g. "USD"
    dateOfJoining: Date;
    dateOfLeaving?: Date;
    contactInfo: {
        phone?: string;
        email?: string;
        emergencyContact?: {
            name: string;
            phone: string;
            relation: string;
        };
    };
    permissions: string[];                        // Feature/action-level permissions
    shifts?: {
        startTime: string;
        endTime: string;
        days: string[];
    }[];
    performance: {
        rating?: number;
        lastReview?: Date;
        feedback?: string;
    };
    documents?: {
        type: string;                               // Document type
        url: string;                                // File link
        uploadedAt: Date;
    }[];
    notes?: string;                               // Optional internal notes
    audit: {
        createdBy: Types.ObjectId;
        updatedBy: Types.ObjectId;
    };
    isDeleted?: boolean;                          // Soft delete flag
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
        hostId: { type: Schema.Types.ObjectId, ref: "users", index: true },
        role: { type: String, enum: ["coordinator", "support", "manager"], required: true, index: true },
        position: { type: String, trim: true, maxlength: 100 },
        status: { type: String, enum: ["active", "onLeave", "suspended", "terminated"], default: "active", index: true },
        employmentType: { type: String, enum: ["full_time", "part_time", "contract", "intern"] },
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
            createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
            updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
        },
        isDeleted: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

// Compound index for common admin filters
EmployeeSchema.index({ hostId: 1, status: 1 });

export const getEmployeeModel = (db: Connection) =>
    db.models.employees || db.model<IEmployee>("employees", EmployeeSchema);
