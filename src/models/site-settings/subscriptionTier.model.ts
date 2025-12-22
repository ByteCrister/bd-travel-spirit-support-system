// models/subscriptionTier.ts
import { Currency, CURRENCY } from "@/constants/tour.const";
import { Schema, Model, Types, models, model } from "mongoose";
import type { HydratedDocument } from "mongoose";

// imported currency type
/**
 * export enum CURRENCY {
   BDT = "BDT",
   USD = "USD",
   INR = "INR",
 }
 export type Currency = `${CURRENCY}`;
 */

export type ObjectId = Types.ObjectId;

export interface ISubscriptionTierSetting {
    _id?: ObjectId;
    key: string;
    title: string;
    price: number;
    currency: Currency;
    billingCycleDays: number[];
    perks?: string[];
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface SubscriptionTierSettingModel extends Model<ISubscriptionTierSetting> {
    upsertByKey(payload: Partial<ISubscriptionTierSetting>): Promise<HydratedDocument<ISubscriptionTierSetting>>;
}

const SubscriptionTierSettingSchema = new Schema<ISubscriptionTierSetting>(
    {
        key: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: CURRENCY.BDT },
        billingCycleDays: { type: [Number], default: [] },
        perks: { type: [String], default: [] },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

SubscriptionTierSettingSchema.statics.upsertByKey = async function (
    payload: Partial<ISubscriptionTierSetting>
): Promise<HydratedDocument<ISubscriptionTierSetting>> {
    if (!payload.key) throw new Error("key is required for upsertByKey");
    const existing = await this.findOne({ key: payload.key });
    if (!existing) {
        return this.create(payload);
    }
    Object.assign(existing, payload);
    await existing.save();
    return existing;
};

const SubscriptionTierSetting =
    (models.SubscriptionTierSetting as SubscriptionTierSettingModel) ||
    model<ISubscriptionTierSetting, SubscriptionTierSettingModel>("SubscriptionTierSetting", SubscriptionTierSettingSchema);

export default SubscriptionTierSetting;
