import { NOTIFICATION_PRIORITY, USER_NOTIFICATION_TYPE } from "../constants/notification.const";

/**
 * Notification DTO for frontend
 */
export interface UserNotificationDTO {
    id: string;
    recipientId: string;
    type: USER_NOTIFICATION_TYPE;
    priority: NOTIFICATION_PRIORITY;

    title: string;
    message: string;
    link?: string;

    relatedModel?: string;   // Tour, Booking, etc.
    relatedId?: string;

    isRead: boolean;
    deliveredAt?: string;
    readAt?: string;

    createdAt: string;
    updatedAt: string;
}
