// models/support-system-notification.model.ts
import {
  ADMIN_NOTIFICATION_PRIORITY,
  ADMIN_NOTIFICATION_TYPE,
  AdminNotificationPriority,
  AdminNotificationType,
} from "@/constants/support-system-notification.const";
import { defineModel } from "@/lib/helpers/defineModel";
import { Schema, Document, Types } from "mongoose";

/**
 * Interface – only what you need:
 * - type & priority (for filtering/sorting)
 * - title & message (the actual content)
 * - optional link, icon, related entity
 * - meta for any extra data
 * - soft delete & expiry
 */
/** Mongoose Document interface — server-side only. */
export interface ISupportSystemNotification extends Document {
  type: AdminNotificationType;
  title: string;
  message: string;
  link?: string;
  icon?: string;
  relatedModel?: string;
  relatedId?: Types.ObjectId;
  priority: AdminNotificationPriority;
  meta?: Record<string, unknown>;
  expiresAt?: Date;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Plain-object interface for API responses / frontend use.
 * Does NOT extend Mongoose Document — safe to spread & mutate in Zustand stores.
 */
export interface ISupportSystemNotificationData {
  _id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  link?: string;
  icon?: string;
  relatedModel?: string;
  relatedId?: string;
  priority: AdminNotificationPriority;
  meta?: Record<string, unknown>;
  expiresAt?: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const SupportSystemNotificationSchema = new Schema<ISupportSystemNotification>(
  {
    type: {
      type: String,
      enum: Object.values(ADMIN_NOTIFICATION_TYPE),
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    link: { type: String, trim: true },
    icon: { type: String, trim: true },
    relatedModel: { type: String, trim: true },
    relatedId: { type: Schema.Types.ObjectId },
    priority: {
      type: String,
      enum: Object.values(ADMIN_NOTIFICATION_PRIORITY),
      default: ADMIN_NOTIFICATION_PRIORITY.MEDIUM,
      index: true,
    },
    meta: { type: Schema.Types.Mixed },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
    isRead: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Keeps the TTL logic – LOW/MEDIUM → 60 days, HIGH/CRITICAL → never expire
SupportSystemNotificationSchema.pre("save", function (next) {
  if (
    this.priority === ADMIN_NOTIFICATION_PRIORITY.LOW ||
    this.priority === ADMIN_NOTIFICATION_PRIORITY.MEDIUM
  ) {
    this.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);
  } else {
    this.expiresAt = undefined;
  }
  next();
});

// Simple index for the most common query: newest (undeleted) notifications
SupportSystemNotificationSchema.index({ isDeleted: 1, createdAt: -1 });

export const SupportSystemNotificationModel = defineModel("SupportSystemNotification", SupportSystemNotificationSchema);