// types/notification.types.ts
import {
    AdminNotificationType,
    AdminNotificationPriority,
} from "@/constants/support-system-notification.const";

/**
 * Plain-object representation of a Support System Notification.
 * This is the shape returned by the API and used in the frontend.
 * It does NOT extend Mongoose Document – safe for Zustand stores and components.
 */
export interface SupportSystemNotificationType {
    _id: string;
    type: AdminNotificationType;
    title: string;
    message: string;
    link?: string;
    icon?: string;
    relatedModel?: string;
    relatedId?: string;                  // always a string once serialised
    priority: AdminNotificationPriority;
    meta?: Record<string, unknown>;
    expiresAt?: string;                  // ISO date string
    isRead: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Standard response shape for cursor‑based pagination.
 */
export interface FetchNotificationsResponseType {
    notifications: SupportSystemNotificationType[];
    nextCursor: string | null;
    hasMore: boolean;
    totalUnread: number;
}