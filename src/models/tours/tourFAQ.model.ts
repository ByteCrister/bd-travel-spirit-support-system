import {
    Schema,
    Document,
    Types,
    Query,
} from "mongoose";
import { MODERATION_STATUS, ModerationStatus } from "@/constants/tour.const";
import { defineModel } from "@/lib/helpers/defineModel";
import { FAQ_REPORT_REASON, FaqReportReason } from "@/constants/faq-report.const";

/* ------------------------------------------------------------------ */
/* Report Types */
/* ------------------------------------------------------------------ */

export interface ITourFAQReport {
    reportedBy: Types.ObjectId;
    reason?: FaqReportReason;
    customReason?: string;
    explanation?: string;
    createdAt: Date;
}

/* ------------------------------------------------------------------ */
/* Like / Dislike Types */
/* ------------------------------------------------------------------ */

export interface ITourFAQLike {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    createdAt: Date;
    deletedAt?: Date | null;
}

/* ------------------------------------------------------------------ */
/* Main FAQ Type */
/* ------------------------------------------------------------------ */

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

    likes: ITourFAQLike[];
    dislikes: ITourFAQLike[];

    reports: ITourFAQReport[];
    createdAt: Date;
    updatedAt: Date;
}

/* ------------------------------------------------------------------ */
/* Schemas */
/* ------------------------------------------------------------------ */

const ReportSchema = new Schema<ITourFAQReport>(
    {
        reportedBy: { type: Schema.Types.ObjectId, ref: "Traveler", required: true },
        reason: { type: String, enum: Object.values(FAQ_REPORT_REASON) },
        customReason: { type: String, trim: true, maxlength: 200 },
        explanation: { type: String, trim: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const LikeSchema = new Schema<ITourFAQLike>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "Traveler",
            required: true,
        },
        createdAt: { type: Date, default: Date.now },
        deletedAt: { type: Date, default: null },
    },
    {
        _id: true,
        versionKey: false,
    }
);

/* ------------------------------------------------------------------ */
/* Tour FAQ Schema */
/* ------------------------------------------------------------------ */

const TourFAQSchema = new Schema<ITourFAQ>(
    {
        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
            index: true,
        },
        askedBy: { type: Schema.Types.ObjectId, ref: "Traveler", required: true },
        answeredBy: { type: Schema.Types.ObjectId, ref: "Traveler" },

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
        editedBy: { type: Schema.Types.ObjectId, ref: "Traveler" },

        likes: { type: [LikeSchema], default: [] },
        dislikes: { type: [LikeSchema], default: [] },

        reports: { type: [ReportSchema], default: [] },
    },
    { timestamps: true, versionKey: false }
);

/* ------------------------------------------------------------------ */
/* Validations */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Soft Delete Filter */
/* ------------------------------------------------------------------ */

TourFAQSchema.pre<Query<ITourFAQ[], ITourFAQ>>(/^find/, function (next) {
    this.where({ deletedAt: null });
    next();
});

/* ------------------------------------------------------------------ */
/* Virtuals */
/* ------------------------------------------------------------------ */

TourFAQSchema.virtual("isAnswered").get(function (this: ITourFAQ) {
    return Boolean(this.answer);
});

TourFAQSchema.virtual("likeCount").get(function (this: ITourFAQ) {
    return this.likes.filter(l => !l.deletedAt).length;
});

TourFAQSchema.virtual("dislikeCount").get(function (this: ITourFAQ) {
    return this.dislikes.filter(d => !d.deletedAt).length;
});

/* ------------------------------------------------------------------ */
/* Indexes */
/* ------------------------------------------------------------------ */

TourFAQSchema.index({ tour: 1, status: 1, createdAt: -1 });
TourFAQSchema.index({ askedBy: 1, createdAt: -1 });
TourFAQSchema.index({ "reports.reason": 1 });

TourFAQSchema.index({
  question: "text",
  answer: "text",
});

/* ------------------------------------------------------------------ */

export const TourFAQModel = defineModel("TourFAQ", TourFAQSchema);