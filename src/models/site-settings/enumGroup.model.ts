// models/site-settings/enumGroup.model.ts
import { defineModel } from "@/lib/helpers/defineModel";
import { Schema, Model, Types, HydratedDocument } from "mongoose";
import restoredSuffix from "@/lib/helpers/restore-suffix";

export type ObjectId = Types.ObjectId;

export interface IEnumValue {
    key: string;
    label: string;
    value: string | number;
    active: boolean;
    description?: string | null;
    deletedAt?: Date | null; // Add deletedAt for individual enum value soft delete
}

export interface IEnumGroupSetting {
    _id?: ObjectId;
    name: string;
    description?: string | null;
    values: IEnumValue[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null; // Add deletedAt for group soft delete
}

export type IEnumGroup = HydratedDocument<IEnumGroupSetting>;

export interface EnumGroupSettingModel extends Model<IEnumGroupSetting> {
    // Group-level operations
    upsertByName(payload: Partial<IEnumGroupSetting>): Promise<IEnumGroup>;
    softDeleteGroupById(id: string): Promise<IEnumGroup | null>;
    restoreGroupById(id: string): Promise<IEnumGroup | null>;

    // Enum value operations (only when group is not deleted)
    softDeleteEnumValue(groupId: string, enumKey: string): Promise<IEnumGroup | null>;
    restoreEnumValue(groupId: string, enumKey: string): Promise<IEnumGroup | null>;
    deleteEnumValuePermanently(groupId: string, enumKey: string): Promise<IEnumGroup | null>;
}

const EnumValueSchema = new Schema<IEnumValue>(
    {
        key: { type: String, required: true },
        label: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
        active: { type: Boolean, default: true, index: true },
        description: { type: String, default: null },
        deletedAt: { type: Date, default: null }, // Soft delete for individual enum values
    },
    { _id: false }
);

const EnumGroupSettingSchema = new Schema<IEnumGroupSetting, EnumGroupSettingModel>(
    {
        name: { type: String, required: true },
        description: { type: String, default: null },
        values: { type: [EnumValueSchema], default: [] },
        deletedAt: { type: Date, default: null, index: true }, // Soft delete for the group
    },
    { timestamps: true }
);

// Index for querying non-deleted enum values within a group
EnumGroupSettingSchema.index({ 'values.deletedAt': 1 });

/* -------------------------
 Group-level operations
------------------------- */

EnumGroupSettingSchema.statics.upsertByName = async function (
    payload: Partial<IEnumGroupSetting>
): Promise<IEnumGroup> {
    if (!payload.name) throw new Error("name is required for upsertByName");

    // Only find non-deleted groups
    const existing = await this.findOne({
        name: payload.name,
        deletedAt: null
    });

    if (!existing) {
        // Check if there's a deleted group with same name to restore
        const deletedGroup = await this.findOne({
            name: payload.name,
            deletedAt: { $ne: null }
        });

        if (deletedGroup) {
            // Restore the group and update its values
            Object.assign(deletedGroup, payload);
            deletedGroup.deletedAt = null;

            // Optionally restore all enum values when group is restored
            deletedGroup.values.forEach(value => {
                if (value.deletedAt) {
                    value.deletedAt = null;
                    value.active = true; // Activate when restoring
                }
            });

            await deletedGroup.save();
            return deletedGroup;
        }

        return this.create(payload);
    }

    Object.assign(existing, payload);
    await existing.save();
    return existing;
};

EnumGroupSettingSchema.statics.softDeleteGroupById = async function (
    id: string
): Promise<IEnumGroup | null> {
    // Only soft delete non-deleted groups
    return this.findOneAndUpdate(
        {
            _id: id,
            deletedAt: null
        },
        {
            deletedAt: new Date(),
            // Optionally deactivate all enum values when group is deleted
            $set: { 'values.$[].deletedAt': new Date() }
        },
        { new: true }
    );
};

/**
 * Restores a previously soft-deleted enum group by its ID.
 *
 * - If a non-deleted group already exists with the same `name`,
 *   a UTC timestamp suffix is appended via `restoredSuffix()` to avoid conflicts.
 * - If the suffixed name still conflicts (very unlikely), the suffix is regenerated until unique.
 * - All enum values inside the group are also restored (clears `deletedAt` and reactivates).
 *
 * @param {string} id - The ObjectId of the group to restore.
 * @returns {Promise<IEnumGroup | null>} The restored group document, or `null` if not found.
 */
EnumGroupSettingSchema.statics.restoreGroupById = async function (
    id: string
): Promise<IEnumGroup | null> {
    // Find the deleted group
    const deletedGroup = await this.findOne({
        _id: id,
        deletedAt: { $ne: null }
    });

    if (!deletedGroup) return null;

    // If a non-deleted group exists with the same name, append a suffix.
    // Retry until we find a unique name (defensive: extremely unlikely to loop more than once).
    let candidateName = deletedGroup.name;
    let conflict = await this.findOne({ name: candidateName, deletedAt: null }).lean().exec();

    while (conflict) {
        candidateName = `${deletedGroup.name}${restoredSuffix()}`;
        conflict = await this.findOne({ name: candidateName, deletedAt: null }).lean().exec();
    }

    deletedGroup.name = candidateName;

    // Clear deletedAt for group and restore all enum values
    deletedGroup.deletedAt = null;
    deletedGroup.values.forEach(value => {
        if (value.deletedAt) {
            value.deletedAt = null;
            value.active = true;
        }
    });

    await deletedGroup.save();
    return deletedGroup;
};


/* -------------------------
 Enum Value-level operations (only when group is active)
------------------------- */

EnumGroupSettingSchema.statics.softDeleteEnumValue = async function (
    groupId: string,
    enumKey: string
): Promise<IEnumGroup | null> {
    // Can only delete enum values in non-deleted groups
    const group = await this.findOne({
        _id: groupId,
        deletedAt: null
    });

    if (!group) return null;

    // Find the enum value and mark as deleted
    const valueIndex = group.values.findIndex(v => v.key === enumKey && !v.deletedAt);

    if (valueIndex === -1) return null;

    group.values[valueIndex].deletedAt = new Date();
    group.values[valueIndex].active = false;
    group.markModified('values');

    await group.save();
    return group;
};

/**
 * Restores a previously soft-deleted enum value within a group.
 *
 * - Operates only when the parent group is active (not soft-deleted).
 * - If another active enum value already exists with the same `key`,
 *   a UTC timestamp suffix is appended via `restoredSuffix()` to avoid conflicts.
 * - If the suffixed key still conflicts within the group, the suffix is regenerated until unique.
 * - The enum value is reactivated (`active = true`) and its `deletedAt` cleared.
 *
 * @param {string} groupId - The ObjectId of the parent group (must be non-deleted).
 * @param {string} enumKey - The key of the enum value to restore.
 * @returns {Promise<IEnumGroup | null>} The updated group document, or `null` if not found.
 */
EnumGroupSettingSchema.statics.restoreEnumValue = async function (
    groupId: string,
    enumKey: string
): Promise<IEnumGroup | null> {
    // Can only restore enum values in non-deleted groups
    const group = await this.findOne({
        _id: groupId,
        deletedAt: null
    });

    if (!group) return null;

    // Find the deleted enum value
    const valueIndex = group.values.findIndex(v => v.key === enumKey && v.deletedAt);

    if (valueIndex === -1) return null;

    // If an active value with the same key exists, append suffix and ensure uniqueness within the group
    let candidateKey = group.values[valueIndex].key;
    const hasActiveWithKey = (k: string) => group.values.some(v => v.key === k && !v.deletedAt);

    if (hasActiveWithKey(candidateKey)) {
        // Retry until unique within this group's values
        do {
            candidateKey = `${group.values[valueIndex].key}${restoredSuffix()}`;
        } while (hasActiveWithKey(candidateKey));
        group.values[valueIndex].key = candidateKey;
    }

    // Restore the enum value
    group.values[valueIndex].deletedAt = null;
    group.values[valueIndex].active = true;
    group.markModified('values');

    await group.save();
    return group;
};

EnumGroupSettingSchema.statics.deleteEnumValuePermanently = async function (
    groupId: string,
    enumKey: string
): Promise<IEnumGroup | null> {
    // Can only permanently delete enum values in non-deleted groups
    const group = await this.findOne({
        _id: groupId,
        deletedAt: null
    });

    if (!group) return null;

    // Remove the enum value completely (not soft delete)
    const initialLength = group.values.length;
    group.values = group.values.filter(v => v.key !== enumKey);

    if (group.values.length === initialLength) return null; // No value was removed

    group.markModified('values');
    await group.save();
    return group;
};

/* -------------------------
 Query Helpers (optional but useful)
------------------------- */

// Method to get only non-deleted enum values
EnumGroupSettingSchema.methods.getActiveValues = function (): IEnumValue[] {
    return this.values.filter((v: IEnumValue) => !v.deletedAt && v.active);
};

// Method to get all values including deleted
EnumGroupSettingSchema.methods.getAllValues = function (includeDeleted = false): IEnumValue[] {
    if (includeDeleted) {
        return this.values;
    }
    return this.values.filter((v: IEnumValue) => !v.deletedAt);
};

const EnumGroupSetting = defineModel("EnumGroupSetting", EnumGroupSettingSchema) as EnumGroupSettingModel;

export default EnumGroupSetting;