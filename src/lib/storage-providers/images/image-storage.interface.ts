// src/lib/storage-providers/images/image-storage.interface.ts

/**
 * Represents the normalized metadata returned by any image storage provider
 * after a successful upload.
 *
 * This interface abstracts away provider-specific response formats
 * (e.g., Cloudinary's `public_id`, S3's `Key`, GCS's `name`) into a
 * consistent shape that the rest of the application can rely on.
 *
 * All providers must map their native response fields into this structure
 * to ensure interoperability and predictable downstream usage.
 */
export interface UploadedImage {
    /**
     * Unique identifier for the stored object in the provider's backend.
     * - Cloudinary: `public_id`
     * - S3: `Key`
     * - GCS: `name`
     *
     * This value is required for deletion, updates, or generating signed URLs.
     */
    objectKey: string;

    /**
     * Fully qualified, publicly accessible URL to the stored image.
     * This should be CDN-optimized if the provider supports it.
     */
    publicUrl: string;

    /**
     * MIME type of the stored file (e.g., `image/jpeg`, `image/png`).
     * Useful for validation, rendering decisions, and analytics.
     */
    contentType: string;

    /**
     * File size in bytes.
     * Enables size-based validation, analytics, and quota enforcement.
     */
    fileSize: number;

    /**
     * Width of the image in pixels (if available).
     * Providers that don't return dimensions can omit this.
     */
    width?: number;

    /**
     * Height of the image in pixels (if available).
     */
    height?: number;

    /**
     * Optional map of named variants (e.g., thumbnails, responsive sizes).
     * Keys are variant names, values are public URLs.
     *
     * Example:
     * {
     *   "thumb": "https://cdn.example.com/img/thumb.jpg",
     *   "large": "https://cdn.example.com/img/large.jpg"
     * }
     */
    variants?: Record<string, string>;
}

/**
 * Defines the contract that all image storage providers must fulfill.
 *
 * This interface enforces a consistent API for:
 * - Uploading images (from Base64-encoded data)
 * - Deleting stored images by their unique key
 *
 * By coding against this interface, the application can switch providers
 * (Cloudinary, S3, GCS, local storage, etc.) without changing business logic.
 */
export interface ImageStorageProvider {
    /**
     * Uploads an image from a Base64-encoded string to the storage backend.
     *
     * @param base64 - The Base64-encoded image data (including MIME prefix or raw).
     * @param folder - Optional logical folder or path within the provider's storage.
     *                 Providers that don't support folders may ignore this.
     * @returns A promise resolving to the normalized UploadedImage metadata.
     *
     * Implementations should:
     * - Validate the Base64 input
     * - Handle provider-specific upload APIs
     * - Map the provider's response to the UploadedImage interface
     */
    uploadBase64(base64: string, folder?: string): Promise<UploadedImage>;

    /**
     * Deletes an image from the storage backend by its unique object key.
     *
     * @param objectKey - The provider-specific identifier for the stored image.
     * @returns A promise resolving to `true` if deletion succeeded, `false` otherwise.
     *
     * Implementations should:
     * - Ensure idempotency (deleting a non-existent file should not throw)
     * - Handle provider-specific deletion APIs
     */
    deleteFile(objectKey: string): Promise<boolean>;
}
