/**
 * Enum representing the moderation status of a comment.
 * - PENDING: Awaiting review or automatic moderation.
 * - APPROVED: Visible to all users.
 * - REJECTED: Hidden due to moderation rules.
 */
// Utility type to extract enum values
type EnumValues<T> = T[keyof T];

export enum COMMENT_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
export type CommentStatus = EnumValues<typeof COMMENT_STATUS>;