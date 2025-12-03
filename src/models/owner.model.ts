import mongoose, {
    Schema,
    model,
    models,
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
        user: { type: Schema.Types.ObjectId, ref: "User", required: true},
        name: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
        strict: true,
    }
);

/** Auto-populate user */
OwnerSchema.pre<Query<IOwnerDoc[], IOwnerDoc>>(/^find/, function (next) {
    this.populate({ path: "user", select: "email role createdAt updatedAt" });
    next();
});

/** Index */
OwnerSchema.index({ user: 1 }, { unique: true });

/** Export model */
export const OwnerModel: mongoose.Model<IOwnerDoc> =
    (models.Owner as mongoose.Model<IOwnerDoc>) || model<IOwnerDoc>("Owner", OwnerSchema);

export default OwnerModel;