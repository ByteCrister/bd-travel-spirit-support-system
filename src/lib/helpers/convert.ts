// src/lib/helpers/convert.ts
import crypto from "crypto";

/**
 * Convert a base64-encoded data URL or plain base64 string into a Buffer.
 *
 * - Accepts either a full data URL (`data:<mime>;base64,<data>`) or a raw base64 string.
 * - Strips the optional `data:` prefix if present, then decodes to a Node Buffer.
 *
 * **Parameters**
 * @param base64 - The base64 payload or data URL to decode.
 *
 * **Returns**
 * - A `Buffer` containing the decoded bytes.
 *
 * **Notes**
 * - This function does not validate the MIME type or length; callers should
 *   enforce size/type limits before calling if needed.
 * - If the input is not valid base64, `Buffer.from` will throw; callers may
 *   wrap this call in try/catch to surface a friendly error.
 *
 * **Example**
 * ```ts
 * const buf = base64ToBuffer("data:image/png;base64,iVBORw0KGgoAAAANS...");
 * ```
 */
export function base64ToBuffer(base64: string): Buffer {
  // Remove optional data URL prefix (e.g., "data:image/png;base64,")
  const cleaned = base64.replace(/^data:.*;base64,/, "");
  // Decode base64 into a Buffer
  return Buffer.from(cleaned, "base64");
}

/**
 * Compute the SHA-256 hex digest for a Buffer.
 *
 * - Uses Node's built-in `crypto` module to produce a deterministic checksum.
 * - Useful for deduplication, integrity checks, or generating stable IDs.
 *
 * **Parameters**
 * @param buffer - The binary data to hash.
 *
 * **Returns**
 * - A lowercase hex string representing the SHA-256 digest.
 *
 * **Notes**
 * - This function is synchronous and fast for typical asset sizes, but hashing
 *   very large streams should be done incrementally to avoid high memory use.
 * - For cross-language compatibility, ensure consumers expect a hex-encoded
 *   lowercase string.
 *
 * **Example**
 * ```ts
 * const checksum = sha256(buffer);
 * // "3a7bd3e2360a...f4b2"
 * ```
 */
export function sha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
