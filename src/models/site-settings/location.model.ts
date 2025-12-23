// models/site-settings/location.model.ts
import { defineModel } from "@/lib/helpers/defineModel";
import restoredSuffix from "@/lib/helpers/restore-suffix";
import { Schema, Model, Types, HydratedDocument } from "mongoose";

export type ObjectId = Types.ObjectId;

export interface ILocationEntry {
    _id?: ObjectId;
    key: string;
    country: string;
    region?: string;
    city?: string;
    slug?: string;
    lat: number;
    lng: number;
    active: boolean;
    location?: {
        type: "Point";
        coordinates: [number, number];
    };
    createdAt?: Date;
    updatedAt?: Date;
    deleteAt?: Date | null;
}

// Hydrated doc type — correct & simple
export type ILocationSettingEntry = HydratedDocument<ILocationEntry>;

// Custom model interface
export interface LocationSettingModel extends Model<ILocationEntry> {
    upsertByKey(payload: Partial<ILocationEntry>): Promise<ILocationSettingEntry>;
    softDeleteById(id: ObjectId | string): Promise<ILocationSettingEntry | null>;
    restoreById(id: ObjectId | string): Promise<ILocationSettingEntry | null>;
}

const LocationSettingSchema = new Schema<ILocationEntry, LocationSettingModel>(
    {
        key: { type: String, required: true },
        country: { type: String, required: true },
        region: { type: String },
        city: { type: String },
        slug: { type: String },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        location: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: [0, 0] },
        },
        active: { type: Boolean, default: true },
        deleteAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

LocationSettingSchema.index({ location: "2dsphere" });

/**
 * Upsert by key:
 * - If a document with the given key exists (including deleted ones), update it.
 * - Otherwise create a new document.
 */
LocationSettingSchema.statics.upsertByKey = async function (
    payload: Partial<ILocationEntry>
): Promise<ILocationSettingEntry> {
    if (!payload.key) throw new Error("key is required for upsertByKey");

    const existing = await this.findOne({ key: payload.key });

    if (!existing) return this.create(payload);

    Object.assign(existing, payload);
    await existing.save();
    return existing;
};

/**
 * Soft-delete helper: mark a document as deleted by setting deleteAt and deactivating it.
 */
LocationSettingSchema.statics.softDeleteById = async function (
    id: ObjectId | string
): Promise<ILocationSettingEntry | null> {
    const doc = await this.findById(id);
    if (!doc) return null;
    if (doc.deleteAt) return doc; // already deleted

    doc.deleteAt = new Date();
    doc.active = false;
    await doc.save();
    return doc;
};

/**
 * Restore helper:
 * - If the document is not deleted, returns it unchanged.
 * - If restoring would cause a key conflict with an existing non-deleted doc,
 *   append a restoredSuffix and ensure uniqueness by repeating until unique.
 */
LocationSettingSchema.statics.restoreById = async function (
    id: ObjectId | string
): Promise<ILocationSettingEntry | null> {
    const doc = await this.findById(id);
    if (!doc) return null;
    if (!doc.deleteAt) return doc; // already active

    const Model = this as LocationSettingModel;
    let desiredKey = doc.key;
    let conflict = await Model.findOne({ key: desiredKey, deleteAt: null }).lean();

    while (conflict) {
        desiredKey = `${desiredKey}${restoredSuffix()}`;
        conflict = await Model.findOne({ key: desiredKey, deleteAt: null }).lean();
    }

    doc.key = desiredKey;
    doc.deleteAt = null;
    doc.active = true;
    await doc.save();
    return doc;
};

const LocationSetting = defineModel("LocationSetting", LocationSettingSchema) as LocationSettingModel;

export default LocationSetting;