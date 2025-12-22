// models/reset-password-request.model.ts
import { REQUEST_STATUS, RequestStatus } from "@/constants/reset-password-request.const";
import { USER_ROLE } from "@/constants/user.const";
import { defineModel } from "@/lib/helpers/defineModel";
import { Schema, Document } from "mongoose";
const ALLOWED_REQUESTER_ROLES = [USER_ROLE.ASSISTANT, USER_ROLE.SUPPORT] as const;

export interface IResetPasswordRequest extends Document {
    requesterEmail: string;
    requesterMobile?: string;
    requesterName?: string;
    requesterRole: USER_ROLE;

    // visible in email
    description?: string;
    reason?: string; // only used when status === "denied"
    status: RequestStatus;

    // internal tracking (not sent in email)
    requestedAt: Date;
    requestedFromIP?: string;
    requestedAgent?: string;

    reviewedAt?: Date;
    fulfilledAt?: Date;

    // methods
    markApproved(adminMeta?: { adminId?: string; adminName?: string; adminEmail?: string }): Promise<IResetPasswordRequest>;
    markDenied(reason: string, adminMeta?: { adminId?: string; adminName?: string; adminEmail?: string }): Promise<IResetPasswordRequest>;
    fulfill(adminMeta?: { adminId?: string; adminName?: string; adminEmail?: string }, tempPassword?: string): Promise<IResetPasswordRequest>;
    cancel(reason?: string): Promise<IResetPasswordRequest>;

    // presentation helper - payload safe to include in emails
    toEmailPayload(): {
        requesterEmail: string;
        requesterName?: string;
        requesterRole: USER_ROLE;
        requesterMobile?: string;
        status: RequestStatus;
        description?: string;
        reason?: string | undefined;
    };
}

const ResetPasswordRequestSchema = new Schema<IResetPasswordRequest>(
    {
        requesterEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: /^\S+@\S+\.\S+$/,
        },
        requesterMobile: { type: String, trim: true },
        requesterName: { type: String, trim: true },
        requesterRole: {
            type: String,
            enum: ALLOWED_REQUESTER_ROLES,
            required: true,
            default: USER_ROLE.ASSISTANT,
        },

        // Visible fields for email
        description: { type: String, trim: true }, // employee explains reason for reset
        reason: { type: String, trim: true }, // admin reason for denial (set when denied)
        status: {
            type: String,
            enum: Object.values(REQUEST_STATUS),
            default: REQUEST_STATUS.PENDING,
            required: true,
            index: true,
        },

        // Internal tracking fields (not to be sent in email)
        requestedAt: { type: Date, default: () => new Date(), required: true },
        requestedFromIP: { type: String },
        requestedAgent: { type: String },

        reviewedAt: { type: Date },
        fulfilledAt: { type: Date },

    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
ResetPasswordRequestSchema.index({ requesterEmail: 1, status: 1 });
ResetPasswordRequestSchema.index({ requesterMobile: 1, status: 1 });
ResetPasswordRequestSchema.index({ requesterRole: 1, requestedAt: -1 });

// Static helper to create a request
ResetPasswordRequestSchema.statics.createRequest = async function (payload: {
    email: string;
    mobile?: string;
    name?: string;
    role: USER_ROLE;
    description?: string;
    requestedFromIP?: string;
    requestedAgent?: string;
}) {
    const doc = new this({
        requesterEmail: payload.email.toLowerCase().trim(),
        requesterMobile: payload.mobile?.trim(),
        requesterName: payload.name?.trim(),
        requesterRole: payload.role,
        description: payload.description?.trim(),
        requestedFromIP: payload.requestedFromIP,
        requestedAgent: payload.requestedAgent,
        status: REQUEST_STATUS.PENDING,
        requestedAt: new Date(),
    });
    return doc.save();
};

// Static to fetch pending requests
ResetPasswordRequestSchema.statics.findPending = function (limit = 50) {
    return this.find({ status: REQUEST_STATUS.PENDING }).sort({ requestedAt: -1 }).limit(limit).exec();
};

// Instance methods

ResetPasswordRequestSchema.methods.markApproved = async function (this: IResetPasswordRequest) {
    if (this.status !== REQUEST_STATUS.PENDING) throw new Error("Only pending requests can be approved");
    this.status = REQUEST_STATUS.FULFILLED; // approve flow: directly mark as fulfilled only if your process wants that; otherwise set to a dedicated APPROVED constant
    this.reviewedAt = new Date();
    // keep adminMeta in review note if needed; we avoid storing admin fields here per request
    return this.save();
};

ResetPasswordRequestSchema.methods.markDenied = async function (this: IResetPasswordRequest, reason: string) {
    if (this.status !== REQUEST_STATUS.PENDING) throw new Error("Only pending requests can be denied");
    this.status = REQUEST_STATUS.DENIED;
    this.reason = reason?.trim();
    this.reviewedAt = new Date();
    return this.save();
};

ResetPasswordRequestSchema.methods.fulfill = async function (this: IResetPasswordRequest) {
    if (this.status === REQUEST_STATUS.FULFILLED) throw new Error("Request already fulfilled");
    // depending on your flow you may require prior denial/approval; here we allow fulfilling from pending or denied states
    this.status = REQUEST_STATUS.FULFILLED;
    this.fulfilledAt = new Date();
    // Do NOT persist tempPassword to this model; if you must, store elsewhere or remove ASAP. We intentionally do not accept tempPassword here for persistence.
    return this.save();
};


ResetPasswordRequestSchema.methods.toEmailPayload = function (this: IResetPasswordRequest) {
    // returns only the fields that should be sent in the notification email
    return {
        requesterEmail: this.requesterEmail,
        requesterName: this.requesterName,
        requesterRole: this.requesterRole,
        requesterMobile: this.requesterMobile,
        status: this.status,
        description: this.description,
        reason: this.status === REQUEST_STATUS.DENIED ? this.reason : undefined,
    };
};

export const ResetPasswordRequestModel = defineModel("ResetPasswordRequest", ResetPasswordRequestSchema);

export default ResetPasswordRequestModel;