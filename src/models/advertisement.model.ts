import {
    AD_STATUS,
    AdStatusType,
    PLACEMENT,
    PlacementType,
} from "@/constants/advertising.const";
import mongoose, { Schema, Document, Model, Types, Query } from "mongoose";

/* -------------------------------------------
 * SNAPSHOT (EMBEDDED PLAN)
 * ----------------------------------------- */

export interface IPlanSnapshot {
    name: string;
    placements: PlacementType[];
    price: number;
    currency: string;
    durationDays: number;
    description?: string;
}

const PlanSnapshotSchema = new Schema<IPlanSnapshot>(
    {
        name: { type: String, required: true },
        placements: {
            type: [String],
            enum: Object.values(PLACEMENT),
            required: true,
        },
        price: { type: Number, required: true },
        currency: { type: String, required: true },
        durationDays: { type: Number, required: true },
        description: { type: String },
    },
    { _id: false }
);

/* -------------------------------------------
 * ADVERTISEMENT DOCUMENT
 * ----------------------------------------- */

export interface IAdvertisement {
    guideId: Types.ObjectId;
    tourId?: Types.ObjectId;
    title?: string;

    snapshot: IPlanSnapshot;

    status: AdStatusType;
    reason?: string;

    startAt?: Date;
    endAt?: Date;

    autoRenew: boolean;
    renewCount: number;

    impressions: number;
    clicks: number;

    paymentRef?: string;
    note?: string;

    createdBy?: Types.ObjectId;

    isDeleted: boolean;
    deletedAt?: Date | null;
    deletedBy?: Types.ObjectId | null;
}

/* -------------------------------------------
 * INSTANCE METHODS
 * ----------------------------------------- */

export interface IAdvertisementMethods {
    getExpiryDate(): Date | undefined;
    isActive(): boolean;
}

/* -------------------------------------------
 * STATIC MODEL METHODS
 * ----------------------------------------- */

export interface AdvertisementModel
    extends Model<IAdvertisement, Record<string, never>, IAdvertisementMethods> {
    softDeleteById(
        id: Types.ObjectId,
        deletedBy?: Types.ObjectId
    ): Promise<(IAdvertisement & Document) | null>;
    restoreById(id: Types.ObjectId): Promise<(IAdvertisement & Document) | null>;
}

/* -------------------------------------------
 * SCHEMA
 * ----------------------------------------- */

const AdSchema = new Schema<
    IAdvertisement,
    AdvertisementModel,
    IAdvertisementMethods
>(
    {
        guideId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Guide",
            index: true,
        },
        tourId: { type: Schema.Types.ObjectId, ref: "Tour" },
        title: { type: String },

        snapshot: { type: PlanSnapshotSchema, required: true },

        status: {
            type: String,
            enum: Object.values(AD_STATUS),
            default: AD_STATUS.Draft,
            index: true,
        },

        reason: { type: String, default: "" },

        startAt: { type: Date },
        endAt: { type: Date, index: true },

        autoRenew: { type: Boolean, default: false },
        renewCount: { type: Number, default: 0 },

        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },

        paymentRef: { type: String },
        note: { type: String },

        createdBy: { type: Schema.Types.ObjectId, ref: "employees" },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: "employees",
            default: null,
        },
    },
    { timestamps: true }
);

/* -------------------------------------------
 * INSTANCE METHODS
 * ----------------------------------------- */

AdSchema.method("getExpiryDate", function getExpiryDate() {
    if (this.endAt) return this.endAt;
    if (this.startAt) {
        return new Date(
            this.startAt.getTime() + this.snapshot.durationDays * 86400000
        );
    }
    return undefined;
});

AdSchema.method("isActive", function isActive() {
    if (this.status !== AD_STATUS.Active) return false;
    const now = new Date();
    return (
        (!this.startAt || this.startAt <= now) && (!this.endAt || this.endAt > now)
    );
});

/* -------------------------------------------
 * STATIC METHODS
 * ----------------------------------------- */

AdSchema.static("softDeleteById", function softDeleteById(id, deletedBy) {
    return this.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date(), deletedBy },
        { new: true }
    );
});

AdSchema.static("restoreById", function restoreById(id) {
    return this.findByIdAndUpdate(
        id,
        { isDeleted: false, deletedAt: null, deletedBy: null },
        { new: true }
    );
});

/* -------------------------------------------
 * MIDDLEWARE
 * ----------------------------------------- */

function excludeDeleted(this: Query<unknown, unknown>, next: () => void) {
    const q = this.getQuery();
    if ("isDeleted" in q || this.getOptions()?.withDeleted) return next();
    this.setQuery({ ...q, isDeleted: false });
    next();
}

AdSchema.pre("find", excludeDeleted);
AdSchema.pre("findOne", excludeDeleted);
AdSchema.pre("countDocuments", excludeDeleted);

AdSchema.pre("aggregate", function (next: () => void) {
    const agg = this as mongoose.Aggregate<unknown[]> & {
        options?: Record<string, unknown>;
    };
    if (agg.options?.allowDeleted) return next();
    agg.pipeline().unshift({ $match: { isDeleted: false } });
    next();
});

/* -------------------------------------------
 * MODEL
 * ----------------------------------------- */

const Advertisement =
    mongoose.models.Advertisement ||
    mongoose.model<IAdvertisement, AdvertisementModel>("Advertisement", AdSchema);

export default Advertisement;
