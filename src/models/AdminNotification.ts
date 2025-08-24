// models/AdminNotification.ts
import { Schema, model, Document, Types, Connection } from 'mongoose';

/**
 * Enum representing the different system or business events
 * that can trigger an admin notification.
 *
 * Using an enum ensures:
 * - Type safety in TypeScript (no accidental typos in string values)
 * - Centralized management of allowed event types
 * - Easy reuse across services, controllers, and tests
 */
export enum AdminNotificationType {
    NEW_USER_SIGNUP = 'new_user_signup',       // A new user has registered
    NEW_BOOKING = 'new_booking',               // A booking/reservation has been made
    LOW_INVENTORY = 'low_inventory',           // Stock or inventory is running low
    HIGH_TRAFFIC_ALERT = 'high_traffic_alert', // Unusually high traffic detected
    FAILED_PAYMENT = 'failed_payment',         // A payment attempt failed
    SYSTEM_ERROR = 'system_error',             // A critical system error occurred
    CONTENT_FLAGGED = 'content_flagged',       // User-generated content was flagged
}

/**
 * Enum representing the urgency/priority level of a notification.
 *
 * This helps admins quickly identify which notifications
 * require immediate attention vs. those that can be handled later.
 */
export enum AdminNotificationPriority {
    LOW = 'low',           // Informational, no immediate action needed
    MEDIUM = 'medium',     // Normal priority, should be addressed in due course
    HIGH = 'high',         // Important, requires timely attention
    CRITICAL = 'critical', // Urgent, immediate action required
}

/**
 * TypeScript interface describing the shape of an AdminNotification document.
 * Extends Mongoose's Document type for built-in MongoDB document properties.
 */
export interface IAdminNotification extends Document {
    recipients: Types.ObjectId[];              // Array of admin user IDs who should receive this notification
    type: AdminNotificationType;               // The event type that triggered this notification
    title: string;                              // Short, descriptive headline for quick scanning
    message: string;                            // Detailed explanation of the event or alert
    link?: string;                              // Optional URL for more details or direct action
    icon?: string;                              // Optional icon name for UI display (e.g., "alert", "user")
    relatedModel?: string;                      // Optional: name of the related Mongoose model (e.g., "Order")
    relatedId?: Types.ObjectId;                 // Optional: ID of the related entity (e.g., specific order ID)
    priority: AdminNotificationPriority;        // Urgency level of the notification
    isRead: boolean;                            // Whether the notification has been marked as read
    readBy: Types.ObjectId[];                   // IDs of admins who have read this notification
    meta?: Record<string, unknown>;             // Arbitrary structured data for extra context
    expiresAt?: Date;                           // Optional: auto-expiry date for cleanup
    isDeleted?: boolean;                        // Soft delete flag (keeps record in DB but hides from UI)
    createdAt: Date;                            // Auto-managed by Mongoose timestamps
    updatedAt: Date;                            // Auto-managed by Mongoose timestamps
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
                ref: 'User', // Reference to the admin user model
                required: true,
                index: true, // Speeds up queries filtering by recipient
            },
        ],
        type: {
            type: String,
            enum: Object.values(AdminNotificationType), // Restricts to allowed event types
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
            enum: Object.values(AdminNotificationPriority),
            default: AdminNotificationPriority.MEDIUM,
            index: true, // Useful for sorting/filtering by urgency
        },
        isRead: { type: Boolean, default: false, index: true },
        readBy: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: [],
                index: true,
            },
        ],
        meta: { type: Schema.Types.Mixed }, // Flexible field for extra data
        expiresAt: { type: Date, index: true }, // Can be used with TTL index for auto-deletion
        isDeleted: { type: Boolean, default: false, index: true },
    },
    { timestamps: true } // Automatically adds createdAt & updatedAt
);

/**
 * Compound index for faster queries when fetching unread notifications
 * for a specific admin, sorted by newest first.
 */
AdminNotificationSchema.index({ recipients: 1, isRead: 1, createdAt: -1 });

/**
 * Retrieves the AdminNotification model from a specific DB connection.
 * This pattern prevents model recompilation errors in hot-reload environments.
 */
export const getAdminNotificationModel = (db: Connection) =>
    db.models.AdminNotification ||
    db.model<IAdminNotification>('AdminNotification', AdminNotificationSchema);

/**
 * Default model export for single-connection applications.
 */
export const AdminNotification = model<IAdminNotification>(
    'AdminNotification',
    AdminNotificationSchema
);
