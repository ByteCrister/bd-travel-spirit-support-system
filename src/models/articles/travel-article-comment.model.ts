// models/travelComment.model.ts
import { COMMENT_STATUS, CommentStatus } from "@/constants/articleComment.const";
import { defineModel } from "@/lib/helpers/defineModel";
import { ClientSession, FilterQuery, Model } from "mongoose";
import { Schema, Types, Document } from "mongoose";

/**
 * Interface for tracking user likes on travel comments
 */
export interface ITravelCommentLike extends Document {
  userId: Types.ObjectId;
  commentId: Types.ObjectId;
  likedAt: Date;
}

/**
 * Interface describing the shape of a Travel Comment document.
 * Extends Mongoose's Document type for full typing support.
 */
export interface ITravelComment extends Document {
  articleId: Types.ObjectId; // The travel article this comment belongs to
  parentId?: Types.ObjectId | null; // Parent comment ID (for threaded/nested replies)
  author: Types.ObjectId; // Traveler who created the comment
  content: string; // The actual text content of the comment
  likes: ITravelCommentLike[];
  replies: Types.ObjectId[]; // Array of child comment IDs (nested replies)
  status: CommentStatus; // Moderation status (pending/approved/rejected)
  rejectReason?: string; // Reason provided by admin when rejecting a comment
  isDeleted: boolean; // Soft delete flag for admin deletion
  deletedAt?: Date; // When the comment was soft-deleted
  createdAt: Date; // Auto-managed timestamp when created
  updatedAt: Date; // Auto-managed timestamp when last updated
}

/**
 * Sub-schema for tracking likes (embedded)
 */
const TravelCommentLikeSchema = new Schema<ITravelCommentLike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    likedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false, // important: prevent extra _id per like
  }
);

export interface TravelCommentModel extends Model<ITravelComment> {

  findByArticle(
    articleId: Types.ObjectId,
    status?: CommentStatus,
    session?: ClientSession
  ): Promise<ITravelComment[]>;

  findReplies(
    parentId: Types.ObjectId,
    status?: CommentStatus,
    session?: ClientSession
  ): Promise<ITravelComment[]>;

  createReply(
    articleId: Types.ObjectId,
    parentId: Types.ObjectId,
    replyData: ICreateReplyData,
    session?: ClientSession
  ): Promise<ITravelComment>;

  findPendingModeration(): Promise<ITravelComment[]>;

  findDeleted(
    session?: ClientSession
  ): Promise<ITravelComment[]>;

  findWithDeleted(
    articleId: Types.ObjectId,
    status?: CommentStatus,
    session?: ClientSession
  ): Promise<ITravelComment[]>;

  toggleLikeById(
    commentId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession
  ): Promise<{
    liked: boolean;
    likeCount: number;
  }>;

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

    likes: {
      type: [TravelCommentLikeSchema],
      default: [],
    },

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
  status: CommentStatus = COMMENT_STATUS.APPROVED,
  session?: ClientSession
): Promise<ITravelComment[]> {

  const query = this.find({
    articleId,
    status,
    isDeleted: false,
    parentId: null,
  })
    .sort({ createdAt: -1 });

  if (session) {
    query.session(session);
  }

  return query.exec();
};

TravelCommentSchema.statics.findReplies = function (
  parentId: Types.ObjectId,
  status: CommentStatus = COMMENT_STATUS.APPROVED,
  session?: ClientSession
): Promise<ITravelComment[]> {
  const query = this.find({
    parentId,
    status,
    isDeleted: false,
  })
    .sort({ createdAt: 1 });

  if (session) {
    query.session(session);
  }

  return query.exec();
};

TravelCommentSchema.statics.createReply = async function (
  articleId: Types.ObjectId,
  parentId: Types.ObjectId,
  replyData: ICreateReplyData,
  session?: ClientSession
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
  await this.findByIdAndUpdate(parentId,
    { $push: { replies: savedReply._id } },
    { session }
  );

  return savedReply;
};

TravelCommentSchema.statics.findPendingModeration = function (
  session?: ClientSession
): Promise<ITravelComment[]> {

  const query = this.find({
    status: COMMENT_STATUS.PENDING,
    isDeleted: false,
  })
    .sort({ createdAt: -1 });

  if (session) {
    query.session(session);
  }

  return query.exec();
};

TravelCommentSchema.statics.findDeleted = function (
  session?: ClientSession
): Promise<ITravelComment[]> {
  const query = this.find({ isDeleted: true })
    .sort({ deletedAt: -1 });

  if (session) {
    query.session(session);
  }

  return query.exec();
};

TravelCommentSchema.statics.findWithDeleted = function (
  articleId: Types.ObjectId,
  status?: CommentStatus,
  session?: ClientSession
): Promise<ITravelComment[]> {
  const queryObj: FilterQuery<ITravelComment> = {
    articleId,
    parentId: null,
  };

  if (status !== undefined) {
    queryObj.status = status;
  }

  // NOTE:
  // No `isDeleted` condition here → returns:
  // - deleted
  // - non-deleted
  // - everything

  const query = this.find(queryObj)
    .sort({ createdAt: -1 });

  if (session) {
    query.session(session);
  }

  return query.exec();
};

TravelCommentSchema.statics.toggleLikeById = async function (
  commentId: Types.ObjectId,
  userId: Types.ObjectId,
  session?: ClientSession
) {
  const comment = await this.findById(commentId).session(session);

  if (!comment || comment.isDeleted) {
    throw new Error("Comment not found");
  }

  // Specify type for `like` here
  const likeIndex = comment.likes.findIndex(
    (like: ITravelCommentLike) => like.userId.toString() === userId.toString()
  );

  let liked: boolean;

  if (likeIndex >= 0) {
    // Unlike
    comment.likes.splice(likeIndex, 1);
    liked = false;
  } else {
    // Like
    comment.likes.push({
      userId,
      likedAt: new Date(),
    } as ITravelCommentLike); // cast to correct type
    liked = true;
  }

  await comment.save({ session });

  return {
    liked,
    likeCount: comment.likes.length,
  };
};

/**
 * Exported TravelComment model.
 * Uses existing model if already compiled (hot-reload safe).
 */
export const TravelCommentModel = defineModel("TravelComment", TravelCommentSchema);