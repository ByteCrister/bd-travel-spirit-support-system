// models/UserNotification.ts
import { Schema, Document, Types, Connection } from "mongoose";

/**
 * Types of notifications supported by the Bandaldegi platform.
 * Keep this tight — adding too many ad-hoc values can hurt filtering logic.
 */
export type UserNotificationType =
    | "booking_confirmation" // Sent after a successful booking
    | "booking_reminder"     // Reminder before a booked tour starts
    | "new_tour"             // Notify about new tour listings
    | "discount_offer"       // Marketing/promo-based notifications
    | "message"              // Direct or group message
    | "system_alert";        // Critical platform/system messages

/** Optional urgency levels for ordering/display logic */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/** Entities that can be referenced in notifications */
export type NotificationRelatedModel =
    | "Tour"
    | "Booking"
    | "User"
    | "Payment"
    | "SupportTicket";

/**
 * =========================
 * INTERFACE
 * =========================
 * Structure of a notification stored in MongoDB.
 */
export interface IUserNotification extends Document {
    recipient: Types.ObjectId; // Target user
    type: UserNotificationType; // Category
    priority: NotificationPriority;
    title: string;              // Short heading
    message: string;            // Longer descriptive body
    link?: string;              // URL to open in UI
    relatedModel?: NotificationRelatedModel;
    relatedId?: Types.ObjectId;
    isRead: boolean;            // UI read/unread state
    deliveredAt?: Date;         // Time it was actually sent to user
    readAt?: Date;              // Time the user opened it
    meta?: Record<string, unknown>; // Flexible key-value store for custom context
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
            ref: "users",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: [
                "booking_confirmation",
                "booking_reminder",
                "new_tour",
                "discount_offer",
                "message",
                "system_alert",
            ],
            required: true,
            index: true,
        },
        priority: {
            type: String,
            enum: ["low", "normal", "high", "urgent"],
            default: "normal",
            index: true,
        },
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        link: { type: String, trim: true },
        relatedModel: {
            type: String,
            enum: ["Tour", "Booking", "User", "Payment", "SupportTicket"],
        },
        relatedId: { type: Schema.Types.ObjectId },
        isRead: { type: Boolean, default: false, index: true },
        deliveredAt: Date,
        readAt: Date,
        meta: {
            type: Map,
            of: Schema.Types.Mixed, // Allows nested key-value pairs without schema changes
        },
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

/**
 * =========================
 * MODEL FACTORY
 * =========================
 * Ensures hot-reload safety in dev and supports multi-connection setups.
 */
export const getUserNotificationModel = (db: Connection) =>
    db.models.UserNotification ||
    db.model<IUserNotification>("UserNotification", UserNotificationSchema);
