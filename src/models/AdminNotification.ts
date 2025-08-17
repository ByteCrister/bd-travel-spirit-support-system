// models/AdminNotification.ts

import { Schema, model, Document, Types, Connection } from 'mongoose';

/**
 * The different system or business events that can trigger an admin notification.
 */
export type AdminNotificationType =
    | 'new_user_signup'
    | 'new_booking'
    | 'low_inventory'
    | 'high_traffic_alert'
    | 'failed_payment'
    | 'system_error'
    | 'content_flagged';

/**
 * Represents an administrative notification entity.
 * This model is used to deliver system-generated events or alerts to one or more admin users.
 */
export interface IAdminNotification extends Document {
    recipients: Types.ObjectId[];         // Target admin user(s) to notify
    type: AdminNotificationType;          // Event type
    title: string;                         // Short, descriptive headline
    message: string;                       // Detailed notification text
    link?: string;                         // Optional URL for more info or direct action
    icon?: string;                         // Optional UI icon (e.g., "alert", "user", "warning")
    relatedModel?: string;                 // Mongoose model name related to the event
    relatedId?: Types.ObjectId;            // ID of related entity
    priority: 'low' | 'medium' | 'high' | 'critical'; // Urgency level
    isRead: boolean;                       // Quick flag for read/unread state
    readBy: Types.ObjectId[];              // Specific admins who have read it
    meta?: Record<string, unknown>;        // Arbitrary structured extra data
    expiresAt?: Date;                      // Optional expiry time for auto-cleanup
    isDeleted?: boolean;                   // Soft delete flag
    createdAt: Date;
    updatedAt: Date;
}

const AdminNotificationSchema = new Schema<IAdminNotification>(
    {
        recipients: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User', // Ensure "User" is your admin user model
                required: true,
                index: true,
            },
        ],
        type: {
            type: String,
            enum: [
                'new_user_signup',
                'new_booking',
                'low_inventory',
                'high_traffic_alert',
                'failed_payment',
                'system_error',
                'content_flagged',
            ],
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
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
            index: true,
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
        meta: { type: Schema.Types.Mixed },
        expiresAt: { type: Date, index: true },
        isDeleted: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

// Compound index for faster unread queries per admin
AdminNotificationSchema.index({ recipients: 1, isRead: 1, createdAt: -1 });

// Optional TTL index for automatic expiry cleanup if expiresAt is set
// AdminNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Retrieves the AdminNotification model from a specific DB connection.
 * Prevents model recompilation in hot-reload environments.
 */
export const getAdminNotificationModel = (db: Connection) =>
    db.models.AdminNotification ||
    db.model<IAdminNotification>('AdminNotification', AdminNotificationSchema);

// Direct default model export (useful for single-connection apps)
export const AdminNotification = model<IAdminNotification>(
    'AdminNotification',
    AdminNotificationSchema
);
