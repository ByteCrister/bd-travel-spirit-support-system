// models/travelComment.model.ts
import { Schema, model, models, Types, Document } from "mongoose";

/**
 * Enum representing the moderation status of a comment.
 * - PENDING: Awaiting review or automatic moderation.
 * - APPROVED: Visible to all users.
 * - REJECTED: Hidden due to moderation rules.
 */
export enum CommentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

/**
 * Interface describing the shape of a Travel Comment document.
 * Extends Mongoose's Document type for full typing support.
 */
export interface ITravelComment extends Document {
  articleId: Types.ObjectId; // The travel article this comment belongs to
  parentId?: Types.ObjectId | null; // Parent comment ID (for threaded/nested replies)
  author: Types.ObjectId; // User who created the comment
  content: string; // The actual text content of the comment
  likes: number; // Number of likes/upvotes this comment has received
  replies: Types.ObjectId[]; // Array of child comment IDs (nested replies)
  status: CommentStatus; // Moderation status (pending/approved/rejected)
  createdAt: Date; // Auto-managed timestamp when created
  updatedAt: Date; // Auto-managed timestamp when last updated
}

/**
 * Schema definition for Travel Comments.
 * Includes references to related models, validation rules,
 * and moderation support.
 */
const TravelCommentSchema = new Schema<ITravelComment>(
  {
    // Reference to the travel article this comment belongs to
    articleId: {
      type: Schema.Types.ObjectId,
      ref: "TravelArticle",
      required: true,
      index: true,
    },

    // Optional parent comment for nested/threaded replies
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "TravelComment",
      default: null,
    },

    // Author of the comment (User reference)
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Comment text with max length validation
    content: { type: String, required: true, trim: true, maxlength: 5000 },

    // Like counter (default: 0)
    likes: { type: Number, default: 0, min: 0 },

    // Array of reply comment IDs (self-referencing)
    replies: [{ type: Schema.Types.ObjectId, ref: "TravelComment" }],

    // Moderation status with default set to "pending"
    status: {
      type: String,
      enum: Object.values(CommentStatus),
      default: CommentStatus.PENDING,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Disable __v field for cleaner documents
    toJSON: { virtuals: true }, // Ensure virtuals are included in JSON
    toObject: { virtuals: true },
  }
);

/**
 * Compound index for efficient queries:
 * - articleId: filter by article
 * - status: filter by moderation state
 * - createdAt: sort by newest first
 */
TravelCommentSchema.index({ articleId: 1, status: 1, createdAt: -1 });

/**
 * Virtual field: replyCount
 * Provides a quick way to get the number of replies without fetching them all.
 */
TravelCommentSchema.virtual("replyCount").get(function (this: ITravelComment) {
  return this.replies?.length || 0;
});

/**
 * Pre-save hook (example):
 * Ensures content is trimmed and sanitized before saving.
 */
TravelCommentSchema.pre("save", function (next) {
  if (this.content) {
    this.content = this.content.trim();
  }
  next();
});

/**
 * Instance methods
 */
TravelCommentSchema.methods.like = async function (): Promise<ITravelComment> {
  this.likes += 1;
  return this.save();
};

TravelCommentSchema.methods.approve =
  async function (): Promise<ITravelComment> {
    this.status = CommentStatus.APPROVED;
    return this.save();
  };

TravelCommentSchema.methods.reject =
  async function (): Promise<ITravelComment> {
    this.status = CommentStatus.REJECTED;
    return this.save();
  };

/**
 * Static methods
 */
TravelCommentSchema.statics.findByArticle = function (
  articleId: Types.ObjectId,
  status: CommentStatus = CommentStatus.APPROVED
): Promise<ITravelComment[]> {
  return this.find({ articleId, status }).sort({ createdAt: -1 }).exec();
};

TravelCommentSchema.statics.addReply = async function (
  parentId: Types.ObjectId,
  replyId: Types.ObjectId
): Promise<void> {
  await this.findByIdAndUpdate(parentId, { $push: { replies: replyId } });
};

/**
 * Exported TravelComment model.
 * Uses existing model if already compiled (hot-reload safe).
 */
export const TravelCommentModel =
  models.TravelComment ||
  model<ITravelComment>("TravelComment", TravelCommentSchema);
