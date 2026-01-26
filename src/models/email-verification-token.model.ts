import mongoose, { ClientSession, Document, FilterQuery, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
    EMAIL_VERIFICATION_PURPOSE,
    EMAIL_VERIFICATION_PURPOSE_VALUES,
    EMAIL_VERIFICATION_EXPIRY,
    EmailVerificationPurpose,
} from '@/constants/email-verification-purpose.const';
import { defineModel } from '@/lib/helpers/defineModel';

/* =======================
   Interfaces
======================= */

export interface IEmailVerificationToken extends Document {
    email: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    usedAt?: Date;
    purpose: EmailVerificationPurpose;

    isValid(): boolean;
    markAsUsed(session?: ClientSession): Promise<void>;
    compareToken(candidateToken: string): Promise<boolean>;
}

interface IEmailVerificationTokenModel
    extends Model<IEmailVerificationToken> {
    generateToken(
        email: string,
        purpose: EmailVerificationPurpose,
        session?: ClientSession
    ): Promise<string>;

    findByToken(
        email: string,
        token: string,
        session?: ClientSession
    ): Promise<IEmailVerificationToken | null>;

    cleanupExpiredTokens(session?: ClientSession): Promise<number>;

    invalidatePreviousTokens(
        email: string,
        purpose?: EmailVerificationPurpose,
        session?: ClientSession
    ): Promise<number>;
}

/* =======================
   Schema
======================= */

const emailVerificationTokenSchema =
    new mongoose.Schema<IEmailVerificationToken, IEmailVerificationTokenModel>(
        {
            email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
                match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
            },

            token: {
                type: String,
                required: true,
                unique: true,
            },

            expiresAt: {
                type: Date,
                required: true,
            },

            createdAt: {
                type: Date,
                default: Date.now,
            },

            usedAt: {
                type: Date,
                default: null,
            },

            purpose: {
                type: String,
                enum: EMAIL_VERIFICATION_PURPOSE_VALUES,
                default: EMAIL_VERIFICATION_PURPOSE.GUIDE_APPLICATION,
                required: true,
            },
        },
        {
            timestamps: false,
            versionKey: false,
        }
    );

/* =======================
   Indexes
======================= */

emailVerificationTokenSchema.index({ email: 1, purpose: 1 });
emailVerificationTokenSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

/* =======================
   Instance Methods
======================= */

emailVerificationTokenSchema.methods.isValid = function (): boolean {
    return !this.usedAt && Date.now() < this.expiresAt.getTime();
};

emailVerificationTokenSchema.methods.markAsUsed = async function (
    session?: ClientSession
) {
    this.usedAt = new Date();
    await this.save({ session });
};

emailVerificationTokenSchema.methods.compareToken = function (
    candidateToken: string
) {
    return bcrypt.compare(candidateToken, this.token);
};

/* =======================
   Static Methods
======================= */

emailVerificationTokenSchema.statics.generateToken = async function (
    email: string,
    purpose: EmailVerificationPurpose = EMAIL_VERIFICATION_PURPOSE.GUIDE_APPLICATION,
    session?: ClientSession
): Promise<string> {
    await this.invalidatePreviousTokens(email, purpose, session);

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = await bcrypt.hash(token, 10);

    await this.create([{
        email,
        token: hashedToken,
        purpose,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY[purpose]),
    }], { session });

    return token;
};

emailVerificationTokenSchema.statics.findByToken = async function (
    email: string,
    plainToken: string,
    session?: ClientSession
) {
    const tokens = await this.find({
        email,
        usedAt: null,
        expiresAt: { $gt: new Date() },
    }).session(session || null);

    for (const tokenDoc of tokens) {
        if (await tokenDoc.compareToken(plainToken)) {
            return tokenDoc;
        }
    }

    return null;
};

emailVerificationTokenSchema.statics.cleanupExpiredTokens = async function (
    session?: ClientSession
) {
    const result = await this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { usedAt: { $ne: null } },
        ],
    }).session(session || null);

    return result.deletedCount ?? 0;
};

emailVerificationTokenSchema.statics.invalidatePreviousTokens =
    async function (
        email: string,
        purpose?: EmailVerificationPurpose,
        session?: ClientSession
    ) {
        const query: FilterQuery<IEmailVerificationToken> = {
            email,
            usedAt: null,
            expiresAt: { $gt: new Date() },
        };

        if (purpose) query.purpose = purpose;

        const result = await this.updateMany(query, {
            $set: { usedAt: new Date() },
        }).session(session || null);

        return result.modifiedCount ?? 0;
    };

/* =======================
   Model Export
======================= */

export const EmailVerificationToken = defineModel<
    IEmailVerificationToken,
    IEmailVerificationTokenModel
>('EmailVerificationToken', emailVerificationTokenSchema);