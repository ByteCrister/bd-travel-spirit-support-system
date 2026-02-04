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
export interface ITravelArticleComment extends Document {
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

  approve(): Promise<ITravelArticleComment>;
  reject(reason: string): Promise<ITravelArticleComment>;
  softDelete(): Promise<ITravelArticleComment>;
  restore(): Promise<ITravelArticleComment>;
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

export interface ITravelArticleCommentModel extends Model<ITravelArticleComment> {

  findByArticle(
    articleId: Types.ObjectId,
    status?: CommentStatus,
    session?: ClientSession
  ): Promise<ITravelArticleComment[]>;

  findReplies(
    parentId: Types.ObjectId,
    status?: CommentStatus,
    session?: ClientSession
  ): Promise<ITravelArticleComment[]>;

  createReply(
    articleId: Types.ObjectId,
    parentId: Types.ObjectId,
    replyData: ICreateReplyData,
    session?: ClientSession
  ): Promise<ITravelArticleComment>;

  findPendingModeration(): Promise<ITravelArticleComment[]>;

  findDeleted(
    session?: ClientSession
  ): Promise<ITravelArticleComment[]>;

  findWithDeleted(
    articleId: Types.ObjectId,
    status?: CommentStatus,
    session?: ClientSession
  ): Promise<ITravelArticleComment[]>;

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
const TravelArticleCommentSchema = new Schema<
  ITravelArticleComment,
  ITravelArticleCommentModel>(
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

      // Author is a traveler)
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
          validator: function (this: ITravelArticleComment, value?: string | null): boolean {
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
TravelArticleCommentSchema.index({ articleId: 1, status: 1, isDeleted: 1, createdAt: -1 });

/**
 * Index for admin queries to see deleted content
 */
TravelArticleCommentSchema.index({ isDeleted: 1, createdAt: -1 });

/**
 * Virtual field: replyCount
 * Provides a quick way to get the number of replies without fetching them all.
 */
TravelArticleCommentSchema.virtual("replyCount").get(function (this: ITravelArticleComment) {
  return this.replies?.length || 0;
});

/**
 * Pre-save hook:
 * Ensures content is trimmed and sanitized before saving.
 * Clears rejectReason when comment is not rejected.
 */
TravelArticleCommentSchema.pre("save", function (next) {
  if (this.content) {
    this.content = this.content.trim();
  }

  // Clear rejectReason if status is not REJECTED
  if (this.status !== COMMENT_STATUS.REJECTED) {
    this.rejectReason = undefined;
  }

  next();
});

TravelArticleCommentSchema.methods.approve = async function (): Promise<ITravelArticleComment> {
  this.status = COMMENT_STATUS.APPROVED;
  this.rejectReason = null; // Clear reject reason when approving
  return this.save();
};

TravelArticleCommentSchema.methods.reject = async function (reason: string): Promise<ITravelArticleComment> {
  this.status = COMMENT_STATUS.REJECTED;
  this.rejectReason = reason;
  return this.save();
};

TravelArticleCommentSchema.methods.softDelete = async function (): Promise<ITravelArticleComment> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

TravelArticleCommentSchema.methods.restore = async function (): Promise<ITravelArticleComment> {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

/**
 * Static methods
 */
TravelArticleCommentSchema.statics.findByArticle = function (
  articleId: Types.ObjectId,
  status: CommentStatus = COMMENT_STATUS.APPROVED,
  session?: ClientSession
): Promise<ITravelArticleComment[]> {

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

TravelArticleCommentSchema.statics.findReplies = function (
  parentId: Types.ObjectId,
  status: CommentStatus = COMMENT_STATUS.APPROVED,
  session?: ClientSession
): Promise<ITravelArticleComment[]> {
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

TravelArticleCommentSchema.statics.createReply = async function (
  articleId: Types.ObjectId,
  parentId: Types.ObjectId,
  replyData: ICreateReplyData,
  session?: ClientSession
): Promise<ITravelArticleComment> {
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

TravelArticleCommentSchema.statics.findPendingModeration = function (
  session?: ClientSession
): Promise<ITravelArticleComment[]> {

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

TravelArticleCommentSchema.statics.findDeleted = function (
  session?: ClientSession
): Promise<ITravelArticleComment[]> {
  const query = this.find({ isDeleted: true })
    .sort({ deletedAt: -1 });

  if (session) {
    query.session(session);
  }

  return query.exec();
};

TravelArticleCommentSchema.statics.findWithDeleted = function (
  articleId: Types.ObjectId,
  status?: CommentStatus,
  session?: ClientSession
): Promise<ITravelArticleComment[]> {
  const queryObj: FilterQuery<ITravelArticleComment> = {
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

TravelArticleCommentSchema.statics.toggleLikeById = async function (
  commentId: Types.ObjectId,
  userId: Types.ObjectId,
  session?: ClientSession
) {
  const query = this.findById(commentId);

  if (session) {
    query.session(session);
  }

  const comment = await query;

  if (!comment || comment.isDeleted) {
    throw new Error("Comment not found");
  }

  const likeIndex = comment.likes.findIndex(
    (like: ITravelCommentLike) =>
      like.userId.toString() === userId.toString()
  );

  let liked: boolean;

  if (likeIndex >= 0) {
    comment.likes.splice(likeIndex, 1);
    liked = false;
  } else {
    comment.likes.push({
      userId,
      likedAt: new Date(),
    } as ITravelCommentLike);
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
export const TravelArticleCommentModel = defineModel<
  ITravelArticleComment,
  ITravelArticleCommentModel
>("TravelArticleComment", TravelArticleCommentSchema);

export default TravelArticleCommentModel;