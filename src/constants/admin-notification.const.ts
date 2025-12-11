/**
 * Enum representing the different system or business events
 * that can trigger an admin notification.
 *
 * Using an enum ensures:
 * - Type safety in TypeScript (no accidental typos in string values)
 * - Centralized management of allowed event types
 * - Easy reuse across services, controllers, and tests
 */
export enum ADMIN_NOTIFICATION_TYPE {
  NEW_USER_SIGNUP = "new_user_signup", // A new user has registered
  NEW_BOOKING = "new_booking", // A booking/reservation has been made
  LOW_INVENTORY = "low_inventory", // Stock or inventory is running low
  HIGH_TRAFFIC_ALERT = "high_traffic_alert", // Unusually high traffic detected
  FAILED_PAYMENT = "failed_payment", // A payment attempt failed
  SYSTEM_ERROR = "system_error", // A critical system error occurred
  CONTENT_FLAGGED = "content_flagged", // User-generated content was flagged
}

/**
 * Enum representing the urgency/priority level of a notification.
 *
 * This helps admins quickly identify which notifications
 * require immediate attention vs. those that can be handled later.
 */
export enum ADMIN_NOTIFICATION_PRIORITY {
  LOW = "low", // Informational, no immediate action needed
  MEDIUM = "medium", // Normal priority, should be addressed in due course
  HIGH = "high", // Important, requires timely attention
  CRITICAL = "critical", // Urgent, immediate action required
}
