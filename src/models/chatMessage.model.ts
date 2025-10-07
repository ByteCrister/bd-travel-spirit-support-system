import mongoose, { Schema, Document, models, model } from 'mongoose';

/**
 * Enum for moderation status of a message.
 * Keeps values consistent across schema, code, and queries.
 */
export const MODERATION_STATUS = {
  CLEAN: 'clean',
  FLAGGED: 'flagged',
  REMOVED: 'removed',
} as const;

export type ModerationStatusType =
  typeof MODERATION_STATUS[keyof typeof MODERATION_STATUS];

/**
 * Chat message document interface.
 * Represents a single text message exchanged between two users.
 */
export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;          // User who sends the message
  receiver: mongoose.Types.ObjectId;        // User who receives the message
  message: string;                          // Text content of the message
  timestamp: Date;                          // When the message was sent
  isDraft: boolean;                         // True if message is a draft (not yet sent)
  isRead: boolean;                          // True if receiver has read the message
  isDelivered: boolean;                     // True if message was delivered to receiver
  isEdited: boolean;                        // True if message was edited after sending
  isDeletedBySender: boolean;               // True if sender deleted/hid the message
  isDeletedByReceiver: boolean;             // True if receiver deleted/hid the message
  moderationStatus: ModerationStatusType;   // Moderation state (clean, flagged, removed)
}

/**
 * Schema definition for chat messages.
 */
const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Speeds up queries by sender
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Speeds up queries by receiver
    },
    message: {
      type: String,
      required: true,
      trim: true, // Removes leading/trailing whitespace
    },
    timestamp: {
      type: Date,
      default: Date.now, // Defaults to current time
    },
    isDraft: {
      type: Boolean,
      default: false,
      index: true, // Useful for draft lookups
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true, // Common query: unread messages
    },
    isDelivered: {
      type: Boolean,
      default: false,
      index: true, // Track delivery receipts
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeletedBySender: {
      type: Boolean,
      default: false,
    },
    isDeletedByReceiver: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: Object.values(MODERATION_STATUS),
      default: MODERATION_STATUS.CLEAN,
      index: true, // Enables moderation dashboards
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

/**
 * Compound index for fast retrieval of unread messages for a receiver.
 */
ChatMessageSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });

/**
 * Unique constraint: ensures only one draft exists between the same sender/receiver.
 */
ChatMessageSchema.index(
  { sender: 1, receiver: 1, isDraft: 1 },
  { unique: true, partialFilterExpression: { isDraft: true } }
);

/**
 * Export the ChatMessage model.
 * Uses existing model if already compiled (avoids hot-reload issues).
 */
export const ChatMessageModel =
  models.ChatMessage || model<IChatMessage>('ChatMessage', ChatMessageSchema);
