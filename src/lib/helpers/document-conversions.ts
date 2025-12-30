// src/lib/helpers/convert.ts
import crypto from "crypto";
import { ApiError } from "./withErrorHandler";

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

/**
 * Validate and normalize a base64-encoded data URL.
 *
 * Ensures the input is a well-formed data URL with a valid MIME type and base64 payload,
 * and returns a normalized data URL string suitable for safe use (for example, in `src`
 * attributes or server-side processing). Throws a descriptive error when validation fails.
 *
 * @param {string} base64 - The input data URL or raw base64 string to validate. Accepts:
 *   - a full data URL like "data:image/png;base64,iVBORw0KGgo..."
 *   - or a raw base64 payload with an implied MIME type (caller should prefer full data URLs).
 *
 * @returns {string} A validated, normalized data URL (e.g., "data:image/png;base64,<payload>").
 *
 * @throws {TypeError} If `base64` is not a string or is empty.
 * @throws {Error} If the value is not a valid data URL, has an unsupported MIME type,
 *   or the base64 payload is malformed.
 *
 * @example
 * const imgDataUrl = assertValidDataUrl("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...");
 */
export function assertValidDataUrl(base64: string): string {
  if (typeof base64 !== "string") {
    throw new ApiError("Invalid file format", 400);
  }

  const match = base64.match(
    /^data:([\w.+-\/]+);base64,([A-Za-z0-9+/=]+)$/
  );

  if (!match) {
    throw new ApiError("Malformed base64 data URL", 400);
  }

  const [, mimeType, data] = match;

  // Allow all images, PDF, and DOCX
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  const isDocx =
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (!isImage && !isPdf && !isDocx) {
    throw new ApiError("Unsupported file type", 400);
  }

  // Basic base64 sanity check
  if (data.length < 10) {
    throw new ApiError("Invalid base64 payload", 400);
  }

  // Return normalized data URL (Cloudinary safe)
  return `data:${mimeType};base64,${data}`;
}


export const isCloudinaryUrl = (value?: string) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    // adjust domain check if you use a custom Cloudinary domain
    return url.hostname.includes("res.cloudinary.com") || url.hostname.includes("cloudinary.com");
  } catch {
    return false;
  }
};

export function isBase64DataUrl(value?: string): boolean {
  if (!value || typeof value !== "string") return false;

  return value.startsWith("data:");
}