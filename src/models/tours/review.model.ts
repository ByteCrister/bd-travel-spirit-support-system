// models/review.model.ts

import mongoose, {
    Schema,
    model,
    models,
    Document,
    Types,
    Query,
    FilterQuery,
    CallbackWithoutResultAndOptionalError,
} from "mongoose";
import { TourModel } from "./tour.model";
import { TRAVEL_TYPE, TravelType } from "@/constants/tour.const";

export interface IReviewReply {
    _id: Types.ObjectId;
    employee: Types.ObjectId; // ref: "Employee"
    message: string;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

const ReviewReplySchema = new Schema<IReviewReply>(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        isApproved: {
            type: Boolean,
            default: true,
            index: true,
        },
        deletedAt: { type: Date, default: null, index: true },
    },
    {
        timestamps: true,
        _id: true, // automatically add _id for replies
    }
);


////////////////////////////////////////////////////////////////////////////////
// INTERFACE: The shape of a Review document
////////////////////////////////////////////////////////////////////////////////

export interface IReview extends Document {
    tour: Types.ObjectId; // Which Tour is being reviewed
    user: Types.ObjectId; // Who wrote the review
    rating: number; // 1–5 star scale
    title?: string; // Optional headline
    comment: string; // Full textual feedback
    images: Types.ObjectId[]; // Attached review images
    tripType?: TravelType; // Traveler context
    travelDate?: Date; // When the trip occurred
    isVerified: boolean; // True if booking verified
    isApproved: boolean; // Moderation state
    helpfulCount: number; // “Helpful” vote tally
    deletedAt?: Date; // Soft-delete timestamp

    replies: IReviewReply[];

    createdAt: Date;
    updatedAt: Date;

    // Instance methods
    incrementHelpful(): Promise<number>;
}

////////////////////////////////////////////////////////////////////////////////
// SOFT-DELETE PLUGIN: Adds `deletedAt` and filters queries automatically
////////////////////////////////////////////////////////////////////////////////

function softDeletePlugin(schema: Schema) {
    // Add deletedAt field
    schema.add({ deletedAt: { type: Date, default: null, index: true } });

    // Pre-find middleware excludes soft-deleted documents
    schema.pre<Query<IReview[], IReview>>(
        /^find/,
        function (
            this: Query<IReview[], IReview>,
            next: CallbackWithoutResultAndOptionalError
        ) {
            this.where({ deletedAt: null });
            next();
        }
    );
}

////////////////////////////////////////////////////////////////////////////////
// SCHEMA DEFINITION
////////////////////////////////////////////////////////////////////////////////

const ReviewSchema = new Schema<IReview>(
    {
        // Reference to the tour being reviewed
        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
            index: true,
        },

        // Reference to the authoring user
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Rating value between 1 and 5
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            index: true,
        },

        // Optional headline for the review
        title: { type: String, trim: true, maxlength: 100 },

        // Main review body
        comment: { type: String, required: true, trim: true },

        // Array of image references
        images: [{ type: Schema.Types.ObjectId, ref: "Asset" }],

        // Trip context for other travelers
        tripType: { type: String, enum: Object.values(TRAVEL_TYPE) },

        // When the trip actually took place
        travelDate: { type: Date, index: true },

        // True if this user’s booking was verified by the system
        isVerified: { type: Boolean, default: false, index: true },

        // Moderation flag: only approved reviews are shown publicly
        isApproved: { type: Boolean, default: true, index: true },

        replies: {
            type: [ReviewReplySchema],
            default: [],
        },

        // Tally of how many users found this review helpful
        helpfulCount: { type: Number, default: 0, min: 0, index: true },
    },
    {
        timestamps: true, // Adds createdAt & updatedAt
        versionKey: "__v", // Enable document versioning
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Apply soft-delete behavior
ReviewSchema.plugin(softDeletePlugin);

////////////////////////////////////////////////////////////////////////////////
// INDEXES: Fast lookups and constraints
////////////////////////////////////////////////////////////////////////////////

// One review per user per tour
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Sort reviews by rating or helpfulness
ReviewSchema.index({ tour: 1, rating: -1 });
ReviewSchema.index({ tour: 1, helpfulCount: -1 });

// Efficient retrieval of approved, recent reviews
ReviewSchema.index({ isApproved: 1, createdAt: -1 });

////////////////////////////////////////////////////////////////////////////////
// INSTANCE METHODS: Helpers on review documents
////////////////////////////////////////////////////////////////////////////////

/**
 * Increments the helpfulCount by 1 and returns the new count.
 */
ReviewSchema.methods.incrementHelpful = async function (
    this: IReview
): Promise<number> {
    this.helpfulCount += 1;
    await this.save();
    return this.helpfulCount;
};

////////////////////////////////////////////////////////////////////////////////
// POST-HOOKS: Maintain Tour’s averageRating
////////////////////////////////////////////////////////////////////////////////

/**
 * Recalculates and updates the parent Tour’s averageRating
 * after each review save or removal.
 */
async function recalcAverageRating(doc: IReview) {
    const stats = await mongoose.model<IReview>("Review").aggregate<{
        _id: Types.ObjectId;
        avgRating: number;
    }>([{ $match: { tour: doc.tour, deletedAt: null, isApproved: true } }, { $group: { _id: "$tour", avgRating: { $avg: "$rating" } } }]);

    const avgRating = stats[0]?.avgRating ?? 0;
    await TourModel.findByIdAndUpdate(doc.tour, { averageRating: avgRating });
}

////////////////////////////////////////////////////////////////////////////////
// POST-HOOKS: Keep the parent Tour.averageRating in sync
////////////////////////////////////////////////////////////////////////////////

/**
 * After saving (insert or update), recalc and persist the averageRating.
 */
ReviewSchema.post("save", function (doc: IReview) {
    // Mongoose gives us `doc` here directly
    void recalcAverageRating(doc);
});

/**
 * After a `findOneAndDelete(...)` query, recalc averageRating.
 * Note: Mongoose only passes `doc` when it existed.
 */
ReviewSchema.post("findOneAndDelete", function (doc: IReview | null) {
    if (doc) {
        void recalcAverageRating(doc);
    }
});

/**
 * After calling `doc.deleteOne()`, `this` is your document.
 */
ReviewSchema.post(
    "deleteOne",
    { document: true, query: false },
    function (this: IReview) {
        void recalcAverageRating(this);
    }
);

////////////////////////////////////////////////////////////////////////////////
// STATICS: Model-level utilities
////////////////////////////////////////////////////////////////////////////////

interface PaginateResult<T> {
    docs: T[];
    total: number;
    page: number;
    pages: number;
}

/**
 * Fetches paginated reviews based on filter, page, and limit.
 *
 * @param filter  MongoDB filter query (e.g., { tour, isApproved: true }).
 * @param options Pagination options: page number & results per page.
 */
ReviewSchema.statics.paginate = async function (
    filter: FilterQuery<IReview>,
    options: { page?: number; limit?: number } = {}
): Promise<PaginateResult<IReview>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
        this.find(filter).skip(skip).limit(limit),
        this.countDocuments(filter),
    ]);

    return {
        docs,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

////////////////////////////////////////////////////////////////////////////////
// INSTANCE METHODS
////////////////////////////////////////////////////////////////////////////////

ReviewSchema.methods.addReply = async function (
    this: IReview,
    employeeId: Types.ObjectId,
    message: string
): Promise<IReview> {
    this.replies.push({
        _id: new mongoose.Types.ObjectId(),
        employee: employeeId,
        message,
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as IReviewReply);
    await this.save();
    return this;
};

////////////////////////////////////////////////////////////////////////////////
// EXPORT: Use existing model if already compiled (avoids overwrite errors)
////////////////////////////////////////////////////////////////////////////////

export const ReviewModel =
    (models.Review as mongoose.Model<IReview>) ||
    model<IReview>("Review", ReviewSchema);
