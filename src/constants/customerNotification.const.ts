/**
 * Types of notifications supported
 */
export enum USER_NOTIFICATION_TYPE {
  BOOKING_CONFIRMATION = "booking_confirmation",
  BOOKING_REMINDER = "booking_reminder",
  NEW_TOUR = "new_tour",
  DISCOUNT_OFFER = "discount_offer",
  MESSAGE = "message",
  SYSTEM_ALERT = "system_alert",
}

/**
 * Optional urgency levels
 */
export enum NOTIFICATION_PRIORITY {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

/**
 * Entities that can be referenced in notifications
 */
export enum NOTIFICATION_RELATED_MODEL {
  TOUR = "Tour",
  BOOKING = "Booking",
  USER = "User",
  PAYMENT = "Payment",
  SUPPORT_TICKET = "SupportTicket",
}

/** Entities that can be referenced in notifications */
export enum NOTIFICATION_RELATED_MODAL {
  TOUR = "Tour",
  BOOKING = "Booking",
  USER = "User",
  PAYMENT = "Payment",
  SUPPORT_TICKET = "SupportTicket",
}
