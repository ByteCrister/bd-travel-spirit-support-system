/**
 * Enum representing the different system or business events
 * that can trigger a guide system notification.
 *
 * Using an enum ensures:
 * - Type safety in TypeScript (no accidental typos in string values)
 * - Centralized management of allowed event types
 * - Easy reuse across services, controllers, and tests
 */
export enum GUIDE_SYSTEM_NOTIFICATION_TYPE {
  // --- Password Resets ---
  GUIDE_EMP_FORGOT_PASSWORD = "guide_emp_forgot_password", // A guide’s employee (sub‑account) forgot password

  // --- Bookings & Transactions: This is for Guide not for Support System ---
  NEW_BOOKING = "new_booking", // A new tour/activity booking was made
  BOOKING_CANCELLED = "booking_cancelled", // A booking was cancelled (requires attention)
  FAILED_PAYMENT = "failed_payment", // A payment attempt failed
  REFUND_REQUESTED = "refund_requested", // A traveler requested a refund

  // --- Content & Reviews ---
  CONTENT_FLAGGED = "content_flagged", // User‑generated content (review, photo) was reported
  NEW_REVIEW = "new_review", // A new review/rating has been submitted

  // --- System & Alerts ---
  SYSTEM_ERROR = "system_error", // A critical system error occurred
  HIGH_TRAFFIC_ALERT = "high_traffic_alert", // Unusually high traffic detected
  LOW_INVENTORY = "low_inventory", // Tour spots / availability running low
}

export type GuideSystemNotificationType = `${GUIDE_SYSTEM_NOTIFICATION_TYPE}`;

/**
 * Enum representing the urgency/priority level of a notification.
 *
 * This helps admins quickly identify which notifications
 * require immediate attention vs. those that can be handled later.
 */
export enum GUIDE_SYSTEM_NOTIFICATION_PRIORITY {
  LOW = "low", // Informational, no immediate action needed
  MEDIUM = "medium", // Normal priority, should be addressed in due course
  HIGH = "high", // Important, requires timely attention
  CRITICAL = "critical", // Urgent, immediate action required
}

export type GuideSystemNotificationPriority = `${GUIDE_SYSTEM_NOTIFICATION_PRIORITY}`;