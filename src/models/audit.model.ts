// audit.model.ts
import { defineModel } from "@/lib/helpers/defineModel";
import {
    Schema,
    Document,
    Types,
    ClientSession,
    Model,
} from "mongoose";

/** Strongly typed diff fields */
export interface IAuditChangeSet {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
}

/** Audit DTO / Document */
export interface IAuditDoc extends Document {
    targetModel: string;
    target: Types.ObjectId;

    actor?: Types.ObjectId;
    actorModel?: string;

    action: string;

    note?: string;
    ip?: string;
    userAgent?: string;

    changes?: IAuditChangeSet;

    createdAt: Date;
}

/** Input type for createAudit() */
export interface ICreateAuditParams {
    targetModel: string;
    target: Types.ObjectId | string;
    action: string;

    note?: string;
    ip?: string;
    userAgent?: string;

    actor?: Types.ObjectId | string;
    actorModel?: string;

    before?: Record<string, unknown>;
    after?: Record<string, unknown>;

    session?: ClientSession | null;
}

/** Mongoose Schema */
const AuditSchema = new Schema<IAuditDoc>(
    {
        targetModel: { type: String, required: true, index: true },
        target: { type: Schema.Types.ObjectId, required: true, index: true },

        actor: { type: Schema.Types.ObjectId, refPath: "actorModel" },
        actorModel: { type: String },

        action: { type: String, required: true },

        note: { type: String },
        ip: { type: String },
        userAgent: { type: String },

        changes: {
            before: { type: Schema.Types.Mixed },
            after: { type: Schema.Types.Mixed },
        },
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false,
        },
        versionKey: false,
        strict: true,
    }
);

/** Production-grade indexes */
AuditSchema.index({ targetModel: 1, target: 1, createdAt: -1 });
AuditSchema.index({ actor: 1, createdAt: -1 });
AuditSchema.index({ action: 1, createdAt: -1 });

/** Model Interfaces */
export interface IAuditModel extends Model<IAuditDoc> {
    createAudit(params: ICreateAuditParams): Promise<IAuditDoc>;

    getRecentForTarget(
        targetModel: string,
        target: Types.ObjectId | string,
        limit?: number
    ): Promise<IAuditDoc[]>;

    getRecentForActor(
        actor: Types.ObjectId | string,
        limit?: number
    ): Promise<IAuditDoc[]>;
}

/** Static: Create Audit */
AuditSchema.statics.createAudit = async function (
    params: ICreateAuditParams
): Promise<IAuditDoc> {
    const Audit = this as IAuditModel;

    const {
        targetModel,
        target,
        action,
        note,
        ip,
        userAgent,
        actor,
        actorModel,
        before,
        after,
        session = null,
    } = params;

    const doc = new Audit({
        targetModel,
        target,
        action,
        note,
        ip,
        userAgent,
        actor,
        actorModel,
        changes: before || after ? { before, after } : undefined,
    });

    if (session) {
        await doc.save({ session });
    } else {
        await doc.save();
    }

    return doc;
};

/** Static: Query for target history */
AuditSchema.statics.getRecentForTarget = function (
    targetModel: string,
    target: Types.ObjectId | string,
    limit = 50
): Promise<IAuditDoc[]> {
    const Audit = this as IAuditModel;

    return Audit.find({ targetModel, target })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean<IAuditDoc[]>()
        .exec();
};

/** Static: Query for actor history */
AuditSchema.statics.getRecentForActor = function (
    actor: Types.ObjectId | string,
    limit = 50
): Promise<IAuditDoc[]> {
    const Audit = this as IAuditModel;

    return Audit.find({ actor })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean<IAuditDoc[]>()
        .exec();
};

/** Export */
export const AuditModel = defineModel("Audit", AuditSchema);

export default AuditModel;