// src/utils/helpers/mongodb-id-conversions.ts

import crypto from "crypto";
import baseX from "base-x";

// Base62 alphabet for compact, URL-safe encoding (0-9, a-z, A-Z)
const BASE62 = baseX(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);

// Derive a 32-byte AES-256 key from the secret provided in environment variables.
// Using SHA-256 ensures consistent key length regardless of the original secret size.
const SECRET_KEY = crypto
    .createHash("sha256")
    .update(process.env.ID_SECRET??process.env.NEXT_PUBLIC_ID_SECRET!)
    .digest();

// AES requires a random Initialization Vector (IV) for each encryption.
// We use 16 bytes since AES block size is 128 bits.
const IV_LENGTH = 16;

/**
 * Encrypts a MongoDB ObjectId (or any string) into a short, URL-safe Base62 string.
 *
 * Steps:
 * 1. Generate a random IV for this encryption.
 * 2. Encrypt the input string using AES-256-CBC with the derived secret key.
 * 3. Concatenate IV + ciphertext, then encode in Base62 for compactness.
 *
 * @param objectId - The MongoDB ObjectId (or string) to encode.
 * @returns A Base62-encoded encrypted string.
 */
export function encodeId(objectId: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);

    const encrypted = Buffer.concat([
        cipher.update(objectId, "utf8"),
        cipher.final(),
    ]);

    return BASE62.encode(Buffer.concat([iv, encrypted]));
}

/**
 * Decodes a previously encoded ID back into its original string.
 *
 * Steps:
 * 1. Decode the Base62 string back into a buffer.
 * 2. Extract the IV (first 16 bytes) and ciphertext (remaining bytes).
 * 3. Decrypt using AES-256-CBC with the same secret key and IV.
 * 4. Return the original string, or null if decryption fails.
 *
 * @param encoded - The Base62-encoded encrypted string.
 * @returns The original string if valid, otherwise null.
 */
export function decodeId(encoded: string): string | null {
    try {
        const buffer = BASE62.decode(encoded);

        const iv = buffer.slice(0, IV_LENGTH);
        const encrypted = buffer.slice(IV_LENGTH);

        const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        return decrypted.toString("utf8");
    } catch {
        // Return null if decoding or decryption fails (invalid input or wrong secret)
        return null;
    }
}