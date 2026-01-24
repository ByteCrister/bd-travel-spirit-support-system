// models/travelComment.model.ts
import { COMMENT_STATUS, CommentStatus } from "@/constants/articleComment.const";
import { defineModel } from "@/lib/helpers/defineModel";
import { FilterQuery, Model } from "mongoose";
import { Schema, Types, Document } from "mongoose";

/**
 * Interface describing the shape of a Travel Comment document.
 * Extends Mongoose's Document type for full typing support.
 */
export interface ITravelComment extends Document {
  articleId: Types.ObjectId; // The travel article this comment belongs to
  parentId?: Types.ObjectId | null; // Parent comment ID (for threaded/nested replies)
  author: Types.ObjectId; // Traveler who created the comment
  content: string; // The actual text content of the comment
  likes: number; // Number of likes/upvotes this comment has received
  replies: Types.ObjectId[]; // Array of child comment IDs (nested replies)
  status: CommentStatus; // Moderation status (pending/approved/rejected)
  rejectReason?: string; // Reason provided by admin when rejecting a comment
  isDeleted: boolean; // Soft delete flag for admin deletion
  deletedAt?: Date; // When the comment was soft-deleted
  createdAt: Date; // Auto-managed timestamp when created
  updatedAt: Date; // Auto-managed timestamp when last updated
}

export interface TravelCommentModel extends Model<ITravelComment> {

  findByArticle(
    articleId: Types.ObjectId,
    status?: CommentStatus
  ): Promise<ITravelComment[]>;

  findReplies(
    parentId: Types.ObjectId,
    status?: CommentStatus
  ): Promise<ITravelComment[]>;

  createReply(
    articleId: Types.ObjectId,
    parentId: Types.ObjectId,
    replyData: ICreateReplyData
  ): Promise<ITravelComment>;

  findPendingModeration(): Promise<ITravelComment[]>;

  findDeleted(): Promise<ITravelComment[]>;

  findWithDeleted(
    articleId: Types.ObjectId,
    status?: CommentStatus
  ): Promise<ITravelComment[]>;
}

/**
 * Interface for creating a reply
 */
export interface ICreateReplyData {
  author: Types.ObjectId;
  content: string;
  parentId?: Types.ObjectId;
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

    // Author could be an support employee and can be a traveler)
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
      enum: Object.values(COMMENT_STATUS),
      default: COMMENT_STATUS.PENDING,
      index: true,
    },

    // Reason for rejection (required when status is REJECTED)
    rejectReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
      validate: {
        validator: function (this: ITravelComment, value?: string | null): boolean {
          // Only required when status is REJECTED
          if (this.status === COMMENT_STATUS.REJECTED) {
            return typeof value === "string" && value.trim().length > 0;
          }
          return true;
        },
        message: "Reject reason is required when comment is rejected",
      },
    },

    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // When the comment was soft-deleted
    deletedAt: {
      type: Date,
      default: null,
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
 * - isDeleted: filter out deleted comments
 */
TravelCommentSchema.index({ articleId: 1, status: 1, isDeleted: 1, createdAt: -1 });

/**
 * Index for admin queries to see deleted content
 */
TravelCommentSchema.index({ isDeleted: 1, createdAt: -1 });

/**
 * Virtual field: replyCount
 * Provides a quick way to get the number of replies without fetching them all.
 */
TravelCommentSchema.virtual("replyCount").get(function (this: ITravelComment) {
  return this.replies?.length || 0;
});

/**
 * Pre-save hook:
 * Ensures content is trimmed and sanitized before saving.
 * Clears rejectReason when comment is not rejected.
 */
TravelCommentSchema.pre("save", function (next) {
  if (this.content) {
    this.content = this.content.trim();
  }

  // Clear rejectReason if status is not REJECTED
  if (this.status !== COMMENT_STATUS.REJECTED) {
    this.rejectReason = undefined;
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

TravelCommentSchema.methods.approve = async function (): Promise<ITravelComment> {
  this.status = COMMENT_STATUS.APPROVED;
  this.rejectReason = null; // Clear reject reason when approving
  return this.save();
};

TravelCommentSchema.methods.reject = async function (reason: string): Promise<ITravelComment> {
  this.status = COMMENT_STATUS.REJECTED;
  this.rejectReason = reason;
  return this.save();
};

TravelCommentSchema.methods.softDelete = async function (): Promise<ITravelComment> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

TravelCommentSchema.methods.restore = async function (): Promise<ITravelComment> {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

/**
 * Static methods
 */
TravelCommentSchema.statics.findByArticle = function (
  articleId: Types.ObjectId,
  status: CommentStatus = COMMENT_STATUS.APPROVED
): Promise<ITravelComment[]> {
  return this.find({
    articleId,
    status,
    isDeleted: false,
    parentId: null // Only get top-level comments by default
  })
    .sort({ createdAt: -1 })
    .exec();
};

TravelCommentSchema.statics.findReplies = function (
  parentId: Types.ObjectId,
  status: CommentStatus = COMMENT_STATUS.APPROVED
): Promise<ITravelComment[]> {
  return this.find({
    parentId,
    status,
    isDeleted: false
  })
    .sort({ createdAt: 1 }) // Oldest first for replies
    .exec();
};

TravelCommentSchema.statics.createReply = async function (
  articleId: Types.ObjectId,
  parentId: Types.ObjectId,
  replyData: ICreateReplyData
): Promise<ITravelComment> {
  // Create the reply comment
  const reply = new this({
    articleId,
    parentId,
    author: replyData.author,
    content: replyData.content,
    status: COMMENT_STATUS.PENDING, // Replies start as pending
  });

  const savedReply = await reply.save();

  // Add reply to parent's replies array
  await this.findByIdAndUpdate(parentId, {
    $push: { replies: savedReply._id }
  });

  return savedReply;
};

TravelCommentSchema.statics.findPendingModeration = function (): Promise<ITravelComment[]> {
  return this.find({
    status: COMMENT_STATUS.PENDING,
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .exec();
};

TravelCommentSchema.statics.findDeleted = function (): Promise<ITravelComment[]> {
  return this.find({ isDeleted: true })
    .sort({ deletedAt: -1 })
    .exec();
};

TravelCommentSchema.statics.findWithDeleted = function (
  articleId: Types.ObjectId,
  status?: CommentStatus
): Promise<ITravelComment[]> {
  const query: FilterQuery<ITravelComment> = {
    articleId,
    parentId: null, // top-level comments only
  };

  if (status !== undefined) {
    query.status = status;
  }

  // NOTE:
  // No `isDeleted` condition here → returns:
  // - deleted
  // - non-deleted
  // - everything
  return this.find(query)
    .sort({ createdAt: -1 })
    .exec();
};

/**
 * Exported TravelComment model.
 * Uses existing model if already compiled (hot-reload safe).
 */
export const TravelCommentModel = defineModel("TravelComment", TravelCommentSchema);