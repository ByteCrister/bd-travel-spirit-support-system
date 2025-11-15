// models/tourFAQ.model.ts
import mongoose, {
    Schema,
    Document,
    Types,
    model,
    models,
    Query,
} from "mongoose";
import { MODERATION_STATUS, ModerationStatus } from "@/constants/tour.const";
import { FAQ_REPORT_REASON, FaqReportReason } from "@/constants/faqReport.const";

export interface ITourFAQReport {
    reportedBy: Types.ObjectId;
    reason?: FaqReportReason; // optional enum
    customReason?: string; // user-provided reason (when no enum used)
    explanation?: string;
    createdAt: Date;
}

export interface ITourFAQ extends Document {
    tour: Types.ObjectId;
    askedBy: Types.ObjectId;
    answeredBy?: Types.ObjectId;
    question: string;
    answer?: string;
    status: ModerationStatus;
    order?: number;
    isActive: boolean;
    deletedAt?: Date | null;
    answeredAt?: Date;
    editedAt?: Date;
    editedBy?: Types.ObjectId;
    likes: number;
    dislikes: number;
    reports: ITourFAQReport[];
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<ITourFAQReport>(
    {
        reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String, enum: Object.values(FAQ_REPORT_REASON) },
        customReason: { type: String, trim: true, maxlength: 200 },
        explanation: { type: String, trim: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const TourFAQSchema = new Schema<ITourFAQ>(
    {
        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
            index: true,
        },
        askedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        answeredBy: { type: Schema.Types.ObjectId, ref: "User" },
        question: { type: String, required: true, trim: true, maxlength: 1000 },
        answer: { type: String, trim: true, maxlength: 5000 },
        status: {
            type: String,
            enum: Object.values(MODERATION_STATUS),
            default: MODERATION_STATUS.PENDING,
            index: true,
        },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null },
        answeredAt: { type: Date },
        editedAt: { type: Date },
        editedBy: { type: Schema.Types.ObjectId, ref: "User" },
        likes: { type: Number, default: 0, min: 0 },
        dislikes: { type: Number, default: 0, min: 0 },
        reports: [ReportSchema],
    },
    { timestamps: true, versionKey: false }
);

// Ensure at least one reason is provided per report
ReportSchema.pre("validate", function (next) {
    const hasEnumReason = !!this.reason;
    const hasCustomReason =
        !!this.customReason && this.customReason.trim().length > 0;
    if (!hasEnumReason && !hasCustomReason) {
        return next(
            new Error(
                "A report must include either a predefined reason or a customReason."
            )
        );
    }
    next();
});

// Soft delete filter
TourFAQSchema.pre<Query<ITourFAQ[], ITourFAQ>>(/^find/, function (next) {
    this.where({ deletedAt: null });
    next();
});

// Virtuals
TourFAQSchema.virtual("isAnswered").get(function (this: ITourFAQ) {
    return Boolean(this.answer);
});

// Indexes
TourFAQSchema.index({ tour: 1, status: 1, createdAt: -1 });
TourFAQSchema.index({ askedBy: 1, createdAt: -1 });
TourFAQSchema.index({ "reports.reason": 1 });
TourFAQSchema.index({ likes: -1 });
TourFAQSchema.index({ dislikes: -1 });

export const TourFAQModel =
    (models.TourFAQ as mongoose.Model<ITourFAQ>) ||
    model<ITourFAQ>("TourFAQ", TourFAQSchema);
