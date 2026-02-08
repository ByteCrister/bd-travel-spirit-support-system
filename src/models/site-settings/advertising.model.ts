import {
    Schema,
    Model,
    Types,
    HydratedDocument,
    ClientSession,
} from "mongoose";

import { PLACEMENT, PlacementType } from "@/constants/advertising.const";
import { Currency, CURRENCY } from "@/constants/tour.const";
import { defineModel } from "@/lib/helpers/defineModel";
import type { AdvertisingPriceDTO } from "@/types/advertising/advertising-settings.types";
import { withTransaction } from "@/lib/helpers/withTransaction";

export type ObjectId = Types.ObjectId;

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface IAdvertisingDoc {
    _id: ObjectId;
    title: string;
    placement: PlacementType;
    price: number;
    currency: Currency;
    defaultDurationDays?: number | null;
    allowedDurationsDays?: number[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

export type IAdvertisingLeanDoc = Omit<IAdvertisingDoc, "_id"> & {
    _id: string;
};

type TransformRet = {
    _id?: Types.ObjectId | string;
    __v?: number;
    id?: string;
    [key: string]: unknown;
};

/* -------------------------------------------------------------------------- */
/*                              Model Interface                                */
/* -------------------------------------------------------------------------- */

export interface AdvertisingSettingModel extends Model<IAdvertisingDoc> {
    upsertByPlacement(
        payload: Partial<IAdvertisingDoc>,
        session?: ClientSession
    ): Promise<HydratedDocument<IAdvertisingDoc>>;

    softDeleteById(
        id: string | ObjectId,
        session?: ClientSession
    ): Promise<HydratedDocument<IAdvertisingDoc> | null>;

    restoreById(
        id: string | ObjectId,
        session?: ClientSession
    ): Promise<HydratedDocument<IAdvertisingDoc> | null>;

    findActive(
        filter?: Partial<IAdvertisingDoc>,
        session?: ClientSession
    ): Promise<HydratedDocument<IAdvertisingDoc>[]>;

    findDeleted(
        filter?: Partial<IAdvertisingDoc>,
        session?: ClientSession
    ): Promise<HydratedDocument<IAdvertisingDoc>[]>;

    findActiveLean(
        filter?: Partial<IAdvertisingDoc>,
        session?: ClientSession
    ): Promise<IAdvertisingLeanDoc[]>;

    toDTO(doc: IAdvertisingDoc | IAdvertisingLeanDoc): AdvertisingPriceDTO;
}

/* -------------------------------------------------------------------------- */
/*                                   DTO                                      */
/* -------------------------------------------------------------------------- */

export function advertisingToDTO(
    doc: IAdvertisingDoc | IAdvertisingLeanDoc
): AdvertisingPriceDTO {
    return {
        id: doc._id.toString(),
        title: doc.title,
        placement: doc.placement,
        price: doc.price,
        currency: doc.currency,
        defaultDurationDays: doc.defaultDurationDays ?? undefined,
        allowedDurationsDays: doc.allowedDurationsDays ?? [],
        active: doc.active,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}

/* -------------------------------------------------------------------------- */
/*                                   Schema                                   */
/* -------------------------------------------------------------------------- */

const AdvertisingSettingSchema = new Schema<
    IAdvertisingDoc,
    AdvertisingSettingModel
>(
    {
        title: {
            type: String,
            required: true,
            index: true,
        },
        placement: {
            type: String,
            enum: Object.values(PLACEMENT),
            required: true,
            index: true,
        },
        price: { type: Number, required: true, min: 0 },
        currency: {
            type: String,
            enum: Object.values(CURRENCY),
            default: CURRENCY.BDT,
        },
        defaultDurationDays: {
            type: Number,
            min: 1,
            default: null,
        },
        allowedDurationsDays: {
            type: [Number],
            default: [],
            validate: {
                validator: (arr: number[]) => arr.every(d => d > 0),
                message: "All durations must be positive numbers",
            },
        },
        active: { type: Boolean, default: true, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_: unknown, ret: TransformRet) {
                if (ret?._id) {
                    ret.id =
                        typeof ret._id === "string"
                            ? ret._id
                            : (ret._id as Types.ObjectId).toString();
                }
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            transform(_: unknown, ret: TransformRet) {
                if (ret?._id) {
                    ret.id =
                        typeof ret._id === "string"
                            ? ret._id
                            : (ret._id as Types.ObjectId).toString();
                }
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

/* -------------------------------------------------------------------------- */
/*                                   Indexes                                  */
/* -------------------------------------------------------------------------- */

AdvertisingSettingSchema.index(
    { placement: 1, deletedAt: 1 },
    { unique: true }
);
AdvertisingSettingSchema.index({ active: 1, deletedAt: 1 });

/* -------------------------------------------------------------------------- */
/*                                Statics                                     */
/* -------------------------------------------------------------------------- */

AdvertisingSettingSchema.statics.upsertByPlacement = async function (
    payload: Partial<IAdvertisingDoc>,
    session?: ClientSession
) {
    if (!payload.placement) {
        throw new Error("placement is required for upsertByPlacement()");
    }
    return withTransaction(async (s) => {
        const existing = await this.findOne({
            _id: payload._id,
            deletedAt: null,
        }).session(s);

        if (existing) {
            Object.assign(existing, payload);
            await existing.save({ session: s });
            return existing;
        }

        const deleted = await this.findOne({
            placement: payload.placement,
            deletedAt: { $ne: null },
        }).session(s);

        if (deleted) {
            deleted.deletedAt = null;
            Object.assign(deleted, payload);
            await deleted.save({ session: s });
            return deleted;
        }

        const [created] = await this.create([payload], { session: s });
        return created;

    }, session)
};

AdvertisingSettingSchema.statics.softDeleteById = async function (
    id: string | ObjectId,
    session?: ClientSession
) {
    return withTransaction(async (s) => {
        const doc = await this.findById(id).session(s);
        if (!doc || doc.deletedAt) return null;

        doc.deletedAt = new Date();
        doc.active = false;
        await doc.save({ session: s });

        return doc;
    }, session)
};

AdvertisingSettingSchema.statics.restoreById = async function (
    id: string | ObjectId,
    session?: ClientSession
) {
    return withTransaction(async (s) => {
        const doc = await this.findById(id).session(s);
        if (!doc || !doc.deletedAt) return null;

        const conflict = await this.findOne({
            _id: { $ne: doc._id },
            placement: doc.placement,
            deletedAt: null,
        }).session(s);

        if (conflict) {
            throw new Error(
                `Cannot restore: Active document already exists for placement "${doc.placement}"`
            );
        }

        doc.deletedAt = null;
        await doc.save({ session: s });
        return doc;
    }, session)
};

AdvertisingSettingSchema.statics.findActive = function (
    filter: Partial<IAdvertisingDoc> = {},
    session?: ClientSession
) {
    return withTransaction(async (s) => {
        return this.find({ deletedAt: null, ...filter }).session(s);
    }, session)
};

AdvertisingSettingSchema.statics.findDeleted = function (
    filter: Partial<IAdvertisingDoc> = {},
    session?: ClientSession
) {
    return withTransaction(async (s) => {
        return this.find({ deletedAt: { $ne: null }, ...filter }).session(s);
    }, session)
};

AdvertisingSettingSchema.statics.findActiveLean = async function (
    filter: Partial<IAdvertisingDoc> = {},
    session?: ClientSession
) {
    return withTransaction(async (s) => {
        const docs = await this.find({ deletedAt: null, ...filter })
            .session(s)
            .sort({ placement: 1 })
            .lean();

        return docs.map(doc => ({
            ...doc,
            _id: doc._id.toString(),
        })) as IAdvertisingLeanDoc[];
    }, session)
};

AdvertisingSettingSchema.statics.toDTO = advertisingToDTO;

/* -------------------------------------------------------------------------- */
/*                              Middleware                                    */
/* -------------------------------------------------------------------------- */

AdvertisingSettingSchema.pre("save", function (next) {
    const defaultDays = this.defaultDurationDays ?? undefined;
    const allowed = this.allowedDurationsDays ?? [];

    if (
        defaultDays !== undefined &&
        defaultDays !== null &&
        allowed.length > 0 &&
        !allowed.includes(defaultDays)
    ) {
        allowed.push(defaultDays);
        allowed.sort((a, b) => a - b);
        this.allowedDurationsDays = allowed;
    }

    next();
});

/* -------------------------------------------------------------------------- */
/*                                   Model                                    */
/* -------------------------------------------------------------------------- */

const AdvertisingSetting = defineModel<
    IAdvertisingDoc,
    AdvertisingSettingModel
>("AdvertisingSetting", AdvertisingSettingSchema);

export default AdvertisingSetting;