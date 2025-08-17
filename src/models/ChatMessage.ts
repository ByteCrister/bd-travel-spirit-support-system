// models/ChatMessage.ts

import mongoose, { Schema, Document, Connection } from 'mongoose';

/**
 * Chat message model — represents a message exchanged between two users.
 */
export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;           // User who sends the message
  receiver: mongoose.Types.ObjectId;         // User who receives the message
  message: string;                            // Text content of the message
  timestamp: Date;                            // Explicit sent time (defaults to now)
  isDraft: boolean;                           // True if message is still a draft and not sent
  isRead: boolean;                            // True if the receiver has read the message
  isDeletedBySender: boolean;                 // Sender's action to hide/delete this message
  isDeletedByReceiver: boolean;               // Receiver's action to hide/delete this message
}

// Define schema
const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true, // Speeds up sender-based queries
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true, // Speeds up receiver-based queries
    },
    message: {
      type: String,
      required: true,
      trim: true, // Removes leading/trailing spaces
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isDraft: {
      type: Boolean,
      default: false,
      index: true, // Queries for drafts become faster
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeletedBySender: {
      type: Boolean,
      default: false,
    },
    isDeletedByReceiver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt fields automatically
  }
);

// Unique constraint: Prevent multiple drafts between the same sender & receiver
ChatMessageSchema.index(
  { sender: 1, receiver: 1, isDraft: 1 },
  {
    unique: true,
    partialFilterExpression: { isDraft: true },
  }
);

/**
 * Returns the ChatMessage model from the provided connection.
 * Prevents model recompilation in case of hot reload.
 */
export const getChatMessageModel = (db: Connection) =>
  db.models.ChatMessage ||
  db.model<IChatMessage>('ChatMessage', ChatMessageSchema);
