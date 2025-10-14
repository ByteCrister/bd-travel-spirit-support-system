/**
 * Enum representing the moderation status of a comment.
 * - PENDING: Awaiting review or automatic moderation.
 * - APPROVED: Visible to all users.
 * - REJECTED: Hidden due to moderation rules.
 */
export enum COMMENT_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
