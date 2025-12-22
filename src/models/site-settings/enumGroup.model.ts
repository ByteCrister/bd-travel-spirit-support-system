// models/site-settings/enumGroup.model.ts
import { defineModel } from "@/lib/helpers/defineModel";
import { Schema, Model, Types, HydratedDocument } from "mongoose";

export type ObjectId = Types.ObjectId;

export interface IEnumValue {
    key: string;
    label: string;
    value: string | number;
    active: boolean;
    description?: string | null;
}

export interface IEnumGroupSetting {
    _id?: ObjectId;
    name: string;
    description?: string | null;
    values: IEnumValue[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type IEnumGroup = HydratedDocument<IEnumGroupSetting>;

export interface EnumGroupSettingModel extends Model<IEnumGroupSetting> {
    upsertByName(payload: Partial<IEnumGroupSetting>): Promise<IEnumGroup>;
}

const EnumValueSchema = new Schema<IEnumValue>(
    {
        key: { type: String, required: true },
        label: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
        active: { type: Boolean, default: true, index: true },
        description: { type: String, default: null },
    },
    { _id: false }
);

const EnumGroupSettingSchema = new Schema<IEnumGroupSetting, EnumGroupSettingModel>(
    {
        name: { type: String, required: true },
        description: { type: String, default: null },
        values: { type: [EnumValueSchema], default: [] },
    },
    { timestamps: true }
);

EnumGroupSettingSchema.statics.upsertByName = async function (
    payload: Partial<IEnumGroupSetting>
): Promise<IEnumGroup> {
    if (!payload.name) throw new Error("name is required for upsertByName");

    const existing = await this.findOne({ name: payload.name });

    if (!existing) return this.create(payload);

    Object.assign(existing, payload);
    await existing.save();

    return existing;
};

const EnumGroupSetting = defineModel("EnumGroupSetting", EnumGroupSettingSchema)

export default EnumGroupSetting;