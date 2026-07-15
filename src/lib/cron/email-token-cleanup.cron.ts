import ConnectDB from "@/config/db";
import { EmailVerificationToken } from "@/models/email-verification-token.model";

export type EmailTokenCleanupResult = {
    deletedCount: number;
    error?: string;
};

/**
 * Deletes all expired or already-used email verification tokens.
 *
 * The model's `cleanupExpiredTokens` static handles the query:
 *   - expiresAt < now  (naturally expired)
 *   - usedAt != null   (already consumed)
 *
 * Errors are caught and surfaced in the result so that a failure here
 * does NOT abort the rest of the cron pipeline.
 */
export async function cleanupExpiredEmailTokens(): Promise<EmailTokenCleanupResult> {
    console.log("[cron:email-token-cleanup] Starting cleanup of expired/used email tokens");

    try {
        await ConnectDB();

        const deletedCount = await EmailVerificationToken.cleanupExpiredTokens();

        console.log(
            `[cron:email-token-cleanup] Completed — deleted ${deletedCount} token(s)`
        );

        return { deletedCount };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : String(error);

        console.error(
            "[cron:email-token-cleanup] Failed to clean up tokens:",
            error
        );

        return { deletedCount: 0, error: message };
    }
}
