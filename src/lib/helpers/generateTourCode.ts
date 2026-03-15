import crypto from "crypto";

/**
 * Generates a cryptographically secure random alphanumeric code.
 *
 * This function is useful for generating tokens such as:
 * - verification codes
 * - password reset tokens
 * - invitation codes
 *
 * It uses Node.js `crypto.randomBytes` to ensure strong randomness.
 *
 * @param length - The length of the code to generate.
 * @returns A random alphanumeric string of the specified length.
 */
export default function generateTourCode(length: number): string {
    // Allowed characters in the generated code (A-Z, a-z, 0-9)
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // Generate cryptographically secure random bytes
    const bytes = crypto.randomBytes(length);

    // Store the final generated string
    let result = "";

    // Convert each random byte to a character from the allowed set
    for (let i = 0; i < length; i++) {
        // Map the byte value to a valid index in the chars string
        result += chars[bytes[i] % chars.length];
    }

    // Return the generated code
    return result;
}