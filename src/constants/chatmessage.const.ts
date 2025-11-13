/**
 * Enum for moderation status of a message.
 * Keeps values consistent across schema, code, and queries.
 */
export const MODERATION_STATUS = {
    CLEAN: 'clean',
    FLAGGED: 'flagged',
    REMOVED: 'removed',
} as const;

export type ModerationStatusType =
    typeof MODERATION_STATUS[keyof typeof MODERATION_STATUS];