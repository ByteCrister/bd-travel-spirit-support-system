import { defineModel } from "@/lib/helpers/defineModel";
import {
    Schema,
    Document,
    Types,
    Query,
} from "mongoose";

export interface IOwnerDoc extends Document {
    user: Types.ObjectId;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/** Owner Schema */
const OwnerSchema = new Schema<IOwnerDoc>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    {
        timestamps: true,
        versionKey: false,
        strict: true,
    }
);

/** Auto-populate user */
OwnerSchema.pre<Query<IOwnerDoc[], IOwnerDoc>>(/^find/, function (next) {
    this.populate({ path: "user", select: "name email role createdAt updatedAt" });
    next();
});

/** Index */
OwnerSchema.index({ user: 1 }, { unique: true });

/** Export model */
export const OwnerModel = defineModel("Owner", OwnerSchema);

export default OwnerModel;