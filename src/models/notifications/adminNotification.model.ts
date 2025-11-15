// models/admin-notification.model.ts
import {
  ADMIN_NOTIFICATION_PRIORITY,
  ADMIN_NOTIFICATION_TYPE,
} from "@/constants/adminNotification.const";
import { models } from "mongoose";
import { Schema, model, Document, Types } from "mongoose";

/**
 * TypeScript interface describing the shape of an AdminNotification document.
 * Extends Mongoose's Document type for built-in MongoDB document properties.
 */
export interface IAdminNotification extends Document {
  recipients: Types.ObjectId[]; // Array of admin user IDs who should receive this notification
  type: ADMIN_NOTIFICATION_TYPE; // The event type that triggered this notification
  title: string; // Short, descriptive headline for quick scanning
  message: string; // Detailed explanation of the event or alert
  link?: string; // Optional URL for more details or direct action
  icon?: string; // Optional icon name for UI display (e.g., "alert", "user")
  relatedModel?: string; // Optional: name of the related Mongoose model (e.g., "Order")
  relatedId?: Types.ObjectId; // Optional: ID of the related entity (e.g., specific order ID)
  priority: ADMIN_NOTIFICATION_PRIORITY; // Urgency level of the notification
  isRead: boolean; // Whether the notification has been marked as read
  readBy: Types.ObjectId[]; // IDs of admins who have read this notification
  meta?: Record<string, unknown>; // Arbitrary structured data for extra context
  expiresAt?: Date; // Optional: auto-expiry date for cleanup
  isDeleted?: boolean; // Soft delete flag (keeps record in DB but hides from UI)
  createdAt: Date; // Auto-managed by Mongoose timestamps
  updatedAt: Date; // Auto-managed by Mongoose timestamps
}

/**
 * Mongoose schema definition for AdminNotification.
 * Includes indexes for performance and enum validation for type safety.
 */
const AdminNotificationSchema = new Schema<IAdminNotification>(
  {
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the admin user model
        required: true,
        index: true, // Speeds up queries filtering by recipient
      },
    ],
    type: {
      type: String,
      enum: Object.values(ADMIN_NOTIFICATION_TYPE), // Restricts to allowed event types
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150, // Prevents overly long titles
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000, // Prevents excessively long messages
    },
    link: { type: String, trim: true },
    icon: { type: String, trim: true },
    relatedModel: { type: String, trim: true },
    relatedId: { type: Schema.Types.ObjectId },
    priority: {
      type: String,
      enum: Object.values(ADMIN_NOTIFICATION_PRIORITY),
      default: ADMIN_NOTIFICATION_PRIORITY.MEDIUM,
      index: true, // Useful for sorting/filtering by urgency
    },
    isRead: { type: Boolean, default: false, index: true },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
        index: true,
      },
    ],
    meta: { type: Schema.Types.Mixed }, // Flexible field for extra data
    /**
     * Only set for LOW/MEDIUM priority so TTL deletes them after 60 days.
     * High/Critical leave this field empty → they never expire automatically.
     */
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

// Auto-set expiresAt for LOW and MEDIUM priorities
AdminNotificationSchema.pre("save", function (next) {
  if (
    this.priority === ADMIN_NOTIFICATION_PRIORITY.LOW ||
    this.priority === ADMIN_NOTIFICATION_PRIORITY.MEDIUM
  ) {
    this.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60); // 60 days
  } else {
    this.expiresAt = undefined; // Never auto-delete
  }
  next();
});

/**
 * Compound index for faster queries when fetching unread notifications
 * for a specific admin, sorted by newest first.
 */
AdminNotificationSchema.index({ recipients: 1, isRead: 1, createdAt: -1 });

/**
 * Retrieves the AdminNotification model from a specific DB connection.
 * This pattern prevents model recompilation errors in hot-reload environments.
 */
export const getAdminNotificationModel =
  models.AdminNotification ||
  model<IAdminNotification>("AdminNotification", AdminNotificationSchema);

/**
 * Default model export for single-connection applications.
 */
export const AdminNotification = model<IAdminNotification>(
  "AdminNotification",
  AdminNotificationSchema
);
