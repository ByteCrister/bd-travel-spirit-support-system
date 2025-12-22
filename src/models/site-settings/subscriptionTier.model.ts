// models/subscriptionTier.ts
import { Currency, CURRENCY } from "@/constants/tour.const";
import { defineModel } from "@/lib/helpers/defineModel";
import { Schema, Model, Types } from "mongoose";
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = payload; // ignore _id
    const existing = await this.findOne({ key: rest.key });
    if (!existing) {
        return this.create(rest);
    }
    Object.assign(existing, rest);
    await existing.save();
    return existing;
};

const SubscriptionTierSetting = defineModel("SubscriptionTierSetting", SubscriptionTierSettingSchema) as SubscriptionTierSettingModel;;

export default SubscriptionTierSetting;