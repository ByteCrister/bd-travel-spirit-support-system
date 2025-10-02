// models/tourFAQ.model.ts
import mongoose, { Schema, Document, Types, model, models } from "mongoose";
import { Query } from "mongoose";

export interface ITourFAQ extends Document {
    tour: Types.ObjectId; // reference to Tour
    askedBy: Types.ObjectId; // user who asked
    answeredBy?: Types.ObjectId; // user who answered
    question: string;
    answer?: string;
    order?: number; // optional ordering for UI
    isActive: boolean; // toggle visibility
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TourFAQSchema = new Schema<ITourFAQ>(
    {
        tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true, index: true },
        askedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        answeredBy: { type: Schema.Types.ObjectId, ref: "User" },
        question: { type: String, required: true, trim: true },
        answer: { type: String, trim: true },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true, versionKey: "__v" }
);

// Soft-delete pre-find hook
TourFAQSchema.pre<Query<ITourFAQ[], ITourFAQ>>(/^find/, function (next) {
    this.where({ deletedAt: null }); // now TypeScript knows 'this' is a Query
    next();
});

// Virtual: check if answered
TourFAQSchema.virtual("isAnswered").get(function (this: ITourFAQ) {
    return !!this.answer;
});

export const TourFAQModel =
    (models.TourFAQ as mongoose.Model<ITourFAQ>) || model<ITourFAQ>("TourFAQ", TourFAQSchema);
