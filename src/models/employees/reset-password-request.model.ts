// models/reset-password-request.model.ts
import { Schema, Document, Types, Model, ClientSession } from "mongoose";
import { defineModel } from "@/lib/helpers/defineModel";
import { REQUEST_STATUS, RequestStatus } from "@/constants/reset-password-request.const";

/* =========================================================
   INTERFACES
========================================================= */

export interface IResetPasswordRequest extends Document {
    user: Types.ObjectId;          // User who requested
    employee?: Types.ObjectId;     // Optional employee reference

    description?: string;          // Employee-provided context
    denialReason?: string;         // Admin reason (only if denied)

    status: RequestStatus;

    requestedAt: Date;
    reviewedAt?: Date;
    fulfilledAt?: Date;

    requestedFromIP?: string;
    requestedAgent?: string;

    reviewedBy?: Types.ObjectId;   // Admin user
}

/* =========================================================
   MODEL STATICS
========================================================= */

export interface ResetPasswordRequestModel
    extends Model<IResetPasswordRequest> {

    createRequest(payload: {
        userId: Types.ObjectId;
        employeeId?: Types.ObjectId;
        description?: string;
        ip?: string;
        agent?: string;
    }, session?: ClientSession
    ): Promise<IResetPasswordRequest>;

    findPending(limit?: number): Promise<IResetPasswordRequest[]>;
}

/* =========================================================
   SCHEMA
========================================================= */

const ResetPasswordRequestSchema = new Schema<IResetPasswordRequest>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
        },

        denialReason: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        status: {
            type: String,
            enum: Object.values(REQUEST_STATUS),
            default: REQUEST_STATUS.PENDING,
            index: true,
        },

        requestedAt: {
            type: Date,
            default: Date.now,
            required: true,
        },

        reviewedAt: Date,
        fulfilledAt: Date,

        requestedFromIP: String,
        requestedAgent: String,

        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        strict: true,
    }
);

/* =========================================================
   INDEXES
========================================================= */

ResetPasswordRequestSchema.index({ user: 1, status: 1 });
ResetPasswordRequestSchema.index({ status: 1, requestedAt: -1 });

/* =========================================================
   STATICS
========================================================= */

ResetPasswordRequestSchema.statics.createRequest = function (
    payload,
    session?: ClientSession
) {
    return this.create(
        [
            {
                user: payload.userId,
                employee: payload.employeeId,
                description: payload.description,
                requestedFromIP: payload.ip,
                requestedAgent: payload.agent,
            },
        ],
        session ? { session } : undefined
    );
};

ResetPasswordRequestSchema.statics.findPending = function (limit = 50) {
    return this.find({ status: REQUEST_STATUS.PENDING })
        .sort({ requestedAt: -1 })
        .limit(limit)
        .exec();
};

/* =========================================================
   MODEL EXPORT
========================================================= */

const ResetPasswordRequestModel = defineModel<
    IResetPasswordRequest,
    ResetPasswordRequestModel
>("ResetPasswordRequest", ResetPasswordRequestSchema);

export default ResetPasswordRequestModel;