// models/user-notification.model.ts
import { Schema, Document, Types, models, model } from "mongoose";

/**
 * Types of notifications supported by the Bangladeshi platform.
 * Keep this tight — adding too many ad-hoc values can hurt filtering logic.
 */
export enum USER_NOTIFICATION_TYPE {
    BOOKING_CONFIRMATION = "booking_confirmation", // Sent after a successful booking
    BOOKING_REMINDER = "booking_reminder",         // Reminder before a booked tour starts
    NEW_TOUR = "new_tour",                         // Notify about new tour listings
    DISCOUNT_OFFER = "discount_offer",             // Marketing/promo-based notifications
    MESSAGE = "message",                           // Direct or group message
    SYSTEM_ALERT = "system_alert"                  // Critical platform/system messages
}

/** Optional urgency levels for ordering/display logic */
export enum NOTIFICATION_PRIORITY {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent"
}

/** Entities that can be referenced in notifications */
export enum NOTIFICATION_RELATED_MODAL {
    TOUR = "Tour",
    BOOKING = "Booking",
    USER = "User",
    PAYMENT = "Payment",
    SUPPORT_TICKET = "SupportTicket"
}

/**
 * =========================
 * INTERFACE
 * =========================
 * Structure of a notification stored in MongoDB.
 */
export interface IUserNotification extends Document {
    recipient: Types.ObjectId; // Target user
    type: USER_NOTIFICATION_TYPE; // Category
    priority: NOTIFICATION_PRIORITY;
    title: string;              // Short heading
    message: string;            // Longer descriptive body
    link?: string;              // URL to open in UI
    relatedModel?: NOTIFICATION_RELATED_MODAL;
    relatedId?: Types.ObjectId;
    isRead: boolean;            // UI read/unread state
    deliveredAt?: Date;         // Time it was actually sent to user
    readAt?: Date;              // Time the user opened it
    meta?: Record<string, unknown>; // Flexible key-value store for custom context
    expiresAt?: Date;           // Optional expiration date for TTL index
    createdAt: Date;
    updatedAt: Date;
}

/**
 * =========================
 * SCHEMA
 * =========================
 */
const UserNotificationSchema = new Schema<IUserNotification>(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(USER_NOTIFICATION_TYPE),
            required: true,
            index: true,
        },
        priority: {
            type: String,
            enum: Object.values(NOTIFICATION_PRIORITY),
            default: NOTIFICATION_PRIORITY.NORMAL,
            index: true,
        },
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        link: { type: String, trim: true },
        relatedModel: {
            type: String,
            enum: Object.values(NOTIFICATION_RELATED_MODAL),
        },
        relatedId: { type: Schema.Types.ObjectId },
        isRead: { type: Boolean, default: false, index: true },
        deliveredAt: Date,
        readAt: Date,
        meta: {
            type: Map,
            of: Schema.Types.Mixed, // Allows nested key-value pairs without schema changes
        },
        expiresAt: { type: Date, index: { expireAfterSeconds: 0 } }
    },

    {
        timestamps: true, // auto-manages createdAt / updatedAt
    }
);

/**
 * =========================
 * INDEXES
 * =========================
 * Helpful for:
 * - Retrieving a user's unread notifications quickly
 * - Sorting by priority for urgent alerts
 * - Filtering by type for targeted queries
 */
UserNotificationSchema.index({ recipient: 1, isRead: 1 });
UserNotificationSchema.index({ recipient: 1, priority: -1 });
UserNotificationSchema.index({ createdAt: -1 });
// Middleware to set expiry date conditionally
UserNotificationSchema.pre("save", function (next) {
    if (
        this.priority === NOTIFICATION_PRIORITY.LOW ||
        this.priority === NOTIFICATION_PRIORITY.NORMAL
    ) {
        this.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60); // +60 days
    } else {
        this.expiresAt = undefined; // No auto-delete
    }
    next();
});


/**
 * =========================
 * MODEL FACTORY
 * =========================
 * Ensures hot-reload safety in dev and supports multi-connection setups.
 */
export const UserNotificationModel = models.UserNotification || model<IUserNotification>("UserNotification", UserNotificationSchema);
