export enum EMAIL_VERIFICATION_PURPOSE {
    GUIDE_APPLICATION = 'guide_application',
    PASSWORD_RESET = 'password_reset',
    EMAIL_CHANGE = 'email_change',
}
export type EmailVerificationPurpose = `${EMAIL_VERIFICATION_PURPOSE}`;

/**
 * Helper arrays for mongoose enum
 */
export const EMAIL_VERIFICATION_PURPOSE_VALUES = Object.values(
    EMAIL_VERIFICATION_PURPOSE
);

/**
 * Expiration time per purpose (ms)
 */
export const EMAIL_VERIFICATION_EXPIRY: Record<EMAIL_VERIFICATION_PURPOSE, number> = {
    [EMAIL_VERIFICATION_PURPOSE.GUIDE_APPLICATION]: 24 * 60 * 60 * 1000, // 24h
    [EMAIL_VERIFICATION_PURPOSE.PASSWORD_RESET]: 1 * 60 * 60 * 1000,    // 1h
    [EMAIL_VERIFICATION_PURPOSE.EMAIL_CHANGE]: 1 * 60 * 60 * 1000,      // 1h
};