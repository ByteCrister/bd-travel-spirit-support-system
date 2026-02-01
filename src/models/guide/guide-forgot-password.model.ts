// guide-model-password.model.ts
import { Document, Schema, Types, Model, ClientSession } from "mongoose";
import { defineModel } from "@/lib/helpers/defineModel";
import {
    FORGOT_PASSWORD_STATUS,
    ForgotPasswordStatus,
} from "@/constants/guide-forgot-password.const";

/**
 * -----------------------------
 * DOCUMENT INTERFACE
 * -----------------------------
 */
export interface IGuideForgotPassword extends Document {
    guideId: Types.ObjectId;

    // Request info
    reason: string;
    status: ForgotPasswordStatus;

    // Review info
    reviewedBy?: Types.ObjectId; // support employee / super admin
    reviewedAt?: Date;
    rejectionReason?: string;

    // Security / lifecycle
    expiresAt: Date;
    emailSentAt?: Date;

    createdAt: Date;
    updatedAt: Date;

    // Instance methods
    approve(adminId: Types.ObjectId, options?: { session?: ClientSession | null }): Promise<void>;
    reject(adminId: Types.ObjectId, reason: string, options?: { session?: ClientSession | null }): Promise<void>;
    markEmailSent(options?: { session?: ClientSession | null }): Promise<void>;
}

/**
 * -----------------------------
 * MODEL TYPE (OPTIONAL BUT CLEAN)
 * -----------------------------
 */
export interface IGuideForgotPasswordModel
    extends Model<IGuideForgotPassword> {
    // Instance methods (transaction-safe)
    approve(
        adminId: Types.ObjectId,
        options?: { session?: ClientSession | null }
    ): Promise<void>;

    reject(
        adminId: Types.ObjectId,
        reason: string,
        options?: { session?: ClientSession | null }
    ): Promise<void>;

    markEmailSent(
        options?: { session?: ClientSession | null }
    ): Promise<void>;

}

/**
 * -----------------------------
 * SCHEMA
 * -----------------------------
 */
const GuideForgotPasswordSchema = new Schema<
    IGuideForgotPassword,
    IGuideForgotPasswordModel
>(
    {
        guideId: {
            type: Schema.Types.ObjectId,
            ref: "Guide",
            required: true,
            index: true,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 500,
        },

        status: {
            type: String,
            enum: Object.values(FORGOT_PASSWORD_STATUS),
            default: FORGOT_PASSWORD_STATUS.PENDING,
            index: true,
        },

        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        reviewedAt: {
            type: Date,
        },

        rejectionReason: {
            type: String,
            trim: true,
            maxlength: 300,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        emailSentAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

/**
 * -----------------------------
 * INDEXES (VERY IMPORTANT)
 * -----------------------------
 */

// Only one active pending request per guide
GuideForgotPasswordSchema.index(
    { guideId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: FORGOT_PASSWORD_STATUS.PENDING,
        },
    }
);

// Auto-delete expired requests
GuideForgotPasswordSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

/**
 * -----------------------------
 * INSTANCE METHODS
 * -----------------------------
 */

GuideForgotPasswordSchema.methods.approve = async function (
    this: IGuideForgotPassword,
    adminId: Types.ObjectId,
    options?: { session?: ClientSession | null }
) {
    const session = options?.session ?? null;

    if (this.status !== FORGOT_PASSWORD_STATUS.PENDING) {
        throw new Error("Only pending requests can be approved");
    }

    this.status = FORGOT_PASSWORD_STATUS.APPROVED;
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();

    await this.save({ session });
};

GuideForgotPasswordSchema.methods.reject = async function (
    this: IGuideForgotPassword,
    adminId: Types.ObjectId,
    reason: string,
    options?: { session?: ClientSession | null }
) {
    const session = options?.session ?? null;

    if (this.status !== FORGOT_PASSWORD_STATUS.PENDING) {
        throw new Error("Only pending requests can be rejected");
    }

    this.status = FORGOT_PASSWORD_STATUS.REJECTED;
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    this.rejectionReason = reason;

    await this.save({ session });
};

GuideForgotPasswordSchema.methods.markEmailSent = async function (
    this: IGuideForgotPassword,
    options?: { session?: ClientSession | null }
) {
    const session = options?.session ?? null;

    this.emailSentAt = new Date();

    await this.save({ session });
};

/**
 * -----------------------------
 * EXPORT USING YOUR WRAPPER ✅
 * -----------------------------
 */
const GuideForgotPasswordModel =
    defineModel<IGuideForgotPassword, IGuideForgotPasswordModel>(
        "GuideForgotPassword",
        GuideForgotPasswordSchema
    );

export default GuideForgotPasswordModel;