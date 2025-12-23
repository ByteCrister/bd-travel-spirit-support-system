import { Currency, CURRENCY } from "@/constants/tour.const";
import { defineModel } from "@/lib/helpers/defineModel";
import restoredSuffix from "@/lib/helpers/restore-suffix";
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
    deletedAt?: Date | null;
}


/**
 * Model statics + typed query helpers
 */
export interface SubscriptionTierSettingModel
    extends Model<ISubscriptionTierSetting> {
    upsertByKey(
        payload: Partial<ISubscriptionTierSetting>
    ): Promise<HydratedDocument<ISubscriptionTierSetting>>;
    softDeleteById(id: string): Promise<HydratedDocument<ISubscriptionTierSetting> | null>;
    restoreById(id: string): Promise<HydratedDocument<ISubscriptionTierSetting> | null>;
}

/**
 * Schema with generics: <DocType, ModelType, InstanceMethods = {}, QueryHelpers = {}>
 * Using Record<string, never> instead of {} for empty object type
 */
const SubscriptionTierSettingSchema = new Schema<
    ISubscriptionTierSetting,
    SubscriptionTierSettingModel,
    Record<string, never>  // Changed from {} to Record<string, never>
>(
    {
        key: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: CURRENCY.BDT },
        billingCycleDays: { type: [Number], default: [] },
        perks: { type: [String], default: [] },
        active: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

/* Statics and query helper implementations */
SubscriptionTierSettingSchema.statics.upsertByKey = async function (
    payload: Partial<ISubscriptionTierSetting>
): Promise<HydratedDocument<ISubscriptionTierSetting>> {
    if (!payload.key) throw new Error("key is required for upsertByKey");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = payload;

    const existing = await this.findOne({ key: rest.key, deletedAt: null });

    if (!existing) {
        const deleted = await this.findOne({ key: rest.key, deletedAt: { $ne: null } });
        if (deleted) {
            Object.assign(deleted, rest);
            deleted.deletedAt = null;
            await deleted.save();
            return deleted;
        }
        return this.create(rest);
    }

    Object.assign(existing, rest);
    await existing.save();
    return existing;
};

SubscriptionTierSettingSchema.statics.softDeleteById = async function (id: string) {
    return this.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });
};

SubscriptionTierSettingSchema.statics.restoreById = async function (
    id: string
): Promise<HydratedDocument<ISubscriptionTierSetting> | null> {
    // find the deleted doc
    const deletedDoc = await this.findOne({ _id: id, deletedAt: { $ne: null } });
    if (!deletedDoc) return null;

    // check for conflicts with non-deleted docs
    const conflicts: { key?: boolean; title?: boolean } = {};

    if (deletedDoc.key) {
        const keyConflict = await this.findOne({ key: deletedDoc.key, deletedAt: null }).lean().exec();
        if (keyConflict) conflicts.key = true;
    }

    if (deletedDoc.title) {
        const titleConflict = await this.findOne({ title: deletedDoc.title, deletedAt: null }).lean().exec();
        if (titleConflict) conflicts.title = true;
    }

    // if conflicts exist, append suffix(es)
    if (conflicts.key) {
        deletedDoc.key = `${deletedDoc.key}${restoredSuffix()}`;
    }
    if (conflicts.title) {
        deletedDoc.title = `${deletedDoc.title}${restoredSuffix()}`;
    }

    // clear deletedAt and save
    deletedDoc.deletedAt = null;
    await deletedDoc.save();
    return deletedDoc;
};

const SubscriptionTierSetting = defineModel(
    "SubscriptionTierSetting",
    SubscriptionTierSettingSchema
) as SubscriptionTierSettingModel;

export default SubscriptionTierSetting;