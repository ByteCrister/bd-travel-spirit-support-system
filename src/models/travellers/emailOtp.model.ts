import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { TravelerModel } from "./traveler.model";
import { defineModel } from "@/lib/helpers/defineModel";

export enum OTP_PURPOSE {
  SIGNUP = "signup",
  FORGOT_PASSWORD = "forgot_password",
}

export type OtpPurpose = `${OTP_PURPOSE}`;

export interface IEmailOtp {
  email: string;
  tokenHash?: string;
  purpose: OtpPurpose;
  createdAt: Date;
  expiresAt: Date;
  consumed: boolean;
}

export interface IEmailOtpDoc extends mongoose.Document, IEmailOtp {
  verifyRawToken(raw: string): Promise<boolean>;
}

export interface IEmailOtpModel extends mongoose.Model<IEmailOtpDoc> {
  createFor(
    email: string,
    purpose: OtpPurpose,
    opts?: { ttlMinutes?: number; length?: number }
  ): Promise<{ token: string; doc: IEmailOtpDoc }>;

  consumeToken(
    rawToken: string,
    email: string,
    purpose: OtpPurpose
  ): Promise<IEmailOtpDoc | null>;

  revokeByEmail(
    email: string,
    purpose?: OtpPurpose
  ): Promise<number>;
}

const EmailOtpSchema = new Schema<IEmailOtpDoc>(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true },
    purpose: { type: String, enum: Object.values(OTP_PURPOSE), required: true, index: true },
    createdAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date, required: true, index: true },
    consumed: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.tokenHash;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete ret.tokenHash;
        return ret;
      },
    },
  }
);

// Auto-delete on expiry
EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance
EmailOtpSchema.methods.verifyRawToken = async function (raw: string) {
  return bcrypt.compare(raw, this.tokenHash!);
};

// Static: createFor
EmailOtpSchema.statics.createFor = async function (
  email: string,
  purpose: OtpPurpose,
  opts?: { ttlMinutes?: number; length?: number }
) {
  const ttlMinutes = opts?.ttlMinutes ?? 3;  // default 3 minutes
  const length = opts?.length ?? 6;

  const token = crypto.randomInt(0, 10 ** length)
    .toString()
    .padStart(length, "0");

  const tokenHash = await bcrypt.hash(token, 10);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  // revoke old OTP for same purpose
  await this.updateMany(
    { email: email.toLowerCase(), purpose, consumed: false },
    { consumed: true }
  );

  const doc = await this.create({
    email: email.toLowerCase(),
    tokenHash,
    purpose,
    createdAt: now,
    expiresAt,
    consumed: false,
  });

  return { token, doc };
};

// Static: consumeToken
EmailOtpSchema.statics.consumeToken = async function (
  rawToken: string,
  email: string,
  purpose: OtpPurpose
) {
  const doc = await this.findOne({
    email: email.toLowerCase(),
    purpose,
    consumed: false,
  })
    .sort({ createdAt: -1 })
    .exec();

  if (!doc) return null;
  if (!(await doc.verifyRawToken(rawToken))) return null;

  doc.consumed = true;
  await doc.save();

  // Mark user verified for signup OTP
  if (purpose === OTP_PURPOSE.SIGNUP) {
    const user = await TravelerModel.findOne({ email: email.toLowerCase() });
    if (user && !user.isVerified) {
      user.isVerified = true;
      if (user.accountStatus === "pending") user.accountStatus = "active";
      await user.save();
    }
  }

  return doc;
};

// Static: revokeByEmail
EmailOtpSchema.statics.revokeByEmail = async function (
  email: string,
  purpose?: OtpPurpose
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = { email: email.toLowerCase(), consumed: false };
  if (purpose) filter.purpose = purpose;

  const res = await this.updateMany(filter, { consumed: true });

  return (res.modifiedCount ?? 0) as number;
};

const EmailOtpModel = defineModel("EmailOtp", EmailOtpSchema);

export default EmailOtpModel;