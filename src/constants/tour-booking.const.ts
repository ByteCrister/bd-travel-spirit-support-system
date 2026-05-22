export enum BOOKING_STATUS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no-show',
  REFUNDED = 'refunded',
}
export type BookingStatus = `${BOOKING_STATUS}`; 

export enum BOOKING_PAYMENT_STATUS {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}


export type BookingPaymentStatus = `${BOOKING_PAYMENT_STATUS}`;