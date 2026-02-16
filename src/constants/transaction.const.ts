// constants/transaction.const.ts

/**
 * Represents the lifecycle of a payment transaction.
 */
export enum TRANSACTION_STATUS {
  /**
   * Initial state when transaction is created
   * but payment has not started yet.
   */
  PENDING = "pending",

  /**
   * Payment is currently being processed
   * (e.g., waiting for Stripe confirmation / webhook).
   */
  PROCESSING = "processing",

  /**
   * Payment completed successfully.
   */
  SUCCEEDED = "succeeded",

  /**
   * Payment attempt failed.
   */
  FAILED = "failed",

  /**
   * Transaction was canceled by user or system
   * before completion.
   */
  CANCELED = "canceled",

  /**
   * Payment was successful but later refunded.
   */
  REFUNDED = "refunded",
}

/**
 * Type-safe string union of all transaction statuses.
 */
export type TransactionStatus = `${TRANSACTION_STATUS}`;