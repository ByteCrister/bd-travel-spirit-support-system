// models/site-settings/advertising.model.ts

import { Schema, Model, Types, HydratedDocument } from "mongoose";
import { PLACEMENT, PlacementType } from "@/constants/advertising.const";
import { Currency, CURRENCY } from "@/constants/tour.const";
import { defineModel } from "@/lib/helpers/defineModel";


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

/**
 * Single advertising price/config document
 */
export interface IAdvertisingDoc {
    _id?: ObjectId;
    placement: PlacementType;
    price: number;
    currency: Currency;
    defaultDurationDays?: number;
    allowedDurationsDays?: number[];
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Model interface
 */
export interface AdvertisingSettingModel extends Model<IAdvertisingDoc> {
    upsertByPlacement(payload: Partial<IAdvertisingDoc>): Promise<HydratedDocument<IAdvertisingDoc>>;
}

/**
 * Schema — root document = AdvertisingPrice fields
 */
const AdvertisingSettingSchema = new Schema<IAdvertisingDoc>(
    {
        placement: {
            type: String,
            enum: Object.values(PLACEMENT),
            required: true,
        },
        price: { type: Number, required: true },
        currency: { type: String, default: CURRENCY.BDT },
        defaultDurationDays: { type: Number },
        allowedDurationsDays: { type: [Number], default: [] },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

/**
 * Upsert by placement (NOT singleton)
 */
AdvertisingSettingSchema.statics.upsertByPlacement = async function (
    payload: Partial<IAdvertisingDoc>
): Promise<HydratedDocument<IAdvertisingDoc>> {
    if (!payload.placement) {
        throw new Error("placement is required for upsertByPlacement()");
    }

    const existing = await this.findOne({ placement: payload.placement });

    if (!existing) {
        return this.create(payload);
    }

    Object.assign(existing, payload);
    await existing.save();
    return existing;
};

/**
 * Model
 */
const AdvertisingSetting = defineModel("AdvertisingSetting", AdvertisingSettingSchema);

export default AdvertisingSetting;